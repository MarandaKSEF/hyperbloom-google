import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import session from "express-session";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("hyperbloom.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT,
    bio TEXT,
    farm_boundaries TEXT,
    tier TEXT DEFAULT 'free',
    ai_usage_count INTEGER DEFAULT 0,
    last_usage_reset TEXT
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS vaccinations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    livestock_type TEXT,
    vaccine_name TEXT,
    date TEXT,
    dosage TEXT,
    notes TEXT,
    completed INTEGER DEFAULT 0
  );
  
  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    title TEXT,
    description TEXT,
    severity TEXT,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS forum_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    latitude REAL,
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS forum_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS marketplace_listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

const ADMIN_EMAILS = [
  "georgebwire45@gmail.com",
  "randoguyz@outlook.com",
  "tindaoyanda@gmail.com"
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set('trust proxy', 1);
  app.use(express.json());
  app.use(session({
    secret: "hyperbloom-secret-key",
    resave: false,
    saveUninitialized: false,
    name: 'hyperbloom.sid',
    proxy: true,
    cookie: { 
      secure: true,
      sameSite: 'none',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
  }));

  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const isAdmin = ADMIN_EMAILS.includes(email);
      const tier = isAdmin ? 'elite' : 'free';
      
      const info = db.prepare(
        "INSERT INTO users (name, email, password, tier) VALUES (?, ?, ?, ?)"
      ).run(name, email, hashedPassword, tier);
      
      const user = { 
        id: info.lastInsertRowid, 
        name, 
        email,
        tier,
        is_admin: isAdmin
      };
      (req.session as any).userId = user.id;
      res.json(user);
    } catch (err: any) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "Email already exists" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    (req.session as any).userId = user.id;
    const isAdmin = ADMIN_EMAILS.includes(user.email);
    const { password: _, ...userWithoutPassword } = user;
    const finalUser = { 
      ...userWithoutPassword, 
      is_admin: isAdmin,
      tier: isAdmin ? 'elite' : user.tier 
    };
    res.json(finalUser);
  });

  app.get("/api/auth/me", (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(200).json({ authenticated: false });
    
    const user: any = db.prepare("SELECT id, name, email, avatar, bio, farm_boundaries, tier, ai_usage_count, last_usage_reset FROM users WHERE id = ?").get(userId);
    if (!user) return res.status(200).json({ authenticated: false });
    
    const isAdmin = ADMIN_EMAILS.includes(user.email);
    res.json({ 
      ...user, 
      is_admin: isAdmin,
      tier: isAdmin ? 'elite' : user.tier
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.patch("/api/auth/profile", (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const { name, email, avatar, bio, farm_boundaries } = req.body;
    try {
      db.prepare(
        "UPDATE users SET name = ?, email = ?, avatar = ?, bio = ?, farm_boundaries = ? WHERE id = ?"
      ).run(name, email, avatar, bio, farm_boundaries, userId);
      
      const updatedUser: any = db.prepare("SELECT id, name, email, avatar, bio, farm_boundaries, tier, ai_usage_count FROM users WHERE id = ?").get(userId);
      const isAdmin = ADMIN_EMAILS.includes(updatedUser.email);
      res.json({
        ...updatedUser,
        is_admin: isAdmin,
        tier: isAdmin ? 'elite' : updatedUser.tier
      });
    } catch (err: any) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "Email already exists" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // AI Usage Route
  app.post("/api/ai/usage", (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const user: any = db.prepare("SELECT email, tier, ai_usage_count, last_usage_reset FROM users WHERE id = ?").get(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isAdmin = ADMIN_EMAILS.includes(user.email);
    const effectiveTier = isAdmin ? 'elite' : user.tier;

    const today = new Date().toISOString().split('T')[0];
    let currentCount = user.ai_usage_count || 0;

    if (user.last_usage_reset !== today) {
      db.prepare("UPDATE users SET ai_usage_count = 0, last_usage_reset = ? WHERE id = ?").run(today, userId);
      currentCount = 0;
    }

    const limit = effectiveTier === 'free' ? 20 : 1000;

    if (effectiveTier === 'free' && currentCount >= limit) {
      return res.status(403).json({ error: "Daily free limit reached (20/day). Please upgrade to Pro or Elite for unlimited access." });
    }

    db.prepare("UPDATE users SET ai_usage_count = ai_usage_count + 1 WHERE id = ?").run(userId);
    res.json({ success: true, count: currentCount + 1, limit });
  });

  // Monetization Route
  app.post("/api/monetization/upgrade", (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const { tier, paymentMethod } = req.body;
    if (!['pro', 'elite'].includes(tier)) {
      return res.status(400).json({ error: "Invalid tier" });
    }

    // In a real app, you'd process the payment with M-Pesa, Visa, etc.
    db.prepare("UPDATE users SET tier = ? WHERE id = ?").run(tier, userId);
    
    // Create a notification for the upgrade
    db.prepare("INSERT INTO notifications (user_id, title, content, type) VALUES (?, ?, ?, ?)")
      .run(userId, "Subscription Upgraded", `Welcome to the ${tier.toUpperCase()} plan! You now have full access to premium features.`, "success");

    res.json({ success: true, message: `Successfully upgraded to ${tier.toUpperCase()}!` });
  });

  // Weather API Route
  app.get("/api/weather", async (req, res) => {
    const { lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY || "240851cbf361f872775510801e9bf58c";
    
    if (!lat || !lon) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
      const data = await response.json();
      
      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      // Also get forecast
      const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
      const forecastData = await forecastRes.json();

      res.json({ current: data, forecast: forecastData });
    } catch (err) {
      console.error("Weather fetch error:", err);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  // Notification Routes
  app.get("/api/notifications", (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC").all(userId);
    res.json({ notifications });
  });

  app.patch("/api/notifications/:id/read", (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?").run(req.params.id, userId);
    res.json({ success: true });
  });

  // API Routes
  app.get("/api/vaccinations", (req, res) => {
    const rows = db.prepare("SELECT * FROM vaccinations ORDER BY date ASC").all();
    res.json(rows);
  });

  app.post("/api/vaccinations", (req, res) => {
    const { livestock_type, vaccine_name, date, dosage, notes } = req.body;
    const info = db.prepare(
      "INSERT INTO vaccinations (livestock_type, vaccine_name, date, dosage, notes) VALUES (?, ?, ?, ?, ?)"
    ).run(livestock_type, vaccine_name, date, dosage, notes);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch("/api/vaccinations/:id", (req, res) => {
    const { completed } = req.body;
    db.prepare("UPDATE vaccinations SET completed = ? WHERE id = ?").run(completed ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/alerts", (req, res) => {
    const rows = db.prepare("SELECT * FROM alerts ORDER BY date DESC").all();
    res.json(rows);
  });

  // Forum Routes
  app.get("/api/forum/posts", (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const total = (db.prepare("SELECT COUNT(*) as count FROM forum_posts").get() as any).count;
    const totalPages = Math.ceil(total / limit);

    const posts = db.prepare(`
      SELECT p.*, u.name as author_name, u.avatar as author_avatar, u.bio as author_bio,
      (SELECT COUNT(*) FROM forum_comments WHERE post_id = p.id) as comment_count
      FROM forum_posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    res.json({
      posts,
      pagination: {
        page,
        totalPages,
        total
      }
    });
  });

  app.post("/api/forum/posts", (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    
    const { title, content, category, latitude, longitude } = req.body;
    const info = db.prepare(
      "INSERT INTO forum_posts (user_id, title, content, category, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(userId, title, content, category, latitude, longitude);
    
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/forum/posts/:id", (req, res) => {
    const post = db.prepare(`
      SELECT p.*, u.name as author_name, u.avatar as author_avatar, u.bio as author_bio
      FROM forum_posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(req.params.id);
    
    if (!post) return res.status(404).json({ error: "Post not found" });
    
    const comments = db.prepare(`
      SELECT c.*, u.name as author_name, u.avatar as author_avatar, u.bio as author_bio
      FROM forum_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).all(req.params.id);
    
    res.json({ ...post, comments });
  });

  app.post("/api/forum/posts/:id/comments", (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    
    const { content } = req.body;
    const info = db.prepare(
      "INSERT INTO forum_comments (post_id, user_id, content) VALUES (?, ?, ?)"
    ).run(req.params.id, userId, content);
    
    res.json({ id: info.lastInsertRowid });
  });

  // Marketplace Routes
  app.get("/api/marketplace/listings", (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    const total = (db.prepare("SELECT COUNT(*) as count FROM marketplace_listings").get() as any).count;
    const totalPages = Math.ceil(total / limit);

    const listings = db.prepare(`
      SELECT m.*, u.name as seller_name, u.avatar as seller_avatar
      FROM marketplace_listings m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    res.json({
      listings,
      pagination: {
        page,
        totalPages,
        total
      }
    });
  });

  app.post("/api/marketplace/listings", (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    
    const { name, category, price, location, description, image } = req.body;
    const info = db.prepare(
      "INSERT INTO marketplace_listings (user_id, name, category, price, location, description, image) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(userId, name, category, price, location, description, image || `https://picsum.photos/seed/${encodeURIComponent(name)}/400/300`);
    
    res.json({ id: info.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // In middleware mode, we need to serve index.html ourselves
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 HYPERBLOOM Server Running!`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log(`🌍 Network: http://0.0.0.0:${PORT}`);
    console.log(`🛠️ Mode: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

startServer();
