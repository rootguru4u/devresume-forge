import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useResume } from '../../contexts/ResumeContext';
import { 
  Download, 
  Edit3, 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  Linkedin
} from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const ResumePreview = ({ isPublic = false }) => {
  const { id } = useParams();
  const { currentResume, loading, loadResume, exportResume } = useResume();
  const [resume, setResume] = useState(null);

  useEffect(() => {
    if (id) {
      loadResume(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentResume) {
      setResume(currentResume);
    }
  }, [currentResume]);

  const handleExport = async () => {
    if (resume) {
      await exportResume(resume._id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading resume..." />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-medium text-gray-900 mb-2">Resume not found</h2>
        <p className="text-gray-600 mb-6">The resume you're looking for doesn't exist or has been deleted.</p>
        <Link
          to="/app/resumes"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resumes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {!isPublic && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link
                  to="/app/resumes"
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{resume.title}</h1>
                  <p className="text-sm text-gray-500">Preview</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  to={`/app/resumes/${resume._id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Link>
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="resume-paper bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8 border-b border-gray-200 pb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {resume.personalInfo?.firstName} {resume.personalInfo?.lastName}
              </h1>
              
              <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-600">
                {resume.personalInfo?.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {resume.personalInfo.email}
                  </div>
                )}
                {resume.personalInfo?.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {resume.personalInfo.phone}
                  </div>
                )}
                {resume.personalInfo?.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {resume.personalInfo.location}
                  </div>
                )}
                {resume.personalInfo?.linkedin && (
                  <div className="flex items-center">
                    <Linkedin className="w-4 h-4 mr-1" />
                    LinkedIn
                  </div>
                )}
                {resume.personalInfo?.website && (
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    Website
                  </div>
                )}
              </div>
            </div>

            {/* Professional Summary */}
            {resume.summary && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                  Professional Summary
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {resume.summary}
                </p>
              </div>
            )}

            {/* Experience */}
            {resume.experience && resume.experience.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-1">
                  Professional Experience
                </h2>
                <div className="space-y-6">
                  {resume.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-primary-200 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {exp.title || 'Position Title'}
                          </h3>
                          <p className="text-primary-600 font-medium">
                            {exp.company || 'Company Name'}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {exp.startDate || 'Start'} - {exp.endDate || exp.current ? 'Present' : 'End'}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="text-gray-700 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resume.education && resume.education.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-1">
                  Education
                </h2>
                <div className="space-y-4">
                  {resume.education.map((edu, index) => (
                    <div key={index} className="border-l-2 border-primary-200 pl-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {edu.degree || 'Degree'}
                          </h3>
                          <p className="text-primary-600 font-medium">
                            {edu.institution || 'Institution'}
                          </p>
                          {edu.gpa && (
                            <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {edu.graduationDate || 'Year'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {resume.skills && resume.skills.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-1">
                  Skills
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {resume.skills.map((skill, index) => (
                    <div key={index} className="bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">
                        {skill.name || skill}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {resume.projects && resume.projects.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-1">
                  Projects
                </h2>
                <div className="space-y-4">
                  {resume.projects.map((project, index) => (
                    <div key={index} className="border-l-2 border-primary-200 pl-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {project.name || 'Project Name'}
                      </h3>
                      {project.description && (
                        <p className="text-gray-700 leading-relaxed">
                          {project.description}
                        </p>
                      )}
                      {project.technologies && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.technologies.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {resume.certifications && resume.certifications.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-1">
                  Certifications
                </h2>
                <div className="space-y-3">
                  {resume.certifications.map((cert, index) => (
                    <div key={index} className="border-l-2 border-primary-200 pl-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {cert.name || 'Certification Name'}
                          </h3>
                          <p className="text-primary-600 font-medium">
                            {cert.issuer || 'Issuing Organization'}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {cert.date || 'Date'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer for public view */}
        {isPublic && (
          <div className="text-center mt-8 p-4 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600 mb-4">
              This resume was created with DevResume Forge
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Your Resume
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview; 