import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

// Clients API
export const clientsApi = {
  getAll: (params) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
}

// Matters API
export const mattersApi = {
  getAll: (params) => api.get('/matters', { params }),
  getById: (id) => api.get(`/matters/${id}`),
  create: (data) => api.post('/matters', data),
  update: (id, data) => api.put(`/matters/${id}`, data),
  delete: (id) => api.delete(`/matters/${id}`),
}

// Time Entries API
export const timeEntriesApi = {
  getAll: (params) => api.get('/time-entries', { params }),
  create: (data) => api.post('/time-entries', data),
  update: (id, data) => api.put(`/time-entries/${id}`, data),
  delete: (id) => api.delete(`/time-entries/${id}`),
}

// Invoices API
export const invoicesApi = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  send: (id) => api.post(`/invoices/${id}/send`),
  markPaid: (id) => api.post(`/invoices/${id}/pay`),
}

// Tasks API
export const tasksApi = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
}

// Documents API
export const documentsApi = {
  getAll: (params) => api.get('/documents', { params }),
  upload: (formData) => api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/documents/${id}`),
}

// Communications API
export const communicationsApi = {
  getAll: (params) => api.get('/communications', { params }),
  create: (data) => api.post('/communications', data),
  update: (id, data) => api.put(`/communications/${id}`, data),
  delete: (id) => api.delete(`/communications/${id}`),
}

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getActivities: () => api.get('/dashboard/activities'),
}

// Reports API
export const reportsApi = {
  getRevenueByPracticeArea: () => api.get('/reports/revenue-by-practice-area'),
  getRevenueByClient: () => api.get('/reports/revenue-by-client'),
  getBillableHours: () => api.get('/reports/billable-hours'),
  getAging: () => api.get('/reports/aging'),
}

// Conflicts API
export const conflictsApi = {
  check: (name) => api.post('/conflicts/check', { name }),
  getHistory: () => api.get('/conflicts/history'),
}

export default api
