import React, { useState } from 'react';
import { Button, Modal, Form, ListGroup, Badge, Alert } from 'react-bootstrap';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import ConversationCard from './ConversationCard';
import SearchInput from '../ui/SearchInput';

const ConversationList = ({ onChatSelect }) => {
  const { conversations, users, startConversation, usersLoading } = useChat();
  const { user } = useAuth();
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const filteredUsers = users.filter(u =>
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartConversation = async (otherUser) => {
    setError('');
    
    try {
      await startConversation(otherUser);
      setShowNewChat(false);
      setSearchTerm('');
      onChatSelect?.();
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError('Failed to start conversation. Please try again.');
    }
  };

  const handleNewChatClick = () => {
    setError('');
    setShowNewChat(true);
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

      <Modal 
        show={showNewChat} 
        onHide={() => {
          setShowNewChat(false);
          setSearchTerm('');
          setError('');
        }} 
        size="md"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Start New Conversation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form.Control
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-3"
          />
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {usersLoading ? (
              <div className="text-center p-4">
                <div className="spinner-border spinner-border-sm me-2"></div>
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center p-4 text-muted">
                {users.length === 0 ? (
                  <>
                    <i className="bi bi-people" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
                    <h6>No other users found</h6>
                    <p>Ask someone to sign up to start chatting!</p>
                  </>
                ) : (
                  <>
                    <i className="bi bi-search" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
                    <p>No users found matching "{searchTerm}"</p>
                  </>
                )}
              </div>
            ) : (
              <ListGroup>
                {filteredUsers.map(otherUser => (
                  <ListGroup.Item 
                    key={otherUser.uid}
                    action
                    onClick={() => handleStartConversation(otherUser)}
                    className="d-flex align-items-center user-item"
                  >
                    <img
                      src={otherUser.photoURL || 'https://via.placeholder.com/50'}
                      alt={otherUser.displayName}
                      className="rounded-circle me-3"
                      width={50}
                      height={50}
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-bold">{otherUser.displayName}</div>
                      <small className="text-muted">{otherUser.email}</small>
                    </div>
                    {otherUser.isOnline && (
                      <Badge bg="success" className="ms-auto">Online</Badge>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ConversationList;
