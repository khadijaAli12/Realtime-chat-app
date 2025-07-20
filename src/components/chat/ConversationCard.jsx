// src/components/chat/ConversationCard.jsx
import React from 'react';
import { ListGroup, Badge } from 'react-bootstrap';
import { useChat } from '../../contexts/ChatContext';
import { formatDistanceToNow } from 'date-fns';

const ConversationCard = ({ conversation, currentUser }) => {
  const { setActiveConversation, activeConversation } = useChat();
  
  const otherParticipant = conversation.participants.find(p => p !== currentUser.uid);
  const otherUserDetails = conversation.participantDetails?.[otherParticipant];
  const unreadCount = conversation.unreadCount?.[currentUser.uid] || 0;
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const isActive = activeConversation?.id === conversation.id;

  return (
    <ListGroup.Item 
      action
      active={isActive}
      onClick={() => setActiveConversation(conversation)}
      className="d-flex align-items-center p-3"
    >
      <img
        src={otherUserDetails?.photo || '/default-avatar.png'}
        alt={otherUserDetails?.name}
        className="rounded-circle me-3"
        width={50}
        height={50}
        style={{ objectFit: 'cover' }}
      />
      
      <div className="flex-grow-1 min-w-0">
        <div className="d-flex justify-content-between align-items-start">
          <h6 className="mb-1 text-truncate">{otherUserDetails?.name}</h6>
          <small className="text-muted">
            {formatTime(conversation.lastMessageTime)}
          </small>
        </div>
        
        <p className="mb-1 text-muted text-truncate">
          {conversation.lastMessageSender === currentUser.uid && 'You: '}
          {conversation.lastMessage || 'No messages yet'}
        </p>
        
        {unreadCount > 0 && (
          <Badge bg="primary" pill className="mt-1">
            {unreadCount}
          </Badge>
        )}
      </div>
    </ListGroup.Item>
  );
};

export default ConversationCard;
