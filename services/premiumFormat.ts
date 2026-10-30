/**
 * Hiển thị lộ trình premium: gọn nhãn tháng, dịch nhãn tiếng Anh, chia tường thuật theo giai đoạn.
 * Áp cho cả báo cáo cũ đã lưu (trước khi server chia khung thời gian chuẩn).
 */

/** "Tháng 1-1" -> "Tháng 1"; "Tháng 5-3" -> "Tháng 3-5"; giữ "(tuần 1-2)"; nhãn khác giữ nguyên */
export const tidyMonth = (label?: string): string => {
  const raw = String(label || "").trim();
  const weeks = raw.match(/\((tuần[^)]*)\)/i)?.[1];
  const m = raw.replace(/\([^)]*\)/g, " ").match(/tháng\s*(\d+)(?:\s*(?:[-–]|đến)\s*(?:tháng\s*)?(\d+))?/i);
  if (!m) return raw;
  const a = parseInt(m[1], 10);
  const b = m[2] ? parseInt(m[2], 10) : a;
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  if (weeks) return `Tháng ${lo} (${weeks})`;
  return lo === hi ? `Tháng ${lo}` : `Tháng ${lo}-${hi}`;
};

const LEVEL_VI: Record<string, string> = { High: "Cao", Medium: "Trung bình", Low: "Thấp" };
export const levelVi = (v?: string): string => LEVEL_VI[String(v || "")] || String(v || "");

const CATEGORY_VI: Record<string, string> = {
  Economic: "Kinh tế",
  Personal: "Cá nhân",
  Social: "Xã hội",
  Technical: "Kỹ thuật",
};
export const categoryVi = (v?: string): string => CATEGORY_VI[String(v || "")] || String(v || "");

/** Xác suất 0-100 (số nguyên) hoặc 0-1 (tỷ lệ) -> phần trăm */
export const percent = (p?: number | string): number => {
  const n = Number(p);
  if (!Number.isFinite(n)) return 0;
  const v = n > 0 && n < 1 ? n * 100 : n;
  return Math.max(0, Math.min(100, Math.round(v)));
};

export type NarrativeSection = {
  time?: string;
  content: string;
  type: "intro" | "outro" | "step" | "general";
};

/**
 * Tường thuật mới: mỗi giai đoạn là một đoạn "Tháng X-Y: ...". Trả về null nếu không theo dạng này
 * (khi đó trang dùng cách tách câu cũ cho dữ liệu cũ).
 */
export const parsePhaseParagraphs = (text: string): NarrativeSection[] | null => {
  const paras = String(text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const LABEL = /^(Tháng\s*\d+(?:\s*[-–]\s*\d+)?(?:\s*\([^)]*\))?)\s*:\s*([\s\S]+)$/i;
  const phases = paras.filter((p) => LABEL.test(p));
  if (phases.length < 2) return null;
  return paras.map((p) => {
    const m = p.match(LABEL);
    return m
      ? { time: tidyMonth(m[1]), content: m[2].trim(), type: "step" as const }
      : { content: p, type: "intro" as const };
  });
};
