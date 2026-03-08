import React, { useState, useEffect } from 'react';
import { 
  MessageSquare,
  Users,
  Send,
  MessageCircle,
  Redo,
  Plus,
  MapPin,
  Satellite
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';
import { apiFetch } from '../utils/api';

interface ForumViewProps {
  user?: any;
}

export default function ForumView({ user }: ForumViewProps) {
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General', latitude: null as number | null, longitude: null as number | null });
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const categories = ['General', 'Crops', 'Livestock', 'Market', 'Soil', 'Weather', 'Finance'];

  useEffect(() => {
    fetchForumPosts(1, true);
  }, []);

  const fetchForumPosts = async (page = 1, reset = false) => {
    try {
      if (!reset) setIsLoadingMore(true);
      const data = await apiFetch(`/api/forum/posts?page=${page}&limit=10`);
      
      if (reset) {
        setForumPosts(data.posts || []);
      } else {
        setForumPosts(prev => [...prev, ...(data.posts || [])]);
      }
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err: any) {
      if (err.status !== 401) {
        console.error('Failed to fetch forum posts', err);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchForumPosts(pagination.page + 1);
    }
  };

  const handleGetLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNewPost({
          ...newPost,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setIsLocating(false);
      },
      (err) => {
        setError("Unable to retrieve your location. Please ensure location permissions are granted.");
        setIsLocating(false);
      }
    );
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to post.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const data = await apiFetch('/api/forum/posts', {
        method: 'POST',
        body: JSON.stringify(newPost)
      });
      
      setIsPosting(false);
      setNewPost({ title: '', content: '', category: 'General', latitude: null, longitude: null });
      await fetchForumPosts(1, true);
    } catch (err: any) {
      console.error('Failed to create post', err);
      setError(err.message || 'A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewPost = async (postId: number) => {
    try {
      const data = await apiFetch(`/api/forum/posts/${postId}`);
      setSelectedPost(data);
    } catch (err) {
      console.error('Failed to fetch post details', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await apiFetch(`/api/forum/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment })
      });
      setNewComment('');
      handleViewPost(selectedPost.id);
    } catch (err) {
      console.error('Failed to add comment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvatarUrl = (name: string, avatar?: string) => {
    if (avatar) return avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Left Sidebar - Categories (Quora Spaces style) */}
      <aside className="hidden lg:block w-64 flex-shrink-0 space-y-2">
        <h3 className="px-4 text-xs font-black text-earth-400 uppercase tracking-widest mb-4">Spaces</h3>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setNewPost({ ...newPost, category: cat })}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
              newPost.category === cat 
                ? "bg-primary-50 text-primary-600 border border-primary-100" 
                : "text-earth-600 hover:bg-earth-50"
            )}
          >
            <div className="w-6 h-6 bg-earth-100 rounded-md flex items-center justify-center text-[10px]">
              {cat[0]}
            </div>
            {cat}
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Quora-style "What is your question?" bar */}
        <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-earth-100 flex-shrink-0">
            <img 
              src={getAvatarUrl(user?.name || 'Guest', user?.avatar)} 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
          <button 
            onClick={() => setIsPosting(true)}
            className="flex-1 text-left px-6 py-2.5 bg-earth-50 border border-earth-100 rounded-full text-earth-400 hover:bg-earth-100 transition-all text-sm font-medium"
          >
            What is your question or link?
          </button>
        </div>

        {isPosting && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-earth-200 shadow-xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-earth-900">Create Post</h3>
              <button onClick={() => setIsPosting(false)} className="text-earth-400 hover:text-earth-600">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-6">
              <input 
                type="text" 
                placeholder="Start your question with 'What', 'How', 'Why', etc."
                className="w-full px-6 py-4 bg-earth-50 border border-earth-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg font-bold"
                value={newPost.title}
                onChange={e => setNewPost({...newPost, title: e.target.value})}
                required
              />
              
              <div className="flex gap-4">
                <select 
                  className="px-6 py-3 bg-earth-50 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-bold"
                  value={newPost.category}
                  onChange={e => setNewPost({...newPost, category: e.target.value})}
                >
                  {categories.map(cat => <option key={cat}>{cat}</option>)}
                </select>
                <button 
                  type="button"
                  onClick={handleGetLocation}
                  className={cn(
                    "px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border",
                    newPost.latitude 
                      ? "bg-primary-50 border-primary-200 text-primary-600" 
                      : "bg-earth-50 border-earth-200 text-earth-600 hover:bg-earth-100"
                  )}
                >
                  <MapPin size={18} /> {isLocating ? 'Locating...' : newPost.latitude ? 'Location Added' : 'Add Location'}
                </button>
              </div>

              <textarea 
                placeholder="Describe your question or experience in detail..."
                className="w-full px-6 py-4 bg-earth-50 border border-earth-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[200px]"
                value={newPost.content}
                onChange={e => setNewPost({...newPost, content: e.target.value})}
                required
              />

              {newPost.latitude && (
                <div className="rounded-2xl overflow-hidden border border-earth-200 h-64 relative shadow-inner">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0} 
                    src={`https://maps.google.com/maps?q=${newPost.latitude},${newPost.longitude}&t=k&z=17&output=embed`}
                  ></iframe>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-[10px] font-black text-primary-600 shadow-sm flex items-center gap-2">
                    <Satellite size={14} /> SATELLITE VIEW ATTACHED
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsPosting(false)}
                  className="px-8 py-4 bg-earth-100 text-earth-700 rounded-2xl font-bold hover:bg-earth-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-12 py-4 bg-primary-500 text-white rounded-2xl font-black hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        )}

        {selectedPost ? (
            <div className="bg-white p-8 rounded-[2.5rem] border border-earth-200 shadow-sm animate-in slide-in-from-right-4 duration-300">
              <button 
                onClick={() => setSelectedPost(null)}
                className="mb-8 text-primary-600 font-black text-sm flex items-center gap-2 hover:gap-3 transition-all uppercase tracking-widest"
              >
                <Redo size={18} className="rotate-180" /> Back to Feed
              </button>
              
              <div className="flex items-start gap-4 mb-8">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary-100">
                  <img 
                    src={getAvatarUrl(selectedPost.author_name, selectedPost.author_avatar)} 
                    alt={selectedPost.author_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-earth-900 tracking-tight leading-tight">{selectedPost.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-sm text-earth-500">
                    <span className="font-bold text-primary-600">{selectedPost.author_name}</span>
                    <span>•</span>
                    <span className="bg-earth-100 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">{selectedPost.category}</span>
                    <span>•</span>
                    <span>{new Date(selectedPost.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <p className="text-earth-700 text-lg leading-relaxed mb-10 whitespace-pre-wrap">
                {selectedPost.content}
              </p>

              {selectedPost.latitude && (
                <div className="mb-12 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-earth-400 uppercase tracking-widest flex items-center gap-2">
                      <Satellite size={18} className="text-primary-500" /> Farm Satellite View
                    </h4>
                    <span className="text-[10px] text-earth-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <MapPin size={12} /> {selectedPost.latitude.toFixed(6)}, {selectedPost.longitude.toFixed(6)}
                    </span>
                  </div>
                  <div className="rounded-[2.5rem] overflow-hidden border border-earth-200 h-80 shadow-inner">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      scrolling="no" 
                      marginHeight={0} 
                      marginWidth={0} 
                      src={`https://maps.google.com/maps?q=${selectedPost.latitude},${selectedPost.longitude}&t=k&z=18&output=embed`}
                    ></iframe>
                  </div>
                </div>
              )}

              <div className="border-t border-earth-100 pt-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-black text-earth-900 flex items-center gap-3">
                    <MessageCircle size={24} className="text-primary-500" /> 
                    Answers ({selectedPost.comments?.length || 0})
                  </h4>
                </div>

                <div className="space-y-6">
                  {selectedPost.comments?.map((comment: any) => (
                    <div key={comment.id} className="bg-earth-50 p-8 rounded-[2rem] border border-earth-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-earth-200">
                          <img 
                            src={getAvatarUrl(comment.author_name, comment.author_avatar)} 
                            alt={comment.author_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-earth-900">{comment.author_name}</span>
                          <span className="text-[10px] text-earth-400 font-bold uppercase tracking-widest">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-earth-700 leading-relaxed">{comment.content}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} className="mt-12 space-y-4">
                  <textarea 
                    placeholder="Write your answer..."
                    className="w-full px-6 py-4 bg-earth-50 border border-earth-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px]"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    required
                  />
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="px-10 py-4 bg-primary-500 text-white rounded-2xl font-black hover:bg-primary-600 transition-all flex items-center gap-3 shadow-xl shadow-primary-500/20 disabled:opacity-50"
                    >
                      <Send size={20} /> {isSubmitting ? 'Posting...' : 'Post Answer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {forumPosts.map(post => (
                <div 
                  key={post.id} 
                  onClick={() => handleViewPost(post.id)}
                  className="bg-white p-8 rounded-[2rem] border border-earth-200 shadow-sm hover:shadow-md hover:border-primary-500 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-earth-100">
                      <img 
                        src={getAvatarUrl(post.author_name, post.author_avatar)} 
                        alt={post.author_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs font-bold text-earth-900">{post.author_name}</span>
                    <span className="text-xs text-earth-400">•</span>
                    <span className="text-xs text-earth-400">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <h4 className="text-xl font-black text-earth-900 group-hover:text-primary-600 transition-colors mb-2 tracking-tight">{post.title}</h4>
                  <p className="text-earth-600 text-sm line-clamp-3 mb-6 leading-relaxed">{post.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-earth-400 text-xs font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <MessageCircle size={16} /> {post.comment_count} Answers
                      </div>
                      {post.latitude && (
                        <div className="flex items-center gap-2 text-primary-500">
                          <Satellite size={16} /> Satellite View
                        </div>
                      )}
                    </div>
                    <span className="bg-earth-100 text-earth-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {post.category}
                    </span>
                  </div>
                </div>
              ))}
              {forumPosts.length === 0 && (
                <div className="text-center py-24 bg-earth-50 rounded-[3rem] border-2 border-dashed border-earth-200">
                  <MessageSquare size={48} className="text-earth-300 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-earth-900">No questions yet</h3>
                  <p className="text-earth-500">Be the first to ask the community!</p>
                </div>
              )}
              
              {pagination.page < pagination.totalPages && (
                <div className="flex justify-center pt-8">
                  <button 
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="px-8 py-3 bg-white border border-earth-200 text-earth-700 rounded-xl font-bold hover:bg-earth-50 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {isLoadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More Questions'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar - Stats/Info (Quora style) */}
        <aside className="hidden xl:block w-80 flex-shrink-0 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-earth-200 shadow-sm">
            <h3 className="text-sm font-black text-earth-900 uppercase tracking-widest mb-6">Community Stats</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-earth-500">Total Questions</span>
                <span className="font-black text-earth-900">{forumPosts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-earth-500">Active Farmers</span>
                <span className="font-black text-earth-900">1.2k</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-earth-500">Answers Today</span>
                <span className="font-black text-primary-500">48</span>
              </div>
            </div>
          </div>

          <div className="bg-primary-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-primary-500/20">
            <h3 className="text-lg font-black mb-4">Need Expert Advice?</h3>
            <p className="text-primary-50 text-sm mb-8 opacity-90 leading-relaxed">
              Our AI Assistant is available 24/7 to answer your specific agricultural questions.
            </p>
            <button className="w-full py-4 bg-white text-primary-600 rounded-2xl font-black text-sm shadow-xl hover:bg-primary-50 transition-all">
              Talk to AI Expert
            </button>
          </div>
        </aside>
      </div>
    );
}
