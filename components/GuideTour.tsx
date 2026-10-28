import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IconMapper } from './IconMapper';

export interface TourStep {
  target: string;
  route: string;
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const TOUR_STEPS: TourStep[] = [
 
  {
    target: '#tour-nav-dashboard',
    route: '/dashboard',
    title: 'Trang Tổng Quan',
    content: 'Đây là trung tâm điều hành hiện tại của bạn. Nơi hiển thị thống kê tổng quan, các chỉ số hoạt động và danh sách kịch bản mô phỏng gần đây.',
    placement: 'bottom'
  },
  {
    target: '#tour-nav-simulate',
    route: '/simulate',
    title: 'Trang Mô Phỏng Quyết Định',
    content: 'Click vào đây để đi thẳng tới trang nhập liệu và cấu hình tham số quyết định của bạn.',
    placement: 'bottom'
  },
  {
    target: '#tour-nav-community',
    route: '/community',
    title: 'Không Gian Cộng Đồng',
    content: 'Nơi hiển thị các kịch bản mô phỏng đã được cộng đồng chia sẻ. Bạn có thể bình luận, thả tim hoặc học hỏi từ kinh nghiệm của người khác.',
    placement: 'bottom'
  },
  {
    target: '#tour-nav-progress',
    route: '/progress',
    title: 'Theo Dõi Tiến Trình ',
    content: 'Nơi giúp bạn theo dõi việc hoàn thành các cột mốc thực tế so với kịch bản tối ưu mà AI gợi ý.',
    placement: 'bottom'
  },
  {
    target: '#tour-nav-history',
    route: '/history',
    title: 'Kho Lưu Trữ Lịch Sử ',
    content: 'Nơi lưu trữ tất cả các quyết định và các lộ trình kịch bản bạn từng giả lập để bạn dễ dàng quản lý hoặc so sánh.',
    placement: 'bottom'
  },
   {
    target: '#tour-nav-store',
    route: '/store',
    title: 'Siêu Thị Tri Thức ',
    content: 'Khám phá và mua sắm các báo cáo, công cụ phân tích và mô hình AI tiên tiến để nâng cao năng lực ra quyết định của bạn.',
    placement: 'bottom'
  },
  {
    target: '#tour-btn-simulate',
    route: '/dashboard',
    title: 'Khởi Tạo Mô Phỏng Đầu Tiên',
    content: 'Click vào thẻ lớn này để chuyển sang màn hình nhập liệu quyết định và chạy thử mô phỏng đầu tiên.',
    placement: 'top'
  },
  {
    target: '#tour-decision-textarea',
    route: '/simulate',
    title: 'Mô tả quyết định của bạn',
    content: 'Hãy viết chi tiết về dự định hoặc lựa chọn bạn đang băn khoăn (ví dụ: chuyển việc sang công ty nước ngoài hay tiếp tục làm công ty hiện tại). Càng chi tiết thì AI phân tích càng chính xác.',
    placement: 'top'
  },
  {
    target: '#tour-decision-hints',
    route: '/simulate',
    title: 'Các gợi ý mẫu quyết định',
    content: 'Nếu chưa biết cách viết, bạn có thể click vào các gợi ý có sẵn này để điền nhanh form và tham khảo cấu trúc viết quyết định.',
    placement: 'top'
  },
  {
    target: '#tour-decision-btn',
    route: '/simulate',
    title: 'Tiến hành thiết lập các chỉ số môi trường',
    content: 'Điều chỉnh các thanh kéo: Mức độ áp lực, Tình hình tài chính, Năng lực chuyên môn và Chỉ số rủi ro hiện tại để AI mô phỏng chính xác nhất.',
    placement: 'top'
  }
];

interface TourContextProps {
  isTourActive: boolean;
  currentStepIndex: number;
  startTour: () => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  activeStep: TourStep | null;
}

const TourContext = createContext<TourContextProps | undefined>(undefined);

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const activeStep = isTourActive ? TOUR_STEPS[currentStepIndex] : null;

  const startTour = () => {
    const matchIndex = TOUR_STEPS.findIndex(step => step.route === location.pathname);
    const startIndex = matchIndex !== -1 ? matchIndex : 0;
    setCurrentStepIndex(startIndex);
    setIsTourActive(true);
    if (location.pathname !== TOUR_STEPS[startIndex].route) {
      navigate(TOUR_STEPS[startIndex].route);
    }
  };

  const stopTour = () => {
    setIsTourActive(false);
    localStorage.setItem('ft_onboarding_completed', 'true');
  };

  const nextStep = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      const nextStepObj = TOUR_STEPS[nextIndex];
      setCurrentStepIndex(nextIndex);

      // Handle page transitions if next step is on a different page
      if (location.pathname !== nextStepObj.route) {
        navigate(nextStepObj.route);
      }
    } else {
      stopTour();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      const prevStepObj = TOUR_STEPS[prevIndex];
      setCurrentStepIndex(prevIndex);

      if (location.pathname !== prevStepObj.route) {
        navigate(prevStepObj.route);
      }
    }
  };

  // Auto-scroll the target element into view
  useEffect(() => {
    if (isTourActive && activeStep) {
      const timer = setTimeout(() => {
        const el = document.querySelector(activeStep.target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isTourActive, currentStepIndex]);

  return (
    <TourContext.Provider
      value={{
        isTourActive,
        currentStepIndex,
        startTour,
        stopTour,
        nextStep,
        prevStep,
        activeStep
      }}
    >
      {children}
      <GuideTourOverlay />
    </TourContext.Provider>
  );
};

const GuideTourOverlay: React.FC = () => {
  const { isTourActive, currentStepIndex, activeStep, stopTour, nextStep, prevStep } = useTour();
  const location = useLocation();
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isTourActive || !activeStep) return;

    const updatePosition = () => {
      const el = document.querySelector(activeStep.target);
      if (el) {
        setRect(el.getBoundingClientRect());
      } else {
        setRect(null);
      }
    };

    updatePosition();
    // Poll for DOM rendering
    const interval = setInterval(updatePosition, 300);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isTourActive, currentStepIndex, activeStep, location.pathname]);

  if (!isTourActive || !activeStep) return null;

  // Calculate tooltip style relative to target element
  const isCenter = !rect || activeStep.placement === 'center';
  const tooltipWidth = 420;
  const gap = 16;
  
  let tooltipStyle: React.CSSProperties = {};
  if (rect) {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const estimatedTooltipHeight = 220; // safe estimation

    if (activeStep.placement === 'bottom') {
      let topPos = rect.bottom + gap;
      // If it overflows the bottom of the viewport, flip to top if possible
      if (topPos + estimatedTooltipHeight > viewportHeight) {
        if (rect.top - estimatedTooltipHeight - gap > 0) {
          tooltipStyle = {
            position: 'fixed',
            bottom: viewportHeight - rect.top + gap,
            left: Math.max(16, Math.min(viewportWidth - tooltipWidth - 16, rect.left + rect.width / 2 - tooltipWidth / 2)),
          };
        } else {
          // Keep bottom but cap inside viewport with padding
          tooltipStyle = {
            position: 'fixed',
            bottom: 16,
            left: Math.max(16, Math.min(viewportWidth - tooltipWidth - 16, rect.left + rect.width / 2 - tooltipWidth / 2)),
          };
        }
      } else {
        tooltipStyle = {
          position: 'fixed',
          top: topPos,
          left: Math.max(16, Math.min(viewportWidth - tooltipWidth - 16, rect.left + rect.width / 2 - tooltipWidth / 2)),
        };
      }
    } else if (activeStep.placement === 'top') {
      let bottomPos = viewportHeight - rect.top + gap;
      // If it overflows the top of the viewport, flip to bottom if possible
      if (rect.top - estimatedTooltipHeight - gap < 0) {
        if (rect.bottom + estimatedTooltipHeight + gap < viewportHeight) {
          tooltipStyle = {
            position: 'fixed',
            top: rect.bottom + gap,
            left: Math.max(16, Math.min(viewportWidth - tooltipWidth - 16, rect.left + rect.width / 2 - tooltipWidth / 2)),
          };
        } else {
          // Keep top but cap inside viewport with padding
          tooltipStyle = {
            position: 'fixed',
            top: 16,
            left: Math.max(16, Math.min(viewportWidth - tooltipWidth - 16, rect.left + rect.width / 2 - tooltipWidth / 2)),
          };
        }
      } else {
        tooltipStyle = {
          position: 'fixed',
          bottom: bottomPos,
          left: Math.max(16, Math.min(viewportWidth - tooltipWidth - 16, rect.left + rect.width / 2 - tooltipWidth / 2)),
        };
      }
    } else if (activeStep.placement === 'left') {
      tooltipStyle = {
        position: 'fixed',
        top: Math.max(16, Math.min(viewportHeight - 220, rect.top + rect.height / 2 - 100)),
        left: Math.max(16, rect.left - tooltipWidth - gap),
      };
    } else if (activeStep.placement === 'right') {
      tooltipStyle = {
        position: 'fixed',
        top: Math.max(16, Math.min(viewportHeight - 220, rect.top + rect.height / 2 - 100)),
        left: Math.min(viewportWidth - tooltipWidth - 16, rect.right + gap),
      };
    }
  }

  return (
    <div className="fixed inset-0 z-[190] overflow-hidden font-sans">
      {/* SVG Overlay Backdrop Mask */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="tour-cutout-mask">
            {/* White covers the screen (blocks background) */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black cutout reveals the element underneath */}
            {rect && (
              <rect
                x={rect.x - 8}
                y={rect.y - 8}
                width={rect.width + 16}
                height={rect.height + 16}
                rx={12}
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Semi-transparent dark background applying the mask */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.75)"
          mask="url(#tour-cutout-mask)"
          className="pointer-events-auto"
        />
      </svg>

      {/* Floating Tooltip Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ scale: 0.9, opacity: 0, y: isCenter ? -40 : 0 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={isCenter ? undefined : tooltipStyle}
          className={`z-[200] ${
            isCenter
              ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
              : ''
          } w-[420px] max-w-[95vw] bg-slate-900 border border-slate-700/80 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6),0_0_40px_rgba(37,99,235,0.25)] flex flex-col gap-8`}
        >
          {/* Progress step dots */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
              Hướng dẫn • {currentStepIndex + 1} / {TOUR_STEPS.length}
            </span>
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStepIndex
                      ? 'bg-blue-500 w-3.5'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight font-display leading-snug">
              {activeStep.title}
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              {activeStep.content}
            </p>
          </div>

          <div className="flex items-center justify-between mt-4 pt-6 border-t border-slate-800/80">
            <button
              onClick={stopTour}
              className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors py-2"
            >
              Bỏ qua
            </button>
            <div className="flex gap-2.5">
              {currentStepIndex > 0 && (
                <button
                  onClick={prevStep}
                  className="px-5 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-black uppercase tracking-widest rounded-2xl transition-all"
                >
                  Trước
                </button>
              )}
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2"
              >
                {currentStepIndex === TOUR_STEPS.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}
                <IconMapper name="arrow_forward" className="text-sm" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
