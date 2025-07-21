// src/components/ui/SearchInput.jsx
import React from 'react';

const SearchInput = ({ 
  placeholder = 'Search...', 
  value, 
  onChange, 
  className = '' 
}) => {
  return (
    <div className={`search-wrapper ${className}`}>
      <i className="bi bi-search search-icon"></i>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;
