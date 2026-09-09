export enum SimulationStep {
  DESCRIPTION = 1,
  CONTEXT = 2,
  PROCESSING = 3,
  RESULTS = 4,
}

export type UserTier = "free" | "premium";

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  bio: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  date: string;
  likes: number;
  isLiked?: boolean;
}

export interface SimulationData {
  decision: string;
  stress: number;
  personalFinance: number;
  risk: number;
  academicPerformance: number; // Thêm chỉ số học lực (1-5)
  otherFactors?: string;
  timeHorizon?: number; // Số năm dự báo (1, 3, 5, hoặc 10)
  tier: UserTier;
  mood?: "Lạc quan" | "Bình thường" | "Lo lắng" | "Kiệt sức";
  educationLevel?: "Cấp 3" | "Đại học năm 1-2" | "Đại học năm 3-4" | "Mới ra trường";
  location?: "Thành phố lớn" | "Tỉnh lẻ";
  coreValues?: "Ổn định" | "Thu nhập cao" | "Đam mê/Cống hiến";
}

export interface RoiDetails {
  annualizedRoi: number; // Tỷ suất sinh lời bình quân hàng năm (%/năm), vd: 24.5
  cumulativeRoi: number; // Tổng tỷ suất tích lũy cả kỳ (%), vd: 200
  estimatedCost: string; // Chi phí đầu tư dự kiến (vd: "45 - 65 triệu VNĐ")
  estimatedAnnualGain: string; // Mức thu nhập tăng thêm dự kiến (vd: "15 - 22 triệu VNĐ/tháng")
  paybackPeriodYears: number; // Thời gian hoàn vốn dự kiến (năm), vd: 1.8
  breakdownExplanation: string; // Giải trình cơ sở tính toán
  riskFactor?: string; // Yếu tố rủi ro
}

export interface ScenarioResult {
  id?: string;
  title: string;
  description: string;
  careerGrowth: number;
  happiness: number;
  roi: number;
  cumulativeRoi?: number;
  roiDetails?: RoiDetails;
  metrics?: {
    career?: number;
    happiness?: number;
    roi?: number;
  };
  type: "Positive" | "Neutral" | "Risk";
  deepAnalysis?: {
    swot: {
      label: string;
      value: string;
      color: string;
      type: "S" | "W" | "O" | "T";
    }[];
    resources: {
      label: string;
      value: number;
      unit: string;
      icon: string;
      ghostLabel?: string;
    }[];
    sprint90: { phase: string; tasks: string[] }[];
    criticalAdvice: string;
    riskMitigation?: string;
  };
  marketFit?: {
    score: number;
    analysis: string;
  };
}

export interface MilestoneStep {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  actions: string[];
  tools: string[];
  expectedResult: string;
  completed: boolean;
}

export interface PremiumAnalysisReport {
  detailedNarrative: string;
  milestones: {
    month: string;
    event: string;
    impact: string;
    probability: number;
    details: string | MilestoneStep[]; // Thêm trường thông tin chi tiết hướng dẫn (chuỗi hoặc mảng steps)
  }[];
  influencingFactors: {
    category: string;
    factor: string;
    influence: "High" | "Medium" | "Low";
    description: string;
  }[];
  strategicPivotPoints: { condition: string; action: string }[];
  longTermProjection: string;
}

export interface CommunityPost extends ScenarioResult {
  id: string;
  author: string;
  authorAvatar?: string;
  isAnonymous: boolean;
  date: string;
  likes: number;
  commentsCount: number;
  category: string;
  reliability: number;
  desc: string;
  isLiked?: boolean;
}

export interface HistoryItem extends ScenarioResult {
  id: string;
  author: string;
  isAnonymous: boolean;
  date: string;
  category: string;
  reliability: number;
  desc: string;
  metrics: { career: number; happiness: number; roi: number };
  isFolder?: boolean;
  scenarios?: HistoryItem[];
}

export interface PredictionResult {
  isEnterprise?: boolean;
  summary: string;
  scenarios: ScenarioResult[];
  timeline: {
    start: string;
    sixMonths: string;
    oneYear: string;
    threeYears: string;
  };
}

export interface ProgressItem {
  id: string;
  scenarioId: string;
  title: string;
  category: string;
  date: string;
  report: PremiumAnalysisReport;
  context: SimulationData;
  scenario: ScenarioResult;
  completedMilestones: number[];
  timeframe: number;
}
