// src/utils/messageHelpers.js
import { MESSAGE_STATUS } from './constants';

export const getMessageStatusIcon = (status) => {
  switch (status) {
    case MESSAGE_STATUS.SENT:
      return '✓';
    case MESSAGE_STATUS.DELIVERED:
      return '✓✓';
    case MESSAGE_STATUS.READ:
      return '✓✓';
    default:
      return '';
  }
};

export const getMessageStatusClass = (status) => {
  switch (status) {
    case MESSAGE_STATUS.SENT:
      return 'sent';
    case MESSAGE_STATUS.DELIVERED:
      return 'delivered';
    case MESSAGE_STATUS.READ:
      return 'read';
    default:
      return '';
  }
};

export const shouldShowTimestamp = (currentMessage, previousMessage) => {
  if (!previousMessage) return true;
  
  const currentTime = currentMessage.timestamp?.toDate?.() || new Date(currentMessage.timestamp);
  const previousTime = previousMessage.timestamp?.toDate?.() || new Date(previousMessage.timestamp);
  
  // Show timestamp if messages are more than 5 minutes apart
  return (currentTime - previousTime) > 5 * 60 * 1000;
};
