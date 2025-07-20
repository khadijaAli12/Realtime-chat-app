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
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

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

  // Listen to conversations
  useEffect(() => {
    if (!user) return;

    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        const aTime = a.lastMessageTime?.toDate?.() || new Date(0);
        const bTime = b.lastMessageTime?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      
      setConversations(convs);
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

  const sendMessage = async (text) => {
    if (!user || !activeConversation || !text.trim()) return;

    const messageData = {
      text: text.trim(),
      senderId: user.uid,
      senderName: user.displayName,
      senderPhoto: user.photoURL || '',
      timestamp: serverTimestamp(),
      status: 'sent',
      isDeleted: false
    };

    try {
      await addDoc(
        collection(db, 'conversations', activeConversation.id, 'messages'),
        messageData
      );

      await updateDoc(doc(db, 'conversations', activeConversation.id), {
        lastMessage: text.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSender: user.uid
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const deleteMessage = async (messageId) => {
    if (!user || !activeConversation) return;

    try {
      const messageRef = doc(db, 'conversations', activeConversation.id, 'messages', messageId);
      
      // Mark message as deleted instead of actually deleting it
      await updateDoc(messageRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: user.uid,
        originalText: messages.find(m => m.id === messageId)?.text || '',
        text: ''
      });

      // Update last message if this was the latest one
      const latestMessage = messages[messages.length - 1];
      if (latestMessage?.id === messageId) {
        // Find the previous non-deleted message
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

  const startConversation = async (otherUser) => {
    if (!user) return;

    try {
      const existingConv = conversations.find(conv =>
        conv.participants.includes(otherUser.uid) && 
        conv.participants.includes(user.uid)
      );

      if (existingConv) {
        setActiveConversation(existingConv);
        return existingConv;
      }

      const conversationData = {
        participants: [user.uid, otherUser.uid],
        participantDetails: {
          [user.uid]: {
            name: user.displayName,
            photo: user.photoURL || ''
          },
          [otherUser.uid]: {
            name: otherUser.displayName,
            photo: otherUser.photoURL || ''
          }
        },
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        lastMessageSender: '',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'conversations'), conversationData);
      const newConversation = { id: docRef.id, ...conversationData };
      
      setActiveConversation(newConversation);
      return newConversation;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (conversationId) => {
    if (!user || !conversationId) return;

    try {
      // This could be expanded to mark individual messages as read
      // For now, we'll just update conversation level read status
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
    messages,
    activeConversation,
    users,
    usersLoading,
    usersError,
    loading,
    sendMessage,
    deleteMessage,
    permanentlyDeleteMessage,
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
