
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconMapper } from './IconMapper';

const SharedFooter: React.FC = () => {
  const navigate = useNavigate();

  const footerSections = [
    {
      title: "Nền tảng",
      links: [
        { label: "Mô phỏng AI", path: "/simulate" },
        { label: "Phân tích ma trận", path: "/matrix" },
        { label: "Giám sát rủi ro", path: "/risks" },
        { label: "Lịch sử dữ liệu", path: "/history" }
      ]
    },
    {
      title: "Tài nguyên",
      links: [
        { label: "Phương pháp luận", path: "#" },
        { label: "Tài liệu kỹ thuật", path: "#" },
        { label: "Báo cáo mẫu", path: "#" },
        { label: "API Reference", path: "#" }
      ]
    },
    {
      title: "Công ty",
      links: [
        { label: "Về chúng tôi", path: "#" },
        { label: "Sự nghiệp", path: "#" },
        { label: "Liên hệ", path: "#" },
        { label: "Blog", path: "#" }
      ]
    }
  ];

  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8 px-6 sm:px-10">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <IconMapper name="insights" className=" text-slate-950 text-2xl font-bold" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white font-display">FutureTrace</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
              Hệ thống nghiên cứu quyết định dựa trên trí tuệ nhân tạo, giúp bạn định lượng tương lai và tối ưu hóa các quỹ đạo sự nghiệp quan trọng.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title} className="space-y-6">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button 
                      onClick={() => link.path.startsWith('/') ? navigate(link.path) : null}
                      className="text-sm text-slate-600 hover:text-white font-medium transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
            © 2024 FutureTrace AI System. Thiết kế cho sự tiến liệu.
          </p>
          <div className="flex gap-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Quyền riêng tư</a>
            <a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SharedFooter;
