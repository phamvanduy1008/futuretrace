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
}

export interface SimulationData {
  decision: string;
  stress: number;
  personalFinance: number;
  risk: number;
  academicPerformance: number; // Thêm chỉ số học lực (1-5)
  otherFactors?: string;
  tier: UserTier;
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
}

export interface PremiumAnalysisReport {
  detailedNarrative: string;
  milestones: {
    month: string;
    event: string;
    impact: string;
    probability: number;
    details: string; // Thêm trường thông tin chi tiết hướng dẫn
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
