// src/components/chat/ConversationCard.jsx
import React, { useState } from 'react';
import { Badge, Dropdown } from 'react-bootstrap';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { useChat } from '../../contexts/ChatContext';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import ProfileImage from '../profile/ProfileImage';

const ConversationCard = ({ conversation, currentUser, onClick }) => {
  const { setActiveConversation, activeConversation, markMessagesAsRead } = useChat();
  const [showOptions, setShowOptions] = useState(false);
  
  const otherParticipant = conversation.participants.find(p => p !== currentUser.uid);
  const otherUserDetails = conversation.participantDetails?.[otherParticipant];
  const unreadCount = conversation.unreadCount?.[currentUser.uid] || 0;
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      
      if (isToday(date)) {
        return format(date, 'HH:mm');
      } else if (isYesterday(date)) {
        return 'Yesterday';
      } else {
        return format(date, 'MMM dd');
      }
    } catch (error) {
      return '';
    }
  };

  const getLastMessageDisplay = () => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    if (conversation.lastMessage === 'Message was deleted' || conversation.lastMessage === '') {
      return '🗑️ Message was deleted';
    }
    
    const prefix = conversation.lastMessageSender === currentUser.uid ? 'You: ' : '';
    const message = conversation.lastMessage;
    
    const maxLength = 45;
    const truncatedMessage = message.length > maxLength 
      ? message.substring(0, maxLength) + '...' 
      : message;
    
    return prefix + truncatedMessage;
  };

  const getLastMessageClass = () => {
    if (!conversation.lastMessage || conversation.lastMessage === 'Message was deleted' || conversation.lastMessage === '') {
      return 'last-message text-muted';
    }
    return unreadCount > 0 ? 'last-message font-weight-medium text-primary' : 'last-message';
  };

  const isActive = activeConversation?.id === conversation.id;

  const handleClick = async () => {
    setActiveConversation(conversation);
    onClick?.();
    
    if (unreadCount > 0) {
      await markMessagesAsRead(conversation.id);
    }
  };

  const handleDeleteConversation = async () => {
    if (window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'conversations', conversation.id));
        
        if (isActive) {
          setActiveConversation(null);
        }
        
        alert('Conversation deleted successfully');
      } catch (error) {
        console.error('Error deleting conversation:', error);
        alert('Failed to delete conversation. Please try again.');
      }
    }
  };

  const handleMuteConversation = () => {
    alert('Mute functionality coming soon!');
  };

  const handleArchiveConversation = () => {
    alert('Archive functionality coming soon!');
  };

  return (
    <div 
      className={`conversation-item ${isActive ? 'active' : ''}`}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      <div className="conversation-content" onClick={handleClick}>
        {/* Single ProfileImage Component */}
        <ProfileImage 
          src={otherUserDetails?.photo} 
          name={otherUserDetails?.name}
          size={52} 
          isOnline={true}
          showInitials={true}
          className="conversation-avatar me-3"
        />
        
        <div className="conversation-info flex-grow-1">
          <div className="top-row">
            <div className="name" title={otherUserDetails?.name || 'Unknown User'}>
              {otherUserDetails?.name || 'Unknown User'}
            </div>
            <div className="time">
              {formatTime(conversation.lastMessageTime)}
            </div>
          </div>
          
          <div className="bottom-row">
            <div className={getLastMessageClass()} title={getLastMessageDisplay()}>
              {getLastMessageDisplay()}
            </div>
            
            {unreadCount > 0 && (
              <Badge bg="primary" className="unread-count">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
            
            {conversation.lastMessageSender === currentUser.uid && conversation.lastMessage && (
              <div className="message-status">
                <i className="bi bi-check-all text-muted"></i>
              </div>
            )}
          </div>
        </div>
      </div>

      {showOptions && (
        <div className="conversation-options">
          <Dropdown align="end">
            <Dropdown.Toggle
              as="button"
              className="options-btn"
              bsPrefix="custom"
            >
              <i className="bi bi-three-dots-vertical"></i>
            </Dropdown.Toggle>

            <Dropdown.Menu className="conversation-options-menu">
              <Dropdown.Item onClick={() => markMessagesAsRead(conversation.id)}>
                <i className="bi bi-check2-all me-2"></i>
                Mark as Read
              </Dropdown.Item>
              
              <Dropdown.Item onClick={handleMuteConversation}>
                <i className="bi bi-bell-slash me-2"></i>
                Mute Conversation
              </Dropdown.Item>
              
              <Dropdown.Item onClick={handleArchiveConversation}>
                <i className="bi bi-archive me-2"></i>
                Archive Chat
              </Dropdown.Item>
              
              <Dropdown.Divider />
              
              <Dropdown.Item 
                onClick={handleDeleteConversation}
                className="delete-option"
              >
                <i className="bi bi-trash me-2"></i>
                Delete Conversation
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      )}

      {isActive && <div className="active-indicator" />}
      {unreadCount > 0 && !isActive && <div className="new-message-indicator" />}
    </div>
  );
};

export default ConversationCard;
