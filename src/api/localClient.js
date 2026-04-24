// Local API client to replace Base44
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'http://YOUR_IP:3015/api'  // ← החלף ב-IP או דומיין שלך
  : 'http://localhost:3015/api';

class LocalAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Entity operations
  async get(entity, id) {
    return this.request(`/${entity}/${id}`);
  }

  async find(entity, query = {}) {
    const params = new URLSearchParams(query);
    return this.request(`/${entity}?${params}`);
  }

  async create(entity, data) {
    return this.request(`/${entity}`, {
      method: 'POST',
      body: data,
    });
  }

  async update(entity, id, data) {
    return this.request(`/${entity}/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async delete(entity, id) {
    return this.request(`/${entity}/${id}`, {
      method: 'DELETE',
    });
  }

  // Auth operations (simplified)
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // File upload
  async upload(file) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }
}

export const localAPI = new LocalAPI();
export default localAPI;
