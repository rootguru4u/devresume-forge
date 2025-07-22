import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useResume } from '../../contexts/ResumeContext';
import { 
  FileText, 
  Eye, 
  Download, 
  Star, 
  Search, 
  Filter,
  Grid,
  List,
  Crown,
  Check
} from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Templates = () => {
  const { templates, loading } = useResume();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Placeholder templates data
  const mockTemplates = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean and professional template perfect for corporate roles',
      category: 'professional',
      isPremium: false,
      rating: 4.8,
      downloads: 1234,
      preview: '/images/template-professional.jpg'
    },
    {
      id: 'modern',
      name: 'Modern Creative',
      description: 'Modern design with creative elements for design and tech roles',
      category: 'creative',
      isPremium: true,
      rating: 4.9,
      downloads: 856,
      preview: '/images/template-modern.jpg'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple and clean layout focusing on content',
      category: 'minimal',
      isPremium: false,
      rating: 4.7,
      downloads: 2341,
      preview: '/images/template-minimal.jpg'
    },
    {
      id: 'executive',
      name: 'Executive',
      description: 'Sophisticated template for senior-level positions',
      category: 'professional',
      isPremium: true,
      rating: 4.9,
      downloads: 567,
      preview: '/images/template-executive.jpg'
    },
    {
      id: 'academic',
      name: 'Academic CV',
      description: 'Comprehensive layout for academic and research positions',
      category: 'academic',
      isPremium: false,
      rating: 4.6,
      downloads: 789,
      preview: '/images/template-academic.jpg'
    },
    {
      id: 'tech',
      name: 'Tech Stack',
      description: 'Developer-focused template with skills showcase',
      category: 'tech',
      isPremium: true,
      rating: 4.8,
      downloads: 1123,
      preview: '/images/template-tech.jpg'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'professional', name: 'Professional' },
    { id: 'creative', name: 'Creative' },
    { id: 'minimal', name: 'Minimal' },
    { id: 'academic', name: 'Academic' },
    { id: 'tech', name: 'Technology' }
  ];

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (templateId) => {
    // This would typically create a new resume with the selected template
    // templateId will be used to initialize the resume
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Templates</h1>
        <p className="text-gray-600">
          Choose from our collection of professional, ATS-friendly resume templates
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
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

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" text="Loading templates..." />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-6'
        }>
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all ${
                viewMode === 'list' ? 'p-4' : 'overflow-hidden'
              }`}
            >
              {viewMode === 'grid' ? (
                // Grid View
                <>
                  {/* Template Preview */}
                  <div className="relative bg-gray-100 aspect-[3/4] p-4">
                    <div className="w-full h-full bg-white rounded shadow-sm flex items-center justify-center">
                      <FileText className="w-16 h-16 text-gray-300" />
                    </div>
                    {template.isPremium && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        {template.rating}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {template.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {template.downloads.toLocaleString()} downloads
                      </span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {categories.find(c => c.id === template.category)?.name}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        <Eye className="w-4 h-4 mr-1 inline" />
                        Preview
                      </button>
                      <Link
                        to={`/app/resumes/new?template=${template.id}`}
                        className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm text-center"
                      >
                        Use Template
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                // List View
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-24 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    <FileText className="w-8 h-8 text-gray-300" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {template.name}
                        {template.isPremium && (
                          <Crown className="w-4 h-4 text-yellow-500 ml-2 inline" />
                        )}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        {template.rating}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                      {template.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Download className="w-3 h-3 mr-1" />
                          {template.downloads.toLocaleString()}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 rounded-full">
                          {categories.find(c => c.id === template.category)?.name}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm">
                          Preview
                        </button>
                        <Link
                          to={`/app/resumes/new?template=${template.id}`}
                          className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors text-sm"
                        >
                          Use
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Premium Upsell */}
      <div className="mt-12 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unlock Premium Templates
            </h3>
            <p className="text-gray-600">
              Get access to exclusive premium templates and advanced features
            </p>
          </div>
          <button className="inline-flex items-center px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium">
            <Crown className="w-5 h-5 mr-2" />
            Go Premium
          </button>
        </div>
      </div>
    </div>
  );
};

export default Templates; 