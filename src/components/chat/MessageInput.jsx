// src/components/chat/MessageInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'react-bootstrap';

const MessageInput = ({ 
  onSendMessage, 
  replyingTo = null, 
  onCancelReply,
  disabled = false,
  placeholder = "Type a message..." 
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || disabled || sending) return;

    setSending(true);
    try {
      // Create proper message data structure
      const messageData = {
        text: message.trim(),
        replyTo: replyingTo || null
      };

      await onSendMessage(messageData);
      setMessage('');
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  return (
    <div className="message-input-container">
      {/* Reply Preview */}
      {replyingTo && (
        <div className="reply-preview">
          <div className="reply-preview-content">
            <div className="reply-preview-header">
              <i className="bi bi-reply me-2"></i>
              <span>Replying to {replyingTo.senderName}</span>
              <button 
                className="cancel-reply-btn"
                onClick={onCancelReply}
                type="button"
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="reply-preview-text">
              {replyingTo.text}
            </div>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-wrapper">
          <div className="input-container">
            <button 
              type="button" 
              className="attachment-btn"
              title="Attach file"
              disabled={disabled || sending}
            >
              <i className="bi bi-paperclip"></i>
            </button>
            
            <textarea
              ref={textareaRef}
              className="message-input"
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={replyingTo ? `Reply to ${replyingTo.senderName}...` : placeholder}
              rows={1}
              maxLength={2000}
              disabled={disabled || sending}
            />
            
            <button 
              type="button" 
              className="emoji-btn"
              title="Add emoji"
              disabled={disabled || sending}
            >
              <i className="bi bi-emoji-smile"></i>
            </button>
          </div>
          
          <Button
            type="submit"
            className="send-btn"
            disabled={!message.trim() || disabled || sending}
            title="Send message"
          >
            {sending ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Sending...</span>
              </div>
            ) : (
              <i className="bi bi-send-fill"></i>
            )}
          </Button>
        </div>
      </form>
      
      {/* Typing Indicator */}
      {isTyping && !disabled && !sending && (
        <div className="typing-indicator-self">
          <small className="text-muted">Press Enter to send, Shift + Enter for new line</small>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
