import {
  SimulationData,
  PredictionResult,
  PremiumAnalysisReport,
} from "../types";

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'https://futuretrace-server.onrender.com';

// Tác vụ AI có thể mất 1-2 phút khi server vừa "thức dậy" (Render free) hoặc GPU đang khởi động
const AI_TIMEOUT_MS = 150_000;

export type ApiErrorType = 'AUTH' | 'NETWORK' | 'GENERAL' | 'OVERLOADED' | 'RATE_LIMIT' | 'TIMEOUT' | 'CANCELLED';

export class ApiError extends Error {
  type: ApiErrorType;
  code?: string;
  status?: number;
  requiredToken?: number;
  currentToken?: number;

  constructor(message: string, type: ApiErrorType, extra: Partial<ApiError> = {}) {
    super(message);
    this.type = type;
    Object.assign(this, extra);
  }
}

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const syncRemainingToken = (remainingToken?: number) => {
  if (typeof remainingToken !== 'number') return;
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return;
  try {
    const user = JSON.parse(storedUser);
    localStorage.setItem('user', JSON.stringify({
      ...user,
      token: remainingToken
    }));
  } catch {
    // Ignore malformed local user data.
  }
};

const typeFromStatus = (status: number, serverType?: string): ApiErrorType => {
  if (serverType === 'OVERLOADED' || serverType === 'RATE_LIMIT') return serverType;
  if (status === 401 || status === 402 || status === 403) return 'AUTH';
  if (status === 429) return 'RATE_LIMIT';
  if (status === 502 || status === 503 || status === 504) return 'OVERLOADED';
  return 'GENERAL';
};

/**
 * Gọi API JSON: kiểm tra mã HTTP trước khi parse (trang lỗi HTML 502 của gateway không còn
 * hiện ra thành "Unexpected token '<'"), có timeout và có thể hủy bằng AbortSignal.
 */
const requestJson = async (
  path: string,
  init: RequestInit,
  fallbackMessage: string,
  signal?: AbortSignal,
): Promise<any> => {
  const timeout = AbortSignal.timeout(AI_TIMEOUT_MS);
  const combined = signal && 'any' in AbortSignal ? (AbortSignal as any).any([signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: getAuthHeaders(), signal: combined });
  } catch (e: any) {
    if (signal?.aborted) throw new ApiError('Bạn đã hủy yêu cầu.', 'CANCELLED');
    if (timeout.aborted) {
      throw new ApiError('Máy chủ AI phản hồi quá lâu. Vui lòng thử lại sau ít phút.', 'TIMEOUT');
    }
    throw new ApiError('Không kết nối được máy chủ. Kiểm tra mạng và thử lại.', 'NETWORK');
  }

  const isJson = (response.headers.get('content-type') || '').includes('application/json');
  const body = isJson ? await response.json().catch(() => ({})) : {};

  if (!response.ok) {
    throw new ApiError(body.message || fallbackMessage, typeFromStatus(response.status, body.type), {
      status: response.status,
      code: body.code,
      requiredToken: body.requiredToken,
      currentToken: body.currentToken,
    });
  }
  return body;
};

export const generateSimulation = async (
  data: SimulationData,
  signal?: AbortSignal,
): Promise<PredictionResult> => {
  return requestJson('/api/simulations', {
    method: 'POST',
    body: JSON.stringify(data),
  }, 'Lỗi kết nối server AI.', signal);
};

export const analyzeInputReadiness = async (decision: string, signal?: AbortSignal): Promise<any> => {
  return requestJson('/api/simulations/pre-check', {
    method: 'POST',
    body: JSON.stringify({ decision }),
  }, 'Lỗi kết nối server AI.', signal);
};

export const generatePremiumAnalysis = async (
  title: string,
  description: string,
  scenarioId: string,
  context?: SimulationData,
  timeframe?: number,
): Promise<any> => {
  const data = await requestJson('/api/premium/analyze', {
    method: 'POST',
    body: JSON.stringify({
      scenario: { title, description, id: scenarioId },
      context,
      timeframe
    })
  }, 'Lỗi tạo lộ trình chuyên sâu.');
  syncRemainingToken(data.remainingToken);
  return data;
};

export const pivotPremiumAnalysis = async (
  currentReport: PremiumAnalysisReport,
  completedMilestones: any[],
  feedback: string,
  context?: SimulationData,
  timeframe?: number,
  progressId?: string,
): Promise<PremiumAnalysisReport> => {
  // Khi có progressId, server tự nạp báo cáo từ DB; không cần gửi lại cả báo cáo (~30KB)
  const data = await requestJson('/api/premium/pivot', {
    method: 'POST',
    body: JSON.stringify(progressId
      ? { progressId, feedback, context, timeframe }
      : { currentReport, completedMilestones, feedback, context, timeframe })
  }, 'Lỗi điều chỉnh lộ trình.');
  syncRemainingToken(data.remainingToken);
  return data.report;
};

export const expandStepDetail = async (
  scenarioId: string,
  stepId: string
): Promise<{ step: any; report: any }> => {
  return requestJson('/api/premium/expand-step', {
    method: 'PATCH',
    body: JSON.stringify({ scenarioId, stepId })
  }, 'Không thể tối ưu chi tiết nhiệm vụ.');
};
