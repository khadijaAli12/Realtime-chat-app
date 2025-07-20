// src/components/chat/ChatRoom.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, ListGroup, Badge, Form, Alert, Dropdown } from 'react-bootstrap';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import LoadingSpinner from '../ui/LoadingSpinner';
import ProfileImage from '../profile/ProfileImage';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const ChatRoom = () => {
  const { 
    activeConversation, 
    messages, 
    loading, 
    sendMessage, 
    users, 
    startConversation, 
    usersLoading, 
    usersError,
    setActiveConversation 
  } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationError, setConversationError] = useState('');
  
  // New state for chat features
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showSearchMessages, setShowSearchMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [isMuted, setIsMuted] = useState(false);

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

  // Function to handle conversation starter messages
  const handleConversationStarter = async (messageText) => {
    if (!sendMessage || loading) return;
    
    try {
      console.log('Sending preset message:', messageText);
      await sendMessage(messageText);
    } catch (error) {
      console.error('Failed to send preset message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  // Chat Info Modal Handler
  const handleShowChatInfo = () => {
    setShowChatInfo(true);
  };

  // Mute Chat Handler
  const handleMuteChat = async () => {
    try {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      
      // Update conversation in Firestore
      if (activeConversation) {
        await updateDoc(doc(db, 'conversations', activeConversation.id), {
          [`mutedBy.${user.uid}`]: newMutedState
        });
      }
      
      alert(newMutedState ? 'Chat muted' : 'Chat unmuted');
    } catch (error) {
      console.error('Error muting chat:', error);
      alert('Failed to mute chat. Please try again.');
    }
  };

  // Search Messages Handler
  const handleSearchMessages = () => {
    setShowSearchMessages(true);
  };

  // Filter messages based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = messages.filter(message =>
        message.text?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages([]);
    }
  }, [searchQuery, messages]);

  // Delete Chat Handler
  const handleDeleteChat = async () => {
    if (!activeConversation) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete this conversation with ${getOtherUserDetails()?.name}? This action cannot be undone.`
    );

    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, 'conversations', activeConversation.id));
        setActiveConversation(null);
        alert('Conversation deleted successfully');
      } catch (error) {
        console.error('Error deleting conversation:', error);
        alert('Failed to delete conversation. Please try again.');
      }
    }
  };

  // Get other user details helper
  const getOtherUserDetails = () => {
    if (!activeConversation) return null;
    const otherUserId = activeConversation.participants.find(p => p !== user.uid);
    return activeConversation.participantDetails?.[otherUserId];
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

        {/* User Selection Modal */}
        <Modal 
          show={showNewChatModal} 
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
            {conversationError && (
              <Alert variant="danger">{conversationError}</Alert>
            )}
            
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
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : (
                <ListGroup>
                  {filteredUsers.map(otherUser => (
                    <ListGroup.Item 
                      key={otherUser.uid}
                      action
                      onClick={() => handleStartConversation(otherUser)}
                      className="d-flex align-items-center"
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
                        <div className="fw-bold">{otherUser.displayName || 'Unknown User'}</div>
                        <small className="text-muted">{otherUser.email}</small>
                      </div>
                      {otherUser.isOnline && (
                        <Badge bg="success">Online</Badge>
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </div>
          </Modal.Body>
        </Modal>
      </>
    );
  }

  const otherUserDetails = getOtherUserDetails();

  return (
    <div className="chat-room">
      {/* Enhanced Chat Header */}
      <div className="chat-header">
        <div className="chat-info">
          <button 
            className="back-btn d-lg-none"
            onClick={() => setActiveConversation(null)}
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
          <Dropdown align="end">
            <Dropdown.Toggle as="button" className="action-btn" bsPrefix="custom">
              <i className="bi bi-three-dots-vertical"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={handleShowChatInfo}>
                <i className="bi bi-info-circle me-2"></i>
                Chat Info
              </Dropdown.Item>
              <Dropdown.Item onClick={handleMuteChat}>
                <i className={`bi ${isMuted ? 'bi-bell' : 'bi-bell-slash'} me-2`}></i>
                {isMuted ? 'Unmute Chat' : 'Mute Chat'}
              </Dropdown.Item>
              <Dropdown.Item onClick={handleSearchMessages}>
                <i className="bi bi-search me-2"></i>
                Search Messages
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleDeleteChat} className="text-danger">
                <i className="bi bi-trash me-2"></i>
                Delete Chat
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {loading ? (
          <div className="loading-spinner text-center">
            <div className="spinner-border text-primary mb-3"></div>
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
                <p>Send your first message to {otherUserDetails?.name} and get things rolling!</p>
                <div className="conversation-starters">
                  <button 
                    className="starter-btn"
                    onClick={() => handleConversationStarter("👋 Hello!")}
                    disabled={loading}
                  >
                    👋 Say Hello
                  </button>
                  <button 
                    className="starter-btn"
                    onClick={() => handleConversationStarter("😊 How are you?")}
                    disabled={loading}
                  >
                    😊 How are you?
                  </button>
                  <button 
                    className="starter-btn"
                    onClick={() => handleConversationStarter("What's up? 💬")}
                    disabled={loading}
                  >
                    💬 What's up?
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

      {/* Message Input */}
      <div className="message-input-area">
        <MessageInput 
          onSendMessage={sendMessage}
          onTyping={setIsTyping}
          disabled={loading}
          placeholder={`Message ${otherUserDetails?.name}...`}
        />
      </div>

      {/* Chat Info Modal */}
      <Modal show={showChatInfo} onHide={() => setShowChatInfo(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-info-circle me-2"></i>
            Chat Info
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <ProfileImage 
              src={otherUserDetails?.photo} 
              name={otherUserDetails?.name}
              size={80} 
              showInitials={true}
              className="mb-3"
            />
            <h5>{otherUserDetails?.name}</h5>
            <p className="text-muted">Active now</p>
          </div>
          
          <div className="chat-stats">
            <div className="stat-item">
              <i className="bi bi-chat-dots me-2"></i>
              <span>{messages.length} messages</span>
            </div>
            <div className="stat-item">
              <i className="bi bi-calendar me-2"></i>
              <span>Started conversation</span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChatInfo(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Search Messages Modal */}
      <Modal show={showSearchMessages} onHide={() => setShowSearchMessages(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-search me-2"></i>
            Search Messages
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Search in messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3"
          />
          
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {searchQuery && filteredMessages.length === 0 && (
              <p className="text-muted text-center">No messages found</p>
            )}
            
            {filteredMessages.map(message => (
              <div key={message.id} className="search-result-item p-2 border-bottom">
                <div className="d-flex align-items-start">
                  <ProfileImage 
                    src={message.senderId === user.uid ? user.photoURL : otherUserDetails?.photo}
                    name={message.senderId === user.uid ? user.displayName : otherUserDetails?.name}
                    size={32}
                    showInitials={true}
                    className="me-2"
                  />
                  <div className="flex-grow-1">
                    <div className="fw-semibold">
                      {message.senderId === user.uid ? 'You' : otherUserDetails?.name}
                    </div>
                    <div className="text-muted small">{message.text}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSearchMessages(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ChatRoom;
