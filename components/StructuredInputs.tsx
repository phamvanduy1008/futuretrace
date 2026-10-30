import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SimulationData } from "../types";
import { ProgramOption, searchPrograms } from "../services/knowledgeApi";
import {
  VIETNAM_PROVINCES_34,
  PROVINCE_REGIONS,
  VietnamProvince34,
} from "../data/vietnamProvinces34";
import { IconMapper } from "./IconMapper";

interface Props {
  data: SimulationData;
  onChange: (patch: Partial<SimulationData>) => void;
}

const REGION_SHORT_LABELS: Record<string, string> = {
  ALL: "Tất cả (34)",
  "Thành phố trực thuộc TW": "TP TW (6)",
  "Miền Bắc": "Bắc (13)",
  "Miền Trung & Tây Nguyên": "Trung - TN (9)",
  "Miền Nam": "Nam (6)",
};

const FRAME_MARGIN = 24; // Khoảng cách an toàn tối thiểu (px) với mép khung trình duyệt
const IDEAL_PANEL_HEIGHT = 330;

function normalizeVi(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

interface DropdownPosition {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
  dropUp: boolean;
}

/**
 * Thông tin có cấu trúc (không bắt buộc): chọn đúng trường + ngành từ dữ liệu điểm chuẩn,
 * điểm dự kiến, khu vực (34 tỉnh/thành mới), ngân sách. Giúp số liệu (điểm chuẩn, học phí, lương, ROI)
 * chính xác hơn so với việc hệ thống phải đoán từ câu mô tả tự do.
 */
export const StructuredInputs: React.FC<Props> = ({ data, onChange }) => {
  const [query, setQuery] = useState(data.programLabel || "");
  const [options, setOptions] = useState<ProgramOption[]>([]);
  const [openProgram, setOpenProgram] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Custom Province/City Dropdown state
  const [openLocation, setOpenLocation] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<DropdownPosition | null>(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [activeRegion, setActiveRegion] = useState<string>("ALL");
  const locationTriggerRef = useRef<HTMLButtonElement | null>(null);
  const locationPanelRef = useRef<HTMLDivElement | null>(null);
  const locationSearchInputRef = useRef<HTMLInputElement | null>(null);

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
          setOpenProgram(true);
        })
        .catch(() => { });
    }, 250);
    return () => clearTimeout(t);
  }, [query, data.programId]);

  const updateDropdownPosition = useCallback(() => {
    const trigger = locationTriggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 8;

    const availableBelow = vh - rect.bottom - gap - FRAME_MARGIN;
    const availableAbove = rect.top - gap - FRAME_MARGIN;

    // Ưu tiên mở xuống nếu đủ chỗ (>= 260px), nếu bên dưới hẹp và bên trên rộng hơn thì mở lên trên
    const shouldDropUp =
      availableBelow < 260 && availableAbove > availableBelow;

    const desiredWidth = Math.min(
      Math.max(rect.width, vw < 640 ? rect.width : 400),
      vw - FRAME_MARGIN * 2
    );
    const left = Math.min(
      Math.max(FRAME_MARGIN, rect.left),
      vw - desiredWidth - FRAME_MARGIN
    );

    if (shouldDropUp) {
      const maxHeight = Math.min(
        IDEAL_PANEL_HEIGHT,
        Math.max(210, availableAbove)
      );
      setDropdownPos({
        bottom: vh - rect.top + gap,
        left,
        width: desiredWidth,
        maxHeight,
        dropUp: true,
      });
    } else {
      const maxHeight = Math.min(
        IDEAL_PANEL_HEIGHT,
        Math.max(210, availableBelow)
      );
      setDropdownPos({
        top: rect.bottom + gap,
        left,
        width: desiredWidth,
        maxHeight,
        dropUp: false,
      });
    }
  }, []);

  // Close location dropdown on outside click, Escape, and reposition on scroll/resize
  useEffect(() => {
    if (!openLocation) return;
    updateDropdownPosition();

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        locationTriggerRef.current?.contains(target) ||
        locationPanelRef.current?.contains(target)
      ) {
        return;
      }
      setOpenLocation(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenLocation(false);
      }
    };

    const handleScrollOrResize = (e: Event) => {
      // Không tính lại nếu đang cuộn bên trong chính danh sách tỉnh/thành
      if (
        locationPanelRef.current &&
        e.target instanceof Node &&
        locationPanelRef.current.contains(e.target)
      ) {
        return;
      }
      updateDropdownPosition();
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [openLocation, updateDropdownPosition]);

  useEffect(() => {
    if (openLocation) {
      const timer = setTimeout(() => {
        locationSearchInputRef.current?.focus({ preventScroll: true });
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setLocationSearch("");
    }
  }, [openLocation]);

  const chooseProgram = (p: ProgramOption) => {
    const label = `${p.majorName} - ${p.schoolName}`;
    setQuery(label);
    setOpenProgram(false);
    onChange({ programId: p.id, programLabel: label });
  };

  const clearProgram = () => {
    setQuery("");
    onChange({ programId: undefined, programLabel: undefined });
  };

  const selectedProvince = useMemo<VietnamProvince34 | undefined>(() => {
    if (!data.location) return undefined;
    return VIETNAM_PROVINCES_34.find(
      (p) => p.name === data.location || p.fullName === data.location
    );
  }, [data.location]);

  const filteredProvinces = useMemo(() => {
    const normSearch = normalizeVi(locationSearch);
    return VIETNAM_PROVINCES_34.filter((item) => {
      if (activeRegion !== "ALL" && item.region !== activeRegion) {
        return false;
      }
      if (!normSearch) return true;
      const haystack = [
        item.name,
        item.fullName,
        item.mergedNote,
        ...item.keywords,
      ]
        .map(normalizeVi)
        .join(" ");
      return haystack.includes(normSearch);
    });
  }, [locationSearch, activeRegion]);

  const groupedProvinces = useMemo(() => {
    const groups: { region: string; items: VietnamProvince34[] }[] = [];
    for (const region of PROVINCE_REGIONS) {
      const items = filteredProvinces.filter((p) => p.region === region);
      if (items.length > 0) {
        groups.push({ region, items });
      }
    }
    return groups;
  }, [filteredProvinces]);

  const selectLocation = (locName?: string) => {
    onChange({ location: locName || undefined });
    setOpenLocation(false);
  };

  const inputBaseCls =
    "w-full bg-white border border-slate-200/90 hover:border-blue-300 rounded-2xl text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-slate-400 placeholder:font-medium";

  return (
    <div className="relative z-30 bg-white/90 border border-slate-200/70 rounded-3xl p-5 sm:p-7 space-y-5 shadow-[0_15px_40px_rgba(15,23,42,0.03)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
            <IconMapper name="equalizer" className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-700">
              Thông tin cụ thể{" "}
              <span className="text-slate-400 font-bold normal-case tracking-normal">
                (không bắt buộc)
              </span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn đúng trường, ngành và tỉnh/thành giúp điểm chuẩn, học phí, lương và ROI chính xác hơn.
            </p>
          </div>
        </div>
        <span className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-100 text-[10px] font-black uppercase tracking-wider text-blue-600 shrink-0">
          <IconMapper name="location_on" className="w-3.5 h-3.5" />
          34 Tỉnh / Thành mới
        </span>
      </div>

      {/* Ngành - trường mục tiêu */}
      <div className="relative z-20">
        <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
          <IconMapper name="school" className="w-3.5 h-3.5 text-blue-600" />
          Ngành - trường mục tiêu
        </label>
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-4 text-slate-400 flex items-center">
            <IconMapper name="search" className="w-4 h-4" />
          </div>
          <input
            className={`${inputBaseCls} pl-11 pr-24 py-3.5`}
            placeholder="Gõ tên ngành hoặc trường, ví dụ: kế toán kinh tế đà nẵng"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (data.programId)
                onChange({ programId: undefined, programLabel: undefined });
            }}
            onFocus={() => options.length > 0 && setOpenProgram(true)}
            onBlur={() => setTimeout(() => setOpenProgram(false), 180)}
          />
          {(data.programId || query) && (
            <button
              type="button"
              onClick={clearProgram}
              className="absolute right-3 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1"
              aria-label="Bỏ chọn"
            >
              <IconMapper name="close" className="w-3 h-3" />
              Xóa
            </button>
          )}
        </div>

        <AnimatePresence>
          {openProgram && options.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: 6, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.99 }}
              transition={{ duration: 0.16 }}
              className="absolute z-50 mt-2 w-full bg-white border border-slate-200/90 rounded-2xl shadow-[0_24px_60px_rgba(15,23,42,0.18)] max-h-64 overflow-auto p-1.5"
            >
              {options.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onMouseDown={() => chooseProgram(p)}
                    className="w-full text-left px-3.5 py-3 rounded-xl hover:bg-blue-50/80 transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <span className="block text-sm font-bold text-slate-800 group-hover:text-blue-700 truncate">
                        {p.majorName}
                      </span>
                      <span className="block text-xs text-slate-500 truncate mt-0.5">
                        {p.schoolName} · {p.province}
                      </span>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-black">
                        {p.cutoff} điểm ({p.year})
                      </span>
                      {p.subjectGroups?.length > 0 && (
                        <span className="block text-[10px] font-bold text-slate-400 mt-0.5">
                          {p.subjectGroups.slice(0, 3).join(", ")}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* 3 cột: Khu vực học/sống + Điểm thi dự kiến + Ngân sách */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Custom Options Dropdown: Khu vực học / sống (34 tỉnh thành) */}
        <div className="relative">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
            <IconMapper name="location_on" className="w-3.5 h-3.5 text-blue-600" />
            Khu vực học / sống
          </label>

          <button
            ref={locationTriggerRef}
            type="button"
            onClick={() => setOpenLocation((prev) => !prev)}
            aria-expanded={openLocation}
            aria-haspopup="listbox"
            className={`w-full bg-white border rounded-2xl px-3.5 py-3 text-left flex items-center justify-between gap-2 transition-all duration-200 ${openLocation
                ? "border-blue-500 ring-4 ring-blue-500/10 shadow-sm"
                : data.location
                  ? "border-blue-200 bg-blue-50/20 hover:border-blue-400"
                  : "border-slate-200/90 hover:border-blue-300"
              }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${data.location
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "bg-slate-100 text-slate-400"
                  }`}
              >
                <IconMapper name="location_on" className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                {selectedProvince ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {selectedProvince.name}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md shrink-0">
                      {selectedProvince.type === "Thành phố Trung ương"
                        ? "TP TW"
                        : "Tỉnh"}
                    </span>
                  </div>
                ) : data.location ? (
                  <span className="text-sm font-bold text-slate-900 truncate block">
                    {data.location}
                  </span>
                ) : (
                  <span className="text-sm font-medium text-slate-400 truncate block">
                    Chưa chọn tỉnh/thành
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {data.location && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectLocation(undefined);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      selectLocation(undefined);
                    }
                  }}
                  className="w-6 h-6 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors"
                  title="Bỏ chọn khu vực"
                >
                  <IconMapper name="close" className="w-3.5 h-3.5" />
                </span>
              )}
              <IconMapper
                name="expand_more"
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openLocation ? "rotate-180 text-blue-600" : ""
                  }`}
              />
            </div>
          </button>

          {/* Portal Dropdown Panel: thoát hoàn toàn khỏi overflow-hidden của trang và cách mép frame web tối thiểu 24px */}
          {typeof document !== "undefined" &&
            createPortal(
              <AnimatePresence>
                {openLocation && dropdownPos && (
                  <motion.div
                    ref={locationPanelRef}
                    initial={{
                      opacity: 0,
                      y: dropdownPos.dropUp ? 6 : -6,
                      scale: 0.98,
                    }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      y: dropdownPos.dropUp ? 6 : -6,
                      scale: 0.98,
                    }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    style={{
                      position: "fixed",
                      top: dropdownPos.top,
                      bottom: dropdownPos.bottom,
                      left: dropdownPos.left,
                      width: dropdownPos.width,
                      maxHeight: dropdownPos.maxHeight,
                    }}
                    className="z-[900] flex flex-col bg-white border border-slate-200/95 rounded-3xl shadow-[0_24px_70px_-10px_rgba(15,23,42,0.28)] ring-1 ring-slate-900/5 overflow-hidden font-sans"
                    role="listbox"
                  >
                    {/* Top Search Bar + Single-Row Region Filter */}
                    <div className="shrink-0 p-3 bg-slate-50/90 border-b border-slate-100 space-y-2">
                      <div className="relative flex items-center">
                        <IconMapper
                          name="search"
                          className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none"
                        />
                        <input
                          ref={locationSearchInputRef}
                          type="text"
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          placeholder="Tìm trong 34 tỉnh/thành (hoặc tên tỉnh cũ)..."
                          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        />
                        {locationSearch && (
                          <button
                            type="button"
                            onClick={() => setLocationSearch("")}
                            className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                          >
                            <IconMapper name="close" className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Region Filter Pills on 1 clean line */}
                      <div className="grid grid-cols-5 gap-1">
                        {["ALL", ...PROVINCE_REGIONS].map((reg) => {
                          const active = activeRegion === reg;
                          return (
                            <button
                              key={reg}
                              type="button"
                              onClick={() => setActiveRegion(reg)}
                              className={`py-1 px-1 rounded-lg text-[9.5px] font-black uppercase tracking-tight text-center truncate transition-all ${active
                                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                                  : "bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-200/80"
                                }`}
                            >
                              {REGION_SHORT_LABELS[reg] || reg}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Scrollable Options List */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5 bg-white">
                      {/* Default "Unselected" Option */}
                      {!locationSearch && activeRegion === "ALL" && (
                        <button
                          type="button"
                          onClick={() => selectLocation(undefined)}
                          className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between text-xs font-bold transition-colors ${!data.location
                              ? "bg-slate-100 text-slate-900"
                              : "text-slate-500 hover:bg-slate-50"
                            }`}
                        >
                          <span>Chưa chọn khu vực cụ thể</span>
                          {!data.location && (
                            <IconMapper
                              name="check_circle"
                              className="w-4 h-4 text-slate-600"
                            />
                          )}
                        </button>
                      )}

                      {groupedProvinces.length === 0 ? (
                        <div className="py-6 px-4 text-center">
                          <p className="text-xs font-bold text-slate-500">
                            Không tìm thấy tỉnh/thành phù hợp với "{locationSearch}"
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Thử gõ tên tỉnh mới hoặc tên tỉnh trước sáp nhập.
                          </p>
                        </div>
                      ) : (
                        groupedProvinces.map((group) => (
                          <div key={group.region} className="space-y-0.5">
                            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-2.5 py-1 flex items-center justify-between border-b border-slate-50">
                              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                                {group.region}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                {group.items.length} đơn vị
                              </span>
                            </div>
                            {group.items.map((prov) => {
                              const isSelected =
                                data.location === prov.name ||
                                data.location === prov.fullName;
                              return (
                                <button
                                  key={prov.code}
                                  type="button"
                                  onClick={() => selectLocation(prov.name)}
                                  className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between gap-3 transition-all group ${isSelected
                                      ? "bg-blue-50 border border-blue-200 text-blue-700 shadow-sm"
                                      : "hover:bg-slate-50 border border-transparent text-slate-800"
                                    }`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <span
                                      className={`block text-xs font-bold truncate ${isSelected
                                          ? "text-blue-700"
                                          : "text-slate-800 group-hover:text-blue-600"
                                        }`}
                                    >
                                      {prov.fullName}
                                    </span>
                                    <p className="text-[10px] text-slate-400 font-medium truncate">
                                      {prov.mergedNote}
                                    </p>
                                  </div>
                                  {isSelected ? (
                                    <IconMapper
                                      name="check_circle"
                                      className="w-4 h-4 text-blue-600 shrink-0"
                                    />
                                  ) : (
                                    <span className="text-[10px] font-bold text-slate-300 group-hover:text-blue-500 shrink-0">
                                      Chọn
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer summary (luôn hiển thị ở đáy khung options) */}
                    <div className="shrink-0 px-3.5 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                      <span>Đơn vị hành chính Việt Nam (34 tỉnh/thành)</span>
                      <span>06 TP TW · 28 Tỉnh</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>,
              document.body
            )}
        </div>

        {/* Điểm thi dự kiến (/30) */}
        <div>
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
            <IconMapper name="radar" className="w-3.5 h-3.5 text-blue-600" />
            Điểm thi dự kiến (/30)
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              min={0}
              max={30}
              step={0.25}
              inputMode="decimal"
              className={`${inputBaseCls} pl-4 pr-16 py-3`}
              placeholder="Ví dụ: 24.5"
              value={data.expectedScore ?? ""}
              onChange={(e) =>
                onChange({
                  expectedScore:
                    e.target.value === ""
                      ? undefined
                      : Math.min(30, Math.max(0, Number(e.target.value))),
                })
              }
            />
            <span className="pointer-events-none absolute right-3 px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-500">
              / 30
            </span>
          </div>
        </div>

        {/* Ngân sách gia đình (triệu/năm) */}
        <div>
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
            <IconMapper
              name="account_balance_wallet"
              className="w-3.5 h-3.5 text-blue-600"
            />
            Ngân sách gia đình
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              min={0}
              max={2000}
              step={5}
              inputMode="numeric"
              className={`${inputBaseCls} pl-4 pr-24 py-3`}
              placeholder="Ví dụ: 60"
              value={data.budgetPerYearMillion ?? ""}
              onChange={(e) =>
                onChange({
                  budgetPerYearMillion:
                    e.target.value === ""
                      ? undefined
                      : Math.max(0, Number(e.target.value)),
                })
              }
            />
            <span className="pointer-events-none absolute right-3 px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-500">
              triệu/năm
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StructuredInputs;
