// src/components/ui/alert.jsx
// src/components/ui/alert.jsx
import React, { forwardRef } from 'react';

const Alert = forwardRef(({ 
  className = '', 
  variant = 'default', 
  children,
  ...props 
}, ref) => {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    destructive: 'bg-red-100 text-red-800 border-red-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

const AlertTitle = forwardRef(({ 
  className = '', 
  children,
  ...props 
}, ref) => (
  <h5
    ref={ref}
    className={`mb-1 font-medium leading-none tracking-tight ${className}`}
    {...props}
  >
    {children}
  </h5>
));

const AlertDescription = forwardRef(({ 
  className = '', 
  children,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={`text-sm opacity-90 [&_p]:leading-relaxed ${className}`}
    {...props}
  >
    {children}
  </div>
));

// Add display names for better debugging
Alert.displayName = 'Alert';
AlertTitle.displayName = 'AlertTitle';
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };