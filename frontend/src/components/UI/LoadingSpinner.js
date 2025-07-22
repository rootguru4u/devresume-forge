import React from 'react';
import clsx from 'clsx';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '', 
  text = '',
  fullScreen = false 
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6', 
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'border-primary-600',
    white: 'border-white',
    gray: 'border-gray-600',
    success: 'border-success-600',
    warning: 'border-warning-600',
    danger: 'border-danger-600'
  };

  const spinner = (
    <div className={clsx(
      'animate-spin rounded-full border-2 border-t-transparent',
      sizeClasses[size],
      colorClasses[color],
      className
    )}></div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          {spinner}
          {text && (
            <p className="mt-4 text-gray-600 font-medium">{text}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      'flex items-center justify-center',
      text ? 'flex-col space-y-2' : ''
    )}>
      {spinner}
      {text && (
        <p className="text-sm text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 