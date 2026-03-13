import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SharedHeader from '../components/SharedHeader';
import SharedFooter from '../components/SharedFooter';

const BACKEND_URL = 'https://futuretrace-server.onrender.com';

const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      // Read the "resultCode" and "orderId" from URL query string
      const resultCode = searchParams.get('resultCode');
      const orderId = searchParams.get('orderId');

      // According to MoMo docs: 0 means success
      if (resultCode === '0' && orderId) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/payment/check-status`, {
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
        // If no query parameter, assume failed or invalid access
        setStatus('failed');
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SharedHeader />

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl border border-slate-100"
        >
          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
              <h2 className="text-xl font-bold text-slate-900">Đang xử lý kết quả...</h2>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Thanh toán thành công!</h2>
              <p className="text-slate-500 mb-8">
                Cảm ơn bạn đã nâng cấp Premium. Các tính năng cao cấp đã được mở khóa.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full py-4 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Về trang chủ
              </button>
            </div>
          )}

          {status === 'failed' && (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl">error</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Thanh toán thất bại</h2>
              <p className="text-slate-500 mb-8">
                Rất tiếc, giao dịch của bạn không thành công hoặc đã bị hủy.
              </p>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors mb-3"
              >
                Thử lại
              </button>
              <button
                onClick={() => navigate('/premium')}
                className="w-full py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Quay lại gói cước
              </button>
            </div>
          )}
        </motion.div>
      </main>

      <SharedFooter />
    </div>
  );
};

export default PaymentResultPage;
