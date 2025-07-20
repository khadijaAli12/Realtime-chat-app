// src/components/chat/ConversationList.jsx  
import React, { useState } from 'react';
import { Button, Modal, Form, ListGroup, Badge } from 'react-bootstrap';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import ConversationCard from './ConversationCard';

const ConversationList = ({ onChatSelect }) => {
  const { conversations, users, startConversation } = useChat();
  const { user } = useAuth();
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participants.find(p => p !== user.uid);
    const otherUserDetails = conv.participantDetails?.[otherUser];
    return otherUserDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredUsers = users.filter(u =>
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartConversation = async (otherUser) => {
    console.log('Starting conversation with:', otherUser.displayName); // Debug log
    try {
      await startConversation(otherUser);
      setShowNewChat(false);
      setSearchTerm('');
      onChatSelect?.();
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation. Please try again.');
    }
  };

  const handleNewChatClick = () => {
    console.log('New chat button clicked from sidebar'); // Debug log
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
            New
          </Button>
        </div>
        
        <div className="search-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="conversations-list">
        {filteredConversations.length === 0 && searchTerm === '' ? (
          <div className="empty-state">
            <i className="bi bi-chat-dots empty-icon"></i>
            <h3>No conversations yet</h3>
            <p>Start a new chat to begin messaging with your contacts.</p>
          </div>
        ) : (
          filteredConversations.map(conversation => (
            <ConversationCard 
              key={conversation.id} 
              conversation={conversation}
              currentUser={user}
              onClick={onChatSelect}
            />
          ))
        )}
      </div>

      {/* New Chat Modal */}
      <Modal 
        show={showNewChat} 
        onHide={() => {
          setShowNewChat(false);
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
              {filteredUsers.length === 0 && (
                <div className="text-center p-4 text-muted">
                  <i className="bi bi-people" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
                  <p>No users available</p>
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
                    cursor: 'pointer'
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
                    <div className="fw-bold">{otherUser.displayName}</div>
                    <small className="text-muted">{otherUser.email}</small>
                  </div>
                  {otherUser.isOnline && (
                    <Badge bg="success" className="ms-auto">Online</Badge>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ConversationList;
