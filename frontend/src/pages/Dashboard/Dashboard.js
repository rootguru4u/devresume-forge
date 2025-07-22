import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useResume } from '../../contexts/ResumeContext';
import { 
  Plus, 
  FileText, 
  Download, 
  Eye, 
  Edit3,
  TrendingUp,
  Clock
} from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const { resumes, loading, fetchResumes } = useResume();

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const recentResumes = resumes.slice(0, 3);
  const totalViews = resumes.reduce((sum, resume) => sum + (resume.stats?.views || 0), 0);
  const totalDownloads = resumes.reduce((sum, resume) => sum + (resume.stats?.downloads || 0), 0);

  const stats = [
    {
      name: 'Total Resumes',
      value: resumes.length,
      icon: FileText,
      color: 'primary',
      change: '+2 this month'
    },
    {
      name: 'Total Views',
      value: totalViews,
      icon: Eye,
      color: 'success',
      change: '+12% from last month'
    },
    {
      name: 'Downloads',
      value: totalDownloads,
      icon: Download,
      color: 'warning',
      change: '+5 this week'
    },
    {
      name: 'Completion Rate',
      value: '85%',
      icon: TrendingUp,
      color: 'primary',
      change: 'Average across resumes'
    }
  ];

  if (loading && resumes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your resumes today.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Ready to build your next resume?
            </h2>
            <p className="text-gray-600">
              Create a new resume or continue working on an existing one.
            </p>
          </div>
          <Link
            to="/app/resumes/new"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Resume
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-gray-600 mb-2">
                {stat.name}
              </p>
              <p className="text-xs text-gray-500">
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Resumes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Resumes
                </h3>
                <Link
                  to="/app/resumes"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {resumes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    No resumes yet
                  </h4>
                  <p className="text-gray-600 mb-6">
                    Get started by creating your first resume.
                  </p>
                  <Link
                    to="/app/resumes/new"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Resume
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentResumes.map((resume) => (
                    <div
                      key={resume._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {resume.title}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {format(new Date(resume.updatedAt), 'MMM d, yyyy')}
                            </span>
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {resume.stats?.views || 0} views
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/app/resumes/${resume._id}/edit`}
                          className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/app/resumes/${resume._id}/preview`}
                          className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links & Tips */}
        <div className="space-y-6">
          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                to="/app/resumes/new"
                className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 mr-3 text-primary-600" />
                Create New Resume
              </Link>
              <Link
                to="/app/templates"
                className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <FileText className="w-5 h-5 mr-3 text-primary-600" />
                Browse Templates
              </Link>
              <Link
                to="/app/profile"
                className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Edit3 className="w-5 h-5 mr-3 text-primary-600" />
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              💡 Resume Tips
            </h3>
            <div className="space-y-3 text-sm">
              <p className="text-gray-700">
                • Keep your resume to 1-2 pages for most positions
              </p>
              <p className="text-gray-700">
                • Use action verbs to describe your achievements
              </p>
              <p className="text-gray-700">
                • Tailor your resume for each job application
              </p>
              <p className="text-gray-700">
                • Include relevant keywords from the job posting
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 