import {
  SimulationData,
  PredictionResult,
  PremiumAnalysisReport,
} from "../types";

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getAuthToken = () => localStorage.getItem('token');

export const generateSimulation = async (
  data: SimulationData,
): Promise<PredictionResult> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/simulations`, {
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

  return await response.json();
};

export const generatePremiumAnalysis = async (
  title: string,
  description: string,
  scenarioId: string,
  context?: SimulationData,
  timeframe?: number,
): Promise<any> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/premium/analyze`, {
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

  return await response.json();
};

export const pivotPremiumAnalysis = async (
  currentReport: PremiumAnalysisReport,
  completedMilestones: any[],
  feedback: string,
  context?: SimulationData,
  timeframe?: number,
): Promise<PremiumAnalysisReport> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/premium/pivot`, {
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
  return data.report;
};
