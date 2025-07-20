// src/components/chat/ChatRoom.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, ListGroup, Badge, Form } from 'react-bootstrap';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import LoadingSpinner from '../ui/LoadingSpinner';

const ChatRoom = () => {
  const { activeConversation, messages, loading, sendMessage, users, startConversation } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Filter users for new chat
  const filteredUsers = users.filter(u =>
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartConversation = async (otherUser) => {
    try {
      await startConversation(otherUser);
      setShowNewChatModal(false);
      setSearchTerm('');
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const handleNewChatClick = () => {
    console.log('New chat button clicked'); // Debug log
    setShowNewChatModal(true);
  };

  if (!activeConversation) {
    return (
      <>
        <div className="welcome-screen">
          <div className="welcome-content">
            <div className="welcome-icon">
              <i className="bi bi-chat-heart-fill"></i>
            </div>
            <h1>Welcome to ChatApp!</h1>
            <p>
              Connect with friends, family, and colleagues through secure, 
              real-time messaging. Select a conversation to get started.
            </p>
            <Button 
              className="cta-button"
              onClick={handleNewChatClick}
            >
              <i className="bi bi-plus-circle-fill"></i>
              Start Your First Chat
            </Button>
          </div>
        </div>

        {/* New Chat Modal */}
        <Modal 
          show={showNewChatModal} 
          onHide={() => {
            setShowNewChatModal(false);
            setSearchTerm('');
          }} 
          size="md"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Start New Conversation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Control
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-3"
              style={{ padding: '0.75rem 1rem' }}
            />
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <ListGroup>
                {filteredUsers.length === 0 && searchTerm === '' && (
                  <div className="text-center p-4 text-muted">
                    <i className="bi bi-people" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
                    <p>Loading users...</p>
                  </div>
                )}
                
                {filteredUsers.length === 0 && searchTerm !== '' && (
                  <div className="text-center p-4 text-muted">
                    <i className="bi bi-search" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
                    <p>No users found matching "{searchTerm}"</p>
                  </div>
                )}
                
                {filteredUsers.map(otherUser => (
                  <ListGroup.Item 
                    key={otherUser.uid}
                    action
                    onClick={() => handleStartConversation(otherUser)}
                    className="d-flex align-items-center"
                    style={{ 
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <img
                      src={otherUser.photoURL || '/default-avatar.png'}
                      alt={otherUser.displayName}
                      className="rounded-circle me-3"
                      width={50}
                      height={50}
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-bold" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>
                        {otherUser.displayName}
                      </div>
                      <small className="text-muted">{otherUser.email}</small>
                    </div>
                    {otherUser.isOnline && (
                      <div className="d-flex align-items-center">
                        <Badge bg="success" className="me-2">Online</Badge>
                        <div 
                          className="bg-success rounded-circle"
                          style={{ width: '10px', height: '10px' }}
                        ></div>
                      </div>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowNewChatModal(false);
                setSearchTerm('');
              }}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  const otherUser = activeConversation.participants.find(p => p !== user.uid);
  const otherUserDetails = activeConversation.participantDetails?.[otherUser];

  return (
    <div className="chat-room">
      <div className="chat-header">
        <div className="chat-info">
          <button className="back-btn">
            <i className="bi bi-arrow-left"></i>
          </button>
          <div className="avatar">
            <img
              src={otherUserDetails?.photo || '/default-avatar.png'}
              alt={otherUserDetails?.name}
            />
            <div className="status"></div>
          </div>
          <div className="details">
            <h3>{otherUserDetails?.name}</h3>
            <div className="status-text">Active now</div>
          </div>
        </div>
        
        <div className="chat-actions">
          <button className="action-btn">
            <i className="bi bi-telephone"></i>
          </button>
          <button className="action-btn">
            <i className="bi bi-camera-video"></i>
          </button>
          <button className="action-btn">
            <i className="bi bi-info-circle"></i>
          </button>
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <i className="bi bi-chat-dots" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
                <h3>Start the conversation</h3>
                <p>Send your first message to get things started!</p>
              </div>
            ) : (
              messages.map(message => (
                <MessageBubble 
                  key={message.id} 
                  message={message}
                  isOwn={message.senderId === user.uid}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="message-input-area">
        <MessageInput onSendMessage={sendMessage} />
      </div>
    </div>
  );
};

export default ChatRoom;
