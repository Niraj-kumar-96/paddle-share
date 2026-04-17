const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

const apiCall = async (endpoint, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE}${endpoint}`, config);
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
};

export const authApi = {
  login: (credentials) => apiCall('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => apiCall('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => apiCall('/auth/me'),
  updateProfile: (data) => apiCall('/auth/profile', { method: 'PUT', body: JSON.stringify(data) })
};

export const ridesApi = {
  list: (params) => apiCall(`/rides?${new URLSearchParams(params)}`),
  create: (data) => apiCall('/rides', { method: 'POST', body: JSON.stringify(data) }),
  get: (id) => apiCall(`/rides/${id}`),
  update: (id, data) => apiCall(`/rides/${id}`, { method: 'PUT', body: JSON.stringify(data) })
};

export default apiCall;

