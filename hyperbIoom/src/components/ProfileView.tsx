import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Camera, 
  CheckCircle2, 
  LogOut,
  MapPin,
  Sprout,
  Users,
  MessageSquare,
  TrendingUp,
  Award,
  Calendar,
  Settings as SettingsIcon,
  Plus,
  Sparkles,
  Zap
} from 'lucide-react';
import { cn } from '../utils/cn';
import { apiFetch } from '../utils/api';

interface ProfileViewProps {
  user: any;
  onUpdateUser: (userData: any) => void;
  onLogout: () => void;
  onNavigateToSettings: () => void;
}

export default function ProfileView({ user, onUpdateUser, onLogout, onNavigateToSettings }: ProfileViewProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    bio: user?.bio || '',
    farmName: 'Green Valley Farm',
    location: 'Nairobi, Kenya',
    farmType: 'Mixed Farming',
    farm_boundaries: user?.farm_boundaries || null
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || '',
        bio: user.bio || '',
        farm_boundaries: user.farm_boundaries || null
      }));
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);
    
    try {
      const data = await apiFetch('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          avatar: formData.avatar,
          bio: formData.bio,
          farm_boundaries: formData.farm_boundaries
        })
      });

      onUpdateUser(data);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getAvatarUrl = (name: string, avatar?: string) => {
    if (avatar) return avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=256`;
  };

  const stats = [
    { label: 'Forum Posts', value: '12', icon: MessageSquare, color: 'text-blue-500' },
    { label: 'AI Usage', value: `${user?.ai_usage_count || 0}${user?.tier === 'free' ? '/20' : ''}`, icon: Sparkles, color: 'text-primary-500' },
    { label: 'Community Help', value: '24', icon: Users, color: 'text-purple-500' },
    { label: 'Farm Health', value: '98%', icon: Sprout, color: 'text-emerald-500' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData({ ...formData, avatar: base64 });
        // Optimistically update parent state for immediate header feedback
        onUpdateUser({ ...user, avatar: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpgrade = async (tier: string, paymentMethod: string) => {
    try {
      await apiFetch('/api/monetization/upgrade', { 
        method: 'POST',
        body: JSON.stringify({ tier, paymentMethod })
      });
      const userData = await apiFetch('/api/auth/me');
      onUpdateUser(userData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Upgrade failed:', err);
    }
  };

  const handleSetFarmLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setFormData({ ...formData, farm_boundaries: JSON.stringify(coords) });
      });
    }
  };

  const farmCoords = formData.farm_boundaries ? JSON.parse(formData.farm_boundaries) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-earth-100 dark:bg-earth-700 border-4 border-white dark:border-earth-800 shadow-2xl overflow-hidden">
                <img 
                  src={getAvatarUrl(formData.name, formData.avatar)} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-500 text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white dark:border-earth-800 hover:scale-110 transition-all cursor-pointer">
                <Camera size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-4xl font-black text-earth-900 dark:text-white tracking-tight">{user?.name}</h2>
              {user?.tier !== 'free' ? (
                <span className={cn(
                  "px-3 py-1 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-lg",
                  user?.tier === 'elite' ? "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-500/20" : "bg-primary-500 shadow-primary-500/20"
                )}>
                  <Zap size={10} fill="currentColor" /> {user?.tier}
                </span>
              ) : (
                <span className="px-3 py-1 bg-earth-100 dark:bg-earth-700 text-earth-500 dark:text-earth-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                  Free
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-primary-500 font-bold uppercase tracking-widest flex items-center gap-2">
                <Award size={14} /> Elite Farmer
              </p>
              <span className="text-earth-300 dark:text-earth-600">•</span>
              <p className="text-sm text-earth-500 dark:text-earth-400 font-medium flex items-center gap-2">
                <MapPin size={14} /> {formData.location}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onNavigateToSettings}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-earth-800 border border-earth-200 dark:border-earth-700 text-earth-700 dark:text-earth-200 rounded-2xl font-bold hover:bg-earth-50 transition-all active:scale-95 shadow-sm"
          >
            <SettingsIcon size={18} /> Settings
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-2xl font-bold hover:bg-red-100 transition-all active:scale-95"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-earth-800 p-8 rounded-[2.5rem] border border-earth-200 dark:border-earth-700 shadow-sm hover:shadow-xl transition-all group">
            <div className={cn("w-12 h-12 rounded-2xl bg-earth-50 dark:bg-earth-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", stat.color)}>
              <stat.icon size={24} />
            </div>
            <p className="text-3xl font-black text-earth-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-earth-400 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Farm Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-earth-800 p-10 rounded-[3rem] border border-earth-200 dark:border-earth-700 shadow-xl">
            <h3 className="text-xl font-black text-earth-900 dark:text-white mb-8 flex items-center gap-3">
              <Sprout className="text-primary-500" /> Farm Profile
            </h3>
            
            <div className="space-y-6">
              <div className="p-6 rounded-[2rem] bg-earth-50 dark:bg-earth-700/50 border border-earth-100 dark:border-earth-600">
                <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mb-1">Farm Name</p>
                <p className="font-bold text-earth-900 dark:text-white text-lg">{formData.farmName}</p>
              </div>
              <div className="p-6 rounded-[2rem] bg-earth-50 dark:bg-earth-700/50 border border-earth-100 dark:border-earth-600">
                <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mb-1">Type of Farming</p>
                <p className="font-bold text-earth-900 dark:text-white text-lg">{formData.farmType}</p>
              </div>
              
              {farmCoords && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mb-1">Farm Boundary (Satellite)</p>
                  <div className="rounded-[2rem] overflow-hidden border border-earth-100 dark:border-earth-600 h-48 shadow-inner">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      scrolling="no" 
                      marginHeight={0} 
                      marginWidth={0} 
                      src={`https://maps.google.com/maps?q=${farmCoords.lat},${farmCoords.lng}&t=k&z=18&output=embed`}
                    ></iframe>
                  </div>
                  <p className="text-[10px] text-earth-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <MapPin size={12} /> {farmCoords.lat.toFixed(4)}, {farmCoords.lng.toFixed(4)}
                  </p>
                </div>
              )}

              <div className="p-6 rounded-[2rem] bg-earth-50 dark:bg-earth-700/50 border border-earth-100 dark:border-earth-600">
                <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mb-1">Member Since</p>
                <p className="font-bold text-earth-900 dark:text-white text-lg">January 2024</p>
              </div>
            </div>

            <button 
              onClick={handleSetFarmLocation}
              className="w-full mt-8 py-4 bg-primary-500 text-white rounded-2xl font-black hover:bg-primary-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
            >
              <MapPin size={18} /> {formData.farm_boundaries ? 'Update Farm Boundary' : 'Set Farm Boundary'}
            </button>
          </div>

          {user?.tier !== 'elite' && (
            <div className="bg-earth-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <Sparkles className="text-primary-400" size={28} />
                </div>
                <h3 className="text-2xl font-black mb-4">Upgrade Plan</h3>
                
                <div className="space-y-4 mb-8">
                  {user?.tier === 'free' && (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary-500 transition-all">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-lg">Pro Plan</span>
                        <span className="text-primary-400 font-black">1,000 KSH</span>
                      </div>
                      <p className="text-xs text-earth-400 mb-4">Unlimited AI, Stronger Models, Market Insights</p>
                      <div className="grid grid-cols-2 gap-2">
                        {['M-Pesa', 'Visa', 'Equity', 'KCB'].map(method => (
                          <button 
                            key={method}
                            onClick={() => handleUpgrade('pro', method)}
                            className="py-2 bg-white/10 hover:bg-primary-500 rounded-xl text-[10px] font-black transition-all"
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500 transition-all">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-lg">Elite Plan</span>
                      <span className="text-purple-400 font-black">2,000 KSH</span>
                    </div>
                    <p className="text-xs text-earth-400 mb-4">Everything in Pro + Satellite Monitoring & Expert Calls</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['M-Pesa', 'Visa', 'Equity', 'KCB'].map(method => (
                        <button 
                          key={method}
                          onClick={() => handleUpgrade('elite', method)}
                          className="py-2 bg-white/10 hover:bg-purple-500 rounded-xl text-[10px] font-black transition-all"
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_-20%,rgba(255,255,255,0.1),transparent_70%)]"></div>
            </div>
          )}
        </div>

        {/* Right Column: Edit Profile */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-earth-800 p-10 rounded-[3rem] border border-earth-200 dark:border-earth-700 shadow-xl">
            <h3 className="text-xl font-black text-earth-900 dark:text-white mb-8 flex items-center gap-3">
              <User className="text-primary-500" /> Edit Profile
            </h3>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold text-center">
                {error}
              </div>
            )}
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-earth-400 uppercase tracking-widest ml-4">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-400" size={18} />
                    <input 
                      type="text" 
                      required
                      className="w-full pl-12 pr-6 py-4 bg-earth-50 dark:bg-earth-700 border border-earth-100 dark:border-earth-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all dark:text-white"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-earth-400 uppercase tracking-widest ml-4">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-400" size={18} />
                    <input 
                      type="email" 
                      required
                      className="w-full pl-12 pr-6 py-4 bg-earth-50 dark:bg-earth-700 border border-earth-100 dark:border-earth-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all dark:text-white"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-earth-400 uppercase tracking-widest ml-4">Profile Picture</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Camera className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-400" size={18} />
                    <input 
                      type="url" 
                      placeholder="Paste image URL or upload below..."
                      className="w-full pl-12 pr-6 py-4 bg-earth-50 dark:bg-earth-700 border border-earth-100 dark:border-earth-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all dark:text-white"
                      value={formData.avatar.startsWith('data:') ? 'Custom Uploaded Image' : formData.avatar}
                      readOnly={formData.avatar.startsWith('data:')}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    />
                    {formData.avatar.startsWith('data:') && (
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar: '' })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-red-500 hover:text-red-600"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <label className="px-8 py-4 bg-white dark:bg-earth-800 border border-earth-200 dark:border-earth-700 text-earth-700 dark:text-earth-200 rounded-2xl font-bold hover:bg-earth-50 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-95">
                    <Plus size={18} /> Upload Image
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="text-[10px] text-earth-400 ml-4 italic">Supports JPG, PNG, and GIF. Max size 5MB.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-earth-400 uppercase tracking-widest ml-4">Short Bio</label>
                <textarea 
                  placeholder="Tell the community about yourself..."
                  className="w-full px-6 py-4 bg-earth-50 dark:bg-earth-700 border border-earth-100 dark:border-earth-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all dark:text-white min-h-[100px]"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className="text-xs text-earth-400 font-medium">Your public profile is visible to other farmers.</p>
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="px-10 py-4 bg-earth-900 dark:bg-primary-500 text-white rounded-2xl font-black shadow-xl hover:bg-earth-800 dark:hover:bg-primary-600 transition-all active:scale-95 flex items-center gap-3"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                  {showSuccess && <CheckCircle2 size={18} className="text-green-400" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
