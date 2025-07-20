import React from 'react';

const SkeletonLoader = ({ lines = 3 }) => {
  return (
    <div className="skeleton-loader p-3">
      <div className="d-flex align-items-center mb-2">
        <div className="skeleton-circle me-3"></div>
        <div className="flex-grow-1">
          <div className="skeleton-line skeleton-line-sm mb-1"></div>
          <div className="skeleton-line skeleton-line-xs"></div>
        </div>
      </div>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="skeleton-line mb-1"></div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
