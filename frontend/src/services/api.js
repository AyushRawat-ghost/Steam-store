const API_BASE_URL = '/api/v1';

/**
 * Custom fetch wrapper with automatic JWT token attachment and error parsing
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('steam_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const authApi = {
  // POST /api/v1/auth/register
  register: (payload) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // POST /api/v1/auth/login
  login: (credentials) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // GET /api/v1/auth/me (Protected)
  getMe: () => {
    return request('/auth/me', {
      method: 'GET',
    });
  },

  // 👑 Admin Endpoints
  // GET /api/v1/admin/developers/pending
  getPendingDevelopers: () => {
    return request('/admin/developers/pending', {
      method: 'GET',
    });
  },

  // PATCH /api/v1/admin/developers/:id/verify
  verifyDeveloper: (id) => {
    return request(`/admin/developers/${id}/verify`, {
      method: 'PATCH',
    });
  },
};
