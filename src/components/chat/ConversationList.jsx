// src/components/chat/ConversationList.jsx
import React, { useState } from 'react';
import { Button, Modal, Form, Badge, Alert, Nav } from 'react-bootstrap';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import ConversationCard from './ConversationCard';
import SearchInput from '../ui/SearchInput';
import ProfileImage from '../profile/ProfileImage';

const ConversationList = ({ onChatSelect }) => {
  const { 
    conversations, 
    archivedConversations,
    users, 
    startConversation, 
    usersLoading, 
    usersError,
    showArchived,
    setShowArchived,
    unarchiveConversation
  } = useChat();
  const { user } = useAuth();
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const filteredUsers = users.filter(u =>
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConversations = (showArchived ? archivedConversations : conversations).filter(conv => {
    const otherParticipant = conv.participants.find(p => p !== user.uid);
    const otherUserDetails = conv.participantDetails?.[otherParticipant];
    return otherUserDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleStartConversation = async (otherUser) => {
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
    setError('');
    setShowNewChat(true);
  };

  const handleModalClose = () => {
    setShowNewChat(false);
    setSearchTerm('');
    setError('');
  };

  const handleUnarchive = async (conversationId) => {
    try {
      await unarchiveConversation(conversationId);
    } catch (error) {
      console.error('Error unarchiving conversation:', error);
      setError('Failed to unarchive conversation');
    }
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
          placeholder={showArchived ? "Search archived..." : "Search conversations..."} 
          value={searchTerm}
          onChange={setSearchTerm}
        />

        {/* Archive Toggle Navigation */}
        <Nav variant="pills" className="archive-nav mt-3">
          <Nav.Item>
            <Nav.Link 
              active={!showArchived} 
              onClick={() => setShowArchived(false)}
              className="archive-tab"
            >
              <i className="bi bi-chat-dots me-2"></i>
              Active ({conversations.length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={showArchived} 
              onClick={() => setShowArchived(true)}
              className="archive-tab"
            >
              <i className="bi bi-archive me-2"></i>
              Archived ({archivedConversations.length})
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

      <div className="conversations-list">
        {filteredConversations.length === 0 ? (
          <div className="empty-state">
            <i className={`bi ${showArchived ? 'bi-archive' : 'bi-chat-dots'} empty-icon`}></i>
            <h3>{showArchived ? 'No archived chats' : 'No conversations yet'}</h3>
            <p>
              {showArchived 
                ? 'Archived conversations will appear here.'
                : 'Start a new chat to begin messaging.'
              }
            </p>
            {!showArchived && (
              <Button variant="primary" onClick={handleNewChatClick} className="mt-2">
                <i className="bi bi-plus-circle me-2"></i>
                Start New Chat
              </Button>
            )}
          </div>
        ) : (
          filteredConversations.map(conversation => (
            <ConversationCard 
              key={conversation.id} 
              conversation={conversation}
              currentUser={user}
              onClick={onChatSelect}
              isArchived={showArchived}
              onUnarchive={() => handleUnarchive(conversation.id)}
            />
          ))
        )}
      </div>

      {/* New Chat Modal */}
      <Modal 
        show={showNewChat} 
        onHide={handleModalClose}
        size="md"
        centered
        className="new-chat-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-chat-plus-fill me-2 text-primary"></i>
            Start New Conversation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
          
          <Form.Control
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-3"
          />
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {usersLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary mb-3"></div>
                <p>Finding amazing people to chat with...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-4">
                {users.length === 0 ? (
                  <>
                    <div className="empty-icon mb-3">
                      <i className="bi bi-people-fill"></i>
                    </div>
                    <h5>No other users found</h5>
                    <p>Invite friends to join Eloquent and start conversations!</p>
                  </>
                ) : (
                  <>
                    <div className="empty-icon mb-3">
                      <i className="bi bi-search"></i>
                    </div>
                    <h5>No users found</h5>
                    <p>No users match your search "{searchTerm}"</p>
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
                    <ProfileImage 
                      src={otherUser.photoURL} 
                      name={otherUser.displayName || otherUser.email}
                      size={50} 
                      isOnline={otherUser.isOnline}
                      showInitials={true}
                      className="me-3"
                    />
                    
                    <div className="flex-grow-1">
                      <div className="user-name">{otherUser.displayName || 'Unknown User'}</div>
                      <div className="user-email">{otherUser.email}</div>
                    </div>
                    
                    <div className="user-status">
                      {otherUser.isOnline ? (
                        <Badge bg="success">
                          <i className="bi bi-circle-fill me-1"></i>
                          Online
                        </Badge>
                      ) : (
                        <Badge bg="secondary">Offline</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleModalClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ConversationList;
