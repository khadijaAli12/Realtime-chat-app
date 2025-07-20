// src/components/chat/MessageBubble.jsx
import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';

const MessageBubble = ({ message, isOwn, showAvatar = false, otherUserPhoto }) => {
  const [showOptions, setShowOptions] = useState(false);
  const { user } = useAuth();
  const { deleteMessage } = useChat();

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'HH:mm');
  };

  const handleDeleteMessage = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(message.id);
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('Failed to delete message. Please try again.');
      }
    }
  };

  return (
    <div 
      className={`message-bubble ${isOwn ? 'own' : 'other'}`}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      <div className="message-wrapper">
        {!isOwn && showAvatar && (
          <div className="message-avatar">
            <img
              src={otherUserPhoto || `https://ui-avatars.com/api/?name=User&background=667eea&color=fff`}
              alt="User"
              className="avatar-small"
            />
          </div>
        )}
        
        <div className="bubble">
          {message.isDeleted ? (
            <div className="deleted-message">
              <i className="bi bi-slash-circle me-2"></i>
              <em>This message was deleted</em>
            </div>
          ) : (
            <>
              <div className="message-text">{message.text}</div>
              <div className="message-footer">
                <div className="message-time">
                  {formatTime(message.timestamp)}
                  {isOwn && (
                    <span className="message-status ms-1">
                      {message.status === 'sent' && <i className="bi bi-check"></i>}
                      {message.status === 'delivered' && <i className="bi bi-check-all"></i>}
                      {message.status === 'read' && <i className="bi bi-check-all text-primary"></i>}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Message Options */}
        {showOptions && !message.isDeleted && (
          <div className="message-options">
            <Dropdown align={isOwn ? 'end' : 'start'}>
              <Dropdown.Toggle
                as="button"
                className="options-btn"
                bsPrefix="custom"
              >
                <i className="bi bi-three-dots"></i>
              </Dropdown.Toggle>

              <Dropdown.Menu className="message-options-menu">
                {isOwn && (
                  <>
                    <Dropdown.Item 
                      onClick={handleDeleteMessage}
                      className="delete-option"
                    >
                      <i className="bi bi-trash me-2"></i>
                      Delete Message
                    </Dropdown.Item>
                    <Dropdown.Divider />
                  </>
                )}
                <Dropdown.Item onClick={() => navigator.clipboard.writeText(message.text)}>
                  <i className="bi bi-clipboard me-2"></i>
                  Copy Text
                </Dropdown.Item>
                <Dropdown.Item>
                  <i className="bi bi-reply me-2"></i>
                  Reply
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
