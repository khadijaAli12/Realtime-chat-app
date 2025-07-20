// src/utils/dateFormatter.js
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MM/dd/yyyy');
  }
};

export const formatLastSeen = (timestamp) => {
  if (!timestamp) return 'Never';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return formatDistanceToNow(date, { addSuffix: true });
};

export const formatConversationTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MMM dd');
  }
};
