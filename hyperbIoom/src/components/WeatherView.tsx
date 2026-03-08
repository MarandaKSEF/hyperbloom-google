import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudRain, 
  CloudSun, 
  Sun, 
  Wind, 
  Droplets, 
  Thermometer, 
  MapPin, 
  RefreshCcw, 
  Calendar, 
  TrendingUp, 
  Loader2, 
  Sparkles,
  Clock,
  Globe
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { cn } from '../utils/cn';
import { agriculturalAssistant } from '../services/geminiService';
import { apiFetch } from '../utils/api';

// Fix Leaflet icon issue
const icon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const mockForecastData = {
  current: { 
    temp: 26, 
    condition: 'Mostly Sunny', 
    humidity: '42%', 
    wind: '12 km/h', 
    feelsLike: '28°C', 
    advice: "Optimal conditions for planting maize today. High evaporation rates expected; consider evening irrigation for young seedlings.",
    recommendations: [
      { activity: "Planting", status: "Optimal", desc: "Ideal soil temperature and moisture for maize and beans." },
      { activity: "Fertilizing", status: "Good", desc: "Low wind speeds ensure even distribution of top-dressing." },
      { activity: "Pest Control", status: "Caution", desc: "High humidity in the morning may increase fungal risk." }
    ]
  },
  weekly: [
    { day: 'Today', temp: 26, condition: 'Sunny', icon: Sun, rainProb: 5 },
    { day: 'Thu', temp: 28, condition: 'Partly Cloudy', icon: CloudSun, rainProb: 15 },
    { day: 'Fri', temp: 30, condition: 'Sunny', icon: Sun, rainProb: 10 },
    { day: 'Sat', temp: 27, condition: 'Rainy', icon: CloudRain, rainProb: 85 },
    { day: 'Sun', temp: 25, condition: 'Cloudy', icon: Cloud, rainProb: 40 },
    { day: 'Mon', temp: 24, condition: 'Rainy', icon: CloudRain, rainProb: 75 },
    { day: 'Tue', temp: 26, condition: 'Sunny', icon: Sun, rainProb: 20 },
  ],
  hourly: [
    { time: '12 PM', temp: 26, icon: Sun },
    { time: '1 PM', temp: 27, icon: Sun },
    { time: '2 PM', temp: 28, icon: Sun },
    { time: '3 PM', temp: 28, icon: CloudSun },
    { time: '4 PM', temp: 27, icon: CloudSun },
    { time: '5 PM', temp: 26, icon: CloudSun },
    { time: '6 PM', temp: 24, icon: CloudSun },
    { time: '7 PM', temp: 22, icon: Cloud },
    { time: '8 PM', temp: 21, icon: Cloud },
    { time: '9 PM', temp: 20, icon: Cloud },
    { time: '10 PM', temp: 19, icon: Cloud },
    { time: '11 PM', temp: 19, icon: Cloud },
    { time: '12 AM', temp: 18, icon: Cloud },
    { time: '1 AM', temp: 18, icon: Cloud },
    { time: '2 AM', temp: 17, icon: Cloud },
    { time: '3 AM', temp: 17, icon: Cloud },
    { time: '4 AM', temp: 17, icon: Cloud },
    { time: '5 AM', temp: 18, icon: CloudSun },
    { time: '6 AM', temp: 19, icon: CloudSun },
    { time: '7 AM', temp: 21, icon: Sun },
    { time: '8 AM', temp: 22, icon: Sun },
    { time: '9 AM', temp: 24, icon: Sun },
    { time: '10 AM', temp: 25, icon: Sun },
    { time: '11 AM', temp: 26, icon: Sun },
  ],
  monthly: [
    { week: 'Week 1', avgTemp: 25, rainChance: '10%', condition: 'Dry', advice: "Focus on land preparation and soil testing." },
    { week: 'Week 2', avgTemp: 24, rainChance: '45%', condition: 'Showers', advice: "Good time for early planting of drought-resistant crops." },
    { week: 'Week 3', avgTemp: 22, rainChance: '80%', condition: 'Heavy Rain', advice: "Ensure proper drainage to prevent waterlogging." },
    { week: 'Week 4', avgTemp: 23, rainChance: '30%', condition: 'Mixed', advice: "Monitor for pests that thrive in humid conditions." },
  ],
  yearly: [
    { month: 'January', temp: 28, rain: '20mm', status: 'Dry', activity: 'Harvesting & Storage' },
    { month: 'February', temp: 29, rain: '15mm', status: 'Hot', activity: 'Land Preparation' },
    { month: 'March', temp: 26, rain: '120mm', status: 'Long Rains', activity: 'Planting Maize/Beans' },
    { month: 'April', temp: 24, rain: '250mm', status: 'Peak Rains', activity: 'Weeding & Thinning' },
    { month: 'May', temp: 23, rain: '180mm', status: 'Rains', activity: 'Top Dressing' },
    { month: 'June', temp: 21, rain: '40mm', status: 'Cool/Dry', activity: 'Pest Monitoring' },
    { month: 'July', temp: 20, rain: '30mm', status: 'Coldest', activity: 'Pruning & Mulching' },
    { month: 'August', temp: 22, rain: '35mm', status: 'Dry', activity: 'Irrigation Setup' },
    { month: 'September', temp: 25, rain: '45mm', status: 'Warm', activity: 'Early Harvesting' },
    { month: 'October', temp: 26, rain: '110mm', status: 'Short Rains', activity: 'Planting Short Crops' },
    { month: 'November', temp: 25, rain: '150mm', status: 'Rains', activity: 'Weeding' },
    { month: 'December', temp: 27, rain: '60mm', status: 'Mixed', activity: 'Harvesting' },
  ]
};

interface WeatherViewProps {
  user: any;
  onAskAI?: (prompt: string) => void;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function WeatherView({ user, onAskAI }: WeatherViewProps) {
  const [activeTab, setActiveTab] = useState('current');
  const [location, setLocation] = useState('Green Valley Farm, Nairobi');
  const [isLocating, setIsLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [geoJson, setGeoJson] = useState<any>(null);
  const [weatherHighlights, setWeatherHighlights] = useState<any[]>([]);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(false);

  const fetchWeatherData = async (lat: number, lon: number) => {
    setIsLoadingData(true);
    try {
      const data = await apiFetch(`/api/weather?lat=${lat}&lon=${lon}`);
      setWeatherData(data);
    } catch (err) {
      console.error("Failed to fetch weather:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchHighlights = async (loc: string) => {
    setIsLoadingHighlights(true);
    try {
      const highlights = await agriculturalAssistant.getWeatherHighlights(loc);
      setWeatherHighlights(Array.isArray(highlights) ? highlights : []);
    } catch (err) {
      console.error("Failed to fetch highlights:", err);
      setWeatherHighlights([]);
    } finally {
      setIsLoadingHighlights(false);
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          setLocation(`Current Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
          setIsLocating(false);
          fetchWeatherData(latitude, longitude);
          fetchHighlights(location);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
          // Fallback to Nairobi if geolocation fails
          const defaultCoords = { lat: -1.2921, lng: 36.8219 };
          setCoords(defaultCoords);
          fetchWeatherData(defaultCoords.lat, defaultCoords.lng);
          fetchHighlights("Nairobi, Kenya");
        }
      );
    } else {
      setIsLocating(false);
      const defaultCoords = { lat: -1.2921, lng: 36.8219 };
      setCoords(defaultCoords);
      fetchWeatherData(defaultCoords.lat, defaultCoords.lng);
      fetchHighlights("Nairobi, Kenya");
    }
  };

  useEffect(() => {
    handleGetLocation();
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
      .then(res => res.json())
      .then(data => setGeoJson(data));
  }, []);

  const currentData = weatherData?.current || null;
  const forecastList = weatherData?.forecast?.list || [];

  // Process forecast for weekly view
  const weeklyForecast = forecastList.filter((_: any, i: number) => i % 8 === 0).map((item: any) => ({
    day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
    temp: Math.round(item.main?.temp || 0),
    condition: item.weather?.[0]?.main || 'Unknown',
    icon: item.weather?.[0]?.main?.includes('Cloud') ? CloudSun : item.weather?.[0]?.main?.includes('Rain') ? CloudRain : Sun,
    rainProb: Math.round((item.pop || 0) * 100)
  }));

  const hourlyForecast = forecastList.slice(0, 24).map((item: any) => ({
    time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric' }),
    temp: Math.round(item.main?.temp || 0),
    icon: item.weather?.[0]?.main?.includes('Cloud') ? CloudSun : item.weather?.[0]?.main?.includes('Rain') ? CloudRain : Sun,
  }));

  const userCountry = user?.location?.split(',').pop()?.trim() || "Kenya";

  const countryStyle = (feature: any) => {
    const isUserCountry = feature.properties.name === userCountry || feature.properties.name === "Kenya";
    return {
      fillColor: isUserCountry ? '#28a745' : '#9ca3af',
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: isUserCountry ? 0.6 : 0.2
    };
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-earth-900 dark:text-white tracking-tight">Weather & Forecasts</h1>
          <p className="text-earth-500 dark:text-earth-400 mt-1 flex items-center gap-2">
            <MapPin size={16} className="text-primary-500" /> {location}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleGetLocation}
            disabled={isLocating || isLoadingData}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-earth-800 border border-earth-200 dark:border-earth-700 rounded-2xl font-bold text-earth-700 dark:text-earth-200 hover:bg-earth-50 dark:hover:bg-earth-700 transition-all shadow-sm disabled:opacity-50"
          >
            {(isLocating || isLoadingData) ? <Loader2 size={18} className="animate-spin text-primary-500" /> : <RefreshCcw size={18} className="text-primary-500" />}
            {(isLocating || isLoadingData) ? 'Updating...' : 'Refresh Data'}
          </button>
        </div>
      </section>

      {/* Weather Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['current', 'weekly', 'map', 'monthly', 'yearly'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-8 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border-2 capitalize flex items-center gap-2",
              activeTab === tab 
                ? "bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20" 
                : "bg-white dark:bg-earth-800 text-earth-500 dark:text-earth-400 border-earth-100 dark:border-earth-700 hover:border-primary-200 hover:bg-earth-50"
            )}
          >
            {tab === 'map' && <Globe size={16} />}
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'current' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="relative">
                  {currentData ? (
                    <img 
                      src={`https://openweathermap.org/img/wn/${currentData.weather[0].icon}@4x.png`} 
                      alt="Weather Icon"
                      className="w-32 h-32 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                    />
                  ) : (
                    <Sun size={120} className="text-yellow-300 drop-shadow-[0_0_30px_rgba(253,224,71,0.5)]" />
                  )}
                </div>
                <div className="text-center md:text-left">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-8xl font-bold tracking-tighter">
                      {currentData ? Math.round(currentData.main.temp) : mockForecastData.current.temp}°
                    </h2>
                    <span className="text-4xl font-light opacity-60">C</span>
                  </div>
                  <p className="text-2xl font-medium text-primary-50 mt-2">
                    {currentData ? currentData.weather[0].description : mockForecastData.current.condition}
                  </p>
                  <div className="flex gap-6 mt-8">
                    <WeatherStat icon={Droplets} label="Humidity" value={currentData ? `${currentData.main.humidity}%` : mockForecastData.current.humidity} />
                    <WeatherStat icon={Wind} label="Wind" value={currentData ? `${Math.round(currentData.wind.speed * 3.6)} km/h` : mockForecastData.current.wind} />
                    <WeatherStat icon={Thermometer} label="Feels Like" value={currentData ? `${Math.round(currentData.main.feels_like)}°C` : mockForecastData.current.feelsLike} />
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 max-w-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Sun size={20} className="text-yellow-300" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary-100">Farmer's Advice</h3>
                </div>
                <p className="text-lg leading-relaxed text-primary-50 font-medium mb-6">
                  "{mockForecastData.current.advice}"
                </p>
                
                <div className="space-y-3 mb-8">
                  {mockForecastData.current.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          rec.status === 'Optimal' ? 'bg-green-400' : rec.status === 'Good' ? 'bg-blue-400' : 'bg-yellow-400'
                        )}></div>
                        <span className="text-xs font-bold">{rec.activity}</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{rec.status}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    if (user?.tier === 'free') {
                      if (confirm("AI Weather Advisory is a premium feature. Would you like to view our pricing plans to unlock expert insights?")) {
                        onAskAI?.('GO_TO_PRICING');
                      }
                      return;
                    }
                    onAskAI?.(`Based on the current weather (${currentData ? Math.round(currentData.main.temp) : 26}°C, ${currentData ? currentData.weather[0].description : 'Sunny'}) and the advice: "${mockForecastData.current.advice}", what specific steps should I take for my farm today?`);
                  }}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 group",
                    user?.tier === 'free' 
                      ? "bg-earth-200 text-earth-600 hover:bg-earth-300" 
                      : "bg-white text-primary-600 hover:bg-primary-50"
                  )}
                >
                  <Sparkles size={18} className={cn(user?.tier !== 'free' && "group-hover:rotate-12 transition-transform")} />
                  {user?.tier === 'free' ? 'Unlock AI Advisory (Pro)' : 'Ask AI Expert for Details'}
                </button>
              </div>
            </div>
          </div>

          {/* Hourly Forecast */}
          <div className="bg-white dark:bg-earth-800 p-8 rounded-[3rem] border border-earth-200 dark:border-earth-700 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 text-primary-500 rounded-xl flex items-center justify-center">
                <Clock size={20} />
              </div>
              <h3 className="text-xl font-black text-earth-900 dark:text-white">Next 24 Hours</h3>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
              {(hourlyForecast.length > 0 ? hourlyForecast : mockForecastData.hourly).map((hour, idx) => (
                <div key={idx} className="flex flex-col items-center min-w-[80px] p-4 rounded-2xl bg-earth-50 dark:bg-earth-700/50 border border-earth-100 dark:border-earth-600 transition-all hover:border-primary-500 group">
                  <span className="text-[10px] font-black text-earth-400 uppercase tracking-widest mb-4">{hour.time}</span>
                  <hour.icon size={24} className="text-primary-500 mb-4 transition-transform group-hover:scale-110" />
                  <span className="text-lg font-black text-earth-900 dark:text-white">{hour.temp}°</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'weekly' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {(weeklyForecast.length > 0 ? weeklyForecast : mockForecastData.weekly).map((item, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "bg-white dark:bg-earth-800 p-8 rounded-[2.5rem] border transition-all flex flex-col items-center text-center group",
                  idx === 0 ? "border-primary-500 shadow-lg ring-4 ring-primary-500/10" : "border-earth-200 dark:border-earth-700 shadow-sm hover:shadow-md hover:border-primary-300"
                )}
              >
                <p className={cn("text-xs font-bold uppercase tracking-widest mb-6", idx === 0 ? "text-primary-600" : "text-earth-400")}>
                  {item.day}
                </p>
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                  idx === 0 ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20" : "bg-earth-50 dark:bg-earth-700 text-earth-400"
                )}>
                  <item.icon size={32} />
                </div>
                <p className="text-2xl font-bold text-earth-900 dark:text-white">{item.temp}°</p>
                <p className="text-[10px] text-earth-400 font-bold uppercase tracking-wider mt-2">{item.condition}</p>
              </div>
            ))}
          </div>

          {/* Precipitation Probability Chart */}
          <div className="bg-white dark:bg-earth-800 p-8 rounded-[3rem] border border-earth-200 dark:border-earth-700 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                <CloudRain size={20} />
              </div>
              <h3 className="text-xl font-black text-earth-900 dark:text-white">Precipitation Probability (%)</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyForecast.length > 0 ? weeklyForecast : mockForecastData.weekly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#9ca3af' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#9ca3af' }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                      backgroundColor: '#fff'
                    }} 
                  />
                  <Bar dataKey="rainProb" radius={[10, 10, 0, 0]}>
                    {(weeklyForecast.length > 0 ? weeklyForecast : mockForecastData.weekly).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.rainProb > 50 ? '#3b82f6' : '#93c5fd'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'map' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-earth-800 p-4 rounded-[3rem] border border-earth-200 dark:border-earth-700 shadow-xl overflow-hidden h-[600px] relative">
            <MapContainer 
              center={coords ? [coords.lat, coords.lng] : [-1.2921, 36.8219]} 
              zoom={4} 
              style={{ height: '100%', width: '100%', borderRadius: '2.5rem' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* Weather Layers */}
              <TileLayer
                url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=240851cbf361f872775510801e9bf58c`}
                opacity={0.4}
              />
              {geoJson && (
                <GeoJSON 
                  data={geoJson} 
                  style={countryStyle}
                />
              )}
              {coords && (
                <Marker position={[coords.lat, coords.lng]}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-bold">{location}</p>
                      {currentData && <p className="text-lg font-black text-primary-500">{Math.round(currentData.main.temp)}°C</p>}
                    </div>
                  </Popup>
                </Marker>
              )}
              {coords && <ChangeView center={[coords.lat, coords.lng]} />}
              
              {/* Weather Highlights Markers */}
              {weatherHighlights.map((highlight, idx) => (
                <Marker 
                  key={`highlight-${idx}`} 
                  position={[highlight.lat, highlight.lon]}
                  icon={L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div class="w-8 h-8 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white shadow-lg animate-pulse">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                          </div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                  })}
                >
                  <Popup>
                    <div className="p-2 max-w-[200px]">
                      <h5 className="font-black text-earth-900 mb-1">{highlight.location}</h5>
                      <div className={cn(
                        "inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-2",
                        highlight.severity === 'High' ? 'bg-red-100 text-red-600' : 
                        highlight.severity === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                      )}>
                        {highlight.event}
                      </div>
                      <p className="text-xs text-earth-600 font-medium leading-relaxed">
                        {highlight.impact}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            <div className="absolute bottom-10 left-10 z-[1000] bg-white/90 dark:bg-earth-800/90 backdrop-blur-md p-4 rounded-2xl border border-earth-200 dark:border-earth-700 shadow-2xl max-w-xs">
              <h4 className="text-sm font-black text-earth-900 dark:text-white mb-2 flex items-center gap-2">
                <Globe size={16} className="text-primary-500" /> Global Weather Patterns
              </h4>
              <p className="text-xs text-earth-500 dark:text-earth-400 leading-relaxed">
                Visualizing real-time temperature patterns and atmospheric pressure. Your country (<span className="text-primary-500 font-bold">{userCountry}</span>) is highlighted.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'monthly' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {mockForecastData.monthly.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-earth-800 p-8 rounded-[2.5rem] border border-earth-200 dark:border-earth-700 shadow-sm hover:shadow-md transition-all">
              <h4 className="text-lg font-bold text-earth-900 dark:text-white mb-4">{item.week}</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-earth-500 dark:text-earth-400 text-sm">Avg. Temp</span>
                  <span className="font-bold text-earth-900 dark:text-white">{item.avgTemp}°C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-earth-500 dark:text-earth-400 text-sm">Rain Chance</span>
                  <span className="font-bold text-primary-600">{item.rainChance}</span>
                </div>
                <div className="pt-4 border-t border-earth-100 dark:border-earth-700">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-earth-400">Outlook</span>
                  <p className="font-bold text-earth-700 dark:text-earth-300 mt-1">{item.condition}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'yearly' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {mockForecastData.yearly.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-earth-800 p-8 rounded-[2.5rem] border border-earth-200 dark:border-earth-700 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-black text-earth-900 dark:text-white">{item.month}</h4>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  item.status === 'Dry' || item.status === 'Hot' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                )}>
                  {item.status}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-earth-400">
                    <Thermometer size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">Temp</span>
                  </div>
                  <span className="font-black text-earth-900 dark:text-white">{item.temp}°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-earth-400">
                    <CloudRain size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">Rainfall</span>
                  </div>
                  <span className="font-black text-primary-500">{item.rain}</span>
                </div>
                
                <div className="pt-4 border-t border-earth-100 dark:border-earth-700">
                  <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Recommended Activity</p>
                  <div className="flex items-center gap-2 text-earth-700 dark:text-earth-300 font-bold">
                    <TrendingUp size={16} className="text-primary-500" />
                    {item.activity}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WeatherStat({ icon: Icon, label, value }: any) {
  return (
    <div className="flex flex-col items-center md:items-start gap-1">
      <div className="flex items-center gap-2 text-primary-200">
        <Icon size={16} />
        <span className="text-[10px] uppercase tracking-widest font-bold">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
