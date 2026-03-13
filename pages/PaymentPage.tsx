import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'https://futuretrace-server.onrender.com';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import SharedHeader from '../components/SharedHeader';
import SharedFooter from '../components/SharedFooter';


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
    const maxAttempts = 10;

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
            // MoMo check status returns resultCode at root level or inside momo_payment
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
      }, 60000); // 1 minute
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


  // Validation: yêu cầu điền đầy đủ
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <SharedHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-5 sm:px-8 lg:px-12 py-10 sm:py-16 lg:py-20">
        <button
          onClick={() => navigate('/premium')}
          className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-10 transition-colors"
        >
          <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">
            arrow_back
          </span>
          Quay lại chọn gói
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
          {/* LEFT - Payment & Billing */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Hoàn tất thanh toán
            </h1>
            <p className="text-slate-600 mb-10">
              Vui lòng điền thông tin hóa đơn và chọn phương thức thanh toán phù hợp.
            </p>

            {/* Payment Method */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-slate-900 mb-5">
                Phương thức thanh toán
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* MoMo */}
                <label
                  className={`relative flex flex-col p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${paymentMethod === 'momo'
                    ? 'border-pink-600 bg-pink-50/60 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow">
                        MoMo
                      </div>
                      <span className="font-semibold text-slate-900">MoMo</span>
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
                  <p className="text-sm text-slate-600">Thanh toán nhanh chóng qua ví MoMo</p>
                </label>

                {/* VNPAY */}
                <label
                  className={`relative flex flex-col p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${paymentMethod === 'vnpay'
                    ? 'border-blue-600 bg-blue-50/60 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow">
                        VNPAY
                      </div>
                      <span className="font-semibold text-slate-900">VNPay</span>
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
                  <p className="text-sm text-slate-600">Thanh toán qua cổng VNPay (đang phát triển)</p>
                </label>
              </div>
            </section>

            {/* Billing Info */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-5">
                Thông tin hóa đơn
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Quốc gia
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none transition-all"
                      disabled
                    >
                      <option>{country}</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Địa chỉ *
                  </label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="Số nhà, đường, phường/xã..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT - Order Summary */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-100 p-7 lg:p-8 sticky top-6 lg:top-24"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">✨</span>
                <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700">
                    <span className="material-symbols-outlined text-blue-500 text-xl mt-0.5">
                      check_circle
                    </span>
                    <span className="text-sm leading-relaxed font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Gói {plan.period.replace('/', '')}</span>
                  <span className="font-semibold">{price.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">VAT (10%)</span>
                  <span className="font-semibold">{priceVat.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-slate-100 text-lg font-bold">
                  <span className="text-slate-900">Tổng thanh toán</span>
                  <span className="text-2xl text-slate-900">{totalPrice.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={loading || !isFormValid}
                className={`w-full mt-8 py-4 px-6 font-bold text-white rounded-xl transition-all flex items-center justify-center gap-3 shadow-md ${loading || !isFormValid
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 active:scale-[0.98]'
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Thanh toán ngay'
                )}
              </button>

              <p className="text-xs text-slate-500 mt-6 text-center leading-relaxed">
                Gia hạn {plan.period.replace('/', '')} cho đến khi bị hủy. Bạn sẽ bị tính phí {totalPrice.toLocaleString('vi-VN')}đ
                {plan.period}. Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ.
              </p>
            </motion.div>
          </div>
        </div>
      </main>

      {/* QR Modal */}
      {showQRModal && qrUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-8 relative shadow-2xl"
          >
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>

            <h3 className="text-2xl font-bold text-center mb-6 text-slate-900">
              Thanh toán qua MoMo
            </h3>

            <div className="flex flex-col items-center gap-6">
              <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
                <QRCodeSVG
                  value={qrUrl}
                  size={220}
                  level="H"
                />
              </div>

              <div className="text-center space-y-3">
                <p className="text-slate-700 font-medium">
                  Mở ứng dụng ngân hàng/ Momo → Chọn "Quét mã QR" và quét mã này để thanh toán{' '}
                  <span className="font-bold">{totalPrice.toLocaleString('vi-VN')}đ</span>
                </p>
                <p className="text-sm text-slate-500">
                  Mã QR có hiệu lực trong khoảng 10 phút. Không chia sẻ mã này với bất kỳ ai.
                </p>
              </div>

              <a
                href={qrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 rounded-xl text-center transition-all shadow-md"
              >
                Mở MoMo ngay
              </a>
            </div>
          </motion.div>
        </div>
      )}

      <SharedFooter />
    </div>
  );
};

export default PaymentPage;