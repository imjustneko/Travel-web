import React from 'react';

const ErrorMessage = ({ 
  message = 'Something went wrong', 
  retry,
  fullPage = false 
}) => {
  const containerClass = fullPage 
    ? 'flex items-center justify-center min-h-screen' 
    : 'p-8';

  return (
    <div className={containerClass}>
      <div className="text-center max-w-md mx-auto">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-gray-600 mb-6">{message}</p>
        {retry && (
          <button
            onClick={retry}
            className="px-6 py-3 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;