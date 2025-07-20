// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        photoURL: user.photoURL || '',
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date()
      });
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      // Update online status
      await setDoc(doc(db, 'users', user.uid), {
        isOnline: true,
        lastSeen: new Date()
      }, { merge: true });
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Google Sign In
  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL || '',
          isOnline: true,
          lastSeen: new Date(),
          createdAt: new Date()
        });
      } else {
        // Update online status
        await setDoc(doc(db, 'users', user.uid), {
          isOnline: true,
          lastSeen: new Date()
        }, { merge: true });
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      if (user) {
        // Update offline status
        await setDoc(doc(db, 'users', user.uid), {
          isOnline: false,
          lastSeen: new Date()
        }, { merge: true });
      }
      
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        setUser({
          ...user,
          ...userData
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    signup,
    login,
    googleSignIn,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
