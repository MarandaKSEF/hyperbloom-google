import React, { useState, useEffect } from 'react';
import { ShieldAlert, Info, AlertTriangle, Search, Filter, MapPin, ChevronRight, Bell, Camera, FlaskConical, Stethoscope, CheckCircle2, XCircle, Loader2, MessageSquare, Plus, Share2, BookOpen } from 'lucide-react';
import { cn } from '../utils/cn';

const DISEASES = {
  "MAIZE_MLN": {
    name: "Maize Lethal Necrosis (MLN)",
    symptoms: ["Yellowing of leaves", "Stunted growth", "Drying of leaf margins"],
    prevention: "Use certified seeds, practice crop rotation, control aphids.",
    treatment: "Uproot infected plants, practice crop rotation, use certified seeds.",
    severity: "High"
  },
  "CATTLE_FMD": {
    name: "Foot and Mouth Disease",
    symptoms: ["Blisters on mouth and feet", "Drooling", "Lameness"],
    prevention: "Regular vaccination, biosecurity measures, quarantine new animals.",
    treatment: "Quarantine animals, vaccinate healthy ones, consult vet immediately.",
    severity: "High"
  },
  "POULTRY_NEWCASTLE": {
    name: "Newcastle Disease",
    symptoms: ["Respiratory distress", "Twisted necks", "Greenish diarrhea"],
    prevention: "Vaccination schedule adherence, strict biosecurity.",
    treatment: "Vaccination is the only effective prevention. Cull infected birds.",
    severity: "High"
  }
};

const initialAlerts = [
  {
    id: 1,
    type: 'Pest',
    title: 'Fall Armyworm Outbreak',
    description: 'Significant activity reported in the northern sub-counties. High risk for maize and sorghum crops.',
    severity: 'High',
    date: '2026-02-24',
    location: 'Nairobi North',
    source: 'plantwise',
    coords: { lat: -1.28, lng: 36.82 }
  },
  {
    id: 2,
    type: 'Disease',
    title: 'Maize Lethal Necrosis (MLN)',
    description: 'Early signs detected in neighboring farms. Ensure use of certified seeds.',
    severity: 'Medium',
    date: '2026-02-23',
    location: 'Regional',
    source: 'kalro',
    coords: { lat: -1.30, lng: 36.78 }
  }
];

const communityReports = [
  { id: 1, user: 'Farmer Mike', report: 'Seeing unusual yellowing on maize leaves in Limuru area.', time: '2h ago', likes: 12, comments: 3 },
  { id: 2, user: 'Sarah J.', report: 'Confirmed Fall Armyworm in my field. Watch out neighbors!', time: '5h ago', likes: 24, comments: 8 },
];

export default function AlertsView() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'scan' | 'livestock' | 'community' | 'prevention'>('alerts');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [livestockInput, setLivestockInput] = useState('');
  const [isLivestockScanning, setIsLivestockScanning] = useState(false);
  const [livestockResult, setLivestockResult] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
        },
        () => setIsLocating(false)
      );
    }
  }, []);

  const [isReporting, setIsReporting] = useState(false);
  const [newReport, setNewReport] = useState('');
  const [reports, setReports] = useState(communityReports);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setScanResult(null); // Reset result when new image is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = () => {
    if (!selectedImage) return;
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult(DISEASES.MAIZE_MLN);
    }, 2000);
  };

  const handleLivestockScan = () => {
    if (!livestockInput.trim()) return;
    setIsLivestockScanning(true);
    setLivestockResult(null);
    setTimeout(() => {
      setIsLivestockScanning(false);
      setLivestockResult(DISEASES.CATTLE_FMD);
    }, 2000);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReport.trim()) return;
    
    const report = {
      id: reports.length + 1,
      user: 'You',
      report: newReport,
      time: 'Just now',
      likes: 0,
      comments: 0
    };
    
    setReports([report, ...reports]);
    setNewReport('');
    setIsReporting(false);
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-earth-900 dark:text-white tracking-tight">Disease Detection & Alerts</h1>
          <p className="text-earth-500 dark:text-earth-400 mt-1 flex items-center gap-2">
            AI-powered diagnosis and regional outbreak monitoring.
            {userLocation && (
              <span className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                <MapPin size={10} /> Location Active
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 bg-white dark:bg-earth-800 p-1.5 rounded-2xl border border-earth-200 dark:border-earth-700 shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: 'alerts', label: 'Alerts', icon: Bell },
            { id: 'scan', label: 'Crop Scanner', icon: Camera },
            { id: 'livestock', label: 'Livestock AI', icon: Stethoscope },
            { id: 'community', label: 'Community', icon: MessageSquare },
            { id: 'prevention', label: 'Prevention', icon: BookOpen },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap",
                activeTab === tab.id ? "bg-primary-500 text-white shadow-md" : "text-earth-500 dark:text-earth-400 hover:bg-earth-50 dark:hover:bg-earth-700"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === 'alerts' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {userLocation && (
            <div className="bg-primary-50 dark:bg-primary-900/10 p-6 rounded-[2rem] border border-primary-100 dark:border-primary-900/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white dark:bg-earth-800 rounded-2xl flex items-center justify-center text-primary-500 shadow-sm">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-primary-900 dark:text-primary-100">Nearby Alerts</h3>
                  <p className="text-sm text-primary-700 dark:text-primary-300">Showing outbreaks within 50km of your current location.</p>
                </div>
              </div>
              <button className="px-6 py-2 bg-white dark:bg-earth-800 text-primary-600 dark:text-primary-400 rounded-xl font-bold text-sm shadow-sm border border-primary-100 dark:border-primary-900/30">
                View Map
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {initialAlerts.map((alert) => (
              <div key={alert.id} className="bg-white dark:bg-earth-800 rounded-[2.5rem] border border-earth-200 dark:border-earth-700 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row group">
                <div className={cn(
                  "w-full md:w-3 flex items-center justify-center transition-colors",
                  alert.severity === 'High' ? "bg-red-500" : "bg-orange-500"
                )} />
                <div className="p-8 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                        alert.severity === 'High' ? "bg-red-50 dark:bg-red-900/20 text-red-600" : "bg-orange-50 dark:bg-orange-900/20 text-orange-600"
                      )}>
                        {alert.severity === 'High' ? <AlertTriangle size={28} /> : <Info size={28} />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-earth-900 dark:text-white group-hover:text-primary-600 transition-colors">{alert.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={cn("source-badge", alert.source)}>{alert.source.toUpperCase()}</span>
                          <span className="text-[10px] font-bold text-earth-400 uppercase tracking-widest flex items-center gap-1">
                            <MapPin size={12} /> {alert.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-earth-600 dark:text-earth-300 text-lg leading-relaxed mb-8 max-w-4xl">
                    {alert.description}
                  </p>
                  <div className="flex gap-4">
                    <button className="px-8 py-3 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20">
                      View Treatment
                    </button>
                    <button className="px-8 py-3 bg-earth-50 dark:bg-earth-700 text-earth-700 dark:text-earth-200 rounded-xl font-bold hover:bg-earth-100 dark:hover:bg-earth-600 transition-all">
                      Share Alert
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'scan' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-earth-800 rounded-[3rem] border-2 border-dashed border-earth-200 dark:border-earth-700 p-12 text-center relative overflow-hidden">
            {!isScanning && !scanResult && (
              <div className="max-w-md mx-auto">
                <div className="relative group cursor-pointer mb-8">
                  <div className={cn(
                    "w-48 h-48 bg-primary-50 dark:bg-primary-900/20 rounded-[2.5rem] flex items-center justify-center mx-auto text-primary-500 overflow-hidden border-4 border-white dark:border-earth-800 shadow-2xl transition-all group-hover:scale-105 group-hover:rotate-1",
                    selectedImage && "bg-transparent"
                  )}>
                    {selectedImage ? (
                      <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Camera size={48} />
                        <span className="text-xs font-black uppercase tracking-widest opacity-60">Click to Upload</span>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    title="Choose a photo"
                  />
                  {selectedImage && (
                    <div className="absolute -bottom-2 right-1/2 translate-x-24 p-3 bg-primary-500 text-white rounded-2xl shadow-xl border-4 border-white dark:border-earth-800">
                      <CheckCircle2 size={20} />
                    </div>
                  )}
                </div>
                
                <h3 className="text-2xl font-black text-earth-900 dark:text-white mb-4">
                  {selectedImage ? 'Photo Ready!' : 'Scan for Crop Disease'}
                </h3>
                <p className="text-earth-500 dark:text-earth-400 mb-10 leading-relaxed font-medium">
                  {selectedImage 
                    ? 'Great! Now let our AI analyze the symptoms in your photo.' 
                    : 'Upload a clear photo of the affected crop parts (leaves, stems, or roots).'}
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleScan}
                    disabled={!selectedImage}
                    className="w-full py-5 bg-primary-500 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    <FlaskConical size={24} /> {isScanning ? 'Analyzing...' : 'Start AI Analysis'}
                  </button>
                  {selectedImage && (
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="text-earth-400 font-bold text-sm hover:text-red-500 transition-colors"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            )}

            {isScanning && (
              <div className="py-12">
                <Loader2 size={64} className="animate-spin text-primary-500 mx-auto mb-8" />
                <h3 className="text-2xl font-bold text-earth-900 dark:text-white mb-2">Analyzing Symptoms...</h3>
                <p className="text-earth-500 dark:text-earth-400">Comparing with 5,000+ agricultural disease patterns</p>
              </div>
            )}

            {scanResult && (
              <div className="text-left animate-in zoom-in-95 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center justify-center">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-earth-900 dark:text-white">Diagnosis: {scanResult.name}</h3>
                    <p className="text-red-600 font-bold uppercase tracking-widest text-xs mt-1">Severity: {scanResult.severity}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-earth-50 dark:bg-earth-700/50 p-8 rounded-[2rem] border border-earth-100 dark:border-earth-600">
                    <h4 className="font-bold text-earth-900 dark:text-white mb-4 flex items-center gap-2">
                      <Stethoscope size={20} className="text-primary-500" /> Detected Symptoms
                    </h4>
                    <ul className="space-y-3">
                      {scanResult.symptoms?.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-earth-600 dark:text-earth-300">
                          <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-primary-50 dark:bg-primary-900/10 p-8 rounded-[2rem] border border-primary-100 dark:border-primary-900/20">
                    <h4 className="font-bold text-primary-900 dark:text-primary-100 mb-4 flex items-center gap-2">
                      <FlaskConical size={20} className="text-primary-600" /> Recommended Treatment
                    </h4>
                    <p className="text-primary-800 dark:text-primary-200 leading-relaxed font-medium">
                      {scanResult.treatment}
                    </p>
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button className="px-10 py-4 bg-primary-500 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all">
                    Generate Full Report
                  </button>
                  <button 
                    onClick={() => {
                      setScanResult(null);
                      setSelectedImage(null);
                    }}
                    className="px-10 py-4 bg-white dark:bg-earth-700 border border-earth-200 dark:border-earth-600 text-earth-600 dark:text-earth-300 rounded-2xl font-bold hover:bg-earth-50 dark:hover:bg-earth-600 transition-all"
                  >
                    Scan Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'livestock' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-earth-800 rounded-[3rem] border border-earth-200 dark:border-earth-700 p-12 shadow-sm">
            {!isLivestockScanning && !livestockResult && (
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-500">
                    <Stethoscope size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-earth-900 dark:text-white mb-2">Livestock Disease Analysis</h3>
                  <p className="text-earth-500 dark:text-earth-400">Describe symptoms observed in your livestock for an instant AI-powered analysis.</p>
                </div>
                
                <div className="space-y-4">
                  <textarea 
                    className="w-full p-6 bg-earth-50 dark:bg-earth-700 border border-earth-200 dark:border-earth-600 rounded-3xl focus:ring-2 focus:ring-primary-500 outline-none min-h-[150px] text-lg dark:text-white"
                    placeholder="e.g. Cattle showing blistering on hooves, drooling, and high fever..."
                    value={livestockInput}
                    onChange={(e) => setLivestockInput(e.target.value)}
                  />
                  <button 
                    onClick={handleLivestockScan}
                    disabled={!livestockInput.trim()}
                    className="w-full py-5 bg-primary-500 text-white rounded-2xl font-bold hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Search size={24} /> Run AI Diagnosis
                  </button>
                </div>

                <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-3xl flex gap-4 items-start">
                  <AlertTriangle className="text-red-500 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-red-900 dark:text-red-100 mb-1 text-sm">Important Disclaimer</h4>
                    <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                      This tool is for informational purposes only. It should not be used as a substitute for professional veterinary diagnosis. Always consult with a licensed veterinarian.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isLivestockScanning && (
              <div className="py-20 text-center">
                <Loader2 size={64} className="animate-spin text-primary-500 mx-auto mb-8" />
                <h3 className="text-2xl font-bold text-earth-900 dark:text-white mb-2">Analyzing Symptoms...</h3>
                <p className="text-earth-500 dark:text-earth-400">Consulting veterinary database and AI models</p>
              </div>
            )}

            {livestockResult && (
              <div className="text-left animate-in zoom-in-95 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center justify-center">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-earth-900 dark:text-white">Diagnosis: {livestockResult.name}</h3>
                    <p className="text-red-600 font-bold uppercase tracking-widest text-xs mt-1">Severity: {livestockResult.severity}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-earth-50 dark:bg-earth-700/50 p-8 rounded-[2rem] border border-earth-100 dark:border-earth-600">
                    <h4 className="font-bold text-earth-900 dark:text-white mb-4 flex items-center gap-2">
                      <Stethoscope size={20} className="text-primary-500" /> Detected Symptoms
                    </h4>
                    <ul className="space-y-3">
                      {livestockResult.symptoms?.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-earth-600 dark:text-earth-300">
                          <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-primary-50 dark:bg-primary-900/10 p-8 rounded-[2rem] border border-primary-100 dark:border-primary-900/20">
                    <h4 className="font-bold text-primary-900 dark:text-primary-100 mb-4 flex items-center gap-2">
                      <FlaskConical size={20} className="text-primary-600" /> Recommended Action
                    </h4>
                    <p className="text-primary-800 dark:text-primary-200 leading-relaxed font-medium">
                      {livestockResult.treatment}
                    </p>
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button className="px-10 py-4 bg-primary-500 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all">
                    Consult Local Vet
                  </button>
                  <button 
                    onClick={() => setLivestockResult(null)}
                    className="px-10 py-4 bg-white dark:bg-earth-700 border border-earth-200 dark:border-earth-600 text-earth-600 dark:text-earth-300 rounded-2xl font-bold hover:bg-earth-50 dark:hover:bg-earth-600 transition-all"
                  >
                    New Analysis
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'community' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-earth-900 dark:text-white">Community Outbreak Reports</h2>
            <button 
              onClick={() => setIsReporting(!isReporting)}
              className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-2xl font-black shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all active:scale-95"
            >
              <Plus size={20} /> {isReporting ? 'Cancel Report' : 'Report Outbreak'}
            </button>
          </div>

          {isReporting && (
            <div className="bg-white dark:bg-earth-800 p-8 rounded-[2.5rem] border border-earth-200 dark:border-earth-700 shadow-xl animate-in zoom-in-95 duration-300">
              <h3 className="text-xl font-black text-earth-900 dark:text-white mb-6">New Outbreak Report</h3>
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <textarea 
                  placeholder="Describe the outbreak you've observed (location, symptoms, affected crops)..."
                  className="w-full px-6 py-4 bg-earth-50 dark:bg-earth-700 border border-earth-200 dark:border-earth-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px] dark:text-white"
                  value={newReport}
                  onChange={(e) => setNewReport(e.target.value)}
                  required
                />
                <button 
                  type="submit"
                  className="w-full py-4 bg-primary-500 text-white rounded-2xl font-black hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20"
                >
                  Publish Report
                </button>
              </form>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-white dark:bg-earth-800 p-8 rounded-[2.5rem] border border-earth-200 dark:border-earth-700 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-earth-100 dark:bg-earth-700 rounded-2xl flex items-center justify-center text-primary-500 font-black text-xl border border-earth-200 dark:border-earth-600">
                      {report.user[0]}
                    </div>
                    <div>
                      <h4 className="font-black text-earth-900 dark:text-white">{report.user}</h4>
                      <p className="text-[10px] text-earth-400 font-bold uppercase tracking-widest">{report.time}</p>
                    </div>
                  </div>
                  <button className="text-earth-400 hover:text-primary-500 transition-colors">
                    <Share2 size={18} />
                  </button>
                </div>
                <p className="text-earth-600 dark:text-earth-300 leading-relaxed mb-6 font-medium">
                  {report.report}
                </p>
                <div className="flex items-center gap-6 pt-6 border-t border-earth-100 dark:border-earth-700">
                  <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-earth-400 hover:text-primary-500 transition-colors">
                    <CheckCircle2 size={16} /> {report.likes} Verified
                  </button>
                  <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-earth-400 hover:text-primary-500 transition-colors">
                    <MessageSquare size={16} /> {report.comments} Comments
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'prevention' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {Object.entries(DISEASES).map(([key, disease]) => (
            <div key={key} className="bg-white dark:bg-earth-800 p-8 rounded-[2.5rem] border border-earth-200 dark:border-earth-700 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-primary-500 mb-6">
                <ShieldAlert size={28} />
              </div>
              <h3 className="text-xl font-bold text-earth-900 dark:text-white mb-4">{disease.name}</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Prevention Strategy</h4>
                  <p className="text-sm text-earth-600 dark:text-earth-300 leading-relaxed font-medium">
                    {disease.prevention}
                  </p>
                </div>
                <button className="w-full py-3 bg-earth-50 dark:bg-earth-700 text-earth-700 dark:text-earth-200 rounded-xl font-bold text-sm hover:bg-earth-100 dark:hover:bg-earth-600 transition-all">
                  Full Guide
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
