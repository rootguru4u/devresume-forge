import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResume } from '../../contexts/ResumeContext';
import { 
  Save, 
  Eye, 
  Download, 
  Settings, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award,
  Plus,
  ArrowLeft
} from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const ResumeBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentResume, loading, createResume, updateResume, loadResume, setCurrentResume } = useResume();
  const [activeSection, setActiveSection] = useState('personal');
  const [formData, setFormData] = useState({
    title: '',
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  });

  const isEditing = Boolean(id && id !== 'new');

  useEffect(() => {
    if (isEditing) {
      loadResume(id);
    } else {
      // Create new resume
      setCurrentResume(null);
      setFormData({
        title: 'My Resume',
        personalInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          location: '',
          linkedin: '',
          website: ''
        },
        summary: '',
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: []
      });
    }
  }, [id, isEditing]);

  useEffect(() => {
    if (currentResume && isEditing) {
      setFormData({
        title: currentResume.title || '',
        personalInfo: currentResume.personalInfo || {},
        summary: currentResume.summary || '',
        experience: currentResume.experience || [],
        education: currentResume.education || [],
        skills: currentResume.skills || [],
        projects: currentResume.projects || [],
        certifications: currentResume.certifications || []
      });
    }
  }, [currentResume, isEditing]);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleDirectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        await updateResume(id, formData);
      } else {
        const result = await createResume(formData);
        if (result.success) {
          navigate(`/app/resumes/${result.resume._id}/edit`);
        }
      }
    } catch (error) {
      // Save failed - error handling could be added here
    }
  };

  const sections = [
    { id: 'personal', name: 'Personal Info', icon: User },
    { id: 'summary', name: 'Summary', icon: User },
    { id: 'experience', name: 'Experience', icon: Briefcase },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'skills', name: 'Skills', icon: Award },
    { id: 'projects', name: 'Projects', icon: Settings },
    { id: 'certifications', name: 'Certifications', icon: Award }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.firstName || ''}
                  onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.lastName || ''}
                  onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.personalInfo.email || ''}
                  onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="john.doe@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.personalInfo.phone || ''}
                  onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.location || ''}
                  onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="New York, NY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={formData.personalInfo.linkedin || ''}
                  onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.personalInfo.website || ''}
                  onChange={(e) => handleInputChange('personalInfo', 'website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://johndoe.com"
                />
              </div>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Summary
              </label>
              <textarea
                rows={6}
                value={formData.summary || ''}
                onChange={(e) => handleDirectChange('summary', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Write a brief professional summary that highlights your key strengths, experience, and career objectives..."
              />
              <p className="text-sm text-gray-500 mt-1">
                2-3 sentences that summarize your professional background and goals.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {sections.find(s => s.id === activeSection)?.name} Section
            </h3>
            <p className="text-gray-600">
              This section is under development. You can add your {activeSection} information here.
            </p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading resume builder..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/app/resumes')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleDirectChange('title', e.target.value)}
                  className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
                  placeholder="Resume Title"
                />
                <p className="text-sm text-gray-500">
                  {isEditing ? 'Editing resume' : 'Creating new resume'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume Sections</h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <section.icon className="w-5 h-5 mr-3" />
                    {section.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {renderSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder; 