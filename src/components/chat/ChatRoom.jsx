// src/components/chat/ChatRoom.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, ListGroup, Badge, Form, Alert, Dropdown } from 'react-bootstrap';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import LoadingSpinner from '../ui/LoadingSpinner';
import ProfileImage from '../profile/ProfileImage';

const ChatRoom = () => {
  const { activeConversation, messages, loading, sendMessage, users, startConversation, usersLoading, usersError } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationError, setConversationError] = useState('');
  const [showChatInfo, setShowChatInfo] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced user filtering with search
  const filteredUsers = users.filter(u =>
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartConversation = async (otherUser) => {
    console.log('Starting conversation with:', otherUser);
    setConversationError('');
    
    try {
      await startConversation(otherUser);
      setShowNewChatModal(false);
      setSearchTerm('');
    } catch (error) {
      console.error('Error starting conversation:', error);
      setConversationError('Failed to start conversation. Please try again.');
    }
  };

  const handleModalOpen = () => {
    setShowNewChatModal(true);
    setConversationError('');
    setSearchTerm('');
  };

  const handleModalClose = () => {
    setShowNewChatModal(false);
    setSearchTerm('');
    setConversationError('');
  };

  // Enhanced Welcome Screen
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
              real-time messaging. Start meaningful conversations today.
            </p>
            <button 
              className="cta-button"
              onClick={handleModalOpen}
            >
              <i className="bi bi-plus-circle-fill"></i>
              Start Your First Chat
            </button>
            
            {/* Feature Highlights */}
            <div className="feature-grid">
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="bi bi-lightning-charge-fill"></i>
                </div>
                <h4>Real-time</h4>
                <p>Instant messaging</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="bi bi-shield-fill-check"></i>
                </div>
                <h4>Secure</h4>
                <p>Private & encrypted</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="bi bi-device-mobile"></i>
                </div>
                <h4>Responsive</h4>
                <p>Works everywhere</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Modal - Single Profile Image Per User */}
        <Modal 
          show={showNewChatModal} 
          onHide={handleModalClose}
          size="md"
          centered
          className="new-chat-modal"
        >
          <Modal.Header closeButton className="modal-header-modern">
            <Modal.Title>
              <i className="bi bi-chat-plus-fill me-2 text-primary"></i>
              Start New Conversation
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body-modern">
            {conversationError && (
              <Alert variant="danger" className="d-flex align-items-center mb-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {conversationError}
              </Alert>
            )}
            
            {usersError && (
              <Alert variant="warning" className="d-flex align-items-center mb-3">
                <i className="bi bi-wifi-off me-2"></i>
                Error loading users: {usersError}
              </Alert>
            )}
            
            {/* Enhanced Search Input */}
            <div className="search-container mb-4">
              <div className="search-input-wrapper">
                <i className="bi bi-search search-icon-modal"></i>
                <Form.Control
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input-modal"
                />
                {searchTerm && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>
            
            {/* Debug Info */}
            <div className="debug-info mb-3">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                {usersLoading ? 'Loading users...' : `${users.length} users available`}
              </small>
            </div>
            
            {/* Fixed Users List - Single Avatar Per User */}
            <div className="users-list-container">
              {usersLoading ? (
                <div className="loading-state text-center py-4">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p>Finding amazing people to chat with...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="empty-users-state text-center py-4">
                  {users.length === 0 ? (
                    <>
                      <div className="empty-icon mb-3">
                        <i className="bi bi-people-fill"></i>
                      </div>
                      <h5>No other users found</h5>
                      <p>Invite friends to join ChatApp and start conversations!</p>
                    </>
                  ) : (
                    <>
                      <div className="empty-icon mb-3">
                        <i className="bi bi-search"></i>
                      </div>
                      <h5>No users found</h5>
                      <p>No users match your search "{searchTerm}"</p>
                      <small className="text-muted">Try a different search term</small>
                    </>
                  )}
                </div>
              ) : (
                <div className="users-list-wrapper">
                  {filteredUsers.map(otherUser => (
                    <div 
                      key={otherUser.uid}
                      className="user-list-item-fixed"
                      onClick={() => handleStartConversation(otherUser)}
                    >
                      {/* Single ProfileImage Component */}
                      <ProfileImage 
                        src={otherUser.photoURL} 
                        name={otherUser.displayName || otherUser.email}
                        size={56} 
                        isOnline={otherUser.isOnline}
                        showInitials={true}
                        className="user-modal-avatar me-3"
                      />
                      
                      <div className="user-info-section flex-grow-1">
                        <div className="user-name-primary">
                          {otherUser.displayName || 'Unknown User'}
                        </div>
                        <div className="user-email-secondary">
                          {otherUser.email}
                        </div>
                      </div>
                      
                      <div className="user-status-section">
                        {otherUser.isOnline ? (
                          <Badge bg="success" className="status-badge-online">
                            <i className="bi bi-circle-fill me-1"></i>
                            Online
                          </Badge>
                        ) : (
                          <Badge bg="secondary" className="status-badge-offline">
                            Offline
                          </Badge>
                        )}
                        <i className="bi bi-chevron-right text-muted ms-2"></i>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer className="modal-footer-modern">
            <Button 
              variant="outline-secondary" 
              onClick={handleModalClose}
              className="d-flex align-items-center"
            >
              <i className="bi bi-x-circle me-2"></i>
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
      {/* Enhanced Chat Header */}
      <div className="chat-header">
        <div className="chat-info">
          <button 
            className="back-btn d-lg-none"
            onClick={() => window.history.back()}
          >
            <i className="bi bi-arrow-left"></i>
          </button>
          
          <ProfileImage 
            src={otherUserDetails?.photo} 
            name={otherUserDetails?.name}
            size={44} 
            isOnline={true}
            showInitials={true}
            className="chat-avatar"
          />
          
          <div className="details">
            <h3>{otherUserDetails?.name}</h3>
            <div className="status-text">
              <i className="bi bi-circle-fill me-1"></i>
              Active now
            </div>
          </div>
        </div>
        
        <div className="chat-actions">
          <button className="action-btn" title="Voice Call">
            <i className="bi bi-telephone-fill"></i>
          </button>
          <button className="action-btn" title="Video Call">
            <i className="bi bi-camera-video-fill"></i>
          </button>
          
          <Dropdown align="end">
            <Dropdown.Toggle as="button" className="action-btn" bsPrefix="custom">
              <i className="bi bi-three-dots-vertical"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setShowChatInfo(true)}>
                <i className="bi bi-info-circle me-2"></i>
                Chat Info
              </Dropdown.Item>
              <Dropdown.Item>
                <i className="bi bi-bell-slash me-2"></i>
                Mute Chat
              </Dropdown.Item>
              <Dropdown.Item>
                <i className="bi bi-search me-2"></i>
                Search Messages
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item className="text-danger">
                <i className="bi bi-trash me-2"></i>
                Delete Chat
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* Enhanced Messages Container */}
      <div className="messages-container">
        {loading ? (
          <div className="loading-spinner text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading your conversation...</p>
          </div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div className="empty-messages text-center">
                <div className="empty-chat-icon mb-4">
                  <i className="bi bi-chat-dots-fill"></i>
                </div>
                <h3>Start your conversation</h3>
                <p>Send your first message to {otherUserDetails?.name} and get things rolling! 🚀</p>
                <div className="conversation-starters">
                  <button 
                    className="starter-btn"
                    onClick={() => document.querySelector('.message-input')?.focus()}
                  >
                    👋 Say Hello
                  </button>
                  <button 
                    className="starter-btn"
                    onClick={() => document.querySelector('.message-input')?.focus()}
                  >
                    😊 How are you?
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="messages-list">
                  {messages.map((message, index) => (
                    <MessageBubble 
                      key={message.id} 
                      message={message}
                      isOwn={message.senderId === user.uid}
                      showAvatar={
                        index === 0 || 
                        messages[index - 1]?.senderId !== message.senderId
                      }
                      otherUserPhoto={otherUserDetails?.photo}
                      otherUserName={otherUserDetails?.name}
                    />
                  ))}
                </div>
                
                {isTyping && (
                  <div className="typing-indicator">
                    <ProfileImage 
                      src={otherUserDetails?.photo} 
                      name={otherUserDetails?.name}
                      size={24} 
                      showInitials={true}
                      className="me-2"
                    />
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <small className="ms-2">{otherUserDetails?.name} is typing...</small>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </>
        )}
      </div>

      {/* Enhanced Message Input */}
      <div className="message-input-area">
        <MessageInput 
          onSendMessage={sendMessage}
          onTyping={setIsTyping}
          disabled={loading}
          placeholder={`Message ${otherUserDetails?.name}...`}
        />
      </div>
    </div>
  );
};

export default ChatRoom;
