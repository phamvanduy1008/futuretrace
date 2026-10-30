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
  location?: string;
  coreValues?: "Ổn định" | "Thu nhập cao" | "Đam mê/Cống hiến";
  // Đầu vào có cấu trúc (autocomplete trường/ngành): chính xác hơn suy luận từ câu tự do
  programId?: string;
  programLabel?: string;
  expectedScore?: number;
  budgetPerYearMillion?: number;
}

/** Một sự kiện có nguồn trong Fact Sheet (Knowledge Layer v2) */
export interface Fact {
  id: string;
  label: string;
  value: number | null;
  unit: string | null;
  range?: number[];
  year?: number;
  kind: string;
  source?: { publisher?: string; url?: string | null; tier?: string; years?: number[]; verified?: boolean };
}

export interface ScenarioResult {
  id?: string;
  title: string;
  description: string;
  careerGrowth: number;
  happiness: number;
  roi: number;
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
  probability?: number;
  quant?: ScenarioQuant;
}

/** Bằng chứng định lượng từ FT-Salary + Career ROI Engine (backend) */
export interface ScenarioQuant {
  model: string;
  confidence: "high" | "medium" | "low";
  market: {
    segments: string[];
    period: number[];
    demandMomentumPercentPerYear: number;
    salaryGrowthPercentPerYear: number;
    postingsAnalyzed: number;
  } | null;
  assumptions: {
    discountRate: number;
    lensYears: number;
    tuitionPerYearMillion: number;
    tuitionSource?: string;
    studentLivingMonthlyMillion: number;
  };
  roi: {
    ratio: number;
    pvCostMillion: number;
    pvBenefitMillion: number;
    paybackYearFromNow: number | null;
    lensYears: number;
  };
  salary: {
    quantile: string;
    startMonthlyMillion: number;
    year5MonthlyMillion: number;
    counterfactualStartMillion: number;
  };
  affordability: {
    cashNeedPerYearMillion: number;
    familyCapacityPerYearMillion: number;
    gapPerYearMillion: number;
    affordable: boolean;
  };
  metricSources: { careerGrowth: string; roi: string; happiness: string };
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
  simulationId?: string;
  facts?: Fact[];
  program?: { schoolName?: string; majorName?: string; cutoff?: number; year?: number } | null;
  quality?: { provider?: string; groundedness?: number | null; aiCoverage?: number } | null;
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
