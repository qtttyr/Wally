const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  SCAN_PROCESS: `${API_URL}/api/v1/scan/process`,
  AI_INSIGHTS: `${API_URL}/api/v1/ai/insights`,
};

export default API_URL;
