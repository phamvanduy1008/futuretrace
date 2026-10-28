import React, { useState } from "react";
import { sendScenarioFeedback } from "../services/knowledgeApi";

const NEGATIVE_REASONS = [
  { id: "generic", label: "Chung chung" },
  { id: "wrong_numbers", label: "Số liệu không hợp lý" },
  { id: "not_my_situation", label: "Không đúng hoàn cảnh của em" },
  { id: "too_long", label: "Quá dài" },
];

/** 👍/👎 cho một kịch bản: dữ liệu cho vòng cải thiện model tiếp theo và chỉ số chất lượng */
export const ScenarioFeedback: React.FC<{ simulationId?: string; scenarioId?: string }> = ({ simulationId, scenarioId }) => {
  const [rating, setRating] = useState<1 | -1 | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  if (!simulationId || !scenarioId) return null;

  const submit = async (r: 1 | -1, rs: string[] = reasons) => {
    setRating(r);
    try {
      await sendScenarioFeedback(simulationId, {
        scenarioId,
        rating: r,
        reasons: rs,
        numbersPlausible: rs.includes("wrong_numbers") ? false : r === 1 ? true : undefined,
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const toggleReason = (id: string) => {
    const next = reasons.includes(id) ? reasons.filter((x) => x !== id) : [...reasons, id];
    setReasons(next);
    submit(-1, next);
  };

  return (
    <div className="no-print mt-4 pt-4 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-bold text-slate-500 mr-1">Kịch bản này có hữu ích?</span>
        <button
          onClick={() => submit(1, [])}
          aria-pressed={rating === 1}
          className={`px-3 py-1.5 rounded-xl text-sm border transition ${rating === 1 ? "bg-emerald-50 border-emerald-300" : "border-slate-200 hover:border-emerald-300"}`}
        >
          👍
        </button>
        <button
          onClick={() => submit(-1)}
          aria-pressed={rating === -1}
          className={`px-3 py-1.5 rounded-xl text-sm border transition ${rating === -1 ? "bg-rose-50 border-rose-300" : "border-slate-200 hover:border-rose-300"}`}
        >
          👎
        </button>
        {status === "sent" && <span className="text-[11px] text-emerald-600 font-bold">Cảm ơn bạn!</span>}
        {status === "error" && <span className="text-[11px] text-rose-600 font-bold">Chưa gửi được, thử lại sau.</span>}
      </div>
      {rating === -1 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {NEGATIVE_REASONS.map((r) => (
            <button
              key={r.id}
              onClick={() => toggleReason(r.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold border ${reasons.includes(r.id) ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScenarioFeedback;
