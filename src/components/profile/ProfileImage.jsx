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
  const [imageError, setImageError] = useState(false);

  const generateInitialAvatar = (displayName) => {
    if (!displayName || !displayName.trim()) {
      // Theme color background for default user
      return `https://ui-avatars.com/api/?name=User&size=${size * 2}&background=1b4332&color=ffffff&font-size=0.5&bold=true&format=png`;
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
    
    // Generate different shades of the theme color for variety
    const themeColors = [
      '1b4332', // Primary dark forest green
      '2d5a3f', // Lighter forest green
      '40916c', // Medium green
      '52b788', // Light green
      '74c69d', // Very light green
      '2f4f4f', // Dark slate gray
      '556b2f', // Dark olive green
      '6b8e23', // Olive drab
      '228b22', // Forest green
      '32cd32', // Lime green
      '20b2aa', // Light sea green
      '008b8b', // Dark cyan
      '4682b4', // Steel blue (for variety)
      '6a5acd', // Slate blue (for variety)
      '8fbc8f'  // Dark sea green
    ];
    
    // Generate consistent color based on name
    let hash = 0;
    for (let i = 0; i < displayName.length; i++) {
      hash = displayName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % themeColors.length;
    const backgroundColor = themeColors[colorIndex];
    
    // Use ui-avatars.com with theme colors
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size * 2}&background=${backgroundColor}&color=ffffff&font-size=0.5&bold=true&format=png`;
  };

  const shouldShowInitials = () => {
    return (
      imageError || 
      !src || 
      src === '' || 
      src === null || 
      src === undefined ||
      src.includes('placeholder') ||
      src.includes('via.placeholder')
    );
  };

  const getImageSrc = () => {
    if (shouldShowInitials() && showInitials && name) {
      return generateInitialAvatar(name);
    }
    
    if (src && !shouldShowInitials()) {
      return src;
    }
    
    // Final fallback with theme color
    return generateInitialAvatar(name || 'User');
  };

  const handleImageError = () => {
    console.log('Image error for:', src, 'showing initials for:', name);
    setImageError(true);
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
          display: 'block',
          transition: 'all 0.3s ease'
        }}
        onError={handleImageError}
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
            zIndex: 1,
            animation: 'statusPulse 2s infinite'
          }}
        />
      )}
    </div>
  );
};

export default ProfileImage;
