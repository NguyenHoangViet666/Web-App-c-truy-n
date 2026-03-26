
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ForumTopic, Post } from '../types';
import { getPosts, createPost, updatePost } from '../services/dbService';
import { MessageSquare, Eye, Clock, ThumbsUp, Search, Plus, X, Loader2, Send, TrendingUp, Filter, AlertCircle, Pin, Tag, Sparkles, MessageCircle, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { RoleBadge } from '../components/RoleBadge';
import { RichTextEditor } from '../components/RichTextEditor';

const formatDate = (dateStr: any) => {
    if (!dateStr) return 'Đang cập nhật...';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'Đang cập nhật...' : date.toLocaleDateString('vi-VN');
};

export const ForumPage: React.FC = () => {
  const { currentUser, isAdmin } = useAuth(); // Destructure isAdmin
  const { showToast, showConfirm } = useNotification();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState<ForumTopic | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState(''); // New Search State
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
      title: '',
      content: '',
      topic: ForumTopic.GENERAL
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetch = async () => {
        setLoading(true);
        const data = await getPosts(activeTopic === 'All' ? undefined : activeTopic);
        setPosts(data);
        setCurrentPage(1); // Reset page when topic changes
        setLoading(false);
    };
    fetch();
  }, [activeTopic]);

  // Pagination Logic
  // Filter by search query first
  const filteredPosts = posts.filter(post => 
      (activeTopic === 'All' || post.topic === activeTopic) &&
      ((post.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (post.authorName || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreatePost = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser) return;
      
      setCreating(true);
      try {
          await createPost({
              title: newPost.title,
              content: newPost.content,
              topic: newPost.topic,
              authorId: currentUser.id,
              authorName: currentUser.username,
              authorAvatar: currentUser.avatar || '',
              authorRoles: currentUser.roles
          });
          
          // Refresh list
          const data = await getPosts(activeTopic === 'All' ? undefined : activeTopic);
          setPosts(data);
          
          setIsModalOpen(false);
          setNewPost({ title: '', content: '', topic: ForumTopic.GENERAL });
          setCurrentPage(1); // Go to first page to see new post
      } catch (e) {
          console.error(e);
          showToast("Lỗi khi tạo bài viết.", 'error');
      } finally {
          setCreating(false);
      }
  };

  const handleQuickUnpin = async (e: React.MouseEvent, postId: string) => {
      e.preventDefault(); // Prevent navigating to detail
      e.stopPropagation();
      
      if (!isAdmin) return;
      
      showConfirm("Bỏ ghim bài viết này?", async () => {
          try {
              await updatePost(postId, { isPinned: false, pinnedUntil: undefined });
              // Optimistic UI update
              setPosts(prev => prev.map(p => {
                  if (p.id === postId) {
                      return { ...p, isPinned: false, pinnedUntil: undefined };
                  }
                  return p;
              }));
              showToast("Đã bỏ ghim", 'success');
          } catch (e) {
              console.error(e);
              showToast("Lỗi khi bỏ ghim.", 'error');
          }
      });
  };

  const getTopicColor = (topic: ForumTopic) => {
      switch(topic) {
          case ForumTopic.ANNOUNCEMENT: return 'bg-red-100 text-red-800';
          case ForumTopic.QA: return 'bg-blue-100 text-blue-800';
          case ForumTopic.REVIEW: return 'bg-green-100 text-green-800';
          case ForumTopic.SPOILER: return 'bg-gray-800 text-white';
          default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100';
      }
  };

  // Helper to check if pin is active for UI (double check)
  const isPostPinned = (p: Post) => {
      // If admin, we care if it's flagged as pinned regardless of date, so they can manage it
      if (isAdmin && p.isPinned) return true;
      
      // For users, only show if date is valid
      if (!p.isPinned) return false;
      if (!p.pinnedUntil) return true;
      return new Date(p.pinnedUntil) > new Date();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR: TOPICS */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-6">
            <div className="bg-white/80 dark:bg-[#1a1b26]/80 backdrop-blur-md p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-100/50 dark:border-purple-900/50">
                <button 
                    onClick={() => {
                        if (!currentUser) showToast("Vui lòng đăng nhập để tạo bài viết!", 'info');
                        else setIsModalOpen(true);
                    }}
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-white py-3 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg shadow-primary/30 transform hover:scale-105"
                >
                    <Plus className="w-5 h-5 mr-2"/> Tạo bài viết
                </button>
            </div>

            <div className="bg-white/80 dark:bg-[#1a1b26]/80 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-100/50 dark:border-purple-900/50 overflow-hidden">
                <div className="p-4 border-b border-purple-100/50 dark:border-purple-900/50 bg-white/50 dark:bg-[#1a1b26]/50 font-bold flex items-center text-slate-800 dark:text-slate-100">
                    <Filter className="w-4 h-4 mr-2 text-primary"/> Chủ đề
                </div>
                <div className="flex flex-col">
                    <button 
                        onClick={() => setActiveTopic('All')}
                        className={`text-left px-4 py-3 hover:bg-primary/5 border-l-4 transition-all ${activeTopic === 'All' ? 'border-primary bg-gradient-to-r from-primary/10 to-transparent font-bold text-primary' : 'border-transparent text-slate-600 dark:text-slate-300'}`}
                    >
                        Tất cả
                    </button>
                    {Object.values(ForumTopic).map(topic => (
                        <button 
                            key={topic}
                            onClick={() => setActiveTopic(topic)}
                            className={`text-left px-4 py-3 hover:bg-primary/5 border-l-4 transition-all ${activeTopic === topic ? 'border-primary bg-gradient-to-r from-primary/10 to-transparent font-bold text-primary' : 'border-transparent text-slate-600 dark:text-slate-300'}`}
                        >
                            {topic}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* MAIN LIST */}
        <div className="flex-1">
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {activeTopic === 'All' ? 'Thảo luận mới nhất' : activeTopic}
                    </h1>
                    <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm">{filteredPosts.length} bài viết</span>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg leading-5 bg-white dark:bg-[#1a1b26] placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Tìm bài viết, tác giả..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1); // Reset to page 1 on search
                        }}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-primary"/></div>
            ) : currentPosts.length > 0 ? (
                <>
                    <div className="space-y-4">
                        {currentPosts.map(post => {
                            const pinned = isPostPinned(post);
                            return (
                                <Link to={`/forum/${post.id}`} key={post.id} className={`block bg-white/80 dark:bg-[#1a1b26]/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border hover:shadow-[0_8px_30px_rgb(124,58,237,0.12)] hover:border-purple-300 transition-all transform hover:-translate-y-1 ${pinned ? 'border-l-4 border-l-fuchsia-500 bg-gradient-to-r from-fuchsia-50/50 to-transparent' : 'border-purple-100/50 dark:border-purple-900/50'}`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                {pinned && (
                                                    <span className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center shadow-sm shadow-fuchsia-500/30">
                                                        <Pin className="w-3 h-3 mr-1 fill-white"/> Ghim
                                                    </span>
                                                )}
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${getTopicColor(post.topic)}`}>
                                                    {post.topic}
                                                </span>
                                                <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center">
                                                    <Clock className="w-3 h-3 mr-1"/> {formatDate(post.createdAt)}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-1 group-hover:text-primary flex items-center transition-colors">
                                                {pinned && <Pin className="w-4 h-4 mr-2 text-fuchsia-500 flex-shrink-0 fill-current"/>}
                                                {post.title}
                                            </h3>
                                            <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm line-clamp-2 mb-3">
                                                {post.content.substring(0, 150)}...
                                            </p>
                                            <div className="flex items-center gap-2 text-sm">
                                                <img src={post.authorAvatar || 'https://via.placeholder.com/30'} className="w-6 h-6 rounded-full" alt=""/>
                                                <span className="font-medium text-slate-700 dark:text-slate-200">{post.authorName}</span>
                                                <RoleBadge roles={post.authorRoles}/>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 ml-4">
                                            {/* Admin Quick Actions */}
                                            {isAdmin && pinned && (
                                                <button 
                                                    onClick={(e) => handleQuickUnpin(e, post.id)}
                                                    className="p-1.5 bg-white dark:bg-[#1a1b26] border border-fuchsia-200 text-fuchsia-500 rounded-full hover:bg-fuchsia-50 shadow-sm z-10 mb-2 transition-colors"
                                                    title="Bỏ ghim bài viết này"
                                                >
                                                    <div className="relative">
                                                        <Pin className="w-4 h-4 fill-current"/>
                                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-0.5 bg-fuchsia-500 rotate-45"></div>
                                                    </div>
                                                </button>
                                            )}

                                            <div className="flex items-center text-slate-400 dark:text-slate-500 text-xs bg-slate-50 dark:bg-[#0f1016] px-2 py-1 rounded">
                                                <Eye className="w-4 h-4 mr-1"/> {post.viewCount}
                                            </div>
                                            <div className="flex items-center text-slate-400 dark:text-slate-500 text-xs bg-slate-50 dark:bg-[#0f1016] px-2 py-1 rounded">
                                                <MessageCircle className="w-4 h-4 mr-1"/> Chat
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-8">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)} 
                                disabled={currentPage === 1}
                                className="p-2 border rounded-md hover:bg-slate-100 dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5"/>
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-10 h-10 rounded-xl font-bold transition-all ${
                                        currentPage === page 
                                        ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-md shadow-primary/30' 
                                        : 'bg-white dark:bg-[#1a1b26] border border-purple-100 dark:border-purple-900/50 text-slate-600 dark:text-slate-300 hover:bg-primary/5 hover:text-primary hover:border-primary/30'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button 
                                onClick={() => handlePageChange(currentPage + 1)} 
                                disabled={currentPage === totalPages}
                                className="p-2 border rounded-md hover:bg-slate-100 dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5"/>
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-white dark:bg-[#1a1b26] rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300"/>
                    <p>Không tìm thấy bài viết nào.</p>
                </div>
            )}
        </div>
      </div>

      {/* CREATE POST MODAL */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-[#1a1b26] rounded-xl shadow-2xl max-w-2xl w-full animate-scaleIn">
                  <div className="flex justify-between items-center p-6 border-b">
                      <h3 className="font-bold text-xl">Tạo bài viết mới</h3>
                      <button onClick={()=>setIsModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300"><X className="w-6 h-6"/></button>
                  </div>
                  <form onSubmit={handleCreatePost} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                          <input 
                              value={newPost.title}
                              onChange={e => setNewPost({...newPost, title: e.target.value})}
                              className="w-full border p-2 rounded focus:ring-2 focus:ring-primary/50 outline-none"
                              placeholder="Nhập tiêu đề bài viết..."
                              required
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">Chủ đề</label>
                          <select 
                              value={newPost.topic}
                              onChange={e => setNewPost({...newPost, topic: e.target.value as ForumTopic})}
                              className="w-full border p-2 rounded focus:ring-2 focus:ring-primary/50 outline-none"
                          >
                              {Object.values(ForumTopic).map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">Nội dung</label>
                          <textarea 
                              value={newPost.content}
                              onChange={e => setNewPost({...newPost, content: e.target.value})}
                              className="w-full border p-2 rounded h-40 focus:ring-2 focus:ring-primary/50 outline-none"
                              placeholder="Nội dung thảo luận..."
                              required
                          />
                      </div>
                      <div className="flex justify-end pt-4">
                          <button 
                              type="submit" 
                              disabled={creating}
                              className="bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-white px-8 py-2.5 rounded-xl font-bold flex items-center shadow-lg shadow-primary/30 transition-all"
                          >
                              {creating ? <Loader2 className="animate-spin w-5 h-5"/> : 'Đăng bài'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
