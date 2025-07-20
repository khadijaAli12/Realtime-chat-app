// src/components/chat/MessageBubble.jsx
import React from 'react';
import { format } from 'date-fns';

const MessageBubble = ({ message, isOwn }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'HH:mm');
  };

  return (
    <div className={`message-bubble mb-3 ${isOwn ? 'own-message' : 'other-message'}`}>
      <div className={`d-flex ${isOwn ? 'justify-content-end' : 'justify-content-start'}`}>
        <div 
          className={`message-content p-2 rounded ${
            isOwn 
              ? 'bg-primary text-white ms-auto' 
              : 'bg-light text-dark me-auto'
          }`}
          style={{ maxWidth: '70%' }}
        >
          <div className="message-text">{message.text}</div>
          <div className={`message-time mt-1 ${isOwn ? 'text-light' : 'text-muted'}`}>
            <small>
              {formatTime(message.timestamp)}
              {isOwn && (
                <span className="ms-1">
                  {message.status === 'sent' && '✓'}
                  {message.status === 'delivered' && '✓✓'}
                  {message.status === 'read' && '✓✓'}
                </span>
              )}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
