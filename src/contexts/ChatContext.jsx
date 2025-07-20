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
  const [usersLoading, setUsersLoading] = useState(true);

  // Fetch all users
  useEffect(() => {
    if (!user) {
      setUsers([]);
      setUsersLoading(false);
      return;
    }

    const usersQuery = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const allUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(u => u.uid !== user.uid);
      
      setUsers(allUsers);
      setUsersLoading(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      setUsersLoading(false);
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
      status: 'sent'
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

  const value = {
    conversations,
    messages,
    activeConversation,
    users,
    usersLoading,
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
