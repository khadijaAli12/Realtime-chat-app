// src/components/ui/SearchInput.jsx
import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';

const SearchInput = ({ 
  placeholder = 'Search...', 
  value, 
  onChange, 
  className = '' 
}) => {
  return (
    <InputGroup className={`mb-3 ${className}`}>
      <InputGroup.Text className="bg-light border-end-0">
        <i className="bi bi-search text-muted"></i>
      </InputGroup.Text>
      <Form.Control
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-start-0 ps-0"
        style={{ fontSize: '0.9rem' }}
      />
    </InputGroup>
  );
};

export default SearchInput;
