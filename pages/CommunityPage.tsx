import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SharedHeader from '../components/SharedHeader';
import SharedFooter from '../components/SharedFooter';
import { communityService } from '../services/communityService';
import { CommunityPost } from '../types';
import { IconMapper } from '../components/IconMapper';
import { AnimatedBackground } from '../components/AnimatedBackground';

const POSTS_PER_PAGE = 3;

const CommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = searchParams.get('q')?.toLowerCase() || "";

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await communityService.getPosts(currentPage, POSTS_PER_PAGE, filter, query);
      setPosts(data.items);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải dữ liệu cộng đồng.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filter, query]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Reset về trang 1 khi thay đổi filter hoặc query tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, query]);

  const handleLike = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    try {
      const result = await communityService.toggleLike(postId);
      // Update local state to reflect like change immediately
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked: result.liked,
            likes: result.liked ? p.likes + 1 : p.likes - 1
          };
        }
        return p;
      }));
    } catch (err) {
      console.error(err);
    }
  };
  
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatedBackground className="flex flex-col font-sans">
      <SharedHeader />
      
      <main className="flex-1 max-w-[1100px] mx-auto w-full px-6 py-12 sm:py-24">
        <header className="mb-24 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-6 py-2 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-10 border border-blue-100 shadow-sm"
          >
            Mạng lưới nghiên cứu FutureTrace
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
            className="text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            {query 
              ? `Hệ thống tìm thấy một số quỹ đạo nghiên cứu phù hợp với yêu cầu của bạn.`
              : "Khám phá các quỹ đạo tương lai được chia sẻ bởi cộng đồng chuyên gia. Học hỏi từ các mô phỏng Monte Carlo thực tế."
            }
          </motion.p>
        </header>

        <div className="flex flex-wrap items-center justify-center gap-6 mb-20">
          {[
            { id: 'all', label: 'Tất cả báo cáo' },
            { id: 'positive', label: 'Tích cực' },
            { id: 'neutral', label: 'Ổn định' },
            { id: 'risk', label: 'Rủi ro' }
          ].map((f) => (
            <button
              key={f.id} onClick={() => setFilter(f.id)}
              className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                filter === f.id 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-105' 
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-8">
            <div className="w-20 h-20 border-t-4 border-b-4 border-blue-600 rounded-full animate-spin"></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Đang tải quỹ đạo từ mạng lưới nghiên cứu...</p>
          </div>
        ) : error ? (
          <div className="py-24 text-center border-2 border-dashed border-rose-200 rounded-[3.5rem] bg-rose-50/30">
             <IconMapper name="error_outline" className=" text-6xl text-rose-200 mb-8" />
             <p className="text-rose-600 font-black uppercase text-sm tracking-widest">{error}</p>
             <button 
              onClick={() => fetchPosts()}
              className="mt-8 text-rose-600 text-[11px] font-black uppercase tracking-widest hover:underline bg-rose-50 px-8 py-3 rounded-xl border border-rose-100 transition-all"
             >
               Thử lại
             </button>
          </div>
        ) : (
          <div className="space-y-12 mb-24">
            <AnimatePresence mode='popLayout'>
              {posts.map((post, idx) => (
                <motion.article
                  layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }}
                  key={post.id} className="bg-white border-2 border-slate-100 rounded-[3.5rem] p-10 sm:p-14 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] hover:shadow-2xl hover:ring-4 hover:ring-blue-600/30 hover:border-blue-600 hover:-translate-y-2 transition-all group relative overflow-hidden"
                >
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
                          {post.isAnonymous || !post.authorAvatar ? (
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
                              <IconMapper name={post.isAnonymous ? 'visibility_off' : 'person'} className=" text-2xl" />
                            </div>
                          ) : (
                            <img src={post.authorAvatar} className="w-12 h-12 rounded-2xl border-2 border-white shadow-xl" alt={post.author || 'Avatar'} />
                          )}
                          <div>
                             <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{post.author}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{post.date}</p>
                          </div>
                        </div>
                        <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                          post.type === 'Positive' || post.type === 'positive' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                          post.type === 'Risk' || post.type === 'risk' ? 'text-rose-600 bg-rose-50 border-rose-100' : 'text-blue-600 bg-blue-50 border-blue-100'
                        }`}>
                          {post.type === 'Positive' || post.type === 'positive' ? 'Tích cực' :
                           post.type === 'Risk' || post.type === 'risk' ? 'Rủi ro' : 'Ổn định'}
                        </span>
                      </div>

                      <h2 onClick={() => navigate(`/detail/${post.id}`, { state: { scenario: post, fromCommunity: true } })} className="text-3xl sm:text-4xl font-black font-display text-slate-900 hover:text-blue-600 cursor-pointer transition-colors leading-tight uppercase tracking-tighter italic">
                        {post.title}
                      </h2>
                      
                      <p className="text-slate-600 font-medium leading-relaxed italic text-base sm:text-lg opacity-80">
                        "{post.desc}"
                      </p>

                      <div className="flex items-center justify-between pt-10 border-t border-slate-50">
                        <div className="flex items-center gap-10">
                          <button 
                            onClick={(e) => handleLike(e, post.id)}
                            className="flex items-center gap-3 group/btn"
                          >
                            <IconMapper name="favorite" className={`transition-colors text-2xl ${post.isLiked ? 'text-rose-500' : 'text-slate-300 group-hover/btn:text-rose-500'}`} style={post.isLiked ? { fill: 'currentColor' } : {}} />
                            <span className={`text-[11px] font-black ${post.isLiked ? 'text-rose-600' : 'text-slate-400 group-hover/btn:text-slate-900'}`}>{post.likes}</span>
                          </button>
                          <button onClick={() => navigate(`/detail/${post.id}`, { state: { scenario: post, fromCommunity: true } })} className="flex items-center gap-3 group/btn">
                            <IconMapper name="chat_bubble" className="text-slate-300 group-hover/btn:text-blue-600 transition-colors text-2xl" />
                            <span className="text-[11px] font-black text-slate-400 group-hover/btn:text-slate-900">{post.commentsCount}</span>
                          </button>
                        </div>
                        <button onClick={() => navigate(`/detail/${post.id}`, { state: { scenario: post, fromCommunity: true } })} className="flex items-center gap-3 text-[11px] font-black text-blue-600 uppercase tracking-widest hover:translate-x-3 transition-all group">
                           Báo cáo đầy đủ <IconMapper name="arrow_forward" className="text-xl group-hover:scale-125 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>

            {posts.length === 0 && (
              <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-[3.5rem] bg-white shadow-xl">
                 <IconMapper name="search_off" className=" text-6xl text-slate-100 mb-8" />
                 <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Hệ thống không tìm thấy quỹ đạo phù hợp</p>
                 <button 
                  onClick={() => { setFilter('all'); navigate('/community'); }}
                  className="mt-8 text-blue-600 text-[11px] font-black uppercase tracking-widest hover:underline bg-blue-50 px-8 py-3 rounded-xl border border-blue-100 transition-all"
                 >
                   Xóa bộ lọc tìm kiếm
                 </button>
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <nav className="flex items-center justify-center gap-6">
            <button 
              onClick={() => currentPage > 1 && paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-14 h-14 rounded-2xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] hover:shadow-xl"
            >
              <IconMapper name="chevron_left" className="" />
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
              <IconMapper name="chevron_right" className="" />
            </button>
          </nav>
        )}
      </main>

      <SharedFooter />
    </AnimatedBackground>
  );
};

export default CommunityPage;
