import React from 'react';
import { format } from 'date-fns';

const MessageBubble = ({ message, isOwn }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'HH:mm');
  };

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
      <div className="bubble">
        <div className="message-text">{message.text}</div>
        <div className="message-time">
          {formatTime(message.timestamp)}
          {isOwn && (
            <span className="message-status ms-1">
              {message.status === 'sent' && '✓'}
              {message.status === 'delivered' && '✓✓'}
              {message.status === 'read' && <span className="text-primary">✓✓</span>}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
