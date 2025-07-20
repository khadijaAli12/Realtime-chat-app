// src/components/profile/ProfileImage.jsx
import React from 'react';

const ProfileImage = ({ 
  src, 
  alt, 
  size = 40, 
  className = '',
  isOnline = false 
}) => {
  return (
    <div className={`position-relative ${className}`} style={{ width: size, height: size }}>
      <img
        src={src || '/default-avatar.png'}
        alt={alt}
        className="rounded-circle w-100 h-100"
        style={{ objectFit: 'cover' }}
      />
      {isOnline && (
        <span 
          className="position-absolute bg-success rounded-circle border border-white"
          style={{
            width: '12px',
            height: '12px',
            bottom: '0',
            right: '0'
          }}
        />
      )}
    </div>
  );
};

export default ProfileImage;
