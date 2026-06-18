import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import SharedHeader from '../components/SharedHeader';
import SharedFooter from '../components/SharedFooter';
import { IconMapper } from '../components/IconMapper';
import { AnimatedBackground } from '../components/AnimatedBackground';


const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'vnpay'>('momo');

  // Form states
  const [fullName, setFullName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [country] = useState('Việt Nam');

  // Modal QR
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 20;

    if (showQRModal && orderId) {
      interval = setInterval(async () => {
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setShowQRModal(false);
          setError('Giao dịch đã hết hạn do quá thời gian chờ (10 phút). Vui lòng thử lại.');
          return;
        }

        try {
          const res = await fetch(`${API_BASE_URL}/api/payment/check-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId })
          });
          if (res.ok) {
            const data = await res.json();
            const code = data?.momo_payment?.resultCode !== undefined
              ? data.momo_payment.resultCode
              : data?.resultCode;

            if (code === 0) {
              clearInterval(interval);
              setShowQRModal(false);
              navigate(`/payment-result?resultCode=0&orderId=${orderId}`);
            }
          }
        } catch (e) {
          console.error('Lỗi khi kiểm tra trạng thái:', e);
        }
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [showQRModal, orderId, navigate, setError]);

  const plan = location.state?.plan;
  if (!plan) {
    return <Navigate to="/premium" replace />;
  }

  const getNumericPrice = (priceStr: string) => {
    return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
  };

  const price = getNumericPrice(plan.price);
  const priceVat = (price * 0.1);
  const totalPrice = price + priceVat;

  const isFormValid = fullName.trim() !== '' && addressLine1.trim() !== '';

  const handlePayment = async () => {
    if (!isFormValid) {
      setError('Vui lòng điền đầy đủ thông tin hóa đơn (Họ tên và Địa chỉ).');
      return;
    }

    if (paymentMethod === 'vnpay') {
      alert('Chức năng thanh toán qua VNPay đang được phát triển!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      let userId = 'user_' + Math.random().toString(36).substring(7);
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.userId) userId = payload.userId;
          else if (payload.id) userId = payload.id;
        } catch (e) {
          console.log("Could not decode token for userId");
        }
      }

      const orderData = {
        userId,
        total_price: totalPrice,
        planType: plan.planType || 'monthly',
        paymentMethod,
        billing: { fullName, address: addressLine1, country },
      };

      const response = await fetch(`${API_BASE_URL}/api/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Không thể tạo giao dịch thanh toán. Vui lòng thử lại sau.');
      }

      const data = await response.json();

      if (data?.momo_payment?.qrCodeUrl) {
        setQrUrl(data.momo_payment.qrCodeUrl);
        setOrderId(data.momo_payment.orderId);
        setShowQRModal(true);
      } else {
        throw new Error('Dữ liệu phản hồi từ MoMo không hợp lệ.');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <AnimatedBackground className="flex flex-col font-sans">
      <SharedHeader />

      <motion.main
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-10 py-12 sm:py-20"
      >
        {/* Back button */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate('/premium')}
          className="group flex items-center gap-3 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest mb-12 transition-colors"
        >
          <IconMapper name="arrow_back" className="text-lg transition-transform group-hover:-translate-x-1" />
          Quay lại chọn gói
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-14">
          {/* LEFT - Payment & Billing */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-widest mb-4">
                PREMIUM <IconMapper name="chevron_right" className="text-[10px]" /> THANH TOÁN
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-display text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500 leading-normal pb-2 uppercase italic pt-2">
                Hoàn tất thanh toán
              </h1>
              <p className="text-slate-600 mt-3 text-lg font-medium italic mb-14">
                "Chọn phương thức thanh toán và điền thông tin hóa đơn."
              </p>
            </motion.div>

            {/* Payment Method */}
            <motion.section variants={itemVariants} className="mb-14">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                <IconMapper name="credit_card" className="text-blue-600 text-lg" />
                Phương thức thanh toán
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {/* MoMo */}
                <label
                  className={`relative flex flex-col p-8 rounded-[2rem] cursor-pointer transition-all duration-300 group ${paymentMethod === 'momo'
                    ? 'bg-white border-2 border-pink-500 ring-2 ring-pink-500/10 shadow-[0_20px_50px_-12px_rgba(236,72,153,0.15)]'
                    : 'bg-white border-2 border-slate-100 hover:border-slate-200 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)]'
                    }`}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-pink-500/20">
                        MoMo
                      </div>
                      <span className="font-black text-slate-900 uppercase tracking-tight text-sm">MoMo</span>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      value="momo"
                      checked={paymentMethod === 'momo'}
                      onChange={() => setPaymentMethod('momo')}
                      className="w-5 h-5 text-pink-600 border-slate-300 focus:ring-pink-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500 font-medium italic">Thanh toán nhanh chóng qua ví MoMo</p>
                </label>

                {/* VNPAY */}
                <label
                  className={`relative flex flex-col p-8 rounded-[2rem] cursor-pointer transition-all duration-300 group ${paymentMethod === 'vnpay'
                    ? 'bg-white border-2 border-blue-500 ring-2 ring-blue-500/10 shadow-[0_20px_50px_-12px_rgba(37,99,235,0.15)]'
                    : 'bg-white border-2 border-slate-100 hover:border-slate-200 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)]'
                    }`}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-500/20">
                        VNPAY
                      </div>
                      <span className="font-black text-slate-900 uppercase tracking-tight text-sm">VNPay</span>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      value="vnpay"
                      checked={paymentMethod === 'vnpay'}
                      onChange={() => setPaymentMethod('vnpay')}
                      className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500 font-medium italic">Thanh toán qua cổng VNPay (đang phát triển)</p>
                </label>
              </div>
            </motion.section>

            {/* Billing Info */}
            <motion.section variants={itemVariants}>
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                <IconMapper name="receipt_long" className="text-blue-600 text-lg" />
                Thông tin hóa đơn
              </h2>
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 sm:p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 text-slate-900 font-medium bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                      Quốc gia
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={country}
                        readOnly
                        className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-slate-500 font-medium cursor-not-allowed outline-none"
                      />
                      <IconMapper name="expand_more" className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                      Địa chỉ *
                    </label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="Số nhà, đường, phường/xã..."
                      className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 text-slate-900 font-medium bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>
            </motion.section>
          </div>

          {/* RIGHT - Order Summary */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-[3rem] border border-slate-100 p-8 sm:p-10 sticky top-6 lg:top-24 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)]"
            >
              {/* Plan Header */}
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <IconMapper name="workspace_premium" className="text-white text-3xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 font-display tracking-tight uppercase italic">{plan.name}</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1">Gói dịch vụ cao cấp</p>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature: string, i: number) => (
                  <li key={i} className="flex items-start gap-4">
                    <IconMapper name="check_circle" className="text-blue-600 text-xl font-bold mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-bold text-slate-700 leading-relaxed pt-0.5">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Price Breakdown */}
              <div className="bg-slate-50 rounded-2xl p-6 space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gói {plan.period.replace('/', '')}</span>
                  <span className="font-black text-slate-900">{price.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">VAT (10%)</span>
                  <span className="font-black text-slate-900">{priceVat.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-slate-200">
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Tổng thanh toán</span>
                  <span className="text-3xl font-black text-slate-900 font-display tracking-tighter">{totalPrice.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
                  <IconMapper name="error" className="text-rose-500 text-lg flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={loading || !isFormValid}
                className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-4 shadow-xl ${loading || !isFormValid
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-blue-600 text-white shadow-slate-200 hover:shadow-blue-500/20 active:scale-[0.98]'
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Thanh toán ngay
                    <IconMapper name="arrow_forward" className="text-sm" />
                  </>
                )}
              </button>

              <p className="text-[9px] text-slate-400 mt-6 text-center leading-relaxed font-medium uppercase tracking-widest">
                Gia hạn {plan.period.replace('/', '')} cho đến khi bị hủy. Bạn sẽ bị tính phí {totalPrice.toLocaleString('vi-VN')}đ
                {plan.period}. Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.main>

      {/* QR Modal */}
      <AnimatePresence>
        {showQRModal && qrUrl && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQRModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 overflow-hidden"
            >
              <button
                onClick={() => setShowQRModal(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center"
              >
                <IconMapper name="close" className="text-xl" />
              </button>

              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-pink-500/20 text-white font-black text-lg">
                  MoMo
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2 italic font-display">
                  Quét mã thanh toán
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qua ví điện tử MoMo</p>
              </div>

              <div className="flex flex-col items-center gap-8">
                <div className="bg-white p-5 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100">
                  <QRCodeSVG
                    value={qrUrl}
                    size={220}
                    level="H"
                  />
                </div>

                <div className="text-center space-y-3">
                  <p className="text-slate-600 font-medium text-sm italic">
                    Mở ứng dụng ngân hàng / MoMo → Chọn "Quét mã QR" và quét mã này để thanh toán{' '}
                    <span className="font-black text-slate-900 not-italic">{totalPrice.toLocaleString('vi-VN')}đ</span>
                  </p>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                    Mã QR có hiệu lực trong 10 phút. Không chia sẻ mã này.
                  </p>
                </div>

                <a
                  href={qrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black py-5 rounded-2xl text-center text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-pink-500/20 flex items-center justify-center gap-3"
                >
                  Mở MoMo ngay
                  <IconMapper name="open_in_new" className="text-sm" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SharedFooter />
    </AnimatedBackground>
  );
};

export default PaymentPage;
