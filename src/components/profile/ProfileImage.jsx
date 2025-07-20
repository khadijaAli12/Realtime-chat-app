// src/components/profile/ProfileImage.jsx
import React, { useState } from 'react';

const ProfileImage = ({ 
  src, 
  alt, 
  size = 40, 
  className = '',
  isOnline = false,
  name = '',
  showInitials = true 
}) => {
  const [hasError, setHasError] = useState(false);

  const generateInitialAvatar = (displayName) => {
    if (!displayName || !displayName.trim()) {
      return `https://ui-avatars.com/api/?name=User&size=${size * 2}&background=6b7280&color=ffffff&font-size=0.5`;
    }
    
    const nameParts = displayName.trim().split(' ');
    let initials = '';
    
    if (nameParts.length >= 2) {
      // First and last name initials
      initials = nameParts[0].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    } else {
      // Just first name - take first letter
      initials = nameParts[0].charAt(0).toUpperCase();
    }
    
    // Force initial avatar generation
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size * 2}&background=4f46e5&color=ffffff&font-size=0.5&bold=true&format=png`;
  };

  const shouldUseInitials = () => {
    return (
      hasError || 
      !src || 
      src === '' || 
      src === null || 
      src === undefined ||
      src.includes('placeholder') ||
      src.includes('via.placeholder') ||
      src.includes('default-avatar')
    );
  };

  const getImageSrc = () => {
    if (shouldUseInitials() && showInitials && name && name.trim()) {
      return generateInitialAvatar(name);
    }
    
    if (src && !shouldUseInitials()) {
      return src;
    }
    
    // Fallback
    return generateInitialAvatar(name || 'User');
  };

  const handleImageError = (e) => {
    console.log('Image error for:', src, 'falling back to initials for:', name);
    setHasError(true);
    
    if (showInitials && name && name.trim()) {
      e.target.src = generateInitialAvatar(name);
    } else {
      e.target.src = `https://ui-avatars.com/api/?name=User&size=${size * 2}&background=6b7280&color=ffffff&font-size=0.5`;
    }
  };

  const handleImageLoad = () => {
    // Reset error state if image loads successfully
    if (hasError && src && !src.includes('ui-avatars.com')) {
      setHasError(false);
    }
  };

  return (
    <div 
      className={`profile-image-container ${className}`} 
      style={{ 
        width: size, 
        height: size, 
        position: 'relative',
        display: 'inline-block'
      }}
    >
      <img
        src={getImageSrc()}
        alt={alt || name || 'Profile'}
        className="profile-image"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid var(--border-light)',
          display: 'block'
        }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
      {isOnline && (
        <span 
          className="online-status"
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: `${Math.max(size * 0.25, 10)}px`,
            height: `${Math.max(size * 0.25, 10)}px`,
            backgroundColor: '#10b981',
            border: '2px solid white',
            borderRadius: '50%',
            zIndex: 1
          }}
        />
      )}
    </div>
  );
};

export default ProfileImage;
