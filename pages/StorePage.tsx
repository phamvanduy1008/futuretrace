import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SharedHeader from '../components/SharedHeader';
import SharedFooter from '../components/SharedFooter';
import { useNavigate } from 'react-router-dom';
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000';
import { IconMapper } from '../components/IconMapper';
import { AnimatedBackground } from '../components/AnimatedBackground';

const TOKEN_PACKS = [
  {
    id: 'starter',
    name: 'Khởi Đầu',
    price: 29000,
    token: 100,
    bonusPercent: 0,
    description: 'Thử nghiệm tính năng AI lần đầu.',
    color: 'slate',
    icon: 'nut',
    highlight: false,
  },
  {
    id: 'basic',
    name: 'Cơ Bản',
    price: 59000,
    token: 250,
    bonusPercent: 10,
    description: 'Lý tưởng cho người dùng thường xuyên.',
    color: 'blue',
    icon: 'lightning',
    highlight: false,
  },
  {
    id: 'standard',
    name: 'Tiêu Chuẩn',
    price: 119000,
    token: 550,
    bonusPercent: 22,
    description: 'Phù hợp cho việc nghiên cứu chuyên sâu.',
    color: 'indigo',
    icon: 'lightbulb',
    highlight: false,
  },
  {
    id: 'advanced',
    name: 'Nâng Cao',
    price: 229000,
    token: 1200,
    bonusPercent: 38,
    description: 'Tối ưu cho người nghiêm túc với tương lai.',
    color: 'violet',
    icon: 'rocket_launch',
    highlight: true,
  },
  {
    id: 'expert',
    name: 'Chuyên Gia',
    price: 449000,
    token: 2500,
    bonusPercent: 45,
    description: 'Dành cho phân tích chiến lược chuyên sâu.',
    color: 'purple',
    icon: 'workspace_premium',
    highlight: false,
  },
  {
    id: 'enterprise',
    name: 'Doanh Nghiệp',
    price: 799000,
    token: 5000,
    bonusPercent: 72,
    description: 'Toàn quyền sử dụng cho tổ chức.',
    color: 'amber',
    icon: 'diamond',
    highlight: false,
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; badge: string; btnBg: string; icon: string }> = {
  slate: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-500', btnBg: 'bg-slate-900 hover:bg-slate-700', icon: 'text-slate-500' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-600', btnBg: 'bg-blue-600 hover:bg-blue-700', icon: 'text-blue-500' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-600', btnBg: 'bg-indigo-600 hover:bg-indigo-700', icon: 'text-indigo-500' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-600', btnBg: 'bg-violet-600 hover:bg-violet-700', icon: 'text-violet-500' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-600', btnBg: 'bg-purple-600 hover:bg-purple-700', icon: 'text-purple-500' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', btnBg: 'bg-amber-500 hover:bg-amber-600', icon: 'text-amber-500' },
};

const FEATURE_COSTS = [
  { action: 'Tạo kịch bản mô phỏng (3 kịch bản)', cost: 100, icon: 'model_training' },
  { action: 'Phân tích chuyên sâu (Roadmap AI)', cost: 80, icon: 'science' },
  { action: 'Điều chỉnh lộ trình (Pivot)', cost: 50, icon: 'change' },
];

const StorePage: React.FC = () => {
  const navigate = useNavigate();
  const [userToken, setUserToken] = useState<number | null>(null);

  // Token calculator states
  const [simCount, setSimCount] = useState<number>(0);
  const [analysisCount, setAnalysisCount] = useState<number>(0);
  const [pivotCount, setPivotCount] = useState<number>(0);

  // Dynamic token calculation
  const totalNeededTokens = (simCount * 100) + (analysisCount * 80) + (pivotCount * 50);

  // Recommendation logic
  const getRecommendedPack = (tokensNeeded: number) => {
    if (tokensNeeded <= 0) return null;
    const pack = TOKEN_PACKS.find(p => p.token >= tokensNeeded);
    return pack ? pack.id : 'enterprise';
  };
  const recommendedPackId = getRecommendedPack(totalNeededTokens);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUserToken(data.token ?? 0);
          }
        } catch (e) {
          console.error('Error fetching user:', e);
        }
      }
    };
    fetchUser();
  }, []);

  const handleBuyPack = (pack: typeof TOKEN_PACKS[0]) => {
    navigate('/checkout', {
      state: {
        plan: {
          id: pack.id,
          name: `${pack.token} Token - Gói ${pack.name}`,
          price: `${pack.price}đ`,
          period: '',
          tokenAmount: pack.token,
          features: [
            `${pack.token.toLocaleString('vi-VN')} token được cộng ngay vào tài khoản`,
            pack.bonusPercent > 0 ? `Tiết kiệm ${pack.bonusPercent}% so với gói Khởi Đầu` : 'Không cam kết dài hạn',
            'Dùng cho mô phỏng, phân tích & pivot AI',
            'Token không hết hạn',
          ],
        }
      }
    });
  };

  return (
    <AnimatedBackground className="flex flex-col font-sans min-h-screen">
      <SharedHeader />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-8 py-12 lg:py-20">
        {/* Hero & Calculator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20 items-stretch">
          
          {/* Left Column: Hero Intro */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="self-start inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100/50 shadow-sm"
            >
              <IconMapper name="store" className="text-sm" />
              Cửa hàng
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black font-display tracking-tight text-slate-900 leading-[0.8] uppercase"
            >
              Mua token<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Dùng ngay.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl"
            >
              Cung cấp năng lượng cho AI mô phỏng, phân tích chiến lược SWOT & lập lộ trình hành động chi tiết 90 ngày. Chọn gói phù hợp với lộ trình của bạn.
            </motion.p>

            {/* User Token Balance Card */}
            {userToken !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex self-start items-center gap-4 px-6 py-4 bg-white/70 backdrop-blur-md border border-blue-100 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                  <IconMapper name="toll" className="text-xl" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Token hiện có trong ví</p>
                  <p className="text-xl font-black text-slate-900 flex items-baseline gap-1">
                    {userToken.toLocaleString('vi-VN')}
                    <span className="text-xs font-bold text-slate-400 uppercase">tokens</span>
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Dynamic Token Calculator & Reference */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-5 flex flex-col"
          >
            <div className="bg-slate-950 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border border-slate-800 flex flex-col justify-between h-full">
              {/* Decorative glows */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    Ước lượng tài nguyên
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-black uppercase tracking-widest">
                    Interactive
                  </span>
                </div>
                
                <h3 className="text-lg font-black uppercase tracking-tight text-white mb-4">
                  Bạn cần chạy bao nhiêu tác vụ?
                </h3>
                
                {/* Counter Controls */}
                <div className="space-y-4 mb-6">
                  {/* Simulation count */}
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <IconMapper name="model_training" className="text-base" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">Mô phỏng quyết định</p>
                        <p className="text-[9px] text-slate-400">100 token / 3 kịch bản</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSimCount(prev => Math.max(0, prev - 1))}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-black text-white">{simCount}</span>
                      <button
                        onClick={() => setSimCount(prev => prev + 1)}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Deep Analysis count */}
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <IconMapper name="science" className="text-base" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">Phân tích chuyên sâu SWOT</p>
                        <p className="text-[9px] text-slate-400">80 token / báo cáo</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAnalysisCount(prev => Math.max(0, prev - 1))}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-black text-white">{analysisCount}</span>
                      <button
                        onClick={() => setAnalysisCount(prev => prev + 1)}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Pivot count */}
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400">
                        <IconMapper name="change" className="text-base" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">Điều chỉnh lộ trình (Pivot)</p>
                        <p className="text-[9px] text-slate-400">50 token / lần</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPivotCount(prev => Math.max(0, prev - 1))}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-black text-white">{pivotCount}</span>
                      <button
                        onClick={() => setPivotCount(prev => prev + 1)}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic recommendation footer */}
              <div className="pt-6 border-t border-white/10 mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-slate-400">Tổng token cần dùng</p>
                    <p className="text-2xl font-black text-white">{totalNeededTokens} <span className="text-xs font-bold text-blue-400 uppercase">token</span></p>
                  </div>
                  {totalNeededTokens > 0 && (
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-widest text-slate-400">Gói khuyến nghị</p>
                      <p className="text-sm font-black text-blue-400 uppercase tracking-tight">
                        {TOKEN_PACKS.find(p => p.id === recommendedPackId)?.name || 'Doanh Nghiệp'}
                      </p>
                    </div>
                  )}
                </div>

                {totalNeededTokens === 0 ? (
                  <p className="text-[10px] text-slate-500 font-medium text-center">
                    Tăng số lượng tác vụ ở trên để nhận đề xuất gói tối ưu nhất.
                  </p>
                ) : (
                  <div className="text-[10px] text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-2">
                    <IconMapper name="check_circle" className="text-blue-400 text-sm shrink-0" />
                    <span>
                      Nên mua gói <strong>{TOKEN_PACKS.find(p => p.id === recommendedPackId)?.name || 'Doanh Nghiệp'}</strong> để nhận đủ tài nguyên và tối ưu chi phí.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Title for Packs Section */}
        <div className="text-center mb-10 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display uppercase tracking-tight mb-3">
            Chọn gói Token phù hợp
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Nhấp mua để chuyển tiếp đến cổng giao dịch an toàn. Token của bạn không bao giờ hết hạn.
          </p>
        </div>

        {/* Token packs grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
          {TOKEN_PACKS.map((pack, i) => {
            const c = COLOR_MAP[pack.color];
            const pricePerToken = Math.round(pack.price / pack.token);
            
            // Check if this pack is suggested by the calculator
            const isSuggested = pack.id === recommendedPackId;
            
            // Default highlighted is advanced pack
            const isHighlighted = pack.highlight;

            return (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className={`relative flex flex-col rounded-[2.5rem] border-2 p-8 transition-all duration-300 group hover:shadow-2xl hover:-translate-y-2 ${
                  isHighlighted
                    ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 border-violet-500 ring-4 ring-violet-500/20 shadow-2xl shadow-violet-900/30'
                    : isSuggested
                      ? 'bg-white border-blue-500 ring-4 ring-blue-500/20 shadow-xl'
                      : `bg-white/80 backdrop-blur-md ${c.border} hover:border-blue-400/60`
                }`}
              >
                {/* Popular Badge */}
                {isHighlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-xl shadow-violet-500/30">
                    Phổ biến nhất
                  </div>
                )}

                {/* Suggested Badge */}
                {!isHighlighted && isSuggested && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-500/30 animate-pulse">
                    Được khuyến nghị
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${
                    isHighlighted ? 'bg-violet-600/20 text-violet-400' : `${c.bg} ${c.icon}`
                  }`}>
                    <IconMapper name={pack.icon} className="text-2xl" />
                  </div>
                  {pack.bonusPercent > 0 && (
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      isHighlighted 
                        ? 'bg-violet-500/20 text-violet-300' 
                        : c.badge
                    }`}>
                      +{pack.bonusPercent}% ưu đãi
                    </span>
                  )}
                </div>

                {/* Pack info */}
                <div className="mb-6 flex-1">
                  <h3 className={`text-[11px] font-black uppercase tracking-widest mb-3 ${
                    isHighlighted ? 'text-violet-400' : 'text-slate-400'
                  }`}>
                    Gói {pack.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-4xl font-black font-display tracking-tighter ${
                      isHighlighted ? 'text-white' : 'text-slate-900'
                    }`}>
                      {pack.token.toLocaleString('vi-VN')}
                    </span>
                    <span className={`text-xs font-black uppercase tracking-widest ${
                      isHighlighted ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      tokens
                    </span>
                  </div>
                  <p className={`text-sm font-medium ${
                    isHighlighted ? 'text-slate-400' : 'text-slate-600'
                  } mb-4 leading-relaxed`}>
                    {pack.description}
                  </p>
                  
                  {/* Cost per token badge */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                    isHighlighted ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-500'
                  }`}>
                    <IconMapper name="toll" className="text-xs" />
                    ≈ {pricePerToken.toLocaleString('vi-VN')}đ / token
                  </span>
                </div>

                {/* Divider */}
                <div className={`border-t mb-6 ${
                  isHighlighted ? 'border-white/10' : 'border-slate-100'
                }`} />

                {/* Price & button */}
                <div>
                  <div className="flex items-baseline justify-between mb-5">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      isHighlighted ? 'text-slate-400' : 'text-slate-400'
                    }`}>Giá trọn gói</span>
                    <span className={`text-2xl font-black font-display tracking-tighter ${
                      isHighlighted ? 'text-white' : 'text-slate-900'
                    }`}>
                      {pack.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <button
                    onClick={() => handleBuyPack(pack)}
                    className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                      isHighlighted
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-xl shadow-violet-900/30'
                        : isSuggested
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20'
                          : `${c.btnBg} text-white shadow-md hover:shadow-lg`
                    }`}
                  >
                    Mua ngay
                    <IconMapper name="arrow_forward" className="text-sm transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Trust Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pt-16 border-t border-slate-200/60 max-w-5xl mx-auto"
        >
          <div className="text-center mb-12">
            <h3 className="text-xl font-black text-slate-900 font-display uppercase tracking-tight mb-2">
              Cam kết dịch vụ & Bảo mật thanh toán
            </h3>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              FutureTrace sử dụng các cổng thanh toán uy tín để đảm bảo trải nghiệm giao dịch an toàn tuyệt đối.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Token Expiry */}
            <div className="bg-white/60 backdrop-blur-sm border border-slate-100 p-6 rounded-3xl text-center space-y-3 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto">
                <IconMapper name="timer" className="text-2xl" />
              </div>
              <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                Token Không Hết Hạn
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Số token đã mua được bảo toàn trong tài khoản của bạn và không bao giờ hết hạn. Bạn có thể sử dụng bất cứ lúc nào.
              </p>
            </div>

            {/* Card 2: Secure Payment */}
            <div className="bg-white/60 backdrop-blur-sm border border-slate-100 p-6 rounded-3xl text-center space-y-3 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto">
                <IconMapper name="verified_user" className="text-2xl" />
              </div>
              <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                Thanh Toán An Toàn
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Giao dịch được mã hóa và xử lý tự động thông qua tích hợp API chính thức. Token tự động cộng sau khi thanh toán thành công.
              </p>
            </div>

            {/* Card 3: Support */}
            <div className="bg-white/60 backdrop-blur-sm border border-slate-100 p-6 rounded-3xl text-center space-y-3 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto">
                <IconMapper name="help" className="text-2xl" />
              </div>
              <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                Hỗ Trợ Nhanh 24/7
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đội ngũ hỗ trợ kỹ thuật của chúng tôi luôn sẵn sàng 24/7 để giải quyết mọi thắc mắc về token hoặc giao dịch của bạn.
              </p>
            </div>
          </div>
        </motion.section>
      </main>

      <SharedFooter />
    </AnimatedBackground>
  );
};

export default StorePage;
