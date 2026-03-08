import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  X, 
  Trash2, 
  Clock,
  Check
} from 'lucide-react';
import { cn } from '../utils/cn';
import { apiFetch } from '../utils/api';

interface Notification {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: number;
  created_at: string;
}

interface NotificationsViewProps {
  onClose: () => void;
}

export default function NotificationsView({ onClose }: NotificationsViewProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch('/api/notifications');
      setNotifications(data.notifications || []);
    } catch (err: any) {
      if (err.status !== 401) {
        console.error('Failed to fetch notifications:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-green-500" size={20} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'error': return <AlertTriangle className="text-red-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-8 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, x: 50, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-earth-800 rounded-[2.5rem] shadow-2xl border border-earth-200 dark:border-earth-700 pointer-events-auto overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="p-8 border-b border-earth-100 dark:border-earth-700 flex items-center justify-between bg-earth-50/50 dark:bg-earth-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Bell size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-earth-900 dark:text-white tracking-tight">Notifications</h3>
              <p className="text-xs text-earth-400 font-bold uppercase tracking-widest mt-0.5">
                {notifications.filter(n => !n.is_read).length} Unread
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-earth-100 dark:hover:bg-earth-700 rounded-xl transition-all text-earth-400 hover:text-earth-900 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
              <p className="text-sm text-earth-400 font-bold uppercase tracking-widest">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="w-20 h-20 bg-earth-50 dark:bg-earth-900 rounded-[2rem] flex items-center justify-center text-earth-200 dark:text-earth-700">
                <Bell size={40} />
              </div>
              <div>
                <h4 className="text-lg font-black text-earth-900 dark:text-white">All caught up!</h4>
                <p className="text-sm text-earth-400 mt-1">No new notifications at the moment.</p>
              </div>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                className={cn(
                  "p-6 rounded-[2rem] border transition-all relative group",
                  notification.is_read 
                    ? "bg-white dark:bg-earth-800 border-earth-100 dark:border-earth-700 opacity-60" 
                    : "bg-earth-50 dark:bg-earth-700/50 border-primary-500/20 shadow-sm"
                )}
              >
                <div className="flex gap-4">
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-black text-earth-900 dark:text-white truncate pr-8">{notification.title}</h5>
                      {!notification.is_read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="absolute top-6 right-6 p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                          title="Mark as read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-earth-600 dark:text-earth-300 leading-relaxed mb-3">
                      {notification.content}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-earth-400 uppercase tracking-widest">
                      <Clock size={12} />
                      {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-6 bg-earth-50/50 dark:bg-earth-900/50 border-t border-earth-100 dark:border-earth-700">
            <button 
              className="w-full py-4 bg-white dark:bg-earth-800 border border-earth-200 dark:border-earth-700 text-earth-600 dark:text-earth-300 rounded-2xl font-bold text-sm hover:bg-earth-50 dark:hover:bg-earth-700 transition-all flex items-center justify-center gap-2"
              onClick={() => {
                notifications.filter(n => !n.is_read).forEach(n => markAsRead(n.id));
              }}
            >
              <CheckCircle2 size={18} /> Mark all as read
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
