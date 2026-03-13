import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SharedHeader from '../components/SharedHeader';
import SharedFooter from '../components/SharedFooter';
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000';
import { IconMapper } from '../components/IconMapper';
import { AnimatedBackground } from '../components/AnimatedBackground';

const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const resultCode = searchParams.get('resultCode');
      const orderId = searchParams.get('orderId');
      // According to MoMo docs: 0 means success
      if (resultCode === '0' && orderId) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/payment/check-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
          });

          if (res.ok) {
            const data = await res.json();
            // Verify from backend that the payment was truly successful
            const code = data?.momo_payment?.resultCode !== undefined 
                           ? data.momo_payment.resultCode 
                           : data?.resultCode;

            if (code === 0) {
              setStatus('success');
              return;
            }
          }
          setStatus('failed');
        } catch (e) {
          console.error('Lỗi kiểm tra trạng thái thanh toán:', e);
          setStatus('failed');
        }
      } else if (resultCode) {
        setStatus('failed');
      } else {
        setStatus('failed');
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  return (
    <AnimatedBackground className="flex flex-col font-sans">
      <SharedHeader />

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-white rounded-[3rem] p-12 sm:p-16 max-w-lg w-full text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-100"
        >
          {status === 'loading' && (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-8"></div>
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang xử lý kết quả...</h2>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner border border-emerald-100">
                <IconMapper name="check_circle" className="text-emerald-500 text-5xl" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 font-display uppercase tracking-tight italic leading-normal pt-1">
                Thanh toán thành công!
              </h2>
              <p className="text-slate-500 mb-10 font-medium italic text-sm leading-relaxed max-w-sm">
                Cảm ơn bạn đã nâng cấp Premium. Các tính năng cao cấp đã được mở khóa cho tài khoản của bạn.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-5 rounded-2xl font-black bg-slate-900 hover:bg-blue-600 text-white text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-4"
              >
                Đến bảng điều khiển
                <IconMapper name="arrow_forward" className="text-sm" />
              </button>
            </div>
          )}

          {status === 'failed' && (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-rose-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner border border-rose-100">
                <IconMapper name="error" className="text-rose-500 text-5xl" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 font-display uppercase tracking-tight italic leading-normal pt-1">
                Thanh toán thất bại
              </h2>
              <p className="text-slate-500 mb-10 font-medium italic text-sm leading-relaxed max-w-sm">
                Rất tiếc, giao dịch của bạn không thành công hoặc đã bị hủy. Vui lòng thử lại.
              </p>
              <div className="w-full space-y-4">
                <button
                  onClick={() => navigate('/premium')}
                  className="w-full py-5 rounded-2xl font-black bg-slate-900 hover:bg-blue-600 text-white text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-4"
                >
                  Thử lại
                  <IconMapper name="refresh" className="text-sm" />
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-5 rounded-2xl font-black bg-white border-2 border-slate-100 text-slate-400 hover:bg-slate-50 text-[10px] uppercase tracking-widest transition-all"
                >
                  Về bảng điều khiển
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <SharedFooter />
    </AnimatedBackground>
  );
};

export default PaymentResultPage;
