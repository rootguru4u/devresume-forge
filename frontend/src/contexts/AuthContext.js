import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await authApi.getProfile();
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      // Auth check failed
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authApi.login({ email, password });
      const { user: userData, token, refreshToken } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${userData.firstName}!`);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authApi.register(userData);
      const { user: newUser, token, refreshToken } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      setUser(newUser);
      setIsAuthenticated(true);
      toast.success(`Welcome to DevResume Forge, ${newUser.firstName}!`);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Logout error handled silently
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await authApi.updateProfile(profileData);
      const updatedUser = response.data.user;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully');
      
      return { success: true, user: updatedUser };
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 