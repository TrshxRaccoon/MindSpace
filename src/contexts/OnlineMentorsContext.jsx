import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase-init';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

const OnlineMentorsContext = createContext();

export const useOnlineMentors = () => {
  const context = useContext(OnlineMentorsContext);
  if (!context) {
    throw new Error('useOnlineMentors must be used within an OnlineMentorsProvider');
  }
  return context;
};

export const OnlineMentorsProvider = ({ children }) => {
  const [onlineMentors, setOnlineMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Listen to online mentors collection
  useEffect(() => {
    console.log('Setting up online mentors listener...');
    
    try {
      const onlineMentorsRef = collection(db, 'onlineMentors');
      
      // Simplified query - just get all docs first, then filter
      const unsubscribe = onSnapshot(onlineMentorsRef, (snapshot) => {
        console.log('Snapshot received, docs count:', snapshot.docs.length);
        
        const mentors = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Mentor data:', doc.id, data);
          return {
            id: doc.id,
            ...data
          };
        });
        
        console.log('Online mentors updated:', mentors.length, mentors);
        setOnlineMentors(mentors);
        setIsLoading(false);
      }, (error) => {
        console.error('Error listening to online mentors:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        setIsLoading(false);
      });

      return () => {
        console.log('Cleaning up online mentors listener');
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up listener:', error);
      setIsLoading(false);
    }
  }, []);

  // Set mentor as online
  const setMentorOnline = async (mentorData) => {
    console.log('Setting mentor online:', mentorData);
    
    if (!mentorData?.email) {
      console.error('No email provided for mentor');
      return;
    }

    try {
      const mentorRef = doc(db, 'onlineMentors', mentorData.email);
      const mentorDoc = {
        email: mentorData.email,
        displayName: mentorData.displayName || 'Anonymous Mentor',
        photoURL: mentorData.photoURL || null,
        isOnline: true,
        lastSeen: serverTimestamp(),
        joinedAt: serverTimestamp()
      };
      
      console.log('Writing mentor doc:', mentorDoc);
      await setDoc(mentorRef, mentorDoc, { merge: true });

      console.log('✅ Mentor set as online successfully:', mentorData.email);
    } catch (error) {
      console.error('❌ Error setting mentor online:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
    }
  };

  // Set mentor as offline
  const setMentorOffline = async (mentorEmail) => {
    console.log('Setting mentor offline:', mentorEmail);
    
    if (!mentorEmail) {
      console.error('No email provided for offline mentor');
      return;
    }

    try {
      const mentorRef = doc(db, 'onlineMentors', mentorEmail);
      await deleteDoc(mentorRef);
      
      console.log('✅ Mentor set as offline successfully:', mentorEmail);
    } catch (error) {
      console.error('❌ Error setting mentor offline:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
    }
  };

  // Update mentor's last seen timestamp (heartbeat)
  const updateMentorHeartbeat = async (mentorEmail) => {
    if (!mentorEmail) return;

    try {
      const mentorRef = doc(db, 'onlineMentors', mentorEmail);
      await setDoc(mentorRef, {
        lastSeen: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating mentor heartbeat:', error);
    }
  };

  // Clean up offline mentors (optional, can be called periodically)
  const cleanupOfflineMentors = async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // This would typically be done on the server side or with Cloud Functions
    // For now, we'll rely on manual cleanup when mentors disconnect
    console.log('Cleanup offline mentors older than:', fiveMinutesAgo);
  };

  const value = {
    onlineMentors,
    onlineMentorsCount: onlineMentors.length,
    isLoading,
    setMentorOnline,
    setMentorOffline,
    updateMentorHeartbeat,
    cleanupOfflineMentors
  };

  return (
    <OnlineMentorsContext.Provider value={value}>
      {children}
    </OnlineMentorsContext.Provider>
  );
};