import React, { ReactNode } from "react";

interface AnimatedBackgroundProps {
  children: ReactNode;
  className?: string;
}

export const AnimatedBackground = ({ children, className = "" }: AnimatedBackgroundProps) => {
  return (
    <div className={`relative w-full min-h-screen overflow-hidden`}>
      
      {/* 1. Hiệu ứng tỏa sáng trung tâm (White Spotlight on Soft Blue Background) */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(120% 100% at 50% 0%, #ffffff 0%, #eff6ff 50%, #dbeafe 100%)'
        }}
      ></div>

      {/* 2. Lưới hạt chấm bi (Dot Grid) mờ nhạt - Chuẩn Vercel/Linear
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 z-0"
        style={{ 
          backgroundImage: "radial-gradient(#64748b 1px, transparent 1px)", 
          backgroundSize: "24px 24px" 
        }}
      ></div>
      */}

      {/* 3. Hiệu ứng hạt cát li ti (Static Noise/Grain) */}
      <div 
        className="absolute w-full h-full pointer-events-none opacity-[0.04] mix-blend-multiply z-10"
        style={{ 
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" 
        }}
      ></div>

      {/* 4. Lớp phủ mờ dần (Fade) ở mép dưới để tạo chiều sâu */}
      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none z-10 bg-gradient-to-t from-slate-50 to-transparent"></div>

      <div className={`relative z-20 w-full min-h-screen flex flex-col ${className}`}>
        {children}
      </div>
    </div>
  );
};
