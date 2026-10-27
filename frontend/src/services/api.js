const API_BASE = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('setucase_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  register: async (data) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    return res.json();
  },

  getDemoAccounts: async () => {
    const res = await fetch(`${API_BASE}/auth/demo-accounts`);
    return res.json();
  },

  // Complaints
  getComplaints: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE}/complaints${query ? '?' + query : ''}`;
    const res = await fetch(url, { headers: getHeaders() });
    return res.json();
  },

  getComplaintById: async (id) => {
    const res = await fetch(`${API_BASE}/complaints/${id}`, { headers: getHeaders() });
    return res.json();
  },

  submitComplaint: async (data) => {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateStatus: async (id, data) => {
    const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  addInternalNote: async (id, note) => {
    const res = await fetch(`${API_BASE}/complaints/${id}/notes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ note })
    });
    return res.json();
  },

  assignComplaint: async (id, data) => {
    const res = await fetch(`${API_BASE}/complaints/${id}/assign`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateRelation: async (id, data) => {
    const res = await fetch(`${API_BASE}/complaints/${id}/relation`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  requestMoreInfo: async (id, instructions) => {
    const res = await fetch(`${API_BASE}/complaints/${id}/request-info`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ instructions })
    });
    return res.json();
  },

  provideMoreInfo: async (id, data) => {
    const res = await fetch(`${API_BASE}/complaints/${id}/provide-info`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Analytics
  getDashboardAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, { headers: getHeaders() });
    return res.json();
  },

  // Reviews
  getReviews: async () => {
    const res = await fetch(`${API_BASE}/reviews`, { headers: getHeaders() });
    return res.json();
  },

  submitReview: async (data) => {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch(`${API_BASE}/notifications`, { headers: getHeaders() });
    return res.json();
  },

  markNotificationRead: async (id) => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return res.json();
  },

  // Audit
  getAuditLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/audit${query ? '?' + query : ''}`, { headers: getHeaders() });
    return res.json();
  }
};

