import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../firebase-init';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  const [loading, setLoading] = useState(true);

  const generateRandomUsername = () => {
    return uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: '_',
      length: 2,
      style: 'lowerCase'
    });
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
          lastLoginAt: new Date().toISOString()
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await createUserInFirestore(user);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};