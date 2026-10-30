/**
 * Mô phỏng qua Server-Sent Events (POST /api/simulations/stream).
 * Số liệu (facts) đến sau ~0,1s, văn bản AI đến dần (partial), kết quả đầy đủ ở `done`.
 * Nếu server chưa hỗ trợ streaming (404), tự lùi về POST /api/simulations.
 */
import { SimulationData, PredictionResult } from '../types';
import { ApiError, generateSimulation } from './geminiService';

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'https://futuretrace-server.onrender.com';

export interface StreamFacts {
  facts: any[];
  program: any;
  occupation: any;
  scenarios: Record<string, any> | null;
  confidence: string | null;
  elapsedMs: number;
}

export interface StreamPartial {
  summary: string;
  scenarios: { type?: string; title: string; description: string }[];
}

export interface StreamHandlers {
  onFacts?: (f: StreamFacts) => void;
  onPartial?: (p: StreamPartial) => void;
  onReset?: () => void;
}

const typeFromStatus = (status: number, serverType?: string) => {
  if (serverType) return serverType as any;
  if (status === 401 || status === 402) return 'AUTH';
  if (status === 429) return 'RATE_LIMIT';
  if (status >= 502) return 'OVERLOADED';
  return 'GENERAL';
};

export const streamSimulation = async (
  data: SimulationData,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<PredictionResult> => {
  const token = localStorage.getItem('token');
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/simulations/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(data),
      signal,
    });
  } catch {
    if (signal?.aborted) throw new ApiError('Bạn đã hủy yêu cầu.', 'CANCELLED');
    throw new ApiError('Không kết nối được máy chủ. Kiểm tra mạng và thử lại.', 'NETWORK');
  }

  if (res.status === 404) return generateSimulation(data, signal);
  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.message || 'Lỗi kết nối server AI.', typeFromStatus(res.status, body.type), {
      status: res.status, code: body.code, requiredToken: body.requiredToken, currentToken: body.currentToken,
    });
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buffer.indexOf('\n\n')) >= 0) {
        const block = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const event = /^event: (.+)$/m.exec(block)?.[1];
        const raw = /^data: (.+)$/m.exec(block)?.[1];
        if (!event || !raw) continue;
        const payload = JSON.parse(raw);
        if (event === 'facts') handlers.onFacts?.(payload);
        else if (event === 'partial') handlers.onPartial?.(payload);
        else if (event === 'reset') handlers.onReset?.();
        else if (event === 'done') return payload as PredictionResult;
        else if (event === 'error') throw new ApiError(payload.message, payload.type || 'GENERAL');
      }
    }
  } catch (e: any) {
    if (e instanceof ApiError) throw e;
    if (signal?.aborted) throw new ApiError('Bạn đã hủy yêu cầu.', 'CANCELLED');
    throw new ApiError('Kết nối bị gián đoạn trong lúc phân tích. Token đã được hoàn lại, vui lòng thử lại.', 'NETWORK');
  }
  throw new ApiError('Kết nối kết thúc trước khi có kết quả. Vui lòng thử lại.', 'NETWORK');
};
