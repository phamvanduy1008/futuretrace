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

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-16 sm:py-24">
        {/* Header */}
        <header className="text-center mb-20 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-8 border border-blue-100"
          >
            <IconMapper name="store" className="text-base" />
            FutureTrace Store
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black font-display tracking-tighter text-slate-900 leading-none uppercase italic mb-6"
          >
            Mua token.<br />
            <span className="text-blue-600">Dùng ngay.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 font-medium leading-relaxed"
          >
            Token dùng để chạy AI mô phỏng, phân tích chiến lược và điều chỉnh lộ trình tương lai.
          </motion.p>

          {/* Token balance */}
          {userToken !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                <IconMapper name="toll" className="text-blue-600 text-lg" />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Token hiện có</p>
                <p className="text-lg font-black text-slate-900">{userToken.toLocaleString('vi-VN')} token</p>
              </div>
            </motion.div>
          )}
        </header>

        {/* Feature cost reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="max-w-3xl mx-auto mb-16"
        >
          <div className="bg-slate-950 rounded-3xl p-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-3 mb-2">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Chi phí token cho từng tính năng</p>
            </div>
            {FEATURE_COSTS.map((fc, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400 shrink-0">
                  <IconMapper name={fc.icon} className="text-xl" />
                </div>
                <div>
                  <p className="text-white font-black text-sm">{fc.cost} token</p>
                  <p className="text-slate-400 text-[10px] font-medium">{fc.action}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Token packs grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {TOKEN_PACKS.map((pack, i) => {
            const c = COLOR_MAP[pack.color];
            const pricePerToken = Math.round(pack.price / pack.token);

            return (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className={`relative flex flex-col rounded-[2.5rem] border-2 p-8 transition-all duration-300 group hover:shadow-2xl hover:-translate-y-1 ${pack.highlight
                  ? 'bg-slate-950 border-violet-500 ring-2 ring-violet-500/20 shadow-2xl shadow-violet-900/20'
                  : `bg-white ${c.border} hover:border-opacity-100`
                  }`}
              >
                {pack.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-violet-600 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-xl shadow-violet-500/30">
                    Phổ biến nhất
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${pack.highlight ? 'bg-violet-600/20' : c.bg}`}>
                    <IconMapper name={pack.icon} className={`text-2xl ${pack.highlight ? 'text-violet-400' : c.icon}`} />
                  </div>
                  {pack.bonusPercent > 0 && (
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${pack.highlight ? 'bg-violet-500/20 text-violet-300' : c.badge}`}>
                      +{pack.bonusPercent}% ưu đãi
                    </span>
                  )}
                </div>

                {/* Pack info */}
                <div className="mb-6 flex-1">
                  <h3 className={`text-[11px] font-black uppercase tracking-widest mb-3 ${pack.highlight ? 'text-violet-400' : 'text-slate-400'}`}>
                    {pack.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-4xl font-black font-display tracking-tighter ${pack.highlight ? 'text-white' : 'text-slate-900'}`}>
                      {pack.token.toLocaleString('vi-VN')}
                    </span>
                    <span className={`text-sm font-black uppercase tracking-widest ${pack.highlight ? 'text-slate-400' : 'text-slate-400'}`}>
                      token
                    </span>
                  </div>
                  <p className={`text-sm font-medium ${pack.highlight ? 'text-slate-400' : 'text-slate-500'} mb-3`}>
                    {pack.description}
                  </p>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${pack.highlight ? 'text-slate-500' : 'text-slate-300'}`}>
                    ≈ {pricePerToken.toLocaleString('vi-VN')}đ / token
                  </p>
                </div>

                {/* Divider */}
                <div className={`border-t mb-6 ${pack.highlight ? 'border-white/10' : 'border-slate-100'}`} />

                {/* Price & button */}
                <div>
                  <div className="flex items-baseline justify-between mb-5">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${pack.highlight ? 'text-slate-400' : 'text-slate-400'}`}>Giá</span>
                    <span className={`text-2xl font-black font-display tracking-tighter ${pack.highlight ? 'text-white' : 'text-slate-900'}`}>
                      {pack.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <button
                    onClick={() => handleBuyPack(pack)}
                    className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${pack.highlight
                      ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-900/30'
                      : `${c.btnBg} text-white shadow-lg`
                      }`}
                  >
                    Mua ngay
                    <IconMapper name="arrow_forward" className="text-sm" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center max-w-2xl mx-auto"
        >
          <div className="space-y-4">
            <IconMapper name="verified_user" className="text-slate-200 text-5xl mx-auto block" />
            <h4 className="text-xl font-black text-slate-900 font-display uppercase tracking-tight">
              Token không bao giờ hết hạn
            </h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Token bạn mua được lưu vào tài khoản và sử dụng bất kỳ lúc nào. Thanh toán an toàn qua MoMo. Không có chi phí ẩn hay cam kết dài hạn.
            </p>
          </div>
        </motion.section>
      </main>

      <SharedFooter />
    </AnimatedBackground>
  );
};

export default StorePage;
