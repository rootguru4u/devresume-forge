import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ResumeProvider } from './contexts/ResumeContext';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import Dashboard from './pages/Dashboard/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder/ResumeBuilder';
import ResumeList from './pages/Resume/ResumeList';
import ResumePreview from './pages/Resume/ResumePreview';
import Templates from './pages/Templates/Templates';
import Profile from './pages/Profile/Profile';
import NotFound from './pages/NotFound';

// Styles
import './index.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ResumeProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected Routes with Layout */}
                <Route path="/app" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  {/* Dashboard */}
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  
                  {/* Resume Management */}
                  <Route path="resumes" element={<ResumeList />} />
                  <Route path="resumes/new" element={<ResumeBuilder />} />
                  <Route path="resumes/:id/edit" element={<ResumeBuilder />} />
                  <Route path="resumes/:id/preview" element={<ResumePreview />} />
                  
                  {/* Templates */}
                  <Route path="templates" element={<Templates />} />
                  
                  {/* Profile */}
                  <Route path="profile" element={<Profile />} />
                </Route>

                {/* Public Resume Preview (shared links) */}
                <Route path="/resume/:id" element={<ResumePreview isPublic />} />
                
                {/* Fallback Routes */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>

              {/* Global Toast Notifications */}
              <Toaster
                position="top-right"
                gutter={8}
                containerClassName="toast-container"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                    fontSize: '14px',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    maxWidth: '400px',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                    style: {
                      background: '#065f46',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                    style: {
                      background: '#991b1b',
                    },
                  },
                  loading: {
                    duration: Infinity,
                    iconTheme: {
                      primary: '#3b82f6',
                      secondary: '#fff',
                    },
                    style: {
                      background: '#1e40af',
                    },
                  },
                }}
              />

              {/* Development Tools */}
              {process.env.REACT_APP_SHOW_DEV_TOOLS === 'true' && process.env.NODE_ENV === 'development' && (
                <div className="fixed bottom-4 left-4 z-50">
                  <div className="bg-gray-800 text-white px-3 py-2 rounded-lg text-xs font-mono">
                    <div>ENV: {process.env.REACT_APP_ENVIRONMENT}</div>
                    <div>API: {process.env.REACT_APP_API_URL}</div>
                    <div>Version: {process.env.REACT_APP_VERSION}</div>
                  </div>
                </div>
              )}
            </div>
          </Router>
        </ResumeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App; 