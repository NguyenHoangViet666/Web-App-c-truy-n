import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Novel, NovelType, NovelGenre, NovelLength, NovelStatus } from '../types';
import { getPublicNovels } from '../services/dbService';
import { Filter, BookOpen, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryPageProps { type: 'translated' | 'original'; }

export const CategoryPage: React.FC<CategoryPageProps> = ({ type }) => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedLength, setSelectedLength] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const targetType = type === 'translated' ? NovelType.TRANSLATED : NovelType.ORIGINAL;

  useEffect(() => {
    const fetch = async () => {
        setLoading(true);
        const data = await getPublicNovels();
        setNovels(data);
        setLoading(false);
        // Reset filters when type changes
        setSelectedGenre('All'); 
        setSelectedLength('All'); 
        setSelectedStatus('All');
        setCurrentPage(1);
    };
    fetch();
  }, [type]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenre, selectedLength, selectedStatus]);

  // 1. Filter Logic
  const filteredNovels = novels.filter(n => {
    return n.type === targetType &&
           (selectedGenre === 'All' || (n.genres || []).includes(selectedGenre as NovelGenre)) &&
           (selectedLength === 'All' || n.length === selectedLength) &&
           (selectedStatus === 'All' || n.status === selectedStatus);
  });

  // 2. Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNovels = filteredNovels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNovels.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin w-8 h-8 text-primary"/></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-10 flex justify-between items-end border-b border-purple-100/50 dark:border-purple-900/50 pb-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight drop-shadow-sm">{targetType === NovelType.TRANSLATED ? 'Truyện Dịch' : 'Truyện Sáng Tác'}</h1>
        <button 
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 bg-white/80 dark:bg-[#1a1b26]/80 hover:bg-white dark:hover:bg-[#0f1016] backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 px-5 py-3 rounded-full font-bold shadow-lg shadow-purple-500/10 transition-all hover:scale-105 active:scale-95"
        >
            <Filter className="w-5 h-5 text-primary"/>
            <span className="hidden sm:inline">Bộ Lọc Điệu Nghệ</span>
        </button>
      </div>

      {/* Glassmorphism Drawer Overlay */}
      {isDrawerOpen && (
          <div className="fixed inset-0 z-[60] flex justify-end">
              <div 
                  className="absolute inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm animate-fadeIn cursor-pointer"
                  onClick={() => setIsDrawerOpen(false)}
              ></div>
              <div className="relative w-full max-w-sm h-full bg-white/70 dark:bg-[#0f1016]/70 backdrop-blur-3xl border-l border-white/40 dark:border-slate-800 shadow-[-20px_0_50px_rgba(0,0,0,0.1)] dark:shadow-[-20px_0_50px_rgba(0,0,0,0.5)] p-6 flex flex-col animate-[slideLeft_0.4s_cubic-bezier(0.16,1,0.3,1)] overflow-y-auto">
                  <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-teal-400">Khám Phá</h2>
                      <button 
                          onClick={() => setIsDrawerOpen(false)}
                          className="p-2 rounded-full bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                          <ChevronRight className="w-6 h-6"/>
                      </button>
                  </div>

                  <div className="space-y-8 flex-1">
                      {/* Genre Filter */}
                      <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Thể loại</label>
                          <div className="flex flex-wrap gap-2">
                              <button onClick={() => setSelectedGenre('All')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedGenre === 'All' ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700'}`}>Tất cả</button>
                              {Object.values(NovelGenre).map(g => (
                                  <button key={g} onClick={() => setSelectedGenre(g)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedGenre === g ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700'}`}>{g}</button>
                              ))}
                          </div>
                      </div>

                      {/* Length Filter */}
                      <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Độ dài</label>
                          <div className="flex flex-wrap gap-2">
                              <button onClick={() => setSelectedLength('All')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedLength === 'All' ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30' : 'bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700'}`}>Tất cả</button>
                              {Object.values(NovelLength).map(l => (
                                  <button key={l} onClick={() => setSelectedLength(l)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedLength === l ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30' : 'bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700'}`}>{l}</button>
                              ))}
                          </div>
                      </div>

                      {/* Status Filter */}
                      <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Trạng thái</label>
                          <div className="flex flex-wrap gap-2">
                              <button onClick={() => setSelectedStatus('All')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedStatus === 'All' ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30' : 'bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700'}`}>Tất cả</button>
                              {Object.values(NovelStatus).map(s => (
                                  <button key={s} onClick={() => setSelectedStatus(s)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedStatus === s ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30' : 'bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700'}`}>{s}</button>
                              ))}
                          </div>
                      </div>
                  </div>
                  
                  <div className="pt-6 mt-6 border-t border-slate-200/50 dark:border-slate-800/50">
                      <button 
                          onClick={() => setIsDrawerOpen(false)}
                          className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:scale-[1.02] transition-transform shadow-xl"
                      >
                          Xem {filteredNovels.length} Truyện
                      </button>
                  </div>
              </div>
          </div>
      )}

      {currentNovels.length > 0 ? (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {currentNovels.map(novel => (
                <Link to={`/novel/${novel.id}`} key={novel.id} className="group flex flex-col bg-white/80 dark:bg-[#1a1b26]/80 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-[0_10px_40px_-10px_rgba(124,58,237,0.3)] overflow-hidden border border-purple-100/50 dark:border-purple-900/50 hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-500 hover:-translate-y-3 relative">
                <div className="shine-effect"></div>
                <div className="aspect-[2/3] bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
                    <img src={novel.coverUrl} alt={novel.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-3 right-3 bg-white/20 dark:bg-[#1a1b26]/20 backdrop-blur-md border border-white/30 shadow-lg text-white font-medium text-xs px-2.5 py-1 rounded-full uppercase tracking-wider">{novel.status}</div>
                </div>
                <div className="p-5 flex flex-col flex-1 relative bg-gradient-to-b from-white dark:from-[#1a1b26] to-purple-50/30 dark:to-[#0f1016]">
                    <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary mb-1 min-h-[56px] leading-tight text-slate-800 dark:text-slate-100 transition-colors">{novel.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-3 font-medium">{novel.author}</p>
                    <div className="mt-auto flex flex-wrap gap-1.5">
                        {novel.genres.slice(0, 2).map(g => (
                            <span key={g} className="text-[10px] bg-white/60 dark:bg-slate-800 px-2 py-1 rounded-md text-primary dark:text-white font-medium border border-purple-100 dark:border-purple-900/50 shadow-sm">{g}</span>
                        ))}
                    </div>
                </div>
                </Link>
            ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-12">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className="p-2.5 border border-purple-100/50 dark:border-purple-900/50 rounded-xl hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm bg-white dark:bg-[#1a1b26]"
                    >
                        <ChevronLeft className="w-5 h-5"/>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-xl font-bold transition-all duration-300 ${
                                currentPage === page 
                                ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/30 scale-110' 
                                : 'bg-white dark:bg-[#1a1b26] border border-purple-100/50 dark:border-purple-900/50 text-slate-600 dark:text-slate-300 hover:bg-purple-50 hover:text-primary shadow-sm'
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className="p-2.5 border border-purple-100/50 dark:border-purple-900/50 rounded-xl hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm bg-white dark:bg-[#1a1b26]"
                    >
                        <ChevronRight className="w-5 h-5"/>
                    </button>
                </div>
            )}
        </>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-[#1a1b26] rounded-xl border border-dashed">
          <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-4"/>
          <p>Không tìm thấy truyện nào.</p>
        </div>
      )}
    </div>
  );
};