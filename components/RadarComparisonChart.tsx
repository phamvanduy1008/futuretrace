import React, { useState } from "react";
import { motion } from "framer-motion";
import { ScenarioResult } from "../types";
import { IconMapper } from "./IconMapper";
import { calculateRealisticRoi } from "../services/roiCalculator";

interface AxisDefinition {
  key: string;
  label: string;
  icon: string;
  getValue: (s: ScenarioResult) => number;
  description: string;
}

const RADAR_AXES: AxisDefinition[] = [
  {
    key: "career",
    label: "Sự nghiệp",
    icon: "trending_up",
    getValue: (s) => Math.min(100, Math.max(10, s.careerGrowth)),
    description: "Mức độ thăng tiến vị trí & cơ hội chuyên môn",
  },
  {
    key: "happiness",
    label: "Hạnh phúc",
    icon: "favorite",
    getValue: (s) => Math.min(100, Math.max(10, s.happiness)),
    description: "Chỉ số cân bằng tinh thần và sức khỏe tâm lý",
  },
  {
    key: "roi",
    label: "Hiệu quả ROI",
    icon: "toll",
    getValue: (s) => {
      const { annualizedRoi } = calculateRealisticRoi(s, 5);
      const normalizedScore = Math.round(((annualizedRoi + 10) / 45) * 80 + 15);
      return Math.min(100, Math.max(15, normalizedScore));
    },
    description: "Tỷ suất sinh lời và khả năng hoàn vốn đầu tư bình quân hàng năm",
  },
  {
    key: "safety",
    label: "Độ an toàn",
    icon: "verified_user",
    getValue: (s) => {
      if (s.type === "Positive") return 88;
      if (s.type === "Neutral") return 72;
      return 38;
    },
    description: "Khả năng chống chịu rủi ro và biến cố bất ngờ",
  },
  {
    key: "feasibility",
    label: "Khả thi",
    icon: "check_circle",
    getValue: (s) => {
      if (s.marketFit?.score) return s.marketFit.score;
      return Math.min(
        100,
        Math.max(
          15,
          Math.round(
            s.careerGrowth * 0.4 +
              s.happiness * 0.3 +
              (s.roi > 100 ? 100 : s.roi) * 0.3
          )
        )
      );
    },
    description: "Độ khả thi thực thi đối với năng lực thực tế",
  },
];

const SCENARIO_THEMES: Record<
  string,
  {
    name: string;
    stroke: string;
    fill: string;
    badge: string;
    lightBg: string;
    border: string;
  }
> = {
  Positive: {
    name: "Tối ưu",
    stroke: "#2563eb", // Royal Blue
    fill: "rgba(37, 99, 235, 0.15)",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    lightBg: "bg-blue-50/50",
    border: "border-blue-200",
  },
  Neutral: {
    name: "Cân bằng",
    stroke: "#0d9488", // Teal
    fill: "rgba(13, 148, 136, 0.14)",
    badge: "bg-teal-50 text-teal-700 border-teal-200",
    lightBg: "bg-teal-50/50",
    border: "border-teal-200",
  },
  Risk: {
    name: "Rủi ro cao",
    stroke: "#e11d48", // Rose
    fill: "rgba(225, 29, 72, 0.12)",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    lightBg: "bg-rose-50/50",
    border: "border-rose-200",
  },
};

const DEFAULT_SCENARIOS: ScenarioResult[] = [
  {
    id: "default-pos",
    title: "Lộ trình Tối ưu (Kỹ sư Chuyên sâu)",
    type: "Positive",
    description:
      "Tập trung thăng tiến chuyên môn kỹ thuật, mở rộng network và tối ưu thu nhập.",
    careerGrowth: 88,
    happiness: 82,
    roi: 95,
    marketFit: {
      score: 90,
      analysis: "Nhu cầu thị trường rất cao đối với nhân sự chuyên môn sâu.",
    },
  },
  {
    id: "default-neu",
    title: "Lộ trình Cân bằng (Chuyên viên)",
    type: "Neutral",
    description:
      "Cân bằng cuộc sống và công việc, duy trì năng suất đều đặn và tâm lý thoải mái.",
    careerGrowth: 65,
    happiness: 85,
    roi: 68,
    marketFit: {
      score: 75,
      analysis: "Phù hợp với nhịp sống gia đình và sự ổn định dài hạn.",
    },
  },
  {
    id: "default-risk",
    title: "Lộ trình Đột phá (Khởi nghiệp)",
    type: "Risk",
    description:
      "Chấp nhận rủi ro và biến động tài chính ngắn hạn để tạo đột phá thu nhập.",
    careerGrowth: 78,
    happiness: 58,
    roi: 115,
    marketFit: {
      score: 62,
      analysis: "Cạnh tranh cao, áp lực dòng tiền trong 18 tháng đầu.",
    },
  },
];

interface RadarComparisonChartProps {
  scenarios?: ScenarioResult[];
  className?: string;
  title?: string;
  onScenarioClick?: (scenario: ScenarioResult, index: number) => void;
}

export const RadarComparisonChart: React.FC<RadarComparisonChartProps> = ({
  scenarios,
  className = "",
  title = "So Sánh Đa Chiều 3 Kịch Bản (Radar Chart)",
  onScenarioClick,
}) => {
  const displayScenarios =
    scenarios && scenarios.length > 0 ? scenarios : DEFAULT_SCENARIOS;

  const [activeScenarios, setActiveScenarios] = useState<Record<string, boolean>>({
    Positive: true,
    Neutral: true,
    Risk: true,
  });
  const [hoveredPoint, setHoveredPoint] = useState<{
    scenarioName: string;
    axisLabel: string;
    value: number;
    description: string;
    x: number;
    y: number;
    color: string;
  } | null>(null);

  // Geometry configuration
  const size = 460;
  const center = size / 2;
  const radius = 150;
  const totalAxes = RADAR_AXES.length;
  const angleStep = (Math.PI * 2) / totalAxes;
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Helper to calculate coordinates
  const getCoordinates = (index: number, normalizedValue: number) => {
    const angle = -Math.PI / 2 + index * angleStep;
    const r = radius * normalizedValue;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Generate polygon points for a scenario
  const generatePolygonPath = (scenario: ScenarioResult) => {
    const points = RADAR_AXES.map((axis, i) => {
      const rawVal = axis.getValue(scenario);
      const normalized = Math.max(0.05, Math.min(1, rawVal / 100));
      const { x, y } = getCoordinates(i, normalized);
      return `${x},${y}`;
    });
    return points.join(" ");
  };

  const toggleScenario = (type: string) => {
    setActiveScenarios((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      if (prev[type] && activeCount === 1) return prev; // Keep at least one active
      return { ...prev, [type]: !prev[type] };
    });
  };

  return (
    <div
      className={`bg-white rounded-[2.5rem] border border-slate-200/80 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.06)] p-6 sm:p-10 lg:p-12 relative overflow-hidden text-slate-900 transition-all ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-100 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider mb-3">
            <IconMapper name="radar" className="text-sm text-blue-600" />
            Phân Tích So Sánh Đa Chiều
          </div>
          <h3 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900">
            {title}
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-1.5 max-w-2xl leading-relaxed">
            Đánh giá 5 khía cạnh cốt lõi để làm rõ sự đánh đổi (Trade-off) giữa các lộ trình tương lai
          </p>
        </div>

        {/* Legend / Toggle Buttons */}
        <div className="flex items-center p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/60 shadow-inner flex-wrap gap-1">
          {displayScenarios.map((s, idx) => {
            const theme = SCENARIO_THEMES[s.type] || SCENARIO_THEMES.Neutral;
            const isVisible = activeScenarios[s.type] ?? true;

            return (
              <button
                key={s.type || idx}
                type="button"
                onClick={() => toggleScenario(s.type)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-200 ${
                  isVisible
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/60"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: isVisible ? theme.stroke : "#cbd5e1",
                  }}
                />
                <span>{theme.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative flex flex-col items-center justify-center py-6 sm:py-10">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[460px] h-auto overflow-visible select-none"
        >
          {/* Web Levels (Concentric Polygons) */}
          {levels.map((level, lvlIdx) => {
            const levelPoints = RADAR_AXES.map((_, i) => {
              const { x, y } = getCoordinates(i, level);
              return `${x},${y}`;
            }).join(" ");

            return (
              <g key={lvlIdx}>
                <polygon
                  points={levelPoints}
                  fill={lvlIdx === levels.length - 1 ? "rgba(248, 250, 252, 0.7)" : "none"}
                  stroke="#e2e8f0"
                  strokeWidth="1.2"
                  strokeDasharray={lvlIdx < levels.length - 1 ? "3 3" : "none"}
                />
                <text
                  x={center + 6}
                  y={center - radius * level + 4}
                  fill="#94a3b8"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {Math.round(level * 100)}%
                </text>
              </g>
            );
          })}

          {/* Axis Spoke Lines & Labels */}
          {RADAR_AXES.map((axis, i) => {
            const { x, y } = getCoordinates(i, 1.0);
            const labelCoord = getCoordinates(i, 1.2);

            return (
              <g key={axis.key}>
                <line
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="#cbd5e1"
                  strokeWidth="1.2"
                />
                <circle cx={x} cy={y} r="3" fill="#94a3b8" />
                <text
                  x={labelCoord.x}
                  y={labelCoord.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-slate-700 font-extrabold text-[11px] uppercase tracking-wider"
                >
                  {axis.label}
                </text>
              </g>
            );
          })}

          {/* Scenario Polygons */}
          {displayScenarios.map((scenario, sIdx) => {
            const isVisible = activeScenarios[scenario.type] ?? true;
            if (!isVisible) return null;

            const theme = SCENARIO_THEMES[scenario.type] || SCENARIO_THEMES.Neutral;
            const polyPoints = generatePolygonPath(scenario);

            return (
              <g key={scenario.type || sIdx}>
                <motion.polygon
                  initial={{ opacity: 0, scale: 0.2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: sIdx * 0.1, ease: "easeOut" }}
                  points={polyPoints}
                  fill={theme.fill}
                  stroke={theme.stroke}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  onClick={() => onScenarioClick?.(scenario, sIdx)}
                  className="cursor-pointer transition-all hover:stroke-[3.5]"
                />

                {/* Vertex Interactive Points */}
                {RADAR_AXES.map((axis, aIdx) => {
                  const rawVal = axis.getValue(scenario);
                  const normalized = Math.max(0.05, Math.min(1, rawVal / 100));
                  const { x, y } = getCoordinates(aIdx, normalized);

                  return (
                    <circle
                      key={aIdx}
                      cx={x}
                      cy={y}
                      r="5"
                      fill={theme.stroke}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="cursor-pointer transition-transform hover:scale-150"
                      onMouseEnter={() => {
                        setHoveredPoint({
                          scenarioName: theme.name,
                          axisLabel: axis.label,
                          value: rawVal,
                          description: axis.description,
                          x,
                          y,
                          color: theme.stroke,
                        });
                      }}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Clean Hover Tooltip Card */}
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-30 pointer-events-none p-3.5 bg-slate-900 text-white rounded-2xl shadow-xl text-center max-w-[210px] border border-slate-800"
            style={{
              left: Math.min(Math.max(hoveredPoint.x - 105, 20), size - 210),
              top: Math.max(10, hoveredPoint.y - 85),
            }}
          >
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: hoveredPoint.color }}
              />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                {hoveredPoint.scenarioName}
              </span>
            </div>
            <div className="text-base font-black text-white">
              {hoveredPoint.axisLabel}:{" "}
              <span style={{ color: hoveredPoint.color }}>
                {hoveredPoint.value}%
              </span>
            </div>
            <p className="text-[10px] text-slate-300 font-medium leading-tight mt-1">
              {hoveredPoint.description}
            </p>
          </motion.div>
        )}
      </div>

      {/* Bottom Insights Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
        {displayScenarios.map((s, idx) => {
          const theme = SCENARIO_THEMES[s.type] || SCENARIO_THEMES.Neutral;
          const realisticRoi = calculateRealisticRoi(s, 5);
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-colors ${theme.lightBg} ${theme.border}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg border ${theme.badge}`}
                >
                  {theme.name}
                </span>
                <span
                  className="text-xs font-black"
                  style={{ color: theme.stroke }}
                  title={`Tổng tích lũy 5 năm: +${realisticRoi.cumulativeRoi}% (Hoàn vốn ~${realisticRoi.paybackPeriodYears} năm)`}
                >
                  ROI: +{realisticRoi.annualizedRoi}%/năm
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 mb-1 leading-snug">
                {s.title}
              </h4>
              <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                {s.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
