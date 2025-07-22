import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/app"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Link>
          
          <div>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>
            If you believe this is an error, please{' '}
            <a href="mailto:support@devresumeforge.com" className="text-primary-600 hover:text-primary-500">
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 