import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

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

// Global 401 handler: clear stale auth and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on an auth page
      if (!window.location.pathname.startsWith('/login') && window.location.pathname !== '/') {
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const issueAPI = {
  getAll: (params) => api.get('/issues', { params }),
  getUserIssues: () => api.get('/issues/user'),
  getById: (id) => api.get(`/issues/${id}`),
  create: (formData) => api.post('/issues', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStatus: (id, status, note) => api.patch(`/issues/${id}/status`, { status, note }),
  getStats: () => api.get('/issues/stats'),
  getHeatmap: () => api.get('/issues/heatmap'),
};

export default api;
