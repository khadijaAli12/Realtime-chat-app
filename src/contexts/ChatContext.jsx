// src/contexts/ChatContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [archivedConversations, setArchivedConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  // Fetch all users
  useEffect(() => {
    if (!user) {
      setUsers([]);
      setUsersLoading(false);
      return;
    }

    console.log('Fetching users for chat...');
    setUsersLoading(true);
    setUsersError(null);

    const usersQuery = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      console.log('Users snapshot received, docs:', snapshot.docs.length);
      
      const allUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(u => u.uid !== user.uid);
      
      console.log('Filtered users (excluding self):', allUsers.length);
      setUsers(allUsers);
      setUsersLoading(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      setUsersError(error.message);
      setUsersLoading(false);
      
      if (error.code === 'permission-denied') {
        console.error('Permission denied - check Firestore security rules');
      }
    });

    return unsubscribe;
  }, [user]);

  // Listen to conversations (both active and archived)
  useEffect(() => {
    if (!user) return;

    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
      const allConversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        const aTime = a.lastMessageTime?.toDate?.() || new Date(0);
        const bTime = b.lastMessageTime?.toDate?.() || new Date(0);
        return bTime - aTime;
      });

      // Separate archived and active conversations
      const active = allConversations.filter(conv => 
        !conv.archivedBy || !conv.archivedBy[user.uid]
      );
      const archived = allConversations.filter(conv => 
        conv.archivedBy && conv.archivedBy[user.uid]
      );
      
      setConversations(active);
      setArchivedConversations(archived);
    });

    return unsubscribe;
  }, [user]);

  // Listen to messages in active conversation
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    setLoading(true);
    const messagesQuery = query(
      collection(db, 'conversations', activeConversation.id, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setLoading(false);
    });

    return unsubscribe;
  }, [activeConversation]);

  // FIXED: Updated sendMessage to handle both string and object inputs
  const sendMessage = async (messageInput) => {
    if (!user || !activeConversation) {
      throw new Error('No user or active conversation');
    }

    try {
      // Handle both string and object inputs
      let messageText, replyTo;
      
      if (typeof messageInput === 'string') {
        messageText = messageInput;
        replyTo = null;
      } else if (typeof messageInput === 'object' && messageInput.text) {
        messageText = messageInput.text;
        replyTo = messageInput.replyTo || null;
      } else {
        throw new Error('Invalid message format');
      }

      if (!messageText || !messageText.trim()) {
        throw new Error('Message text cannot be empty');
      }

      // Create base message data
      const messageData = {
        text: messageText.trim(),
        senderId: user.uid,
        senderName: user.displayName || user.email || 'Unknown User',
        senderPhoto: user.photoURL || '',
        timestamp: serverTimestamp(),
        status: 'sent',
        isDeleted: false,
        read: false
      };

      // Add reply data if present
      if (replyTo) {
        messageData.replyTo = {
          id: replyTo.id,
          text: replyTo.text,
          senderName: replyTo.senderName,
          senderId: replyTo.senderId
        };
      }

      console.log('Sending message:', messageData);

      // Add message to Firestore
      await addDoc(
        collection(db, 'conversations', activeConversation.id, 'messages'),
        messageData
      );

      // Update conversation last message
      await updateDoc(doc(db, 'conversations', activeConversation.id), {
        lastMessage: messageText.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSender: user.uid
      });

      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!user || !activeConversation) return;

    try {
      const messageRef = doc(db, 'conversations', activeConversation.id, 'messages', messageId);
      
      await updateDoc(messageRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: user.uid,
        originalText: messages.find(m => m.id === messageId)?.text || '',
        text: 'This message was deleted'
      });

      const latestMessage = messages[messages.length - 1];
      if (latestMessage?.id === messageId) {
        const previousMessage = messages
          .slice(0, -1)
          .reverse()
          .find(msg => !msg.isDeleted);

        if (previousMessage) {
          await updateDoc(doc(db, 'conversations', activeConversation.id), {
            lastMessage: previousMessage.text,
            lastMessageTime: previousMessage.timestamp,
            lastMessageSender: previousMessage.senderId
          });
        } else {
          await updateDoc(doc(db, 'conversations', activeConversation.id), {
            lastMessage: '',
            lastMessageTime: serverTimestamp(),
            lastMessageSender: user.uid
          });
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  };

  const permanentlyDeleteMessage = async (messageId) => {
    if (!user || !activeConversation) return;

    try {
      const messageRef = doc(db, 'conversations', activeConversation.id, 'messages', messageId);
      await deleteDoc(messageRef);
    } catch (error) {
      console.error('Error permanently deleting message:', error);
      throw error;
    }
  };

  const archiveConversation = async (conversationId) => {
    if (!user || !conversationId) return;

    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        [`archivedBy.${user.uid}`]: true,
        [`archivedAt.${user.uid}`]: serverTimestamp()
      });

      // If this is the active conversation, clear it
      if (activeConversation?.id === conversationId) {
        setActiveConversation(null);
      }

      return true;
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw error;
    }
  };

  const unarchiveConversation = async (conversationId) => {
    if (!user || !conversationId) return;

    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        [`archivedBy.${user.uid}`]: false,
        [`unarchivedAt.${user.uid}`]: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error unarchiving conversation:', error);
      throw error;
    }
  };

  const startConversation = async (otherUser) => {
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      // Check in both active and archived conversations
      const allConversations = [...conversations, ...archivedConversations];
      const existingConv = allConversations.find(conv =>
        conv.participants.includes(otherUser.uid) && 
        conv.participants.includes(user.uid)
      );

      if (existingConv) {
        // If conversation was archived, unarchive it
        if (existingConv.archivedBy && existingConv.archivedBy[user.uid]) {
          await unarchiveConversation(existingConv.id);
        }
        setActiveConversation(existingConv);
        return existingConv;
      }

      // Create new conversation
      const conversationData = {
        participants: [user.uid, otherUser.uid],
        participantDetails: {
          [user.uid]: {
            name: user.displayName || user.email || 'Unknown User',
            photo: user.photoURL || ''
          },
          [otherUser.uid]: {
            name: otherUser.displayName || otherUser.email || 'Unknown User',
            photo: otherUser.photoURL || ''
          }
        },
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        lastMessageSender: '',
        createdAt: serverTimestamp(),
        archivedBy: {},
        mutedBy: {}
      };

      console.log('Creating new conversation:', conversationData);

      const docRef = await addDoc(collection(db, 'conversations'), conversationData);
      const newConversation = { id: docRef.id, ...conversationData };
      
      setActiveConversation(newConversation);
      return newConversation;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw new Error(`Failed to start conversation: ${error.message}`);
    }
  };

  const markMessagesAsRead = async (conversationId) => {
    if (!user || !conversationId) return;

    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        [`readBy.${user.uid}`]: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const value = {
    conversations,
    archivedConversations,
    messages,
    activeConversation,
    users,
    usersLoading,
    usersError,
    loading,
    showArchived,
    setShowArchived,
    sendMessage,
    deleteMessage,
    permanentlyDeleteMessage,
    archiveConversation,
    unarchiveConversation,
    startConversation,
    setActiveConversation,
    markMessagesAsRead
  };
 
  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
