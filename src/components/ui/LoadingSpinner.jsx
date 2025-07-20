// src/components/ui/LoadingSpinner.jsx
import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ 
  variant = 'primary', 
  size = 'lg', 
  className = '', 
  text = 'Loading...' 
}) => {
  return (
    <div className={`d-flex flex-column align-items-center justify-content-center p-4 ${className}`}>
      <Spinner animation="border" variant={variant} size={size} />
      {text && <div className="mt-2 text-muted">{text}</div>}
    </div>
  );
};

export default LoadingSpinner;
