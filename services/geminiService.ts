import {
  SimulationData,
  PredictionResult,
  PremiumAnalysisReport,
} from "../types";

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'https://futuretrace-server.onrender.com';

const getAuthToken = () => localStorage.getItem('token');

const syncRemainingToken = (remainingToken?: number, remainingTokenFree?: number, remainingTokenPremium?: number) => {
  if (typeof remainingToken !== 'number' && typeof remainingTokenFree !== 'number' && typeof remainingTokenPremium !== 'number') return;
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return;
  try {
    const user = JSON.parse(storedUser);
    const token_free = typeof remainingTokenFree === 'number' ? remainingTokenFree : (user.token_free ?? 0);
    const token_premium = typeof remainingTokenPremium === 'number' ? remainingTokenPremium : (user.token_premium ?? 0);
    localStorage.setItem('user', JSON.stringify({
      ...user,
      token: typeof remainingToken === 'number' ? remainingToken : token_free + token_premium,
      token_free,
      token_premium
    }));
  } catch {
    // Ignore malformed local user data.
  }
};

const throwApiError = (errorData: any, fallback: string) => {
  const error: any = new Error(errorData.message || fallback);
  error.code = errorData.code;
  error.requiredToken = errorData.requiredToken;
  error.currentToken = errorData.currentToken;
  throw error;
};

export const generateSimulation = async (
  data: SimulationData,
): Promise<PredictionResult> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/simulations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      ...data,
      tier: 'FREE'
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Lỗi kết nối server AI.');
  }

  const result = await response.json();
  return result;
};

export const generatePremiumAnalysis = async (
  title: string,
  description: string,
  scenarioId: string,
  context?: SimulationData,
  timeframe?: number,
): Promise<any> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/premium/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      scenario: { title, description, id: scenarioId },
      context,
      timeframe
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Lỗi tạo lộ trình chuyên sâu.');
  }

  const data = await response.json();
  syncRemainingToken(data.remainingToken, data.remainingTokenFree, data.remainingTokenPremium);
  return data;
};

export const pivotPremiumAnalysis = async (
  currentReport: PremiumAnalysisReport,
  completedMilestones: any[],
  feedback: string,
  context?: SimulationData,
  timeframe?: number,
): Promise<PremiumAnalysisReport> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/premium/pivot`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      currentReport,
      completedMilestones,
      feedback,
      context,
      timeframe
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Lỗi điều chỉnh lộ trình.');
  }

  const data = await response.json();
  syncRemainingToken(data.remainingToken, data.remainingTokenFree, data.remainingTokenPremium);
  return data.report;
};
