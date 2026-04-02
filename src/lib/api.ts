import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mapigolink-web-backend.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = Cookies.get('refresh_token');
        const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh });
        Cookies.set('access_token', data.access, { expires: 1 });
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login/', { email, password }),
  register: (data: object) => api.post('/auth/register/', data),
  logout: (refresh: string) => api.post('/auth/logout/', { refresh }),
  profile: () => api.get('/auth/profile/'),
  updateProfile: (data: object) => api.patch('/auth/profile/', data),
  changePassword: (data: object) => api.post('/auth/change-password/', data),
  users: (params?: object) => api.get('/auth/users/', { params }),
};

// ── Patients ──────────────────────────────────────────
export const patientsApi = {
  list: (params?: object) => api.get('/patients/', { params }),
  get: (id: string) => api.get(`/patients/${id}/`),
  getByMapigoId: (mapigo_id: string) => api.get(`/patients/qr/${mapigo_id}/`),
  create: (data: object) => api.post('/patients/', data),
  update: (id: string, data: object) => api.patch(`/patients/${id}/`, data),
  delete: (id: string) => api.delete(`/patients/${id}/`),
  scan: (mapigo_id: string) => api.post('/patients/scan/', { mapigo_id }),
  regenerateQr: (id: string) => api.post(`/patients/${id}/regenerate-qr/`),
};

// ── Records ──────────────────────────────────────────
export const recordsApi = {
  list: (params?: object) => api.get('/records/', { params }),
  get: (id: string) => api.get(`/records/${id}/`),
  create: (data: object) => api.post('/records/', data),
  update: (id: string, data: object) => api.patch(`/records/${id}/`, data),
  delete: (id: string) => api.delete(`/records/${id}/`),
  forPatient: (patientId: string) => api.get(`/records/patient/${patientId}/`),
  uploadAttachment: (data: FormData) =>
    api.post('/records/attachments/upload/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  accessLogs: (params?: object) => api.get('/records/access-logs/', { params }),
};

// ── Clinics ──────────────────────────────────────────
export const clinicsApi = {
  list: (params?: object) => api.get('/clinics/', { params }),
  get: (id: string) => api.get(`/clinics/${id}/`),
  create: (data: object) => api.post('/clinics/', data),
  update: (id: string, data: object) => api.patch(`/clinics/${id}/`, data),
  delete: (id: string) => api.delete(`/clinics/${id}/`),
  verify: (id: string) => api.post(`/clinics/${id}/verify/`),
  staff: (clinicId: string) => api.get(`/clinics/${clinicId}/staff/`),
  addStaff: (clinicId: string, data: object) => api.post(`/clinics/${clinicId}/staff/`, data),
};

// ── Dashboard ─────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get('/dashboard/stats/'),
  patientGrowth: () => api.get('/dashboard/patient-growth/'),
  recordActivity: () => api.get('/dashboard/record-activity/'),
  topClinics: () => api.get('/dashboard/top-clinics/'),
  recentActivity: () => api.get('/dashboard/recent-activity/'),
};

export default api;
