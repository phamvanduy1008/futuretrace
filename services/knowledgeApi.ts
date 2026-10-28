/**
 * API Knowledge Layer (autocomplete trường/ngành, phương pháp luận), phản hồi kịch bản, làm nóng GPU.
 */
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'https://futuretrace-server.onrender.com';

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

export interface ProgramOption {
  id: string;
  schoolName: string;
  province: string;
  majorName: string;
  majorCode: string | null;
  subjectGroups: string[];
  cutoff: number;
  year: number;
}

export const searchPrograms = async (q: string, signal?: AbortSignal): Promise<ProgramOption[]> => {
  if (!q.trim()) return [];
  const res = await fetch(`${API_BASE_URL}/api/knowledge/search?type=program&limit=8&q=${encodeURIComponent(q)}`, { signal });
  if (!res.ok) return [];
  return (await res.json()).results || [];
};

export const getMethodology = async () => {
  const res = await fetch(`${API_BASE_URL}/api/knowledge/methodology`);
  if (!res.ok) throw new Error('Không tải được thông tin phương pháp luận.');
  return res.json();
};

/** Gọi khi mở form mô phỏng: khởi động GPU của model chính trong lúc người dùng nhập liệu */
export const warmupAI = () => {
  if (!localStorage.getItem('token')) return;
  fetch(`${API_BASE_URL}/api/simulations/warmup`, { method: 'POST', headers: authHeaders() }).catch(() => {});
};

export const sendScenarioFeedback = async (
  simulationId: string,
  body: { scenarioId?: string; rating: 1 | -1; numbersPlausible?: boolean; reasons?: string[]; comment?: string },
) => {
  const res = await fetch(`${API_BASE_URL}/api/simulations/${simulationId}/feedback`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Không gửi được phản hồi.');
  return res.json();
};
