import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  headerActions,
  footer,
  className = '',
  hoverable = false,
  shadow = 'medium', // none, small, medium, large
  padding = 'default' // none, small, default, large
}) => {
  const shadowClasses = {
    none: '',
    small: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg'
  };

  const paddingClasses = {
    none: '',
    small: 'p-3',
    default: 'p-6',
    large: 'p-8'
  };

  const hoverClasses = hoverable ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-200' : '';

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${shadowClasses[shadow]} ${hoverClasses} ${className}`}>
      {/* Header */}
      {(title || subtitle || headerActions) && (
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className={paddingClasses[padding]}>
        {children}
      </div>
      
      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 