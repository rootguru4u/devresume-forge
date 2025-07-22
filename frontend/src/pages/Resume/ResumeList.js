import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useResume } from '../../contexts/ResumeContext';
import { 
  Plus, 
  FileText, 
  Edit3, 
  Eye, 
  Download, 
  Copy, 
  Trash2, 
  Search,
  Filter,
  Grid,
  List,
  Clock
} from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { format } from 'date-fns';

const ResumeList = () => {
  const { resumes, loading, fetchResumes, deleteResume, cloneResume, exportResume } = useResume();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ open: false, resume: null });

  useEffect(() => {
    fetchResumes();
  }, []);

  const filteredResumes = resumes.filter(resume => {
    const matchesSearch = resume.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || resume.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (resume) => {
    setDeleteModal({ open: true, resume });
  };

  const confirmDelete = async () => {
    if (deleteModal.resume) {
      await deleteResume(deleteModal.resume._id);
      setDeleteModal({ open: false, resume: null });
    }
  };

  const handleClone = async (resumeId) => {
    await cloneResume(resumeId);
  };

  const handleExport = async (resumeId) => {
    await exportResume(resumeId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800';
      case 'draft':
        return 'bg-warning-100 text-warning-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && resumes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading resumes..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Resumes</h1>
          <p className="text-gray-600">Manage and organize all your resumes</p>
        </div>
        <Link
          to="/app/resumes/new"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Resume
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search resumes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Resumes Grid/List */}
      {filteredResumes.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No resumes found' : 'No resumes yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first resume to get started'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <Link
              to="/app/resumes/new"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Resume
            </Link>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredResumes.map((resume) => (
            <div
              key={resume._id}
              className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all ${
                viewMode === 'list' ? 'p-4' : 'p-6'
              }`}
            >
              {viewMode === 'grid' ? (
                // Grid View
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary-600" />
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(resume.status)}`}>
                      {resume.status}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">
                    {resume.title}
                  </h3>
                  
                  <div className="text-sm text-gray-500 mb-4 space-y-1">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Updated {format(new Date(resume.updatedAt), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {resume.stats?.views || 0}
                      </span>
                      <span className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {resume.stats?.downloads || 0}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
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
                      <button
                        onClick={() => handleExport(resume._id)}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleClone(resume._id)}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Clone"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(resume)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // List View
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{resume.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {format(new Date(resume.updatedAt), 'MMM d, yyyy')}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(resume.status)}`}>
                          {resume.status}
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
                    <button
                      onClick={() => handleExport(resume._id)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleClone(resume._id)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      title="Clone"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(resume)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Resume
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteModal.resume?.title}"? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ open: false, resume: null })}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeList; 