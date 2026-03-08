import React, { useState } from 'react';
import { 
  Lock, 
  Moon, 
  Sun, 
  Bell, 
  ShieldCheck,
  Smartphone,
  Globe,
  Database,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { cn } from '../utils/cn';

interface SettingsViewProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function SettingsView({ isDarkMode, onToggleDarkMode }: SettingsViewProps) {
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false
  });

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-4xl font-black text-earth-900 dark:text-white tracking-tight mb-2">Settings</h2>
        <p className="text-earth-500 dark:text-earth-400 font-medium">Manage your account security, preferences, and system configuration.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Appearance & Preferences */}
        <section className="bg-white dark:bg-earth-800 p-10 rounded-[3rem] border border-earth-200 dark:border-earth-700 shadow-xl">
          <h3 className="text-xl font-black text-earth-900 dark:text-white mb-8 flex items-center gap-3">
            <Sun className="text-primary-500" /> Appearance & Preferences
          </h3>
          
          <div className="space-y-4">
            <button 
              onClick={onToggleDarkMode}
              className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-earth-50 dark:bg-earth-700/50 hover:bg-earth-100 dark:hover:bg-earth-700 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-earth-800 flex items-center justify-center text-earth-600 dark:text-earth-300 shadow-sm">
                  {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
                </div>
                <div className="text-left">
                  <p className="font-bold text-earth-900 dark:text-white">Dark Mode</p>
                  <p className="text-xs text-earth-400 font-medium">Adjust the app's visual theme</p>
                </div>
              </div>
              <div className={cn(
                "w-14 h-7 rounded-full p-1 transition-colors duration-300",
                isDarkMode ? "bg-primary-500" : "bg-earth-200"
              )}>
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm",
                  isDarkMode ? "translate-x-7" : "translate-x-0"
                )} />
              </div>
            </button>

            <div className="flex items-center justify-between p-6 rounded-[2rem] bg-earth-50 dark:bg-earth-700/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-earth-800 flex items-center justify-center text-earth-600 dark:text-earth-300 shadow-sm">
                  <Globe size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-earth-900 dark:text-white">Language</p>
                  <p className="text-xs text-earth-400 font-medium">Select your preferred language</p>
                </div>
              </div>
              <select className="bg-white dark:bg-earth-800 border border-earth-200 dark:border-earth-700 rounded-xl px-4 py-2 text-sm font-bold text-earth-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>English (US)</option>
                <option>Swahili</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="bg-white dark:bg-earth-800 p-10 rounded-[3rem] border border-earth-200 dark:border-earth-700 shadow-xl">
          <h3 className="text-xl font-black text-earth-900 dark:text-white mb-8 flex items-center gap-3">
            <ShieldCheck className="text-primary-500" /> Security & Privacy
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-earth-400 uppercase tracking-widest ml-4">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-400" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-4 bg-earth-50 dark:bg-earth-700 border border-earth-100 dark:border-earth-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-earth-400 uppercase tracking-widest ml-4">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-400" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full pl-12 pr-6 py-4 bg-earth-50 dark:bg-earth-700 border border-earth-100 dark:border-earth-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-earth-400 uppercase tracking-widest ml-4">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-400" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full pl-12 pr-6 py-4 bg-earth-50 dark:bg-earth-700 border border-earth-100 dark:border-earth-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all dark:text-white"
                  />
                </div>
              </div>
            </div>

            <button className="w-full py-4 bg-earth-900 dark:bg-primary-500 text-white rounded-2xl font-black shadow-xl hover:bg-earth-800 dark:hover:bg-primary-600 transition-all active:scale-95">
              Update Password
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white dark:bg-earth-800 p-10 rounded-[3rem] border border-earth-200 dark:border-earth-700 shadow-xl">
          <h3 className="text-xl font-black text-earth-900 dark:text-white mb-8 flex items-center gap-3">
            <Bell className="text-primary-500" /> Notifications
          </h3>
          
          <div className="space-y-4">
            {[
              { id: 'push', label: 'Push Notifications', icon: Smartphone, desc: 'Receive alerts on your mobile device' },
              { id: 'email', label: 'Email Alerts', icon: Globe, desc: 'Weekly summaries and critical updates' },
              { id: 'sms', label: 'SMS Alerts', icon: Database, desc: 'Emergency weather and disease alerts' }
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-6 rounded-[2rem] bg-earth-50 dark:bg-earth-700/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-earth-800 flex items-center justify-center text-earth-600 dark:text-earth-300 shadow-sm">
                    <item.icon size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-earth-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-earth-400 font-medium">{item.desc}</p>
                  </div>
                </div>
                <div className={cn(
                  "w-14 h-7 rounded-full p-1 transition-colors duration-300 cursor-pointer",
                  notifications[item.id as keyof typeof notifications] ? "bg-primary-500" : "bg-earth-200"
                )} onClick={() => setNotifications({...notifications, [item.id]: !notifications[item.id as keyof typeof notifications]})}>
                  <div className={cn(
                    "w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm",
                    notifications[item.id as keyof typeof notifications] ? "translate-x-7" : "translate-x-0"
                  )} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-50 dark:bg-red-900/10 p-10 rounded-[3rem] border border-red-100 dark:border-red-900/20 shadow-xl">
          <h3 className="text-xl font-black text-red-600 dark:text-red-400 mb-8 flex items-center gap-3">
            <Trash2 /> Danger Zone
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-bold text-earth-900 dark:text-white">Delete Account</p>
              <p className="text-sm text-earth-500 dark:text-earth-400">Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            <button className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all active:scale-95">
              Delete Account
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
