import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplets, 
  Thermometer, 
  Sprout, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Layers,
  FlaskConical,
  Wind
} from 'lucide-react';
import { cn } from '../utils/cn';
import { agriculturalAssistant } from '../services/geminiService';

export default function SoilAnalysis() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    texture: '',
    ph: '',
    deficiencies: '',
    crop: '',
    location: ''
  });

  const soilTextures = [
    'Sandy', 'Loamy', 'Clay', 'Silty', 'Peaty', 'Chalky'
  ];

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const prompt = `As an agricultural expert, analyze this soil profile and provide tailored advice:
      - Texture: ${formData.texture}
      - pH Level: ${formData.ph}
      - Observed Deficiencies/Issues: ${formData.deficiencies}
      - Intended Crop: ${formData.crop}
      - Location: ${formData.location}
      
      Please provide:
      1. Soil Amendment Recommendations
      2. Fertilization Strategy
      3. Suitability of the intended crop and alternative suggestions.
      4. Long-term soil health management tips.`;
      
      const advice = await agriculturalAssistant.getAdvice(prompt);
      setResult(advice);
      setStep(3);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="max-w-3xl">
        <h2 className="text-4xl font-black text-earth-900 dark:text-white tracking-tight mb-4">Soil Health Analysis</h2>
        <p className="text-lg text-earth-500 dark:text-earth-400 leading-relaxed">
          Get professional insights into your soil's health. Input your observations and data to receive tailored recommendations for amendments, fertilization, and crop selection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Progress Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <StepIndicator 
            number={1} 
            title="Soil Profile" 
            active={step === 1} 
            completed={step > 1} 
            onClick={() => setStep(1)}
          />
          <StepIndicator 
            number={2} 
            title="Analysis Parameters" 
            active={step === 2} 
            completed={step > 2} 
            onClick={() => step > 1 && setStep(2)}
          />
          <StepIndicator 
            number={3} 
            title="Tailored Advice" 
            active={step === 3} 
            completed={step > 3} 
            onClick={() => step > 2 && setStep(3)}
          />

          <div className="mt-12 p-8 bg-primary-50 dark:bg-primary-900/10 rounded-[2.5rem] border border-primary-100 dark:border-primary-900/20">
            <div className="flex items-center gap-3 text-primary-600 dark:text-primary-400 mb-4">
              <Info size={20} />
              <span className="text-sm font-black uppercase tracking-widest">Expert Tip</span>
            </div>
            <p className="text-sm text-primary-900 dark:text-primary-100 leading-relaxed font-medium">
              For the most accurate results, collect soil samples from multiple locations in your field at a depth of 15-20cm.
            </p>
          </div>
        </div>

        {/* Main Form Area */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-10 rounded-[3rem] border border-earth-200 shadow-xl space-y-8"
              >
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-earth-900 dark:text-white">Basic Soil Profile</h3>
                  
                  <div className="space-y-3">
                    <label className="text-xs font-black text-earth-400 uppercase tracking-widest ml-4">Soil Texture</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {soilTextures.map(texture => (
                        <button
                          key={texture}
                          onClick={() => setFormData({ ...formData, texture })}
                          className={cn(
                            "py-4 px-6 rounded-2xl text-sm font-bold border transition-all",
                            formData.texture === texture 
                              ? "bg-earth-900 dark:bg-primary-500 text-white border-earth-900 dark:border-primary-500 shadow-lg" 
                              : "bg-earth-50 dark:bg-earth-700 text-earth-600 dark:text-earth-300 border-earth-100 dark:border-earth-600 hover:border-earth-300 dark:hover:border-earth-500"
                          )}
                        >
                          {texture}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-earth-400 uppercase tracking-widest ml-4">Location (Region/County)</label>
                    <input 
                      type="text"
                      placeholder="e.g. Kiambu, Nairobi"
                      className="w-full px-6 py-4 bg-earth-50 dark:bg-earth-700 border border-earth-100 dark:border-earth-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium dark:text-white"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  disabled={!formData.texture || !formData.location}
                  className="w-full py-5 bg-earth-900 dark:bg-primary-500 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-earth-800 dark:hover:bg-primary-600 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  Continue to Analysis <ArrowRight size={20} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-10 rounded-[3rem] border border-earth-200 shadow-xl space-y-8"
              >
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-earth-900 dark:text-white">Analysis Parameters</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-earth-400 uppercase tracking-widest ml-4">pH Level (Optional)</label>
                      <input 
                        type="text"
                        placeholder="e.g. 6.5"
                        className="w-full px-6 py-4 bg-earth-50 dark:bg-earth-700 border border-earth-100 dark:border-earth-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium dark:text-white"
                        value={formData.ph}
                        onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-earth-400 uppercase tracking-widest ml-4">Intended Crop</label>
                      <input 
                        type="text"
                        placeholder="e.g. Maize, Coffee"
                        className="w-full px-6 py-4 bg-earth-50 dark:bg-earth-700 border border-earth-100 dark:border-earth-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium dark:text-white"
                        value={formData.crop}
                        onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-earth-400 uppercase tracking-widest ml-4">Observed Deficiencies / Issues</label>
                    <textarea 
                      rows={4}
                      placeholder="e.g. Yellowing leaves, stunted growth, poor drainage..."
                      className="w-full px-6 py-4 bg-earth-50 dark:bg-earth-700 border border-earth-100 dark:border-earth-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium resize-none dark:text-white"
                      value={formData.deficiencies}
                      onChange={(e) => setFormData({ ...formData, deficiencies: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 py-5 bg-earth-100 dark:bg-earth-700 text-earth-600 dark:text-earth-300 rounded-2xl font-black text-lg hover:bg-earth-200 dark:hover:bg-earth-600 transition-all active:scale-95"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleAnalyze}
                    disabled={isLoading || !formData.crop}
                    className="flex-[2] py-5 bg-primary-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-primary-500/30 hover:bg-primary-600 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>Run Analysis <FlaskConical size={20} /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && result && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-white dark:bg-earth-800 p-10 rounded-[3rem] border border-earth-200 dark:border-earth-700 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-earth-900 dark:text-white">Analysis Results</h3>
                    <button 
                      onClick={() => setStep(1)}
                      className="text-xs font-black text-primary-500 uppercase tracking-widest hover:underline"
                    >
                      Start New Analysis
                    </button>
                  </div>
                  
                  <div className="prose prose-earth dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-earth-800 dark:text-earth-200 leading-relaxed text-lg">
                      {result}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/20">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                      <CheckCircle2 size={24} />
                    </div>
                    <h4 className="text-xl font-black text-emerald-900 dark:text-emerald-100 mb-2">Amendment Plan</h4>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Follow the suggested amendments to balance your soil pH and nutrient levels.</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/20">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                      <Layers size={24} />
                    </div>
                    <h4 className="text-xl font-black text-blue-900 dark:text-blue-100 mb-2">Crop Rotation</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">Consider the alternative crops suggested to improve long-term soil health.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ number, title, active, completed, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-6 rounded-3xl border transition-all text-left",
        active 
          ? "bg-white dark:bg-earth-800 border-earth-900 dark:border-primary-500 shadow-xl translate-x-2" 
          : completed 
            ? "bg-earth-50 dark:bg-earth-700/50 border-earth-200 dark:border-earth-700 opacity-70" 
            : "bg-transparent border-earth-100 dark:border-earth-800 opacity-50"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors",
        active ? "bg-earth-900 dark:bg-primary-500 text-white" : completed ? "bg-primary-500 text-white" : "bg-earth-100 dark:bg-earth-700 text-earth-400 dark:text-earth-500"
      )}>
        {completed ? <CheckCircle2 size={20} /> : number}
      </div>
      <span className={cn(
        "font-black tracking-tight",
        active ? "text-earth-900 dark:text-white" : "text-earth-400 dark:text-earth-500"
      )}>{title}</span>
    </button>
  );
}

function Loader2({ className, size }: { className?: string, size?: number }) {
  return <motion.div 
    animate={{ rotate: 360 }} 
    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    className={className}
  >
    <FlaskConical size={size} />
  </motion.div>;
}
