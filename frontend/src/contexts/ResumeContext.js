import React, { createContext, useContext, useState, useEffect } from 'react';
import { resumeApi } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const ResumeContext = createContext();

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};

export const ResumeProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [currentResume, setCurrentResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchResumes();
      fetchTemplates();
    }
  }, [isAuthenticated]);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await resumeApi.getUserResumes();
      setResumes(response.data.resumes || []);
    } catch (error) {
      // Failed to fetch resumes
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await resumeApi.getTemplates();
      setTemplates(response.data.templates || []);
    } catch (error) {
      // Failed to fetch templates
    }
  };

  const createResume = async (resumeData) => {
    try {
      setLoading(true);
      const response = await resumeApi.createResume(resumeData);
      const newResume = response.data.resume;
      
      setResumes(prev => [newResume, ...prev]);
      setCurrentResume(newResume);
      toast.success('Resume created successfully');
      
      return { success: true, resume: newResume };
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to create resume';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const updateResume = async (resumeId, resumeData) => {
    try {
      const response = await resumeApi.updateResume(resumeId, resumeData);
      const updatedResume = response.data.resume;
      
      setResumes(prev => prev.map(resume => 
        resume._id === resumeId ? updatedResume : resume
      ));
      
      if (currentResume?._id === resumeId) {
        setCurrentResume(updatedResume);
      }
      
      return { success: true, resume: updatedResume };
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to update resume';
      return { success: false, error: message };
    }
  };

  const deleteResume = async (resumeId) => {
    try {
      setLoading(true);
      await resumeApi.deleteResume(resumeId);
      
      setResumes(prev => prev.filter(resume => resume._id !== resumeId));
      
      if (currentResume?._id === resumeId) {
        setCurrentResume(null);
      }
      
      toast.success('Resume deleted successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to delete resume';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const loadResume = async (resumeId) => {
    try {
      setLoading(true);
      const response = await resumeApi.getResume(resumeId);
      const resume = response.data.resume;
      setCurrentResume(resume);
      return { success: true, resume };
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to load resume';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const cloneResume = async (resumeId) => {
    try {
      setLoading(true);
      const response = await resumeApi.cloneResume(resumeId);
      const clonedResume = response.data.resume;
      
      setResumes(prev => [clonedResume, ...prev]);
      toast.success('Resume cloned successfully');
      
      return { success: true, resume: clonedResume };
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to clone resume';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const exportResume = async (resumeId, format = 'pdf') => {
    try {
      setLoading(true);
      const response = await resumeApi.exportResume(resumeId, format);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume-${resumeId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Resume exported as ${format.toUpperCase()}`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Export failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const autoSave = (resumeId, resumeData) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(async () => {
      const result = await updateResume(resumeId, resumeData);
      if (result.success) {
        // Resume auto-saved successfully
      }
    }, parseInt(process.env.REACT_APP_AUTO_SAVE_INTERVAL) || 10000);

    setAutoSaveTimeout(timeout);
  };

  const value = {
    resumes,
    currentResume,
    loading,
    templates,
    setCurrentResume,
    fetchResumes,
    createResume,
    updateResume,
    deleteResume,
    loadResume,
    cloneResume,
    exportResume,
    autoSave
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
}; 