const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'https://futuretrace-server.onrender.com';

const getAuthToken = () => localStorage.getItem('token');

export const getEvaluationQuestions = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/evaluations/questions`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Lỗi lấy bộ câu hỏi.');
  }

  return await response.json();
};

export const submitEvaluationResult = async (answers: { questionId: number, score: number }[]) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/evaluations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ answers })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Lỗi lưu kết quả đánh giá.');
  }

  return await response.json();
};

export const getLatestEvaluation = async () => {
  const token = getAuthToken();
  // Don't throw if not logged in, just return null
  if (!token) return null;

  const response = await fetch(`${API_BASE_URL}/api/evaluations/latest`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return null; // Silent fail if unauthorized or no history
  }

  return await response.json();
};
