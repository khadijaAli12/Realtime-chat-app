// src/components/ui/SkeletonLoader.jsx
import React from 'react';
import { Card, Placeholder } from 'react-bootstrap';

const SkeletonLoader = ({ lines = 3 }) => {
  return (
    <Card className="mb-2">
      <Card.Body>
        <Placeholder as="div" animation="glow">
          <div className="d-flex align-items-center mb-2">
            <Placeholder xs={2} className="rounded-circle me-2" style={{ height: '40px' }} />
            <div className="flex-grow-1">
              <Placeholder xs={6} size="sm" />
              <Placeholder xs={4} size="xs" />
            </div>
          </div>
          {Array.from({ length: lines }).map((_, index) => (
            <Placeholder key={index} xs={Math.floor(Math.random() * 8) + 4} className="mb-1" />
          ))}
        </Placeholder>
      </Card.Body>
    </Card>
  );
};

export default SkeletonLoader;
