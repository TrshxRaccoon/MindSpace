import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { rtdb } from '../firebase-init';
import { 
  ref, 
  push, 
  set, 
  onValue, 
  off, 
  update, 
  serverTimestamp,
  onDisconnect,
  child,
  get
} from 'firebase/database';

const FirebaseRealtimeChatContext = createContext();

export const useFirebaseRealtimeChat = () => {
  const context = useContext(FirebaseRealtimeChatContext);
  if (!context) {
    throw new Error('useFirebaseRealtimeChat must be used within a FirebaseRealtimeChatProvider');
  }
  return context;
};

export const FirebaseRealtimeChatProvider = ({ children }) => {
  const { user, userData } = useAuth();
  const [onlineMentors, setOnlineMentors] = useState([]);
  const [userChats, setUserChats] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Set user online status and handle disconnect
  useEffect(() => {
    if (!user) return;

    const userStatusRef = ref(rtdb, `users/${user.uid}/status`);
    const connectedRef = ref(rtdb, '.info/connected');

    const handleConnection = (snapshot) => {
      if (snapshot.val() === true) {
        setIsConnected(true);
        // Set user as online
        set(userStatusRef, {
          online: true,
          lastSeen: serverTimestamp(),
          userType: userData?.userType || 'peer',
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || null,
          email: user.email
        });

        // Set user as offline when they disconnect
        onDisconnect(userStatusRef).set({
          online: false,
          lastSeen: serverTimestamp(),
          userType: userData?.userType || 'peer',
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || null,
          email: user.email
        });
      } else {
        setIsConnected(false);
      }
    };

    onValue(connectedRef, handleConnection);

    return () => {
      off(connectedRef, 'value', handleConnection);
      // Set offline when component unmounts
      set(userStatusRef, {
        online: false,
        lastSeen: serverTimestamp(),
        userType: userData?.userType || 'peer',
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || null,
        email: user.email
      });
    };
  }, [user, userData]);

  // Listen for online mentors
  useEffect(() => {
    if (!user) return;

    const usersRef = ref(rtdb, 'users');
    
    const handleUsersUpdate = (snapshot) => {
      const users = snapshot.val() || {};
      const mentorsList = [];

      Object.entries(users).forEach(([uid, userData]) => {
        if (userData.status?.online && 
            userData.status?.userType === 'mentor' && 
            uid !== user.uid) {
          mentorsList.push({
            id: uid,
            ...userData.status
          });
        }
      });

      setOnlineMentors(mentorsList);
    };

    onValue(usersRef, handleUsersUpdate);

    return () => off(usersRef, 'value', handleUsersUpdate);
  }, [user]);

  // Listen for user's chats
  useEffect(() => {
    if (!user) return;

    const chatsRef = ref(rtdb, 'chats');
    
    const handleChatsUpdate = (snapshot) => {
      const chats = snapshot.val() || {};
      const userChatsList = [];

      Object.entries(chats).forEach(([chatId, chatData]) => {
        if (chatData.members && chatData.members[user.uid]) {
          userChatsList.push({
            id: chatId,
            ...chatData
          });
        }
      });

      setUserChats(userChatsList);
    };

    onValue(chatsRef, handleChatsUpdate);

    return () => off(chatsRef, 'value', handleChatsUpdate);
  }, [user]);

  // Create or get existing chat between user and mentor
  const createChatWithMentor = async (mentorId, mentorData) => {
    if (!user) return null;

    try {
      // Create a consistent chat ID (smaller ID first)
      const chatId = [user.uid, mentorId].sort().join('_');
      const chatRef = ref(rtdb, `chats/${chatId}`);

      console.log('Creating/checking chat with ID:', chatId);

      // Check if chat already exists
      const snapshot = await get(chatRef);
      
      if (!snapshot.exists()) {
        console.log('Creating new chat...');
        // Create new chat
        const timestamp = Date.now();
        const chatData = {
          members: {
            [user.uid]: {
              displayName: user.displayName || 'User',
              photoURL: user.photoURL || null,
              userType: 'peer',
              joinedAt: timestamp
            },
            [mentorId]: {
              displayName: mentorData.displayName || 'Mentor',
              photoURL: mentorData.photoURL || null,
              userType: 'mentor',
              joinedAt: timestamp
            }
          },
          createdAt: timestamp,
          lastMessage: null,
          lastMessageTime: null
        };

        await set(chatRef, chatData);
        console.log('Chat created successfully');
      } else {
        console.log('Chat already exists');
      }

      return chatId;
    } catch (error) {
      console.error('Error creating chat with mentor:', error);
      return null;
    }
  };

  // Send message to a chat
  const sendMessage = async (chatId, messageText) => {
    if (!user || !messageText.trim()) return false;

    try {
      const messagesRef = ref(rtdb, `chats/${chatId}/messages`);
      const messageRef = push(messagesRef);
      
      const timestamp = Date.now();
      const message = {
        text: messageText.trim(),
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        senderPhoto: user.photoURL || null,
        timestamp: timestamp,
        createdAt: timestamp
      };

      await set(messageRef, message);
      console.log('Message sent successfully:', message);

      // Update chat's last message info
      const chatRef = ref(rtdb, `chats/${chatId}`);
      await update(chatRef, {
        lastMessage: messageText.trim(),
        lastMessageTime: timestamp
      });

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  // Get messages for a specific chat
  const getChatMessages = (chatId, callback) => {
    if (!chatId) return null;

    const messagesRef = ref(rtdb, `chats/${chatId}/messages`);
    
    const handleMessages = (snapshot) => {
      console.log('Messages snapshot:', snapshot.val());
      const messages = snapshot.val() || {};
      const messagesList = Object.entries(messages).map(([id, data]) => ({
        id,
        ...data
      })).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

      console.log('Processed messages list:', messagesList);
      callback(messagesList);
    };

    onValue(messagesRef, handleMessages);

    return () => off(messagesRef, 'value', handleMessages);
  };

  // Get chat details
  const getChatDetails = (chatId, callback) => {
    if (!chatId) return null;

    const chatRef = ref(rtdb, `chats/${chatId}`);
    
    const handleChatDetails = (snapshot) => {
      const chatData = snapshot.val();
      if (chatData) {
        callback({
          id: chatId,
          ...chatData
        });
      }
    };

    onValue(chatRef, handleChatDetails);

    return () => off(chatRef, 'value', handleChatDetails);
  };

  const value = {
    onlineMentors,
    userChats,
    isConnected,
    createChatWithMentor,
    sendMessage,
    getChatMessages,
    getChatDetails
  };

  return (
    <FirebaseRealtimeChatContext.Provider value={value}>
      {children}
    </FirebaseRealtimeChatContext.Provider>
  );
};

export default FirebaseRealtimeChatContext;