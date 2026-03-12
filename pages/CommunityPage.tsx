
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SharedHeader from '../components/SharedHeader';
import SharedFooter from '../components/SharedFooter';
import { getCommunity } from '../data/mockDatabase';
import { CommunityPost } from '../types';

const POSTS_PER_PAGE = 3;

const CommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const query = searchParams.get('q')?.toLowerCase() || "";

  useEffect(() => {
    setPosts(getCommunity());
  }, []);

  // Reset về trang 1 khi thay đổi filter hoặc query tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, query]);

  // Logic lọc kép: Theo Category VÀ Theo từ khóa Search
  const filteredPosts = posts.filter(post => {
    const matchesFilter = filter === 'all' || post.type.toLowerCase() === filter;
    const matchesQuery = !query || 
      post.title.toLowerCase().includes(query) || 
      post.desc.toLowerCase().includes(query) ||
      post.author.toLowerCase().includes(query);
    
    return matchesFilter && matchesQuery;
  });
  
  // Logic phân trang
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const indexOfLastPost = currentPage * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <SharedHeader />
      
      <main className="flex-1 max-w-[1100px] mx-auto w-full px-6 py-12 sm:py-24">
        <header className="mb-24 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-6 py-2 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-10 border border-blue-100 shadow-sm"
          >
            FutureTrace Research Network
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-7xl font-black tracking-tighter mb-10 font-display text-slate-900 leading-none uppercase italic"
          >
            {query ? (
              <>Kết quả cho: <br /><span className="text-blue-600">"{query}"</span></>
            ) : (
              <>Cộng đồng <br /> <span className="text-blue-600">Nghiên cứu Tương lai.</span></>
            )}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            {query 
              ? `Hệ thống tìm thấy ${filteredPosts.length} quỹ đạo nghiên cứu phù hợp với yêu cầu của bạn.`
              : "Khám phá các quỹ đạo tương lai được chia sẻ bởi cộng đồng chuyên gia. Học hỏi từ các mô phỏng Monte Carlo thực tế."
            }
          </motion.p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-20">
          {['all', 'positive', 'neutral', 'risk'].map((f) => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                filter === f 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-105' 
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)]'
              }`}
            >
              {f === 'all' ? 'Tất cả báo cáo' : f}
            </button>
          ))}
        </div>

        {/* Post Feed */}
        <div className="space-y-12 mb-24">
          <AnimatePresence mode='popLayout'>
            {currentPosts.map((post, idx) => (
              <motion.article
                layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }}
                key={post.id} className="bg-white border border-slate-100 rounded-[3.5rem] p-10 sm:p-14 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] hover:shadow-[0_60px_120px_-30px_rgba(0,0,0,0.15)] hover:-translate-y-2 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex flex-col md:flex-row gap-14">
                  {/* Metric Sidebar */}
                  <div className="md:w-32 flex md:flex-col gap-8 items-center shrink-0 pt-2">
                    <div className="flex flex-col items-center">
                       <span className="text-3xl font-black text-slate-900">{post.roi}%</span>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">ROI Dự báo</span>
                    </div>
                    <div className="w-px md:w-16 h-8 md:h-px bg-slate-100"></div>
                    <div className="flex flex-col items-center">
                       <span className="text-3xl font-black text-blue-600">{post.reliability}%</span>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Tin cậy</span>
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        {post.isAnonymous ? (
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
                            <span className="material-symbols-outlined text-2xl">visibility_off</span>
                          </div>
                        ) : (
                          <img src={post.authorAvatar} className="w-12 h-12 rounded-2xl border-2 border-white shadow-xl" alt={post.author} />
                        )}
                        <div>
                           <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{post.author}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{post.date}</p>
                        </div>
                      </div>
                      <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                        post.type === 'Positive' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                        post.type === 'Risk' ? 'text-rose-600 bg-rose-50 border-rose-100' : 'text-blue-600 bg-blue-50 border-blue-100'
                      }`}>
                        {post.category}
                      </span>
                    </div>

                    <h2 onClick={() => navigate(`/detail/${post.id}`, { state: { scenario: post } })} className="text-3xl sm:text-4xl font-black font-display text-slate-900 hover:text-blue-600 cursor-pointer transition-colors leading-tight uppercase tracking-tighter italic">
                      {post.title}
                    </h2>
                    
                    <p className="text-slate-500 font-medium leading-relaxed italic text-base sm:text-lg opacity-80">
                      "{post.desc}"
                    </p>

                    <div className="flex items-center justify-between pt-10 border-t border-slate-50">
                      <div className="flex items-center gap-10">
                        <button className="flex items-center gap-3 group/btn">
                          <span className="material-symbols-outlined text-slate-300 group-hover/btn:text-rose-500 transition-colors text-2xl">favorite</span>
                          <span className="text-[11px] font-black text-slate-400 group-hover/btn:text-slate-900">{post.likes}</span>
                        </button>
                        <button onClick={() => navigate(`/detail/${post.id}`, { state: { scenario: post } })} className="flex items-center gap-3 group/btn">
                          <span className="material-symbols-outlined text-slate-300 group-hover/btn:text-blue-600 transition-colors text-2xl">chat_bubble</span>
                          <span className="text-[11px] font-black text-slate-400 group-hover/btn:text-slate-900">{post.commentsCount}</span>
                        </button>
                      </div>
                      <button onClick={() => navigate(`/detail/${post.id}`, { state: { scenario: post } })} className="flex items-center gap-3 text-[11px] font-black text-blue-600 uppercase tracking-widest hover:translate-x-3 transition-all group">
                         Báo cáo đầy đủ <span className="material-symbols-outlined text-xl group-hover:scale-125 transition-transform">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>

          {filteredPosts.length === 0 && (
            <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-[3.5rem] bg-white shadow-xl">
               <span className="material-symbols-outlined text-6xl text-slate-100 mb-8">search_off</span>
               <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em]">Hệ thống không tìm thấy quỹ đạo phù hợp</p>
               <button 
                onClick={() => navigate('/community')}
                className="mt-8 text-blue-600 text-[11px] font-black uppercase tracking-widest hover:underline bg-blue-50 px-8 py-3 rounded-xl border border-blue-100 transition-all"
               >
                 Xóa bộ lọc tìm kiếm
               </button>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-6">
            <button 
              onClick={() => currentPage > 1 && paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-14 h-14 rounded-2xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] hover:shadow-xl"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-[2rem] border border-slate-100 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)]">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`w-11 h-11 rounded-xl text-[10px] font-black transition-all ${
                    currentPage === number 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 scale-110' 
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>

            <button 
              onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-14 h-14 rounded-2xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] hover:shadow-xl"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </nav>
        )}
      </main>

      <SharedFooter />
    </div>
  );
};

export default CommunityPage;
