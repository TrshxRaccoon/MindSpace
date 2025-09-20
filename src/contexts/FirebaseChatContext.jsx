import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc,
  where
} from 'firebase/firestore';
import { db } from '../firebase-init';
import { useAuth } from './AuthContext';

const FirebaseChatContext = createContext();

export const useFirebaseChat = () => {
  const context = useContext(FirebaseChatContext);
  if (!context) {
    throw new Error('useFirebaseChat must be used within a FirebaseChatProvider');
  }
  return context;
};

export const FirebaseChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [onlineMentors, setOnlineMentors] = useState([]);
  const [isConnected, setIsConnected] = useState(true); // Firebase is always "connected"

  // Listen to messages in real-time
  useEffect(() => {
    const messagesRef = collection(db, 'chatMessages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = [];
      snapshot.forEach((doc) => {
        newMessages.push({ id: doc.id, ...doc.data() });
      });
      setMessages(newMessages);
    }, (error) => {
      console.error('Error listening to messages:', error);
    });

    return () => unsubscribe();
  }, []);

  // Listen to online mentors in real-time
  useEffect(() => {
    const mentorsRef = collection(db, 'onlineMentors');
    
    const unsubscribe = onSnapshot(mentorsRef, (snapshot) => {
      const mentorsList = [];
      snapshot.forEach((doc) => {
        const mentorData = doc.data();
        // Only include mentors who have been active in the last 2 minutes
        const isRecentlyActive = mentorData.lastSeen && 
          (new Date() - mentorData.lastSeen.toDate()) < 2 * 60 * 1000;
        
        if (isRecentlyActive) {
          mentorsList.push({ id: doc.id, ...mentorData });
        }
      });
      setOnlineMentors(mentorsList);
    }, (error) => {
      console.error('Error listening to mentors:', error);
    });

    return () => unsubscribe();
  }, []);

  // Send a message
  const sendMessage = async (text, roomId = 'general') => {
    if (!user || !text.trim()) return;

    try {
      await addDoc(collection(db, 'chatMessages'), {
        text: text.trim(),
        sender: {
          uid: user.uid,
          displayName: user.displayName || 'Anonymous',
          email: user.email
        },
        roomId,
        timestamp: serverTimestamp(),
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Set mentor as online
  const setMentorOnline = async () => {
    if (!user || !user.email?.includes('mentor')) return;

    try {
      const mentorRef = doc(db, 'onlineMentors', user.uid);
      await setDoc(mentorRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Anonymous Mentor',
        photoURL: user.photoURL || null,
        lastSeen: serverTimestamp(),
        status: 'online'
      });
      console.log('Mentor set as online');
    } catch (error) {
      console.error('Error setting mentor online:', error);
    }
  };

  // Set mentor as offline
  const setMentorOffline = async () => {
    if (!user) return;

    try {
      const mentorRef = doc(db, 'onlineMentors', user.uid);
      await deleteDoc(mentorRef);
      console.log('Mentor set as offline');
    } catch (error) {
      console.error('Error setting mentor offline:', error);
    }
  };

  // Join a room (no-op for Firebase, but kept for compatibility)
  const joinRoom = (roomId) => {
    console.log('Joined room:', roomId);
  };

  const value = {
    messages,
    onlineMentors: onlineMentors.length,
    onlineMentorsList: onlineMentors,
    isConnected,
    sendMessage,
    setMentorOnline,
    setMentorOffline,
    joinRoom
  };

  return (
    <FirebaseChatContext.Provider value={value}>
      {children}
    </FirebaseChatContext.Provider>
  );
};