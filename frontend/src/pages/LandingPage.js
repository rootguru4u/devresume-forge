import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Eye, 
  Zap, 
  Shield, 
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: FileText,
      title: "Professional Templates",
      description: "Choose from beautiful, ATS-friendly resume templates designed by experts."
    },
    {
      icon: Eye,
      title: "Live Preview",
      description: "See your resume update in real-time as you make changes."
    },
    {
      icon: Download,
      title: "PDF Export",
      description: "Download your resume as a high-quality PDF ready for job applications."
    },
    {
      icon: Zap,
      title: "Quick & Easy",
      description: "Build a professional resume in minutes, not hours."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and never shared with third parties."
    },
    {
      icon: Star,
      title: "ATS Optimized",
      description: "Our templates are optimized for Applicant Tracking Systems."
    }
  ];

  const benefits = [
    "No hidden fees or subscriptions",
    "Unlimited resume downloads",
    "Professional formatting",
    "Mobile-friendly editor",
    "Cloud storage included",
    "Expert-designed layouts"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-primary-50 via-white to-primary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">DevResume Forge</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-primary-50 via-white to-primary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Build Your
                <span className="text-primary-600"> Perfect Resume</span>
                <br />
                In Minutes
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Create professional, ATS-friendly resumes with our intuitive builder. 
                Choose from expert-designed templates and export as PDF.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  Start Building Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Free to use • No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our resume builder combines powerful features with an intuitive interface 
              to help you create standout resumes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose DevResume Forge?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of job seekers who have successfully landed their dream jobs 
                using our professional resume builder.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Link
                  to="/register"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  Get Started Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8">
                <div className="bg-white rounded-xl shadow-xl p-6 transform rotate-3 hover:rotate-0 transition-transform">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-100 rounded mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded mb-4"></div>
                  <div className="h-3 bg-primary-200 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build Your Professional Resume?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have created stunning resumes with DevResume Forge.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 transition-colors"
          >
            Start Building For Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">DevResume Forge</h3>
            <p className="text-gray-400 mb-6">
              Build professional resumes that get you hired.
            </p>
            <div className="flex justify-center space-x-6">
              <Link to="/login" className="text-gray-400 hover:text-white">
                Login
              </Link>
              <Link to="/register" className="text-gray-400 hover:text-white">
                Register
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-gray-400 text-sm">
                © 2024 DevResume Forge. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 