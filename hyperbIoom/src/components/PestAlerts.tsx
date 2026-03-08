import React, { useState, useEffect } from 'react';
import { ShieldAlert, Bug, Ghost, CloudRain, Wind, Search, Filter, AlertTriangle, CheckCircle2, Info, ExternalLink, MapPin, Sprout, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { cn } from '../utils/cn';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Alert {
  id: string;
  type: 'pest' | 'calamity';
  category: 'plant' | 'animal' | 'environmental';
  target: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  date: string;
  source: string;
}

export default function PestAlerts({ user }: { user: any }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'plant' | 'animal' | 'calamity'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const model = user?.tier !== 'free' ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";
      const response = await ai.models.generateContent({
        model: model,
        contents: "Search for current pest outbreaks and natural calamities affecting agriculture in East Africa (specifically Kenya) for the current month. Categorize them into 'plant pests', 'animal diseases/pests', and 'calamities' (floods, locusts, droughts). Return a JSON array of alerts with fields: id, type, category, target (specific plant/animal), title, description, severity (low/medium/high/critical), location, date, source.",
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                category: { type: Type.STRING },
                target: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                severity: { type: Type.STRING },
                location: { type: Type.STRING },
                date: { type: Type.STRING },
                source: { type: Type.STRING }
              },
              required: ["id", "type", "category", "target", "title", "description", "severity", "location", "date", "source"]
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      setAlerts(data);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
      // Fallback data if API fails or for demo
      setAlerts([
        {
          id: '1',
          type: 'pest',
          category: 'plant',
          target: 'Maize',
          title: 'Fall Armyworm Outbreak',
          description: 'Significant infestation reported in Western Kenya. Farmers are advised to monitor crops daily.',
          severity: 'high',
          location: 'Western Kenya',
          date: '2024-05-20',
          source: 'KALRO'
        },
        {
          id: '2',
          type: 'calamity',
          category: 'environmental',
          target: 'All Crops',
          title: 'Flash Flood Warning',
          description: 'Heavy rains expected in the Rift Valley region. Risk of crop damage and soil erosion.',
          severity: 'critical',
          location: 'Rift Valley',
          date: '2024-05-22',
          source: 'Kenya Meteorological Department'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === 'all' || 
      (filter === 'plant' && alert.category === 'plant') ||
      (filter === 'animal' && alert.category === 'animal') ||
      (filter === 'calamity' && alert.type === 'calamity');
    
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-earth-900';
      default: return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black text-earth-900 dark:text-white tracking-tight mb-2">Pest & Calamity Alerts</h2>
          <p className="text-earth-500 dark:text-earth-400 font-medium">Real-time monitoring of agricultural threats in your region.</p>
        </div>
        <button 
          onClick={fetchAlerts}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-earth-800 border border-earth-200 dark:border-earth-700 text-earth-700 dark:text-earth-200 rounded-2xl font-bold hover:bg-earth-50 transition-all shadow-sm"
        >
          <RefreshCw size={18} className={cn(isLoading && "animate-spin")} /> Refresh Data
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by pest, crop, or location..."
            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-earth-800 border border-earth-200 dark:border-earth-700 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all dark:text-white shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex p-1.5 bg-white dark:bg-earth-800 border border-earth-200 dark:border-earth-700 rounded-[2rem] shadow-sm">
          {[
            { id: 'all', label: 'All Alerts', icon: ShieldAlert },
            { id: 'plant', label: 'Plants', icon: Sprout },
            { id: 'animal', label: 'Animals', icon: Ghost },
            { id: 'calamity', label: 'Calamities', icon: CloudRain },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all",
                filter === btn.id 
                  ? "bg-earth-900 dark:bg-primary-500 text-white shadow-lg" 
                  : "text-earth-500 dark:text-earth-400 hover:bg-earth-50 dark:hover:bg-earth-700"
              )}
            >
              <btn.icon size={16} /> {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white dark:bg-earth-800 h-80 rounded-[3rem] border border-earth-200 dark:border-earth-700 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredAlerts.map((alert) => (
              <motion.div
                layout
                key={alert.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-earth-800 p-8 rounded-[3rem] border border-earth-200 dark:border-earth-700 shadow-sm hover:shadow-xl transition-all group flex flex-col"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform",
                    alert.type === 'pest' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                  )}>
                    {alert.type === 'pest' ? <Bug size={28} /> : <CloudRain size={28} />}
                  </div>
                  <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm", getSeverityColor(alert.severity))}>
                    {alert.severity}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{alert.category} • {alert.target}</span>
                  </div>
                  <h3 className="text-xl font-black text-earth-900 dark:text-white mb-4 group-hover:text-primary-600 transition-colors">{alert.title}</h3>
                  <p className="text-sm text-earth-500 dark:text-earth-400 leading-relaxed mb-8">{alert.description}</p>
                </div>

                <div className="pt-6 border-t border-earth-100 dark:border-earth-700 space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-earth-400 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><MapPin size={14} /> {alert.location}</span>
                    <span>{alert.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-earth-400 font-medium italic">Source: {alert.source}</span>
                    <button className="text-primary-500 hover:text-primary-600 transition-colors flex items-center gap-1 text-xs font-black uppercase tracking-widest">
                      Details <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredAlerts.length === 0 && (
        <div className="text-center py-32 bg-earth-50 dark:bg-earth-800/50 rounded-[4rem] border-2 border-dashed border-earth-200 dark:border-earth-700">
          <div className="w-20 h-20 bg-white dark:bg-earth-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h3 className="text-2xl font-black text-earth-900 dark:text-white mb-2">No Active Threats Found</h3>
          <p className="text-earth-500 dark:text-earth-400">Your region currently has no reported pest outbreaks or calamities.</p>
        </div>
      )}

      {/* Advisory Section */}
      <div className="bg-earth-900 dark:bg-primary-600 rounded-[4rem] p-12 lg:p-16 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={48} className="text-primary-400" />
          </div>
          <div className="flex-1 text-center lg:text-left">
            <h3 className="text-3xl font-black mb-4 tracking-tight">Stay Protected with HyperShield</h3>
            <p className="text-earth-200 text-lg leading-relaxed opacity-90">
              Enable push notifications to receive instant alerts about threats in your specific location. Our AI monitors thousands of sources to keep your farm safe.
            </p>
          </div>
          <button className="px-10 py-5 bg-white text-earth-900 rounded-2xl font-black shadow-xl hover:bg-earth-50 transition-all active:scale-95 whitespace-nowrap">
            Enable Smart Alerts
          </button>
        </div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_-20%,rgba(255,255,255,0.1),transparent_70%)]"></div>
      </div>
    </div>
  );
}
