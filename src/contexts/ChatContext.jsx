// src/contexts/ChatContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
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

  // Fetch all users for new chat functionality
  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const allUsers = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(u => u.uid !== user.uid);
      
      setUsers(allUsers);
    };

    fetchUsers();
  }, [user]);

  // Listen to conversations
  useEffect(() => {
    if (!user) return;

    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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
      
      // Mark messages as read
      markMessagesAsRead();
    });

    return unsubscribe;
  }, [activeConversation]);

  // Send message
  const sendMessage = async (text) => {
    if (!user || !activeConversation || !text.trim()) return;

    const messageData = {
      text: text.trim(),
      senderId: user.uid,
      senderName: user.displayName,
      senderPhoto: user.photoURL || '',
      timestamp: serverTimestamp(),
      status: 'sent',
      readBy: [user.uid]
    };

    try {
      // Add message to conversation
      await addDoc(
        collection(db, 'conversations', activeConversation.id, 'messages'),
        messageData
      );

      // Update conversation last message
      await updateDoc(doc(db, 'conversations', activeConversation.id), {
        lastMessage: text.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSender: user.uid,
        [`unreadCount.${user.uid}`]: 0,
        [`unreadCount.${activeConversation.participants.find(p => p !== user.uid)}`]: 
          (activeConversation.unreadCount?.[activeConversation.participants.find(p => p !== user.uid)] || 0) + 1
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Start new conversation
  const startConversation = async (otherUser) => {
    if (!user) return;

    try {
      // Check if conversation already exists
      const existingConv = conversations.find(conv =>
        conv.participants.includes(otherUser.uid) && 
        conv.participants.includes(user.uid)
      );

      if (existingConv) {
        setActiveConversation(existingConv);
        return existingConv;
      }

      // Create new conversation
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
        unreadCount: {
          [user.uid]: 0,
          [otherUser.uid]: 0
        },
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'conversations'), conversationData);
      const newConversation = { id: docRef.id, ...conversationData };
      
      setActiveConversation(newConversation);
      return newConversation;
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async () => {
    if (!user || !activeConversation) return;

    try {
      // Update unread count
      await updateDoc(doc(db, 'conversations', activeConversation.id), {
        [`unreadCount.${user.uid}`]: 0
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
    loading,
    sendMessage,
    startConversation,
    setActiveConversation
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
