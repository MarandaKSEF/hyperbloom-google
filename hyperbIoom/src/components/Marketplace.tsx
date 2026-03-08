import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, MapPin, ExternalLink, Star, Tag, Info, Plus, Globe, ArrowRight, LayoutGrid, List, CheckCircle2, Loader2, Trash2, Download } from 'lucide-react';
import { cn } from '../utils/cn';
import { apiFetch } from '../utils/api';

const equipment = [
  { id: 1, name: 'Walking Tractor (12HP)', price: 'KSh 120,000', supplier: 'Agri-Tools Kenya', location: 'Nairobi', rating: 4.8, image: 'https://picsum.photos/seed/tractor/400/300' },
  { id: 2, name: 'Solar Irrigation Pump', price: 'KSh 45,000', supplier: 'SunCulture', location: 'Thika', rating: 4.9, image: 'https://picsum.photos/seed/pump/400/300' },
  { id: 3, name: 'Drip Irrigation Kit (1 Acre)', price: 'KSh 25,000', supplier: 'Amiran Kenya', location: 'Naivasha', rating: 4.7, image: 'https://picsum.photos/seed/drip/400/300' },
];

const defaultProduce = [
  { id: 101, name: 'Organic Grade A Maize', price: 'KSh 4,500 / Bag', supplier: 'Limuru Farmers Coop', location: 'Limuru', rating: 4.9, image: 'https://picsum.photos/seed/maize/400/300' },
  { id: 102, name: 'Fresh Hass Avocados', price: 'KSh 150 / Kg', supplier: 'Murang\'a Orchards', location: 'Murang\'a', rating: 4.8, image: 'https://picsum.photos/seed/avocado/400/300' },
  { id: 103, name: 'Rhode Island Red Chicks', price: 'KSh 100 / Chick', supplier: 'Poultry Hub', location: 'Nakuru', rating: 4.7, image: 'https://picsum.photos/seed/chicks/400/300' },
];

const externalPlatforms = [
  { name: 'Jumia Food', url: 'https://food.jumia.co.ke', description: 'Sell fresh produce directly to consumers.' },
  { name: 'Twiga Foods', url: 'https://twiga.com', description: 'Supply to a network of retailers across Kenya.' },
  { name: 'M-Farm', url: 'https://mfarm.co.ke', description: 'Connect with buyers and get real-time market prices.' },
];

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState<'equipment' | 'produce' | 'sell' | 'external'>('equipment');
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newListing, setNewListing] = useState({
    name: '',
    category: 'Cereals',
    price: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    fetchListings(1, true);
  }, []);

  const fetchListings = async (page = 1, reset = false) => {
    try {
      if (!reset) setIsLoadingMore(true);
      const data = await apiFetch(`/api/marketplace/listings?page=${page}&limit=12`);
      if (reset) {
        setListings(data.listings || []);
      } else {
        setListings(prev => [...prev, ...(data.listings || [])]);
      }
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err: any) {
      if (err.status !== 401) {
        console.error('Failed to fetch listings', err);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchListings(pagination.page + 1);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiFetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newListing)
      });
      setIsSuccess(true);
      setNewListing({ name: '', category: 'Cereals', price: '', location: '', description: '' });
      await fetchListings(1, true);
      setTimeout(() => {
        setIsSuccess(false);
        setActiveTab('produce');
      }, 800);
    } catch (err) {
      console.error('Failed to publish listing', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteListing = async (id: number) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await apiFetch(`/api/marketplace/listings/${id}`, { method: 'DELETE' });
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error('Failed to delete listing:', err);
    }
  };

  const displayProduce = [...(listings || []).map(l => ({
    id: l.id,
    name: l.name,
    price: l.price,
    supplier: l.seller_name,
    location: l.location,
    rating: 5.0,
    image: l.image,
    isOwner: true 
  })), ...defaultProduce];

  const filteredItems = (activeTab === 'equipment' ? equipment : displayProduce).filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToCSV = () => {
    const dataToExport = activeTab === 'equipment' ? equipment : displayProduce;
    const headers = ['ID', 'Name', 'Price', 'Supplier', 'Location', 'Rating'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(item => [
        item.id,
        `"${item.name}"`,
        `"${item.price}"`,
        `"${item.supplier || (item as any).seller_name}"`,
        `"${item.location}"`,
        item.rating
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hyperbloom_${activeTab}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-earth-900 dark:text-white tracking-tight">Agri-Marketplace</h1>
          <p className="text-earth-500 dark:text-earth-400 mt-1">Buy equipment, sell produce, and connect with global markets.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {(activeTab === 'equipment' || activeTab === 'produce') && (
            <button 
              onClick={exportToCSV}
              className="px-4 py-2 bg-white dark:bg-earth-800 border border-earth-200 dark:border-earth-700 text-earth-600 dark:text-earth-300 rounded-xl text-xs font-bold hover:bg-earth-50 dark:hover:bg-earth-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <Download size={14} /> Export Data
            </button>
          )}
          <div className="flex gap-1 bg-white dark:bg-earth-800 p-1 rounded-2xl border border-earth-200 dark:border-earth-700 shadow-sm">
            {[
              { id: 'equipment', label: 'Equipment', icon: ShoppingBag },
              { id: 'produce', label: 'Buy Produce', icon: Tag },
              { id: 'sell', label: 'Sell Produce', icon: Plus },
              { id: 'external', label: 'External Markets', icon: Globe },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap",
                  activeTab === tab.id ? "bg-primary-500 text-white shadow-md" : "text-earth-500 dark:text-earth-400 hover:bg-earth-50 dark:hover:bg-earth-700"
                )}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-12 pr-6 py-3 bg-white dark:bg-earth-800 border border-earth-200 dark:border-earth-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-48 dark:text-white shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {(activeTab === 'equipment' || activeTab === 'produce') && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredItems.map((product: any) => (
              <div key={product.id} className="bg-white dark:bg-earth-800 rounded-[2.5rem] border border-earth-200 dark:border-earth-700 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <div className="bg-white/90 dark:bg-earth-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-primary-600 dark:text-primary-400 shadow-sm flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> {product.rating}
                    </div>
                    {product.isOwner && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteListing(product.id);
                        }}
                        className="bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag size={14} className="text-primary-500" />
                    <span className="text-[10px] font-bold text-earth-400 uppercase tracking-widest">
                      {activeTab === 'equipment' ? 'Equipment' : 'Produce'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-earth-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">{product.name}</h3>
                  <p className="text-2xl font-black text-primary-600 dark:text-primary-400 mb-4">{product.price}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-earth-500 dark:text-earth-400">
                      <ShoppingBag size={14} /> {product.supplier}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-earth-500 dark:text-earth-400">
                      <MapPin size={14} /> {product.location}
                    </div>
                  </div>

                  <button className="w-full py-3 bg-earth-900 dark:bg-earth-700 text-white rounded-xl font-bold hover:bg-earth-800 dark:hover:bg-earth-600 transition-all flex items-center justify-center gap-2">
                    View Details <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {activeTab === 'produce' && pagination.page < pagination.totalPages && (
            <div className="flex justify-center pt-8">
              <button 
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-8 py-3 bg-white dark:bg-earth-800 border border-earth-200 dark:border-earth-700 text-earth-700 dark:text-earth-300 rounded-xl font-bold hover:bg-earth-50 dark:hover:bg-earth-700 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Produce'
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sell' && (
        <div className="max-w-4xl mx-auto bg-white dark:bg-earth-800 rounded-[3rem] border border-earth-200 dark:border-earth-700 p-12 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-500">
              {isSuccess ? <CheckCircle2 size={40} className="text-green-500" /> : <Plus size={40} />}
            </div>
            <h2 className="text-3xl font-bold text-earth-900 dark:text-white mb-2">
              {isSuccess ? 'Listing Published!' : 'List Your Produce'}
            </h2>
            <p className="text-earth-500 dark:text-earth-400">
              {isSuccess ? 'Your produce is now visible to buyers across the country.' : 'Reach buyers across the country by listing your harvest here.'}
            </p>
          </div>

          <form onSubmit={handlePublish} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-earth-700 dark:text-earth-300 ml-2">Produce Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Grade A White Maize" 
                className="w-full px-6 py-4 bg-earth-50 dark:bg-earth-700 border border-earth-200 dark:border-earth-600 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white" 
                value={newListing.name}
                onChange={e => setNewListing({...newListing, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-earth-700 dark:text-earth-300 ml-2">Category</label>
              <select 
                className="w-full px-6 py-4 bg-earth-50 dark:bg-earth-700 border border-earth-200 dark:border-earth-600 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                value={newListing.category}
                onChange={e => setNewListing({...newListing, category: e.target.value})}
              >
                <option>Cereals</option>
                <option>Vegetables</option>
                <option>Fruits</option>
                <option>Livestock</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-earth-700 dark:text-earth-300 ml-2">Price (KSh)</label>
              <input 
                type="text" 
                required
                placeholder="e.g. 4500 per Bag" 
                className="w-full px-6 py-4 bg-earth-50 dark:bg-earth-700 border border-earth-200 dark:border-earth-600 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white" 
                value={newListing.price}
                onChange={e => setNewListing({...newListing, price: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-earth-700 dark:text-earth-300 ml-2">Location</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Nakuru" 
                className="w-full px-6 py-4 bg-earth-50 dark:bg-earth-700 border border-earth-200 dark:border-earth-600 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white" 
                value={newListing.location}
                onChange={e => setNewListing({...newListing, location: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-earth-700 dark:text-earth-300 ml-2">Description</label>
              <textarea 
                placeholder="Tell buyers more about your produce..." 
                className="w-full px-6 py-4 bg-earth-50 dark:bg-earth-700 border border-earth-200 dark:border-earth-600 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none min-h-[120px] dark:text-white" 
                value={newListing.description}
                onChange={e => setNewListing({...newListing, description: e.target.value})}
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="md:col-span-2 py-5 bg-primary-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" /> Publishing...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 /> Success!
                </>
              ) : (
                'Publish Listing'
              )}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'external' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {externalPlatforms.map((platform) => (
              <div key={platform.name} className="bg-white dark:bg-earth-800 p-10 rounded-[3rem] border border-earth-200 dark:border-earth-700 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-primary-500 mb-8 group-hover:scale-110 transition-transform">
                  <Globe size={32} />
                </div>
                <h3 className="text-2xl font-bold text-earth-900 dark:text-white mb-4">{platform.name}</h3>
                <p className="text-earth-500 dark:text-earth-400 mb-8 leading-relaxed">
                  {platform.description}
                </p>
                <a 
                  href={platform.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold hover:gap-4 transition-all"
                >
                  Visit Platform <ArrowRight size={20} />
                </a>
              </div>
            ))}
          </div>
          
          <div className="bg-earth-900 dark:bg-earth-700 rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h3 className="text-3xl font-bold mb-4">Export Your Produce</h3>
              <p className="text-earth-300 text-lg">
                HYPERBLOOM helps you connect with international buyers and handles the logistics of agricultural exports.
              </p>
            </div>
            <button className="px-10 py-5 bg-white text-earth-900 rounded-2xl font-bold hover:bg-earth-100 transition-all whitespace-nowrap">
              Learn About Exporting
            </button>
          </div>
        </div>
      )}

      <section className="bg-primary-50 dark:bg-primary-900/10 rounded-[3rem] p-10 border border-primary-100 dark:border-primary-900/20 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white dark:bg-earth-800 rounded-2xl flex items-center justify-center text-primary-500 shadow-sm">
            <Info size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary-900 dark:text-primary-100">Market Price Alerts</h3>
            <p className="text-primary-700 dark:text-primary-300">Get notified when prices for your crops change in major markets.</p>
          </div>
        </div>
        <button className="px-10 py-4 bg-primary-500 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all whitespace-nowrap">
          Enable Price Alerts
        </button>
      </section>
    </div>
  );
}

