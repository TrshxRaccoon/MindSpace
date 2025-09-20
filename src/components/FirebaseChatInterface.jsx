import React, { useState, useEffect, useRef } from 'react';
import { useFirebaseRealtimeChat } from '../contexts/FirebaseRealtimeChatContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, ArrowLeft, MessageCircle, Loader2 } from 'lucide-react';

const FirebaseChatInterface = ({ chatId, onBack }) => {
  const { user } = useAuth();
  const { sendMessage, getChatMessages, getChatDetails } = useFirebaseRealtimeChat();
  const [messages, setMessages] = useState([]);
  const [chatDetails, setChatDetails] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Listen for messages in this chat
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = getChatMessages(chatId, (messagesList) => {
      setMessages(messagesList);
    });

    return unsubscribe;
  }, [chatId, getChatMessages]);

  // Listen for chat details
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = getChatDetails(chatId, (details) => {
      setChatDetails(details);
    });

    return unsubscribe;
  }, [chatId, getChatDetails]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || sending) return;

    setSending(true);
    const message = messageInput;
    setMessageInput('');

    try {
      const success = await sendMessage(chatId, message);
      if (!success) {
        // If failed, restore the message
        setMessageInput(message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageInput(message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };

  const getOtherMember = () => {
    if (!chatDetails?.members || !user) return null;
    
    const otherMemberId = Object.keys(chatDetails.members).find(id => id !== user.uid);
    return chatDetails.members[otherMemberId];
  };

  const otherMember = getOtherMember();

  if (!chatId) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-40" />
          <h3 className="text-lg font-medium mb-2">No chat selected</h3>
          <p className="text-sm">Select a mentor to start chatting</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Header */}
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <Button onClick={onBack} variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {otherMember && (
              <>
                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                  <span className="text-sm font-medium text-primary">
                    {otherMember.username?.charAt(0)?.toUpperCase() || 'M'}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {otherMember.username || 'Mentor'}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {otherMember.userType || 'Mentor'}
                    </Badge>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <h3 className="font-medium mb-2">Start your conversation</h3>
                <p className="text-sm">Send a message to begin chatting with {otherMember?.username || 'the mentor'}</p>
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = message.senderId === user?.uid;
                
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isCurrentUser && (
                      <div className="flex items-center justify-center w-8 h-8 bg-muted/60 rounded-full flex-shrink-0">
                        <span className="text-xs font-medium text-muted-foreground">
                          {message.senderName?.charAt(0)?.toUpperCase() || 'M'}
                        </span>
                      </div>
                    )}
                    
                    <div className={`flex flex-col space-y-1 max-w-[80%]`}>
                      {!isCurrentUser && (
                        <span className="text-xs text-muted-foreground px-2">
                          {message.senderName || 'Anonymous'}
                        </span>
                      )}
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          isCurrentUser
                            ? 'bg-primary text-primary-foreground ml-12'
                            : 'bg-muted mr-12'
                        }`}
                      >
                        {message.text}
                      </div>
                      <span className={`text-xs text-muted-foreground px-2 ${
                        isCurrentUser ? 'text-right' : 'text-left'
                      }`}>
                        {formatTime(message.createdAt)}
                      </span>
                    </div>

                    {isCurrentUser && (
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full flex-shrink-0">
                        <span className="text-xs font-medium text-primary">
                          {user?.username?.charAt(0)?.toUpperCase() || 'Y'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            
            {/* Loading indicator for sending message */}
            {sending && (
              <div className="flex justify-end">
                <div className="bg-primary/10 rounded-lg px-3 py-2 flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Sending...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t p-4 bg-card">
          <div className="flex space-x-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={sending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || sending}
              size="icon"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FirebaseChatInterface;