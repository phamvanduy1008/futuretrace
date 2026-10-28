import React, { useEffect, useState } from "react";
import SharedHeader from "../components/SharedHeader";
import SharedFooter from "../components/SharedFooter";
import { getMethodology } from "../services/knowledgeApi";

const Stat: React.FC<{ label: string; value: React.ReactNode; hint?: string }> = ({ label, value, hint }) => (
  <div className="bg-slate-50 rounded-2xl p-4">
    <div className="text-xl font-black text-slate-900">{value}</div>
    <div className="text-[11px] font-bold text-slate-500 mt-1">{label}</div>
    {hint && <div className="text-[11px] text-slate-400 mt-1">{hint}</div>}
  </div>
);

/** Trang công khai: model card + nguồn dữ liệu + hạn chế (minh bạch cho người dùng, hội đồng, nhà đầu tư) */
const MethodologyPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMethodology().then(setData).catch((e) => setError(e.message));
  }, []);

  const s = data?.salaryModel;
  const ft = s?.testAll?.ft_salary_p50;
  const base = s?.testAll?.baseline_current_system_industry_median;
  const admit = data?.admitModel;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SharedHeader />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 space-y-12">
        <header>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">Phương pháp luận</h1>
          <p className="text-slate-600 leading-relaxed">
            Số liệu trong FutureTrace (lương, ROI, điểm chuẩn, xác suất trúng tuyển) đến từ dữ liệu có nguồn và các mô hình
            thống kê được kiểm tra trên dữ liệu chưa từng thấy. AI chỉ viết phần diễn giải; mọi con số AI dùng được đối chiếu
            tự động với nguồn trước khi hiển thị.
          </p>
        </header>

        {error && <p className="text-rose-600">{error}</p>}
        {!data && !error && <p className="text-slate-500">Đang tải...</p>}

        {s && (
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">FT-Salary: dự báo phân phối lương</h2>
            <p className="text-sm text-slate-600 mb-4">
              XGBoost hồi quy phân vị (P25/P50/P75) trên {s.data?.deduplicated?.toLocaleString("vi-VN")} tin tuyển dụng đã khử trùng.
              Huấn luyện {s.split?.train_years}, kiểm tra trên {s.split?.test_rows?.toLocaleString("vi-VN")} tin năm {s.split?.test_year} mà mô hình chưa từng thấy.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Sai số trung bình (MAE)" value={`${ft?.mae_million} tr`} hint={`cách cũ: ${base?.mae_million} tr`} />
              <Stat label="Giảm sai số so với cách cũ" value={`${s.maeReductionVsCurrentPercent}%`} />
              <Stat label="Dự báo trong ±20%" value={`${ft?.within_20pct_percent}%`} />
              <Stat label="Khoảng P25–P75 phủ lương thật" value={`${s.calibration?.test_coverage_after_percent ?? ft?.p25_p75_coverage_percent}%`} hint="mục tiêu 50%" />
            </div>
          </section>
        )}

        {admit && (
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">FT-Admit: xác suất trúng tuyển</h2>
            <p className="text-sm text-slate-600 mb-3">
              Điểm chuẩn năm tới được mô hình như phân phối chuẩn quanh điểm các năm gần nhất; độ bất định học từ biến động
              năm-qua-năm của từng nhóm ngành và tăng thêm khi dữ liệu cũ hơn một năm hoặc vắt qua mốc đổi chương trình 2025.
            </p>
            {admit.calibrated && admit.backtests?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {admit.backtests.map((b: any) => (
                  <Stat key={b.targetYear} label={`Backtest ${b.targetYear}: Brier`} value={b.brierModel} hint={`baseline ${b.brierNaiveStep} · ${b.programs} chương trình`} />
                ))}
              </div>
            ) : (
              <p className="text-sm bg-amber-50 border border-amber-100 rounded-2xl p-4 text-amber-800">
                Đang dùng tham số mặc định (độ lệch chuẩn {admit.sigmaGlobal} điểm), chưa hiệu chỉnh vì chưa đủ dữ liệu điểm chuẩn nhiều năm.
                Xác suất hiển thị là ước lượng sơ bộ.
              </p>
            )}
          </section>
        )}

        {data?.data && (
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">Dữ liệu</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <Stat label="Trường" value={data.data.schools} />
              <Stat label="Chương trình đào tạo" value={data.data.programs?.toLocaleString("vi-VN")} />
              <Stat label="Có học phí" value={data.data.programs_with_tuition} />
              <Stat label="Năm điểm chuẩn" value={(data.data.years_covered || []).join(", ")} />
            </div>
            <h3 className="font-black text-slate-900 mb-2">Nguồn</h3>
            <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5 mb-4">
              {Object.values(data.sources || {}).map((src: any) => (
                <li key={src.title}>
                  {src.title} — {src.publisher} (cấp độ {src.tier}{src.verified ? ", đã đối chiếu" : ", chưa đối chiếu nguồn chính thức"})
                </li>
              ))}
              {data.marketSource && <li>{data.marketSource.title} ({data.marketSource.years?.join("–")}) — {data.marketSource.caveat}</li>}
            </ul>
            <h3 className="font-black text-slate-900 mb-2">Hạn chế đã biết</h3>
            <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
              {(data.data.known_gaps || []).map((g: string) => <li key={g}>{g}</li>)}
              <li>Lương trong tin tuyển dụng là lương rao, không phải lương thực nhận.</li>
            </ul>
          </section>
        )}
      </main>
      <SharedFooter />
    </div>
  );
};

export default MethodologyPage;
