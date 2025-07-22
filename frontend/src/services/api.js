import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add correlation ID for tracking
    config.headers['X-Correlation-ID'] = generateCorrelationId();
    
    // Log request in development
    if (process.env.REACT_APP_ENABLE_DEBUG === 'true') {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        headers: config.headers,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.REACT_APP_ENABLE_DEBUG === 'true') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    
    return response;
  },
  (error) => {
    const message = error.response?.data?.error?.message || error.response?.data?.error || error.message || 'An error occurred';
    
    // Handle different error types
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      if (!error.config?.skipAuthToast) {
        toast.error('Session expired. Please log in again.');
      }
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      toast.error('Access denied. You don\'t have permission to perform this action.');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found');
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please try again later.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      toast.error('Network error. Please check your connection.');
    } else if (!error.config?.skipErrorToast) {
      toast.error(message);
    }
    
    console.error('❌ API Error:', {
      status: error.response?.status,
      message,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
    });
    
    return Promise.reject(error);
  }
);

// Helper functions
const generateCorrelationId = () => {
  return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Authentication API
export const authApi = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // User login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success && response.data.data.tokens) {
      localStorage.setItem('authToken', response.data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // User logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Refresh access token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/auth/refresh', 
      { refreshToken },
      { skipAuthToast: true }
    );
    
    if (response.data.success && response.data.data.tokens) {
      localStorage.setItem('authToken', response.data.data.tokens.accessToken);
      if (response.data.data.tokens.refreshToken) {
        localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
      }
    }
    
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    if (response.data.success && response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },
};

// Resume API
export const resumeApi = {
  // Get all user resumes
  getResumes: async (params = {}) => {
    const response = await api.get('/resumes', { params });
    return response.data;
  },

  // Get single resume by ID
  getResume: async (id) => {
    const response = await api.get(`/resumes/${id}`);
    return response.data;
  },

  // Create new resume
  createResume: async (resumeData) => {
    const response = await api.post('/resumes', resumeData);
    return response.data;
  },

  // Update resume
  updateResume: async (id, updates) => {
    const response = await api.put(`/resumes/${id}`, updates);
    return response.data;
  },

  // Delete resume
  deleteResume: async (id) => {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
  },

  // Clone resume
  cloneResume: async (id) => {
    const response = await api.post(`/resumes/${id}/clone`);
    return response.data;
  },

  // Export resume as PDF
  exportPDF: async (id, options = {}) => {
    const response = await api.post(
      `/resumes/${id}/export/pdf`,
      options,
      {
        responseType: 'blob',
        timeout: 30000, // 30 seconds for PDF generation
      }
    );
    return response;
  },

  // Get resume preview
  getPreview: async (id, options = {}) => {
    const response = await api.get(`/resumes/${id}/preview`, { params: options });
    return response.data;
  },

  // Update resume status
  updateStatus: async (id, status) => {
    const response = await api.patch(`/resumes/${id}/status`, { status });
    return response.data;
  },

  // Get resume analytics
  getAnalytics: async (id) => {
    const response = await api.get(`/resumes/${id}/analytics`);
    return response.data;
  },
};

// Templates API
export const templatesApi = {
  // Get all templates
  getTemplates: async () => {
    const response = await api.get('/templates');
    return response.data;
  },

  // Get template by ID
  getTemplate: async (id) => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },

  // Create resume from template
  createFromTemplate: async (templateId, resumeData) => {
    const response = await api.post(`/templates/${templateId}/create`, resumeData);
    return response.data;
  },
};

// File Upload API
export const uploadApi = {
  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });
    return response.data;
  },

  // Upload resume attachment
  uploadAttachment: async (file, resumeId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('resumeId', resumeId);
    
    const response = await api.post('/upload/attachment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });
    return response.data;
  },

  // Delete uploaded file
  deleteFile: async (fileId) => {
    const response = await api.delete(`/upload/file/${fileId}`);
    return response.data;
  },
};

// Health API
export const healthApi = {
  // Basic health check
  getHealth: async () => {
    const response = await api.get('/health', { skipErrorToast: true });
    return response.data;
  },

  // Detailed health check
  getDetailedHealth: async () => {
    const response = await api.get('/health/detailed', { skipErrorToast: true });
    return response.data;
  },
};

// Utility functions
export const apiUtils = {
  // Check if API is reachable
  checkConnection: async () => {
    try {
      await healthApi.getHealth();
      return true;
    } catch (error) {
      return false;
    }
  },

  // Format API error message
  formatError: (error) => {
    if (error.response?.data?.error?.message) {
      return error.response.data.error.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  // Create abort controller for canceling requests
  createAbortController: () => new AbortController(),

  // Download file helper
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Validate file type
  validateFileType: (file, allowedTypes) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = allowedTypes.split(',').map(type => type.trim().toLowerCase());
    return allowedExtensions.includes(fileExtension);
  },

  // Validate file size
  validateFileSize: (file, maxSize) => {
    return file.size <= maxSize;
  },
};

export default api; 