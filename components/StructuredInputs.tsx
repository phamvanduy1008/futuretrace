import React, { useEffect, useRef, useState } from "react";
import { SimulationData } from "../types";
import { ProgramOption, searchPrograms } from "../services/knowledgeApi";

interface Props {
  data: SimulationData;
  onChange: (patch: Partial<SimulationData>) => void;
}

const LOCATIONS = ["Hà Nội", "TP.HCM", "Đà Nẵng", "Tỉnh/thành khác"];

/**
 * Thông tin có cấu trúc (không bắt buộc): chọn đúng trường + ngành từ dữ liệu điểm chuẩn,
 * điểm dự kiến, khu vực, ngân sách. Giúp số liệu (điểm chuẩn, học phí, lương, ROI) chính xác hơn
 * so với việc hệ thống phải đoán từ câu mô tả tự do.
 */
export const StructuredInputs: React.FC<Props> = ({ data, onChange }) => {
  const [query, setQuery] = useState(data.programLabel || "");
  const [options, setOptions] = useState<ProgramOption[]>([]);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (data.programId || query.trim().length < 2) {
      setOptions([]);
      return;
    }
    const t = setTimeout(() => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      searchPrograms(query, abortRef.current.signal)
        .then((r) => {
          setOptions(r);
          setOpen(true);
        })
        .catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [query, data.programId]);

  const choose = (p: ProgramOption) => {
    const label = `${p.majorName} - ${p.schoolName}`;
    setQuery(label);
    setOpen(false);
    onChange({ programId: p.id, programLabel: label });
  };

  const clearProgram = () => {
    setQuery("");
    onChange({ programId: undefined, programLabel: undefined });
  };

  const inputCls =
    "w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition";

  return (
    <div className="bg-white/70 border border-slate-200/60 rounded-3xl p-5 sm:p-6 space-y-4">
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Thông tin cụ thể (không bắt buộc)</p>
        <p className="text-xs text-slate-500 mt-1">Chọn đúng trường và ngành giúp điểm chuẩn, học phí, lương và ROI chính xác hơn.</p>
      </div>

      <div className="relative">
        <label className="text-[11px] font-bold text-slate-600 mb-1 block">Ngành - trường mục tiêu</label>
        <div className="flex gap-2">
          <input
            className={inputCls}
            placeholder="Gõ tên ngành hoặc trường, ví dụ: kế toán kinh tế đà nẵng"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (data.programId) onChange({ programId: undefined, programLabel: undefined });
            }}
            onFocus={() => options.length && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
          />
          {data.programId && (
            <button onClick={clearProgram} className="px-3 text-xs font-bold text-slate-500 hover:text-rose-600" aria-label="Bỏ chọn">
              Bỏ chọn
            </button>
          )}
        </div>
        {open && options.length > 0 && (
          <ul className="absolute z-30 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl max-h-72 overflow-auto">
            {options.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onMouseDown={() => choose(p)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-50 last:border-0"
                >
                  <span className="block text-sm font-bold text-slate-800">{p.majorName}</span>
                  <span className="block text-xs text-slate-500">
                    {p.schoolName} · {p.province} · điểm chuẩn {p.year}: {p.cutoff} ({p.subjectGroups.slice(0, 3).join(", ")})
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-bold text-slate-600 mb-1 block">Khu vực học / sống</label>
          <select
            className={inputCls}
            value={data.location || ""}
            onChange={(e) => onChange({ location: e.target.value || undefined })}
          >
            <option value="">Chưa chọn</option>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-600 mb-1 block">Điểm thi dự kiến (/30)</label>
          <input
            type="number" min={0} max={30} step={0.25} inputMode="decimal"
            className={inputCls}
            placeholder="vd 22.5"
            value={data.expectedScore ?? ""}
            onChange={(e) => onChange({ expectedScore: e.target.value === "" ? undefined : Math.min(30, Math.max(0, Number(e.target.value))) })}
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-slate-600 mb-1 block">Ngân sách gia đình (triệu/năm)</label>
          <input
            type="number" min={0} max={2000} step={5} inputMode="numeric"
            className={inputCls}
            placeholder="vd 60"
            value={data.budgetPerYearMillion ?? ""}
            onChange={(e) => onChange({ budgetPerYearMillion: e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)) })}
          />
        </div>
      </div>
    </div>
  );
};

export default StructuredInputs;
