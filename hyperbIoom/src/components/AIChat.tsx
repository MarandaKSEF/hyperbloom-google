import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, RefreshCcw, Paperclip, Mic, Image as ImageIcon, Copy, ThumbsUp, ThumbsDown, Redo, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { agriculturalAssistant } from '../services/geminiService';
import { cn } from '../utils/cn';
import { apiFetch } from '../utils/api';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  user: any;
  onUpdateUser: (user: any) => void;
  initialPrompt?: string | null;
  onClearPrompt?: () => void;
}

// AIChat Component: An intelligent agricultural assistant
// Provides expert advice on farming, livestock, and pests
export default function AIChat({ user, onUpdateUser, initialPrompt, onClearPrompt }: AIChatProps) {
  // Chat history state
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hello! I'm **HYPERBLOOM ${user?.tier !== 'free' ? user.tier.toUpperCase() : ''}**, your digital farm assistant. How can I help you improve your farm today?\n\nYou can ask me about:\n* **Crop Management** (planting, irrigation, harvesting)\n* **Livestock Health** (vaccinations, common diseases)\n* **Pest Control** (identification and treatment)\n* **Weather Impacts** on your specific crops` }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Handle file selection for attachments
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
      onClearPrompt?.();
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleUpgrade = async () => {
    try {
      await apiFetch('/api/monetization/upgrade', { 
        method: 'POST',
        body: JSON.stringify({ tier: 'pro', paymentMethod: 'M-Pesa' }) // Default to Pro/M-Pesa from chat
      });
      const userData = await apiFetch('/api/auth/me');
      onUpdateUser(userData);
      setUsageError(null);
      setMessages(prev => [...prev, { role: 'assistant', content: "🎉 **Congratulations!** You've been upgraded to **HYPERBLOOM PRO**. You now have unlimited access to our most powerful AI models." }]);
    } catch (err) {
      console.error('Upgrade failed:', err);
    }
  };

  const handleSend = async (customInput?: string) => {
    const messageToSend = customInput || input.trim();
    if (!messageToSend || isLoading) return;

    setUsageError(null);
    if (!customInput) setInput('');
    
    // Check usage
    try {
      const usageData = await apiFetch('/api/ai/usage', { method: 'POST' });
      
      // Update local user state with new count
      onUpdateUser({ ...user, ai_usage_count: usageData.count });
    } catch (err: any) {
      if (err.status === 403) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `⚠️ **Daily Limit Reached**\n\nYou've used your 20 free AI queries for today. To continue getting expert agricultural advice and unlock our most powerful models, please consider upgrading to a **Pro** or **Elite** plan.\n\n[Upgrade Now to Continue Chatting]` 
        }]);
        setUsageError(err.message);
        return;
      }
      console.error('Usage check failed:', err);
    }

    setMessages(prev => [...prev, { 
      role: 'user', 
      content: attachment ? `${messageToSend}\n\n📎 Attachment: ${attachment.name}` : messageToSend 
    }]);
    setIsLoading(true);
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    try {
      let weatherContext = "";
      const weatherKeywords = ['weather', 'rain', 'storm', 'heat', 'wind', 'irrigation', 'planting', 'harvest'];
      if (weatherKeywords.some(kw => messageToSend.toLowerCase().includes(kw))) {
        const highlights = await agriculturalAssistant.getWeatherHighlights(user?.location || "Kenya");
        if (Array.isArray(highlights) && highlights.length > 0) {
          weatherContext = "\n\n**Current Weather Highlights for your region:**\n" + 
            highlights.map((h: any) => `* **${h.location}**: ${h.event} - ${h.impact} (${h.severity} Severity)`).join('\n');
        }
      }

      const response = await agriculturalAssistant.getAdvice(
        weatherContext ? `${messageToSend}\n\n[Context: ${weatherContext}]` : messageToSend, 
        user?.tier !== 'free'
      );
      setMessages(prev => [...prev, { role: 'assistant', content: response || "I'm sorry, I couldn't process that. Could you try again?" }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please check your internet and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col relative max-w-5xl mx-auto">
      {/* Chat Body */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 space-y-12 no-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-6 max-w-4xl mx-auto group",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                msg.role === 'assistant' 
                  ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white" 
                  : "bg-earth-900 dark:bg-earth-700 text-white"
              )}>
                {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
              </div>
              
              <div className={cn(
                "flex-1 space-y-2",
                msg.role === 'user' ? "text-right" : "text-left"
              )}>
                <div className={cn(
                  "inline-block text-lg leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-earth-100 dark:bg-earth-800 px-8 py-5 rounded-[2.5rem] text-earth-900 dark:text-white shadow-sm" 
                    : "bg-white dark:bg-earth-800 border border-earth-100 dark:border-earth-700 px-8 py-6 rounded-[2.5rem] text-earth-800 dark:text-earth-200 shadow-md ring-4 ring-primary-500/5"
                )}>
                  {msg.role === 'assistant' ? (
                    <div className="markdown-body prose prose-earth dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-earth-900 dark:prose-headings:text-white prose-strong:text-earth-900 dark:prose-strong:text-white prose-li:my-1">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
                
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-earth-400 hover:text-primary-500 transition-colors"><Copy size={16} /></button>
                    <button className="p-2 text-earth-400 hover:text-primary-500 transition-colors"><ThumbsUp size={16} /></button>
                    <button className="p-2 text-earth-400 hover:text-primary-500 transition-colors"><ThumbsDown size={16} /></button>
                    <button 
                      onClick={() => setMessages([{ role: 'assistant', content: "Hello! I'm HYPERBLOOM, your digital farm assistant. How can I help you improve your farm today?" }])}
                      className="p-2 text-earth-400 hover:text-primary-500 transition-colors"
                    >
                      <RefreshCcw size={16} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <div className="flex gap-6 max-w-4xl mx-auto animate-pulse">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} className="text-primary-500 animate-spin" />
            </div>
            <div className="flex-1 space-y-3 pt-2">
              <div className="h-4 bg-earth-100 rounded-full w-3/4"></div>
              <div className="h-4 bg-earth-100 rounded-full w-1/2"></div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Input Box */}
      <div className="mt-auto px-4 pb-8">
        <div className="max-w-3xl mx-auto relative group">
          {usageError && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-6 bg-primary-500 text-white rounded-[2rem] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Sparkles size={24} />
                </div>
                <div>
                  <p className="font-black text-lg leading-tight">Limit Reached</p>
                  <p className="text-sm opacity-90">{usageError}</p>
                </div>
              </div>
              <button 
                onClick={handleUpgrade}
                className="px-8 py-3 bg-white text-primary-600 rounded-xl font-black text-sm hover:bg-primary-50 transition-all shadow-xl"
              >
                Upgrade to Pro
              </button>
            </motion.div>
          )}

          {attachment && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 bg-earth-100 dark:bg-earth-800 rounded-2xl border border-earth-200 dark:border-earth-700 flex items-center justify-between gap-4 max-w-sm"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-500 flex-shrink-0">
                  <Paperclip size={18} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-earth-900 dark:text-white truncate">{attachment.name}</p>
                  <p className="text-[10px] text-earth-400 font-bold uppercase tracking-widest">{(attachment.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button 
                onClick={removeAttachment}
                className="p-2 hover:bg-earth-200 dark:hover:bg-earth-700 rounded-lg transition-colors text-earth-400"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}

          <div className="absolute inset-0 bg-primary-500/5 blur-3xl rounded-[3rem] group-focus-within:bg-primary-500/10 transition-all"></div>
          <div className="relative bg-white dark:bg-earth-800 border border-earth-200 dark:border-earth-700 rounded-[2rem] shadow-2xl p-1.5 transition-all group-focus-within:border-primary-500/50 group-focus-within:ring-8 group-focus-within:ring-primary-500/5">
            <div className="flex items-end gap-1 p-1">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-earth-400 hover:text-primary-500 transition-colors rounded-full hover:bg-earth-50 dark:hover:bg-earth-700"
              >
                <Paperclip size={20} />
              </button>
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask HYPERBLOOM anything..."
                className="flex-1 bg-transparent border-none focus:ring-0 py-3 px-2 text-base text-earth-900 dark:text-white placeholder-earth-400 resize-none max-h-48 no-scrollbar"
              />
              <div className="flex items-center gap-1">
                <button className="p-3 text-earth-400 hover:text-primary-500 transition-colors rounded-full hover:bg-earth-50 dark:hover:bg-earth-700">
                  <Mic size={20} />
                </button>
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "p-3 rounded-full transition-all shadow-xl active:scale-95",
                    input.trim() && !isLoading 
                      ? "bg-primary-500 text-white shadow-primary-500/30" 
                      : "bg-earth-100 dark:bg-earth-700 text-earth-300 dark:text-earth-600"
                  )}
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </div>
          <p className="text-center text-[9px] font-black text-earth-400 uppercase tracking-[0.2em] mt-4">
            HYPERBLOOM AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
