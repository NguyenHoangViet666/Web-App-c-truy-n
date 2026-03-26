
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getPublicNovels } from '../services/dbService';
import { Novel } from '../types';
import { Search, Frown, Loader2 } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  const [results, setResults] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
        setLoading(true);
        const all = await getPublicNovels();
        
        if (!query) { 
            // If no query, show top novels (sort by rating)
            const sorted = [...all].sort((a, b) => {
                const ratingA = a.ratingCount ? (a.ratingSum! / a.ratingCount) : 0;
                const ratingB = b.ratingCount ? (b.ratingSum! / b.ratingCount) : 0;
                return ratingB - ratingA;
            });
            setResults(sorted); 
        } else {
            const lower = query.toLowerCase();
            setResults(all.filter(n => 
                (n.title || '').toLowerCase().includes(lower) || 
                (n.author || '').toLowerCase().includes(lower) ||
                (n.genres || []).some(g => g.toLowerCase().includes(lower))
            ));
        }
        setLoading(false);
    };
    fetch();
  }, [query]);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin w-8 h-8 text-primary"/></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-10 bg-white/60 dark:bg-[#1a1b26]/60 backdrop-blur-md p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-100/50 dark:border-purple-900/50">
        <h1 className="text-3xl font-extrabold flex items-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            {query ? (
                <><Search className="w-8 h-8 mr-3 text-primary"/> Kết quả cho: "{query}"</>
            ) : (
                <><Search className="w-8 h-8 mr-3 text-primary"/> Bảng Xếp Hạng</>
            )}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2 font-medium">Tìm thấy <span className="text-primary font-bold">{results.length}</span> kết quả</p>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {results.map(novel => (
            <Link to={`/novel/${novel.id}`} key={novel.id} className="group flex flex-col bg-white/80 dark:bg-[#1a1b26]/80 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_40px_-10px_rgba(124,58,237,0.3)] overflow-hidden border border-purple-100/50 dark:border-purple-900/50 hover:border-primary/50 transition-all duration-500 hover:-translate-y-3 relative">
                <div className="shine-effect"></div>
                <div className="aspect-[2/3] bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
                    <img src={novel.coverUrl} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt={novel.title}/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-5 flex flex-col flex-1 relative bg-gradient-to-b from-white dark:from-[#1a1b26] to-purple-50/30 dark:to-[#0f1016]">
                    <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary mb-1 min-h-[56px] leading-tight text-slate-800 dark:text-slate-100 transition-colors">{novel.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">{novel.author}</p>
                </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-white/40 dark:bg-[#1a1b26]/40 backdrop-blur-md rounded-3xl border border-dashed border-purple-200">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-purple-600/10 flex items-center justify-center mb-6">
              <Frown className="h-12 w-12 text-primary opacity-60"/>
          </div>
          <h3 className="font-bold text-xl text-slate-700 dark:text-slate-200">Không tìm thấy kết quả nào</h3>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">Vui lòng thử lại với từ khóa khác.</p>
        </div>
      )}
    </div>
  );
};
