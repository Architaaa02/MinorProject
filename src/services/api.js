import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

// The API returns geographic data as an object while the existing UI renders a
// human-readable address. Keep that translation in one place so every screen
// consumes the same stable shape.
export const toIssueView = (issue) => ({
  ...issue,
  id: issue.id || issue._id,
  title: issue.title || issue.description?.slice(0, 60) || 'Untitled issue',
  location: issue.location?.address || issue.location || 'Location unavailable',
  userName: issue.citizen?.name || issue.userName || 'Citizen',
  imageUrl: issue.imageUrl?.startsWith('http')
    ? issue.imageUrl
    : `${API_ORIGIN}${issue.imageUrl || ''}`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const issueAPI = {
  getAll: () => api.get('/issues'),
  getUserIssues: () => api.get('/issues/user'),
  create: (formData) => api.post('/issues', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStatus: (id, status) => api.patch(`/issues/${id}/status`, { status }),
  getStats: () => api.get('/issues/stats'),
};

export default api;
