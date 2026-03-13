
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SharedHeader from '../components/SharedHeader';
import SharedFooter from '../components/SharedFooter';
import { useNavigate } from 'react-router-dom';
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000/api';


const PremiumPage: React.FC = () => {
  const navigate = useNavigate();
  const [userTier, setUserTier] = useState<string>('free');

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
            setUserTier(data.tier || 'free');
          }
        } catch (e) {
          console.error('Error fetching user tier:', e);
        }
      }
    };
    fetchUser();
  }, []);
  const plans = [
    {
      id: 'free',
      name: 'Miễn phí',
      price: '0đ',
      period: '/mãi mãi',
      description: 'Dành cho nhu cầu nghiên cứu cá nhân cơ bản.',
      features: [
        'Mô phỏng 3 kịch bản cơ bản',
        'Timeline lộ trình đơn giản',
        'Lưu trữ tối đa 5 báo cáo',
        'Phân tích SWOT cơ bản'
      ],
      isCurrent: userTier === 'free',
      buttonText: userTier === 'free' ? 'Đang sử dụng' : 'Sử dụng',
      color: 'slate'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '299.000đ',
      period: '/tháng',
      description: 'Tối ưu hóa chiến lược với phân tích chuyên sâu.',
      features: [
        'Không giới hạn mô phỏng',
        'Phân tích sâu kịch bản chiến lược',
        'Dự báo và hạn chế rủi ro nâng cao',
        'Tư vấn chiến thuật cơ bản',
        'Hỗ trợ AI ưu tiên xử lý'
      ],
      isPopular: true,
      isCurrent: userTier === 'premium_demo',
      buttonText: userTier === 'premium_demo' ? 'Đang sử dụng' : 'Nâng cấp ngay',
      color: 'blue'
    },
    {
      id: 'enterprise',
      name: 'Doanh nghiệp',
      price: 'Liên hệ',
      period: '',
      description: 'Giải pháp toàn diện cho tổ chức và đội ngũ.',
      features: [
        'Tất cả tính năng Premium',
        'Phân tích ma trận đa biến tùy chỉnh',
        'Cố vấn AI riêng biệt cho doanh nghiệp',
        'Quản lý quyền truy cập đội ngũ',
        'Xuất báo cáo PDF/Excel chuyên nghiệp'
      ],
      isCurrent: false,
      buttonText: 'Liên hệ tư vấn',
      color: 'indigo'
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <SharedHeader />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-20 sm:py-32">
        <header className="text-center mb-24 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-amber-100"
          >
            FutureTrace Elite Access
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-7xl font-black tracking-tighter mb-8 font-display text-slate-900 leading-[0.9]"
          >
            Định lượng tương lai <br /> <span className="text-blue-600">ở cấp độ cao nhất.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 font-medium leading-relaxed"
          >
            Nâng cấp lên Premium để mở khóa các phân tích kịch bản chiến lược chuyên sâu và hệ thống cảnh báo rủi ro tự động.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`relative flex flex-col p-10 rounded-[3rem] border transition-all duration-500 group hover:shadow-2xl ${plan.isPopular
                ? 'bg-slate-950 text-white border-blue-600 ring-1 ring-blue-600 shadow-2xl scale-105 z-10'
                : 'bg-white border-slate-100 text-slate-900 hover:border-blue-200'
                }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-500/20">
                  Lựa chọn tốt nhất
                </div>
              )}

              <div className="mb-10">
                <h3 className={`text-sm font-black uppercase tracking-[0.3em] mb-6 ${plan.isPopular ? 'text-blue-400' : 'text-slate-400'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black font-display tracking-tighter">{plan.price}</span>
                  <span className={`text-xs font-bold uppercase tracking-widest ${plan.isPopular ? 'text-slate-500' : 'text-slate-400'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm font-medium leading-relaxed ${plan.isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="flex-1 mb-12 space-y-6">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className={`material-symbols-outlined text-xl ${plan.isPopular ? 'text-blue-500' : 'text-blue-600'}`}>
                      check_circle
                    </span>
                    <span className={`text-[11px] font-black uppercase tracking-widest leading-tight ${plan.isPopular ? 'text-slate-300' : 'text-slate-600'}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button
                disabled={plan.isCurrent}
                onClick={() => {
                  if (plan.id === 'premium') {
                    navigate('/checkout', { state: { plan } });
                  }
                }}
                className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${plan.isCurrent
                  ? 'bg-slate-100 text-slate-400 cursor-default'
                  : plan.isPopular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-900/20'
                    : 'bg-slate-900 hover:bg-blue-600 text-white shadow-xl shadow-slate-200'
                  }`}
              >
                {plan.buttonText}
                {!plan.isCurrent && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
              </button>
            </motion.div>
          ))}
        </div>

        <section className="mt-40 pt-20 border-t border-slate-100 text-center">
          <div className="max-w-2xl mx-auto space-y-10">
            <span className="material-symbols-outlined text-slate-200 text-6xl">verified_user</span>
            <h4 className="text-2xl font-black text-slate-900 font-display uppercase tracking-tight">Cam kết bảo mật & hiệu suất</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed uppercase tracking-widest">
              Dữ liệu mô phỏng của bạn được mã hóa hoàn toàn. Các gói Premium và Doanh nghiệp được ưu tiên sử dụng cụm máy chủ xử lý AI chuyên dụng của FutureTrace.
            </p>
          </div>
        </section>
      </main>

      <SharedFooter />
    </div>
  );
};

export default PremiumPage;
