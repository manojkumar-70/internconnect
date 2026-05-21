import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('🌐 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('📤 API Request:', {
    method: config.method,
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
  });
  return config;
});

// Log responses
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  registerStudent: (data) => api.post('/auth/student/register', data),
  loginStudent: (data) => api.post('/auth/student/login', data),
  registerCompany: (data) => api.post('/auth/company/register', data),
  loginCompany: (data) => api.post('/auth/company/login', data),
  loginAdmin: (data) => api.post('/auth/admin/login', data),
};

// Student API
export const studentAPI = {
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  searchBySkills: (skills) => api.get('/students/search', { params: { skills } }),
  getApplications: () => api.get('/students/applications'),
};

// Company API
export const companyAPI = {
  getProfile: () => api.get('/companies/profile'),
  updateProfile: (data) => api.put('/companies/profile', data),
  getInternships: () => api.get('/companies/internships'),
};

// Internship API
export const internshipAPI = {
  getAll: (filters) => api.get('/internships', { params: filters }),
  getById: (id) => api.get(`/internships/${id}`),
  create: (data) => api.post('/internships', data),
  update: (id, data) => api.put(`/internships/${id}`, data),
  close: (id) => api.put(`/internships/${id}/close`),
};

// Application API
export const applicationAPI = {
  apply: (data) => api.post('/applications', data),
  getStudentApplications: () => api.get('/applications/student/applications'),
  getInternshipApplications: (internshipId) =>
    api.get(`/applications/${internshipId}/applications`),
  accept: (id) => api.put(`/applications/${id}/accept`),
  reject: (id, data) => api.put(`/applications/${id}/reject`, data),
};

// Task API
export const taskAPI = {
  getAll: (filters) => api.get('/tasks', { params: filters }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  submit: (id, data) => api.post(`/tasks/${id}/submit`, data),
  review: (id, submissionId, data) =>
    api.put(`/tasks/${id}/submission/${submissionId}/review`, data),
};

// Team API
export const teamAPI = {
  getAll: () => api.get('/teams'),
  create: (data) => api.post('/teams', data),
  getCompanyTeams: () => api.get('/teams/company/teams'),
  accept: (id) => api.put(`/teams/${id}/accept`),
};

// Rating API
export const ratingAPI = {
  create: (data) => api.post('/ratings', data),
  getRatings: (userId, userType) => api.get(`/ratings/${userId}/${userType}`),
  getSummary: (userId, userType) => api.get(`/ratings/${userId}/${userType}/summary`),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/stats'),
  getStudents: () => api.get('/admin/students'),
  removeStudent: (id) => api.delete(`/admin/students/${id}`),
  getCompanies: () => api.get('/admin/companies'),
  updateCompanyVerification: (id, data) =>
    api.put(`/admin/companies/${id}/verify`, data),
  getApplicationStats: () => api.get('/admin/applications/stats'),
};

export default api;
