
import React from 'react';
import SharedHeader from '../components/SharedHeader';
import SharedFooter from '../components/SharedFooter';
import { motion } from 'framer-motion';
import { MATRIX_DATA } from '../data/mockDatabase';

const ComparisonMatrixPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <SharedHeader />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-8 py-8 sm:py-16 mb-20">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-12 sm:mb-20">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-8 border border-blue-100">
            PHÂN TÍCH ĐA BIẾN: MATRIX VIEW v2.0
          </div>
          <h1 className="text-3xl sm:text-6xl font-black tracking-tight mb-6 font-display text-slate-900 leading-tight">So sánh Đa biến</h1>
          <p className="text-slate-500 text-sm sm:text-xl max-w-3xl leading-relaxed font-medium">
            Phân tích điểm tương đồng, khác biệt và hiệu quả tương đối giữa các nhánh thời gian dự kiến để tìm ra lộ trình tối ưu nhất.
          </p>
        </motion.div>

        <div className="overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="min-w-[900px] bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl shadow-slate-100">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="w-1/4 p-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">HỆ SỐ BIẾN THỂ</th>
                  {MATRIX_DATA.columns.map(col => (
                    <th key={col.id} className="p-8 text-left">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${col.color.replace('text-', 'bg-')} shadow-sm`}></div>
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{col.label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX_DATA.rows.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-all group">
                    <td className="p-8 border-r border-slate-50 bg-slate-50/10">
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 transition-colors text-2xl">{row.icon}</span>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-widest group-hover:translate-x-1 transition-transform">{row.label}</span>
                      </div>
                    </td>
                    {MATRIX_DATA.columns.map(col => {
                      const data = (row.values as any)[col.id];
                      return (
                        <td key={col.id} className="p-8">
                          {data.type === 'bar' && (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span>{data.label}</span>
                                <span className="text-slate-900">+{data.value}%</span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }} 
                                  animate={{ width: `${data.value}%` }} 
                                  className={`h-full ${data.barColor || 'bg-blue-600'}`} 
                                  transition={{ duration: 1.2, delay: i * 0.1 }}
                                />
                              </div>
                            </div>
                          )}
                          {data.type === 'badge' && (
                            <div className="space-y-2">
                              <span className={`px-5 py-2 text-[10px] font-black uppercase border rounded-2xl inline-block shadow-sm ${data.color}`}>
                                {data.value}
                              </span>
                              {data.sub && <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{data.sub}</p>}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="bg-slate-900 p-10 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <span className="material-symbols-outlined text-[100px] text-white">insights</span>
            </div>
            <h3 className="text-xs font-black mb-4 uppercase tracking-[0.3em] text-blue-400 font-display">Tối ưu hóa Lợi ích</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium relative z-10">
              Dựa trên phân tích ma trận, quỹ đạo "Kỹ sư Cao cấp" duy trì chỉ số hạnh phúc trung bình cao hơn 25% so với các phương án mạo hiểm.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white border border-slate-100 p-10 rounded-3xl shadow-sm hover:shadow-2xl hover:border-blue-600/10 transition-all">
            <h3 className="text-xs font-black mb-4 uppercase tracking-[0.3em] text-rose-600 font-display">Cảnh báo tới hạn</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Mô hình kinh doanh tự do đòi hỏi quỹ dự phòng tài chính gấp 1.5 lần so với các kịch bản còn lại để tránh điểm sụt giảm thanh khoản.
            </p>
          </motion.div>
        </div>
      </main>

      <SharedFooter />
    </div>
  );
};

export default ComparisonMatrixPage;
