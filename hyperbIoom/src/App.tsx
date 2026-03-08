import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CloudSun, 
  ShieldAlert, 
  Stethoscope, 
  BookOpen, 
  MessageSquare,
  Users,
  Menu,
  X,
  ShoppingBag, 
  Wallet, 
  CheckSquare,
  Calendar,
  Sprout,
  Bell,
  Star,
  ChevronRight,
  User,
  Settings,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './utils/cn';

import Dashboard from './components/Dashboard';
import WeatherView from './components/WeatherView';
import AlertsView from './components/AlertsView';
import LivestockView from './components/LivestockView';
import LearningHub from './components/LearningHub';
import AIChat from './components/AIChat';
import Marketplace from './components/Marketplace';
import ForumView from './components/ForumView';
import PricingCard from './components/PricingCard';
import PaymentModal from './components/PaymentModal';
import PestAlerts from './components/PestAlerts';
import FinanceTracker from './components/FinanceTracker';
import FarmChecklist from './components/FarmChecklist';
import SoilAnalysis from './components/SoilAnalysis';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import NotificationsView from './components/NotificationsView';
import { apiFetch } from './utils/api';
import Auth from './components/Auth';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-earth-50 dark:bg-earth-900 p-8 text-center">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-8">
            <ShieldAlert size={48} />
          </div>
          <h1 className="text-3xl font-black text-earth-900 dark:text-white mb-4">Something went wrong</h1>
          <p className="text-earth-500 dark:text-earth-400 mb-8 max-w-md">
            The application encountered an unexpected error. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-primary-500 text-white rounded-2xl font-black shadow-xl hover:bg-primary-600 transition-all"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chatPrompt, setChatPrompt] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hyperScore, setHyperScore] = useState(1250);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<{name: string, price: string} | null>(null);

  const handleUpgrade = async (tier: string) => {
    if (tier.toLowerCase() === 'free') return;
    const price = tier.toLowerCase() === 'pro' ? '1000' : '2000';
    setSelectedTier({ name: tier.toLowerCase(), price });
    setIsPaymentModalOpen(true);
  };

  const onPaymentSuccess = async (method: string) => {
    if (!selectedTier) return;
    try {
      await apiFetch('/api/monetization/upgrade', {
        method: 'POST',
        body: JSON.stringify({ tier: selectedTier.name, paymentMethod: method })
      });
      const updatedUser = await apiFetch('/api/auth/me');
      setUser(updatedUser);
      alert(`Successfully upgraded to ${selectedTier.name.toUpperCase()}!`);
    } catch (err) {
      console.error('Upgrade failed', err);
    }
  };

  useEffect(() => {
    const fetchUnread = async () => {
      if (!isAuthenticated) return;
      try {
        const data = await apiFetch('/api/notifications');
        if (data && data.notifications) {
          setUnreadCount(data.notifications.filter((n: any) => !n.is_read).length);
        }
      } catch (err: any) {
        if (err.status !== 401) {
          console.error('Failed to fetch unread count:', err);
        }
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      setUser(null);
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await apiFetch('/api/auth/me');
        if (userData && userData.authenticated !== false) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        // Silent fail for initial auth check
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-earth-50 dark:bg-earth-900">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'weather', label: 'Weather', icon: CloudSun },
    { id: 'pest-alerts', label: 'Pest & Calamity Alerts', icon: ShieldAlert },
    { id: 'alerts', label: 'Disease Detection', icon: Stethoscope },
    { id: 'forum', label: 'Community Forum', icon: Users },
    { id: 'learning', label: 'Academy', icon: BookOpen },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { id: 'finance', label: 'Finance', icon: Wallet },
    { id: 'checklist', label: 'Checklist', icon: CheckSquare },
    { id: 'soil', label: 'Soil Health', icon: Sprout },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'pricing', label: 'Pricing Plans', icon: Star },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} isAuthenticated={isAuthenticated} />;
      case 'weather': return <WeatherView user={user} onAskAI={(prompt: string) => {
        if (prompt === 'GO_TO_PRICING') {
          setActiveTab('pricing');
        } else {
          setChatPrompt(prompt);
          setActiveTab('chat');
        }
      }} />;
      case 'pest-alerts': return <PestAlerts user={user} />;
      case 'alerts': return <AlertsView />;
      case 'forum': return <ForumView user={user} />;
      case 'learning': return <LearningHub user={user} />;
      case 'marketplace': return <Marketplace />;
      case 'finance': return <FinanceTracker />;
      case 'checklist': return <FarmChecklist />;
      case 'soil': return <SoilAnalysis />;
      case 'schedule': return <LivestockView />;
      case 'pricing': return (
        <div className="max-w-7xl mx-auto space-y-16 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-black text-earth-900 dark:text-white tracking-tight mb-6">Choose Your Growth Path</h1>
            <p className="text-xl text-earth-500 dark:text-earth-400 leading-relaxed">
              From small-scale gardens to industrial farms, we have the right tools to help you scale your agricultural operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              tier="Free" 
              price="0" 
              features={[
                '20 AI Chatbot uses / day',
                'Basic Weather Forecasts',
                'Community Forum Access',
                'Learning Hub (Limited)',
                'Standard Disease Detection'
              ]}
              onUpgrade={handleUpgrade}
            />
            <PricingCard 
              tier="Pro" 
              price="1,000" 
              isPopular
              features={[
                'Unlimited AI Chatbot',
                'Advanced Weather Advisory',
                'Satellite Crop Monitoring',
                'Full Learning Hub Access',
                'Expert Disease Analysis',
                'Priority Notifications'
              ]}
              onUpgrade={handleUpgrade}
            />
            <PricingCard 
              tier="Elite" 
              price="2,000" 
              features={[
                'Everything in Pro',
                'Direct Expert Consultation',
                'Soil Health Mapping',
                'Market Price Predictions',
                'Custom Farm Reports',
                'Early Access to Features'
              ]}
              onUpgrade={handleUpgrade}
            />
          </div>

          <div className="bg-earth-50 dark:bg-earth-800/50 rounded-[3rem] p-12 border border-earth-100 dark:border-earth-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: 'Secure Payments', desc: 'Encrypted transactions via Visa, M-Pesa & more.' },
                { label: 'Cancel Anytime', desc: 'No long-term contracts, pause or cancel whenever.' },
                { label: '24/7 Support', desc: 'Our team is always here to help you grow.' },
                { label: 'Localized Advice', desc: 'Insights tailored specifically for Kenyan soil.' }
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <h4 className="font-black text-earth-900 dark:text-white">{item.label}</h4>
                  <p className="text-sm text-earth-500 dark:text-earth-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
      case 'chat': return <AIChat user={user} onUpdateUser={setUser} initialPrompt={chatPrompt} onClearPrompt={() => setChatPrompt(null)} />;
      case 'profile': return (
        <ProfileView 
          user={user} 
          onUpdateUser={setUser} 
          onLogout={handleLogout}
          onNavigateToSettings={() => setActiveTab('settings')}
        />
      );
      case 'settings': return (
        <SettingsView 
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
      );
      default: return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex bg-earth-50 dark:bg-earth-900 font-sans selection:bg-primary-500/30 transition-colors duration-500">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-earth-900/60 backdrop-blur-md z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 xl:w-80 bg-white dark:bg-earth-800 border-r border-earth-200 dark:border-earth-700 transform transition-transform duration-700 ease-[0.22,1,0.36,1] lg:relative lg:translate-x-0 shadow-2xl lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-8 xl:p-10 flex items-center gap-4">
            <div 
              onClick={() => setActiveTab('profile')}
              className="w-12 h-12 xl:w-14 xl:h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-primary-500/30 rotate-3 transition-transform hover:rotate-0 cursor-pointer overflow-hidden border-2 border-white dark:border-earth-700"
            >
              <img 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`} 
                alt="Profile" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl xl:text-2xl font-black text-earth-900 dark:text-white tracking-tighter leading-none">HYPERBLOOM</h1>
                {user?.is_admin && (
                  <span className="px-1.5 py-0.5 bg-accent-500 text-white text-[8px] font-black rounded uppercase tracking-widest">Admin</span>
                )}
              </div>
              <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] mt-1">Digital Farm</p>
            </div>
          </div>

          <nav className="flex-1 mt-4 px-6 space-y-1 overflow-y-auto no-scrollbar">
            <p className="px-6 text-[10px] font-black text-earth-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-5 py-2.5 rounded-xl text-sm font-bold transition-all group relative overflow-hidden",
                  activeTab === item.id
                    ? "bg-earth-900 dark:bg-primary-500 text-white shadow-xl shadow-earth-900/10 translate-x-1"
                    : "text-earth-500 dark:text-earth-400 hover:bg-earth-50 dark:hover:bg-earth-700 hover:text-earth-900 dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <item.icon size={20} className={cn("transition-transform group-hover:scale-110", activeTab === item.id ? "text-primary-400 dark:text-white" : "text-primary-500")} />
                  {item.label}
                </div>
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-earth-900 to-earth-800 dark:from-primary-500 dark:to-primary-600"
                  />
                )}
                {activeTab === item.id && <ChevronRight size={16} className="relative z-10 text-primary-400 dark:text-white" />}
              </button>
            ))}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-6 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all group mt-4"
            >
              <LogOut size={20} className="transition-transform group-hover:scale-110" />
              Sign Out
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-white/80 dark:bg-earth-800/80 backdrop-blur-2xl border-b border-earth-200 dark:border-earth-700 flex items-center justify-between px-8 lg:px-16 sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-4 text-earth-600 dark:text-earth-400 lg:hidden hover:bg-earth-100 dark:hover:bg-earth-700 rounded-2xl transition-all active:scale-95 flex items-center gap-3"
            >
              <Menu size={24} />
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-earth-200 dark:border-earth-700">
                <img 
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`} 
                  alt="Profile" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
              </div>
            </button>
            <div className="hidden lg:block">
              <h2 className="text-2xl font-black text-earth-900 dark:text-white tracking-tight">
                {navItems.find(i => i.id === activeTab)?.label}
              </h2>
              <p className="text-xs text-earth-400 dark:text-earth-500 font-bold uppercase tracking-widest mt-1">
                {activeTab === 'dashboard' ? 'Overview & Insights' : 'Service Module'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden xl:flex items-center gap-4 bg-earth-100 dark:bg-earth-700 px-6 py-3 rounded-2xl border border-earth-200 dark:border-earth-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-black text-earth-600 dark:text-earth-300 uppercase tracking-widest">Satellite Connected</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-4 text-earth-400 hover:text-earth-900 dark:hover:text-white hover:bg-earth-100 dark:hover:bg-earth-700 rounded-2xl transition-all relative group active:scale-95"
              >
                {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
              </button>
              
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-4 text-earth-400 hover:text-earth-900 dark:hover:text-white hover:bg-earth-100 dark:hover:bg-earth-700 rounded-2xl transition-all relative group active:scale-95"
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-earth-800 ring-4 ring-red-500/10"></span>
                )}
              </button>
              
              <div className="h-10 w-[1px] bg-earth-200 dark:bg-earth-700 mx-2 hidden sm:block"></div>
              
              <button 
                onClick={() => setActiveTab('profile')}
                className={cn(
                  "flex items-center gap-4 p-1.5 pr-6 rounded-[1.5rem] transition-all group active:scale-95",
                  activeTab === 'profile' ? "bg-earth-900 dark:bg-primary-500 text-white" : "hover:bg-earth-100 dark:hover:bg-earth-700"
                )}
              >
                <div className="w-12 h-12 rounded-2xl bg-earth-100 dark:bg-earth-700 border-2 border-white dark:border-earth-800 shadow-xl overflow-hidden group-hover:border-primary-500 transition-all">
                  <img 
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`} 
                    alt="Profile" 
                    referrerPolicy="no-referrer" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:block text-left">
                  <p className={cn("text-sm font-black leading-none", activeTab === 'profile' ? "text-white" : "text-earth-900 dark:text-white")}>{user?.name || 'Farmer John'}</p>
                  <p className={cn("text-[10px] font-black uppercase tracking-widest mt-1.5", activeTab === 'profile' ? "text-primary-400" : "text-primary-500")}>
                    {user?.tier?.toUpperCase() || 'FREE'} MEMBER
                  </p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 xl:p-16 scroll-smooth bg-earth-50/50 dark:bg-earth-900/50">
          <AnimatePresence>
            {showNotifications && (
              <NotificationsView onClose={() => setShowNotifications(false)} />
            )}
          </AnimatePresence>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[1600px] mx-auto"
          >
            {renderContent()}
          </motion.div>
          
          <footer className="mt-32 py-20 border-t border-earth-200 dark:border-earth-700 text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-10 h-10 bg-earth-900 dark:bg-primary-500 rounded-xl flex items-center justify-center text-primary-400 shadow-2xl overflow-hidden">
                <img src="/logo.png" alt="Hyperbloom" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-black text-earth-900 dark:text-white tracking-tighter">HYPERBLOOM</span>
            </div>
            <p className="text-sm text-earth-400 font-bold uppercase tracking-widest mb-4">Empowering the Next Generation of Farmers</p>
            <div className="flex justify-center gap-8 text-earth-400 text-xs font-bold uppercase tracking-widest mb-8">
              <a href="#" className="hover:text-primary-500 transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary-500 transition-colors">Terms</a>
              <a href="#" className="hover:text-primary-500 transition-colors">Support</a>
            </div>
            <p className="text-[10px] text-earth-300 font-medium">© 2026 Hyperbloom Platform. Built for Kenya, Inspired by Nature.</p>
          </footer>
        </div>
      </main>
      {/* Modals */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        tier={selectedTier?.name || ''}
        price={selectedTier?.price || ''}
        onSuccess={onPaymentSuccess}
      />
    </div>
    </ErrorBoundary>
  );
}
