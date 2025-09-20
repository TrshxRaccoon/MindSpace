import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../firebase-init';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

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
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const generateRandomUsername = () => {
    return uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: '_',
      length: 2,
      style: 'lowerCase'
    });
  };

  const fetchUserData = async (email) => {
    if (!email) return null;
    
    try {
      const userDocRef = doc(db, 'users', email);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    return null;
  };

  const createUserInFirestore = async (userAuth) => {
    if (!userAuth) return;

    const userDocRef = doc(db, 'users', userAuth.email);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const username = generateRandomUsername();
      
      try {
        await setDoc(userDocRef, {
          email: userAuth.email,
          username: username,
          displayName: userAuth.displayName,
          photoURL: userAuth.photoURL,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          journal: [] // Initialize empty journal array
        });
      } catch (error) {
        console.error('Error creating user document:', error);
      }
    } else {
      // Update last login time for existing user
      try {
        await setDoc(userDocRef, {
          lastLoginAt: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        console.error('Error updating user document:', error);
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserInFirestore(result.user);
      return result;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  // Posts functionality
  const fetchPosts = async () => {
    try {
      const postsCollection = collection(db, 'posts');
      const postsQuery = query(postsCollection, orderBy('date', 'desc'));
      const postsSnapshot = await getDocs(postsQuery);
      
      const posts = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return posts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  };

  const createPost = async (postData) => {
    if (!user || !userData) return null;
    
    try {
      const newPost = {
        username: userData.username,
        user: user.email + " (hidden)", // Email but marked as hidden
        title: postData.title,
        content: postData.content,
        date: Timestamp.now(),
        likes: 0,
        likedBy: [],
        comments: {},
        numberOfFlags: 0
      };
      
      const docRef = await addDoc(collection(db, 'posts'), newPost);
      return { id: docRef.id, ...newPost };
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const likePost = async (postId) => {
    if (!user || !userData) return;
    
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (postDoc.exists()) {
        const postData = postDoc.data();
        const likedBy = postData.likedBy || [];
        const currentLikes = postData.likes || 0;
        
        if (likedBy.includes(userData.username)) {
          // Unlike
          await updateDoc(postRef, {
            likedBy: arrayRemove(userData.username),
            likes: currentLikes - 1
          });
        } else {
          // Like
          await updateDoc(postRef, {
            likedBy: arrayUnion(userData.username),
            likes: currentLikes + 1
          });
        }
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const addComment = async (postId, commentText) => {
    if (!user || !userData || !commentText.trim()) return;
    
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (postDoc.exists()) {
        const postData = postDoc.data();
        const currentComments = postData.comments || {};
        
        // Generate a unique comment ID
        const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newComment = {
          content: commentText,
          user: userData.username,
          date: Timestamp.now()
        };
        
        // Update the comments map
        await updateDoc(postRef, {
          [`comments.${commentId}`]: newComment
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Journal functionality - Updated for journal array structure
  const fetchJournals = async () => {
    if (!user?.email) return [];
    
    try {
      const userDocRef = doc(db, 'users', user.email);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const journal = data.journal || [];
        return journal.sort((a, b) => b.date.seconds - a.date.seconds);
      }
      return [];
    } catch (error) {
      console.error('Error fetching journals:', error);
      return [];
    }
  };

  const saveJournalEntry = async (entry, mood) => {
    if (!user?.email || !userData) return null;
    
    try {
      const newJournalEntry = {
        date: Timestamp.now(),
        entry: entry.trim(),
        mood: mood.toLowerCase()
      };
      
      const userDocRef = doc(db, 'users', user.email);
      await updateDoc(userDocRef, {
        journal: arrayUnion(newJournalEntry)
      });
      
      return newJournalEntry;
    } catch (error) {
      console.error('Error saving journal entry:', error);
      throw error;
    }
  };

  const deleteJournalEntry = async (entryIndex) => {
    if (!user?.email) return false;
    
    try {
      const currentJournals = await fetchJournals();
      if (entryIndex >= 0 && entryIndex < currentJournals.length) {
        const updatedJournals = currentJournals.filter((_, index) => index !== entryIndex);
        
        const userDocRef = doc(db, 'users', user.email);
        await updateDoc(userDocRef, {
          journal: updatedJournals
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      return false;
    }
  };

  const updateJournal = async (journalId, updates) => {
    if (!user?.email) return;
    
    try {
      const currentJournals = await fetchJournals();
      const journalIndex = currentJournals.findIndex(journal => journal.id === journalId);
      
      if (journalIndex !== -1) {
        currentJournals[journalIndex] = {
          ...currentJournals[journalIndex],
          ...updates,
          lastModified: Timestamp.now()
        };
        
        const userDocRef = doc(db, 'users', user.email);
        await updateDoc(userDocRef, {
          journals: currentJournals
        });
        
        // Update local userData
        setUserData(prev => ({
          ...prev,
          journals: currentJournals
        }));
      }
    } catch (error) {
      console.error('Error updating journal:', error);
    }
  };

  const deleteJournal = async (journalId) => {
    if (!user?.email) return;
    
    try {
      const currentJournals = await fetchJournals();
      const filteredJournals = currentJournals.filter(journal => journal.id !== journalId);
      
      const userDocRef = doc(db, 'users', user.email);
      await updateDoc(userDocRef, {
        journals: filteredJournals
      });
      
      // Update local userData
      setUserData(prev => ({
        ...prev,
        journals: filteredJournals
      }));
    } catch (error) {
      console.error('Error deleting journal:', error);
    }
  };

  const addPageToJournal = async (journalId) => {
    if (!user?.email) return null;
    
    try {
      const currentJournals = await fetchJournals();
      const journalIndex = currentJournals.findIndex(journal => journal.id === journalId);
      
      if (journalIndex !== -1) {
        const newPage = {
          id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: '',
          createdAt: Timestamp.now()
        };
        
        currentJournals[journalIndex].pages.push(newPage);
        currentJournals[journalIndex].lastModified = Timestamp.now();
        
        const userDocRef = doc(db, 'users', user.email);
        await updateDoc(userDocRef, {
          journals: currentJournals
        });
        
        setUserData(prev => ({
          ...prev,
          journals: currentJournals
        }));
        
        return newPage;
      }
    } catch (error) {
      console.error('Error adding page to journal:', error);
      return null;
    }
  };

  const updateJournalPage = async (journalId, pageId, content) => {
    if (!user?.email) return;
    
    try {
      const currentJournals = await fetchJournals();
      const journalIndex = currentJournals.findIndex(journal => journal.id === journalId);
      
      if (journalIndex !== -1) {
        const pageIndex = currentJournals[journalIndex].pages.findIndex(page => page.id === pageId);
        if (pageIndex !== -1) {
          currentJournals[journalIndex].pages[pageIndex].content = content;
          currentJournals[journalIndex].lastModified = Timestamp.now();
          
          const userDocRef = doc(db, 'users', user.email);
          await updateDoc(userDocRef, {
            journals: currentJournals
          });
          
          setUserData(prev => ({
            ...prev,
            journals: currentJournals
          }));
        }
      }
    } catch (error) {
      console.error('Error updating journal page:', error);
    }
  };

  // Session mood tracking
  const recordJournalSession = async (mood) => {
    if (!user?.email) return;
    
    try {
      const sessionEntry = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: Timestamp.now(),
        mood: mood,
        timestamp: Date.now()
      };
      
      const userDocRef = doc(db, 'users', user.email);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const journalSessions = data.journalSessions || [];
        const updatedSessions = [...journalSessions, sessionEntry];
        
        await updateDoc(userDocRef, {
          journalSessions: updatedSessions
        });
        
        // Update local userData
        setUserData(prev => ({
          ...prev,
          journalSessions: updatedSessions
        }));
      }
    } catch (error) {
      console.error('Error recording journal session:', error);
    }
  };

  const getJournalSessions = async () => {
    if (!user?.email) return [];
    
    try {
      const userDocRef = doc(db, 'users', user.email);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return data.journalSessions || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching journal sessions:', error);
      return [];
    }
  };

  const shouldAskForMood = async () => {
    try {
      const sessions = await getJournalSessions();
      if (sessions.length === 0) return true;
      
      // Check if user has logged a mood in the last 24 hours
      const lastSession = sessions[sessions.length - 1];
      const lastSessionTime = lastSession.timestamp;
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      return (now - lastSessionTime) > twentyFourHours;
    } catch (error) {
      console.error('Error checking mood requirement:', error);
      return true;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await createUserInFirestore(user);
        await fetchUserData(user.email);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userData,
    loading,
    signInWithGoogle,
    logout,
    fetchUserData,
    fetchPosts,
    createPost,
    likePost,
    addComment,
    fetchJournals,
    saveJournalEntry,
    deleteJournalEntry,
    recordJournalSession,
    getJournalSessions,
    shouldAskForMood
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};