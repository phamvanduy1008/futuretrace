import React from "react";
import { Fact } from "../types";

const TIER_LABEL: Record<string, string> = {
  A: "Nguồn chính thức",
  B: "Nguồn tổng hợp",
  C: "Dữ liệu tuyển dụng",
  curated: "FutureTrace biên soạn",
  model: "Mô hình FutureTrace",
};

const fmt = (f: Fact) => {
  if (f.value === null || f.value === undefined) return "";
  const v = typeof f.value === "number" ? f.value.toLocaleString("vi-VN") : f.value;
  return `${v}${f.unit ? ` ${f.unit}` : ""}`;
};

/** Danh sách số liệu có nguồn đã dùng cho lượt mô phỏng (mã [F#] khớp trích dẫn trong văn bản AI) */
export const FactsPanel: React.FC<{ facts?: Fact[]; dark?: boolean; compact?: boolean }> = ({ facts, dark, compact }) => {
  if (!facts?.length) return null;
  const shown = compact ? facts.filter((f) => f.value !== null).slice(0, 4) : facts;
  return (
    <div className={`rounded-3xl border p-5 sm:p-6 ${dark ? "bg-white/5 border-white/10" : "bg-white border-slate-100 shadow-sm"}`}>
      <p className={`text-[11px] font-black uppercase tracking-widest mb-4 ${dark ? "text-blue-300" : "text-slate-500"}`}>
        Số liệu & nguồn
      </p>
      <ul className="space-y-3">
        {shown.map((f) => (
          <li key={f.id} className="flex gap-3">
            <span className={`shrink-0 text-[10px] font-black px-2 py-0.5 rounded-md h-fit ${dark ? "bg-blue-500/20 text-blue-200" : "bg-blue-50 text-blue-700"}`}>
              {f.id}
            </span>
            <div className="min-w-0">
              <p className={`text-sm leading-snug ${dark ? "text-slate-200" : "text-slate-700"}`}>
                {f.label}
                {fmt(f) && <strong className={dark ? "text-white" : "text-slate-900"}>: {fmt(f)}</strong>}
                {f.range && <span className={dark ? "text-slate-400" : "text-slate-500"}> (khoảng {f.range[0]}–{f.range[1]})</span>}
              </p>
              {!compact && f.source && (
                <p className={`text-[11px] mt-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  {TIER_LABEL[f.source.tier || ""] || "Nguồn"}: {f.source.publisher}
                  {f.source.years ? ` (${f.source.years.join("–")})` : ""}
                  {f.source.verified === false ? " · chưa đối chiếu nguồn chính thức" : ""}
                  {f.source.url && (
                    <>
                      {" · "}
                      <a href={f.source.url} target="_blank" rel="noreferrer" className="underline hover:text-blue-600">xem nguồn</a>
                    </>
                  )}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FactsPanel;
