// src/components/chat/MessageInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'react-bootstrap';

const MessageInput = ({ onSendMessage, onTyping, disabled = false, placeholder = "Type a message..." }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled && onSendMessage) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Clear typing indicator
      if (onTyping) {
        onTyping(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    
    // Trigger typing indicator
    if (onTyping && e.target.value.trim()) {
      onTyping(true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    } else if (onTyping && !e.target.value.trim()) {
      onTyping(false);
    }
  };

  // Focus method for external access
  useEffect(() => {
    if (inputRef.current) {
      window.focusMessageInput = () => inputRef.current.focus();
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="input-wrapper">
      <div className="input-container">
        <button type="button" className="attachment-btn" title="Attach file">
          <i className="bi bi-paperclip"></i>
        </button>
        
        <textarea
          ref={inputRef}
          className="message-input"
          placeholder={placeholder}
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          rows={1}
        />
        
        <button type="button" className="emoji-btn" title="Add emoji">
          <i className="bi bi-emoji-smile"></i>
        </button>
      </div>
      
      <Button
        type="submit"
        className="send-btn"
        disabled={!message.trim() || disabled}
      >
        <i className="bi bi-send-fill"></i>
      </Button>
    </form>
  );
};

export default MessageInput;
