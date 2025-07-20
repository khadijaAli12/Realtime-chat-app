import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useChat } from '../../contexts/ChatContext';

const ConversationCard = ({ conversation, currentUser, onClick }) => {
  const { setActiveConversation, activeConversation } = useChat();
  
  const otherParticipant = conversation.participants.find(p => p !== currentUser.uid);
  const otherUserDetails = conversation.participantDetails?.[otherParticipant];
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const isActive = activeConversation?.id === conversation.id;

  const handleClick = () => {
    setActiveConversation(conversation);
    onClick?.();
  };

  return (
    <div 
      className={`conversation-item ${isActive ? 'active' : ''}`}
      onClick={handleClick}
    >
      <div className="avatar">
        <img
          src={otherUserDetails?.photo || 'https://via.placeholder.com/48'}
          alt={otherUserDetails?.name}
        />
        <div className="status-indicator" />
      </div>
      
      <div className="conversation-info">
        <div className="top-row">
          <div className="name">{otherUserDetails?.name}</div>
          <div className="time">
            {formatTime(conversation.lastMessageTime)}
          </div>
        </div>
        
        <div className="bottom-row">
          <div className="last-message">
            {conversation.lastMessageSender === currentUser.uid && 'You: '}
            {conversation.lastMessage || 'No messages yet'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationCard;
