// src/components/chat/ConversationList.jsx
import React, { useState } from 'react';
import { Button, Modal, Form, ListGroup, Badge, Alert } from 'react-bootstrap';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import ConversationCard from './ConversationCard';
import SearchInput from '../ui/SearchInput';
import ProfileImage from '../profile/ProfileImage';

const ConversationList = ({ onChatSelect }) => {
  const { conversations, users, startConversation, usersLoading, usersError } = useChat();
  const { user } = useAuth();
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Debug logs
  React.useEffect(() => {
    console.log('ConversationList - Users:', users);
    console.log('ConversationList - Users loading:', usersLoading);
    console.log('ConversationList - Users error:', usersError);
  }, [users, usersLoading, usersError]);

  const filteredUsers = users.filter(u =>
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartConversation = async (otherUser) => {
    console.log('Starting conversation with:', otherUser);
    setError('');
    
    try {
      await startConversation(otherUser);
      setShowNewChat(false);
      setSearchTerm('');
      onChatSelect?.();
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError('Failed to start conversation: ' + error.message);
    }
  };

  const handleNewChatClick = () => {
    console.log('New chat clicked - Users available:', users.length);
    console.log('Current users:', users);
    setError('');
    setShowNewChat(true);
  };

  const handleModalClose = () => {
    setShowNewChat(false);
    setSearchTerm('');
    setError('');
  };

  return (
    <div className="sidebar-content">
      <div className="sidebar-header">
        <div className="header-title">
          <h2>Messages</h2>
          <Button 
            className="new-chat-btn"
            onClick={handleNewChatClick}
          >
            <i className="bi bi-plus-circle"></i>
            <span className="d-none d-lg-inline ms-1">New</span>
          </Button>
        </div>
        
        <SearchInput 
          placeholder="Search conversations..." 
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-chat-dots empty-icon"></i>
            <h3>No conversations yet</h3>
            <p>Start a new chat to begin messaging.</p>
          </div>
        ) : (
          conversations.map(conversation => (
            <ConversationCard 
              key={conversation.id} 
              conversation={conversation}
              currentUser={user}
              onClick={onChatSelect}
            />
          ))
        )}
      </div>

      {/* Enhanced New Chat Modal - Same as ChatRoom */}
      <Modal 
        show={showNewChat} 
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
          {error && (
            <Alert variant="danger" className="d-flex align-items-center mb-3">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
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
          
          {/* Users List with ProfileImage */}
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
                    <details className="text-start mt-3">
                      <summary>Debug Info</summary>
                      <small>
                        <br />Current user: {user?.displayName} ({user?.uid})
                        <br />Users in database: {users.length}
                        <br />Users error: {usersError || 'None'}
                        <br />Search term: "{searchTerm}"
                      </small>
                    </details>
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
                    className="user-list-item"
                    onClick={() => handleStartConversation(otherUser)}
                  >
                    <div className="user-avatar-section">
                      <ProfileImage 
                        src={otherUser.photoURL} 
                        name={otherUser.displayName || otherUser.email}
                        size={56} 
                        isOnline={otherUser.isOnline}
                        showInitials={true}
                        className="user-modal-avatar"
                      />
                    </div>
                    
                    <div className="user-info-section">
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
    </div>
  );
};

export default ConversationList;
