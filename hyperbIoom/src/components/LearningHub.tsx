import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Satellite, 
  Book, 
  Video, 
  FlaskConical, 
  Download, 
  Bookmark,
  ChevronRight,
  Play,
  Star,
  CloudRain,
  Droplets,
  Thermometer,
  Lightbulb,
  Redo,
  Sparkles,
  MessageCircle,
  ArrowRight,
  Loader2,
  BookOpen,
  Trophy,
  History,
  Sprout,
  ShieldAlert,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';
import { agriculturalAssistant } from '../services/geminiService';
import Markdown from 'react-markdown';

const sources = [
  { id: 'kilimo', name: 'KILIMO', category: 'Government & Policy', color: 'kilimo' },
  { id: 'kalro', name: 'KALRO GAPs', category: 'Government & Policy', color: 'kalro' },
  { id: 'kaop', name: 'KAOP', category: 'Real-Time Advisory', color: 'kaop' },
  { id: 'aik', name: 'AIK', category: 'Real-Time Advisory', color: 'aik' },
  { id: 'plantwise', name: 'PlantwisePlus', category: 'Plant Health & Nutrition', color: 'plantwise' },
  { id: 'yara', name: 'YARA Kenya', category: 'Plant Health & Nutrition', color: 'yara' },
  { id: 'accessag', name: 'Access Agriculture', category: 'Multimedia & Guides', color: 'accessag' },
  { id: 'kfdg', name: 'KFDG', category: 'Multimedia & Guides', color: 'kfdg' },
];

const contentItems = [
  {
    id: 1,
    title: 'Maize Production Best Practices',
    description: 'Complete guide on maize land preparation, planting, weeding, and post-harvest handling according to official KALRO standards.',
    source: 'kalro',
    category: 'Maize',
    tags: ['Land Prep', 'Planting', 'Official'],
    icon: Book,
    type: 'article'
  },
  {
    id: 2,
    title: 'Armyworm Detection and Management',
    description: 'Identify and manage armyworm outbreaks in maize using integrated pest management strategies.',
    source: 'plantwise',
    category: 'Pest Management',
    tags: ['Maize', 'Pest Control', 'Smart Alert'],
    icon: FlaskConical,
    type: 'article'
  },
  {
    id: 3,
    title: 'Fertilizer Recommendation System',
    description: 'Get precise fertilizer recommendations based on soil type, crop stage, and yield targets from YARA experts.',
    source: 'yara',
    category: 'Nutrition',
    tags: ['Fertilizer', 'Soil Testing', 'Precision'],
    icon: FlaskConical,
    type: 'article'
  },
  {
    id: 4,
    title: 'Real-Time Rainfall Monitoring',
    description: 'Satellite-based rainfall data and alerts for your specific location with planting recommendations.',
    source: 'kaop',
    category: 'Weather Advisory',
    tags: ['Rainfall', 'Satellite', 'Location'],
    icon: Satellite,
    type: 'tutorial'
  },
  {
    id: 5,
    title: 'Drip Irrigation Setup Guide',
    description: 'Learn how to install and maintain a low-cost drip irrigation system for small-scale vegetable farming.',
    source: 'aik',
    category: 'Irrigation',
    tags: ['Water', 'Tech', 'DIY'],
    icon: Video,
    type: 'tutorial',
    youtubeId: '2_p_w_f7y_0',
    steps: [
      { title: 'Source Connection', desc: 'Connect your main water source to the header pipe using a filter.' },
      { title: 'Lay Mainline', desc: 'Run the main pipe along the edge of your planting area.' },
      { title: 'Install Emitters', desc: 'Punch holes and attach drip lines at each plant location.' }
    ],
    quiz: {
      question: 'What is the primary benefit of drip irrigation over overhead sprinklers?',
      options: ['Higher water pressure', 'Reduced water waste', 'Faster watering', 'Cheaper pipes'],
      answer: 'Reduced water waste'
    }
  },
  {
    id: 6,
    title: 'Sustainable Soil Management',
    description: 'Practical techniques for improving soil fertility and structure using organic matter and cover crops.',
    source: 'kfdg',
    category: 'Soil Health',
    tags: ['Organic', 'Soil', 'Conservation'],
    icon: Book,
    type: 'article'
  },
  {
    id: 7,
    title: 'Post-Harvest Loss Reduction',
    description: 'Modern storage solutions and handling techniques to minimize losses after harvest.',
    source: 'kalro',
    category: 'Post-Harvest',
    tags: ['Storage', 'Efficiency', 'Profit'],
    icon: BookOpen,
    type: 'article'
  },
  {
    id: 8,
    title: 'Climate-Smart Crop Selection',
    description: 'How to choose the right crop varieties for changing weather patterns in your region.',
    source: 'kaop',
    category: 'Climate',
    tags: ['Weather', 'Planning', 'Resilience'],
    icon: CloudRain,
    type: 'article'
  },
  {
    id: 9,
    title: 'Hydroponics for Beginners',
    description: 'A step-by-step video tutorial on setting up your first hydroponic system for leafy greens.',
    source: 'accessag',
    category: 'Modern Tech',
    tags: ['Hydroponics', 'Water', 'Tech'],
    icon: Video,
    type: 'tutorial',
    youtubeId: '3Ww2TP_tU7o',
    steps: [
      { title: 'System Design', desc: 'Choose between NFT, DWC, or Ebb & Flow systems.' },
      { title: 'Nutrient Mix', desc: 'Prepare the water solution with essential minerals.' },
      { title: 'Seedling Transfer', desc: 'Carefully move your young plants into the net pots.' }
    ],
    quiz: {
      question: 'Which medium is commonly used in hydroponics instead of soil?',
      options: ['Sand', 'Rockwool', 'Sawdust', 'Clay'],
      answer: 'Rockwool'
    }
  },
  {
    id: 10,
    title: 'Livestock Vaccination Schedule',
    description: 'Essential vaccination timelines for cattle, goats, and poultry to prevent common diseases.',
    source: 'kilimo',
    category: 'Livestock',
    tags: ['Health', 'Vaccines', 'Official'],
    icon: Video,
    type: 'tutorial',
    youtubeId: 'v_u_G_k_q_k',
    steps: [
      { title: 'Cold Chain', desc: 'Ensure vaccines are kept between 2°C and 8°C at all times.' },
      { title: 'Sterilization', desc: 'Use clean needles for each animal to prevent cross-contamination.' },
      { title: 'Record Keeping', desc: 'Document the date, animal ID, and vaccine batch number.' }
    ],
    quiz: {
      question: 'At what temperature should most livestock vaccines be stored?',
      options: ['Room temperature', '0°C to 4°C', '2°C to 8°C', '-10°C'],
      answer: '2°C to 8°C'
    }
  }
];

interface LearningHubProps {
  user: any;
}

export default function LearningHub({ user }: LearningHubProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [hyperScore, setHyperScore] = useState(1250);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'resources' | 'ai-expert' | 'tutorials'>('resources');
  const [selectedTutorial, setSelectedTutorial] = useState<any | null>(null);
  const [tutorialProgress, setTutorialProgress] = useState<Record<number, number>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [showQuizResult, setShowQuizResult] = useState(false);

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId) 
        : [...prev, sourceId]
    );
  };

  const handleAiSearch = async () => {
    if (!aiSearchQuery.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);
    try {
      const response = await agriculturalAssistant.getAdvice(aiSearchQuery);
      setAiResponse(response || "I'm sorry, I couldn't generate a response at this time.");
    } catch (error) {
      console.error('AI Search failed:', error);
      setAiResponse("An error occurred while fetching AI advice. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = selectedSources.length === 0 || selectedSources.includes(item.source);
    const matchesTab = activeTab === 'resources' ? item.type === 'article' : activeTab === 'tutorials' ? item.type === 'tutorial' : true;
    return matchesSearch && matchesSource && matchesTab;
  }).sort((a, b) => {
    // Recommendation logic: prioritize items matching user's farm profile
    const aScore = (a.category.toLowerCase().includes(user?.farmType?.toLowerCase() || '') ? 2 : 0) +
                   (a.tags.some(t => t.toLowerCase().includes(user?.location?.toLowerCase() || '')) ? 1 : 0);
    const bScore = (b.category.toLowerCase().includes(user?.farmType?.toLowerCase() || '') ? 2 : 0) +
                   (b.tags.some(t => t.toLowerCase().includes(user?.location?.toLowerCase() || '')) ? 1 : 0);
    return bScore - aScore;
  });

  const handleTutorialComplete = (id: number) => {
    setTutorialProgress(prev => ({ ...prev, [id]: 100 }));
    setHyperScore(prev => prev + 50);
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section - Editorial Style */}
      <section className="relative h-[400px] rounded-[3rem] overflow-hidden group">
        <img 
          src="https://picsum.photos/seed/farm-learning/1920/1080" 
          alt="Learning Hub" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-earth-900 via-earth-900/40 to-transparent"></div>
        <div className="absolute inset-0 p-12 flex flex-col justify-end max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="px-4 py-1.5 bg-primary-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Academy</span>
              <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full flex items-center gap-2">
                <Sparkles size={12} className="text-primary-400" /> AI-Powered
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-6">
              THE FUTURE OF <br />
              <span className="text-primary-400 italic serif">FARMING</span> KNOWLEDGE
            </h1>
            <p className="text-lg text-earth-200 max-w-2xl font-medium leading-relaxed">
              Access Kenya's most trusted agricultural databases and expert AI guidance to optimize your farm's productivity and sustainability.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {[
          { id: 'resources', label: 'Knowledge Base', icon: BookOpen },
          { id: 'ai-expert', label: 'AI Farming Expert', icon: Sparkles },
          { id: 'tutorials', label: 'Video Tutorials', icon: Play },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all active:scale-95",
              activeTab === tab.id 
                ? "bg-earth-900 dark:bg-primary-500 text-white shadow-xl shadow-earth-900/20" 
                : "bg-white dark:bg-earth-800 text-earth-500 dark:text-earth-400 hover:bg-earth-50 dark:hover:bg-earth-700 border border-earth-200 dark:border-earth-700"
            )}
          >
            <tab.icon size={20} className={activeTab === tab.id ? "text-primary-400 dark:text-white" : "text-primary-500"} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'ai-expert' ? (
          <motion.div
            key="ai-expert"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <div className="bg-white dark:bg-earth-800 p-10 rounded-[3rem] border-2 border-primary-500 shadow-2xl shadow-primary-500/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <div className="w-16 h-16 bg-primary-500/10 rounded-3xl flex items-center justify-center text-primary-500">
                  <Sparkles size={32} />
                </div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-3xl font-black text-earth-900 dark:text-white mb-2">Ask the AI Expert</h2>
                <p className="text-earth-500 dark:text-earth-400 mb-10 font-medium">Get instant, localized advice on any agricultural topic.</p>
                
                <div className="space-y-6">
                  <div className="relative">
                    <textarea 
                      value={aiSearchQuery}
                      onChange={(e) => setAiSearchQuery(e.target.value)}
                      placeholder="e.g., How do I manage Fall Armyworm in my maize field during the rainy season?"
                      className="w-full h-40 px-8 py-6 bg-earth-50 dark:bg-earth-900 border-2 border-earth-100 dark:border-earth-700 rounded-[2rem] focus:outline-none focus:border-primary-500 transition-all resize-none text-lg font-medium dark:text-white"
                    />
                    <button 
                      onClick={handleAiSearch}
                      disabled={isAiLoading || !aiSearchQuery.trim()}
                      className="absolute bottom-6 right-6 px-8 py-4 bg-primary-500 text-white rounded-2xl font-black flex items-center gap-3 hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      {isAiLoading ? <Loader2 className="animate-spin" size={20} /> : <MessageCircle size={20} />}
                      Ask Expert
                    </button>
                  </div>

                  {aiResponse && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-8 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-[2rem] relative"
                    >
                      <div className="absolute -top-4 left-8 px-4 py-1 bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">AI Response</div>
                      <div className="prose prose-sm dark:prose-invert max-w-none text-earth-700 dark:text-earth-300 font-medium leading-relaxed">
                        <Markdown>{aiResponse}</Markdown>
                      </div>
                      <div className="mt-8 pt-6 border-t border-primary-100 dark:border-primary-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-2 text-xs font-black text-primary-600 uppercase tracking-widest hover:text-primary-700">
                            <Download size={16} /> Save Guide
                          </button>
                          <button className="flex items-center gap-2 text-xs font-black text-primary-600 uppercase tracking-widest hover:text-primary-700">
                            <Bookmark size={16} /> Bookmark
                          </button>
                        </div>
                        <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">+5 HyperScore Points Earned</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Soil Health', icon: Sprout, color: 'text-emerald-500' },
                { title: 'Pest Control', icon: ShieldAlert, color: 'text-red-500' },
                { title: 'Irrigation', icon: Droplets, color: 'text-blue-500' },
              ].map((topic, i) => (
                <button 
                  key={i}
                  onClick={() => setAiSearchQuery(`Tell me about modern best practices for ${topic.title} in Kenya.`)}
                  className="p-6 bg-white dark:bg-earth-800 border border-earth-200 dark:border-earth-700 rounded-3xl text-left hover:border-primary-500 transition-all group"
                >
                  <topic.icon className={cn("mb-4 transition-transform group-hover:scale-110", topic.color)} size={32} />
                  <h3 className="font-black text-earth-900 dark:text-white mb-1">{topic.title}</h3>
                  <p className="text-xs text-earth-500 dark:text-earth-400 font-bold uppercase tracking-widest">Explore Topic</p>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="resources"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12"
          >
            {/* Sidebar */}
            <aside className="space-y-8">
              <div className="bg-white dark:bg-earth-800 p-8 rounded-[2.5rem] border border-earth-200 dark:border-earth-700 shadow-sm sticky top-24">
                <h3 className="text-xl font-black text-earth-900 dark:text-white flex items-center gap-3 mb-8">
                  <Filter size={24} className="text-primary-500" /> Filters
                </h3>
                
                <div className="space-y-10">
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search resources..."
                      className="w-full pl-14 pr-6 py-4 bg-earth-50 dark:bg-earth-900 border border-earth-200 dark:border-earth-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium dark:text-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {['Government & Policy', 'Real-Time Advisory', 'Plant Health & Nutrition', 'Multimedia & Guides'].map(cat => (
                    <div key={cat}>
                      <h4 className="text-[10px] font-black text-earth-400 uppercase tracking-[0.2em] mb-4">{cat}</h4>
                      <div className="space-y-3">
                        {sources.filter(s => s.category === cat).map(source => (
                          <label key={source.id} className="flex items-center gap-4 cursor-pointer group">
                            <div className="relative flex items-center">
                              <input 
                                type="checkbox" 
                                className="peer w-6 h-6 rounded-lg border-2 border-earth-200 dark:border-earth-700 text-primary-500 focus:ring-primary-500 cursor-pointer appearance-none checked:bg-primary-500 checked:border-primary-500 transition-all"
                                checked={selectedSources.includes(source.id)}
                                onChange={() => toggleSource(source.id)}
                              />
                              <CheckSquare className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" size={14} />
                            </div>
                            <span className={cn("text-sm font-bold transition-colors", selectedSources.includes(source.id) ? "text-primary-600" : "text-earth-600 dark:text-earth-400 group-hover:text-earth-900 dark:group-hover:text-white")}>
                              {source.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setSelectedSources([])}
                  className="w-full mt-12 flex items-center justify-center gap-3 py-4 bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 rounded-2xl font-black text-sm hover:bg-earth-200 dark:hover:bg-earth-600 transition-all active:scale-95"
                >
                  <History size={18} /> Reset Filters
                </button>
              </div>

              <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-primary-500/20 relative overflow-hidden">
                <div className="relative z-10">
                  <Trophy className="mb-6 opacity-50" size={40} />
                  <h4 className="text-xl font-black mb-2">Learning Rewards</h4>
                  <p className="text-sm text-primary-100 font-medium mb-6">Complete guides and tutorials to earn HyperScore points and unlock premium features.</p>
                  <div className="flex items-center gap-2 text-2xl font-black">
                    <Star fill="currentColor" size={24} className="text-accent-400" />
                    <span>+50 Points</span>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="space-y-12">
              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredContent.map(item => (
                  <motion.div 
                    layout
                    key={item.id} 
                    className="bg-white dark:bg-earth-800 rounded-[2.5rem] border border-earth-200 dark:border-earth-700 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group"
                  >
                    <div className="h-48 relative overflow-hidden">
                      <img 
                        src={`https://picsum.photos/seed/${item.id}/800/600`} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-earth-900/80 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white">
                          <item.icon size={20} />
                        </div>
                        <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md", 
                          item.source === 'kalro' ? 'bg-orange-500/50' : 
                          item.source === 'yara' ? 'bg-blue-500/50' : 'bg-primary-500/50'
                        )}>
                          {item.source}
                        </span>
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{item.category}</span>
                        <div className="w-1 h-1 bg-earth-300 rounded-full"></div>
                        <span className="text-[10px] font-black text-earth-400 uppercase tracking-widest">{item.type}</span>
                      </div>
                      <h3 className="text-xl font-black text-earth-900 dark:text-white mb-4 group-hover:text-primary-500 transition-colors leading-tight">{item.title}</h3>
                      <p className="text-sm text-earth-600 dark:text-earth-400 leading-relaxed mb-8 line-clamp-2 font-medium">{item.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-8">
                        {item.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-earth-50 dark:bg-earth-900 text-earth-500 dark:text-earth-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-earth-100 dark:border-earth-700">{tag}</span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => item.type === 'tutorial' ? setSelectedTutorial(item) : null}
                          className="flex-1 py-4 bg-earth-900 dark:bg-primary-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-earth-800 dark:hover:bg-primary-600 transition-all active:scale-95 shadow-lg shadow-earth-900/10"
                        >
                          {item.type === 'tutorial' ? <Play size={18} /> : <BookOpen size={18} />}
                          {item.type === 'tutorial' ? (tutorialProgress[item.id] === 100 ? 'Review Tutorial' : 'Start Tutorial') : 'Read Guide'}
                        </button>
                        <button className="p-4 bg-earth-100 dark:bg-earth-700 text-earth-500 dark:text-earth-400 rounded-2xl hover:bg-accent-500 hover:text-white transition-all active:scale-95">
                          <Bookmark size={20} />
                        </button>
                      </div>
                      {tutorialProgress[item.id] > 0 && (
                        <div className="mt-4 h-1.5 bg-earth-100 dark:bg-earth-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-500 transition-all duration-500" 
                            style={{ width: `${tutorialProgress[item.id]}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Tutorial Modal */}
              <AnimatePresence>
                {selectedTutorial && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedTutorial(null)}
                      className="absolute inset-0 bg-earth-900/90 backdrop-blur-xl"
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="relative w-full max-w-6xl bg-white dark:bg-earth-800 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row h-[90vh]"
                    >
                      {/* Video Section */}
                      <div className="flex-1 bg-black relative">
                        <iframe 
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${selectedTutorial.youtubeId}?autoplay=1`}
                          title={selectedTutorial.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                        <button 
                          onClick={() => setSelectedTutorial(null)}
                          className="absolute top-6 left-6 p-3 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all"
                        >
                          <Redo size={20} className="rotate-180" />
                        </button>
                      </div>

                      {/* Interactive Sidebar */}
                      <div className="w-full lg:w-[400px] border-l border-earth-100 dark:border-earth-700 flex flex-col">
                        <div className="p-8 border-b border-earth-100 dark:border-earth-700">
                          <h3 className="text-2xl font-black text-earth-900 dark:text-white mb-2">{selectedTutorial.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{selectedTutorial.category}</span>
                            <div className="w-1 h-1 bg-earth-300 rounded-full"></div>
                            <span className="text-[10px] font-black text-earth-400 uppercase tracking-widest">Interactive Tutorial</span>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                          {/* Steps */}
                          <div className="space-y-6">
                            <h4 className="text-xs font-black text-earth-400 uppercase tracking-[0.2em]">Step-by-Step Guide</h4>
                            {selectedTutorial.steps?.map((step: any, idx: number) => (
                              <div key={idx} className="flex gap-4 group">
                                <div className="flex flex-col items-center">
                                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-black shadow-lg">
                                    {idx + 1}
                                  </div>
                                  {idx !== selectedTutorial.steps.length - 1 && (
                                    <div className="w-0.5 h-full bg-earth-100 dark:bg-earth-700 my-2"></div>
                                  )}
                                </div>
                                <div className="pb-4">
                                  <h5 className="font-black text-earth-900 dark:text-white mb-1">{step.title}</h5>
                                  <p className="text-sm text-earth-500 dark:text-earth-400 font-medium leading-relaxed">{step.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Quiz Section */}
                          <div className="p-6 bg-earth-50 dark:bg-earth-900 rounded-3xl border border-earth-100 dark:border-earth-700">
                            <h4 className="text-xs font-black text-primary-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                              <Trophy size={14} /> Knowledge Check
                            </h4>
                            <p className="text-sm font-bold text-earth-900 dark:text-white mb-4">{selectedTutorial.quiz?.question}</p>
                            <div className="space-y-2">
                              {selectedTutorial.quiz?.options.map((opt: string) => (
                                <button 
                                  key={opt}
                                  onClick={() => setQuizAnswers({ ...quizAnswers, [selectedTutorial.id]: opt })}
                                  className={cn(
                                    "w-full p-4 rounded-xl text-left text-sm font-bold transition-all border-2",
                                    quizAnswers[selectedTutorial.id] === opt 
                                      ? "bg-primary-500 text-white border-primary-500" 
                                      : "bg-white dark:bg-earth-800 text-earth-600 dark:text-earth-400 border-earth-100 dark:border-earth-700 hover:border-primary-200"
                                  )}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                            {quizAnswers[selectedTutorial.id] && (
                              <button 
                                onClick={() => handleTutorialComplete(selectedTutorial.id)}
                                className="w-full mt-6 py-4 bg-earth-900 dark:bg-primary-500 text-white rounded-xl font-black text-sm shadow-xl"
                              >
                                Submit & Complete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Empty State */}
              {filteredContent.length === 0 && (
                <div className="py-20 text-center">
                  <div className="w-24 h-24 bg-earth-100 dark:bg-earth-800 rounded-full flex items-center justify-center mx-auto mb-6 text-earth-400">
                    <Search size={40} />
                  </div>
                  <h3 className="text-xl font-black text-earth-900 dark:text-white mb-2">No resources found</h3>
                  <p className="text-earth-500 dark:text-earth-400 font-medium">Try adjusting your filters or search query.</p>
                  <button 
                    onClick={() => {setSearchQuery(''); setSelectedSources([]);}}
                    className="mt-8 px-8 py-4 bg-primary-500 text-white rounded-2xl font-black text-sm hover:bg-primary-600 transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdvisorCard({ icon: Icon, label, value, sub, highlight }: any) {
  return (
    <div className={cn(
      "bg-white dark:bg-earth-800 p-8 rounded-[2rem] text-center border-2 border-transparent transition-all hover:border-primary-500 hover:shadow-xl group",
      highlight && "border-accent-500 bg-accent-50/50 dark:bg-accent-900/10"
    )}>
      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110", highlight ? "bg-accent-500 text-white" : "bg-primary-50 dark:bg-primary-900/20 text-primary-500")}>
        <Icon size={32} />
      </div>
      <h3 className="text-xs font-black text-earth-400 uppercase tracking-widest mb-2">{label}</h3>
      <div className={cn("text-3xl font-black", highlight ? "text-accent-600" : "text-primary-600 dark:text-primary-400")}>{value}</div>
      <p className="text-[10px] text-earth-500 dark:text-earth-400 font-black uppercase tracking-widest mt-2">{sub}</p>
    </div>
  );
}

function ClinicCard({ icon: Icon, title, source, desc }: any) {
  return (
    <div className="p-10 rounded-[2.5rem] bg-earth-50 dark:bg-earth-900/50 border border-earth-100 dark:border-earth-700 hover:border-primary-500 transition-all text-center flex flex-col items-center group">
      <div className="w-20 h-20 bg-white dark:bg-earth-800 rounded-3xl flex items-center justify-center text-primary-500 shadow-xl mb-8 transition-transform group-hover:scale-110">
        <Icon size={40} />
      </div>
      <h3 className="text-xl font-black text-earth-900 dark:text-white mb-2">{title}</h3>
      <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6", 
        source === 'kalro' ? 'bg-orange-500/10 text-orange-600' : 
        source === 'yara' ? 'bg-blue-500/10 text-blue-600' : 'bg-primary-500/10 text-primary-600'
      )}>
        {source.toUpperCase()}
      </span>
      <p className="text-sm text-earth-600 dark:text-earth-400 leading-relaxed mb-10 font-medium">{desc}</p>
      <button className="w-full py-4 bg-white dark:bg-earth-800 border-2 border-primary-500 text-primary-600 rounded-2xl font-black text-sm hover:bg-primary-500 hover:text-white transition-all active:scale-95">
        View Guide
      </button>
    </div>
  );
}
