export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const BASE_URL = import.meta.env.VITE_API_URL || '';
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}/api${endpoint}`;

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }
    
    return data;
  },

  get(endpoint, params) {
    let url = endpoint;
    if (params) {
      const qs = new URLSearchParams(params).toString();
      if (qs) url += `?${qs}`;
    }
    return this.request(url, { method: 'GET' });
  },
  post(endpoint, data) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) });
  },
  put(endpoint, data) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(data) });
  },
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};

export const auth = {
  async login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    return data.user;
  },
  async register(email, password, full_name) {
    const data = await api.post('/auth/register', { email, password, full_name });
    localStorage.setItem('token', data.token);
    return data.user;
  },
  async me() {
    try {
      if (!localStorage.getItem('token')) return null;
      return await api.get('/auth/me');
    } catch (e) {
      this.logout();
      return null;
    }
  },
  async updateMe(updates) {
    return await api.put('/auth/profile', updates);
  },
  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
  redirectToLogin(returnUrl) {
    const url = returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login';
    window.location.href = url;
  }
};
