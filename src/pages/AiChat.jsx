import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Bot, User, Trash2, Loader2, Sparkles, MessageCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Component to format text with markdown-like styling
const FormattedText = ({ text }) => {
  if (!text) return null;

  // Split text by ** for bold formatting
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          // Bold text
          return (
            <span key={index} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </span>
          );
        } else if (part.includes('\n')) {
          // Handle line breaks
          return part.split('\n').map((line, lineIndex) => (
            <React.Fragment key={`${index}-${lineIndex}`}>
              {line}
              {lineIndex < part.split('\n').length - 1 && <br />}
            </React.Fragment>
          ));
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};

const MessageBubble = ({ message, user: currentUser }) => {
  const isUser = message.isUser;
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex w-full gap-3 p-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <Avatar className="h-8 w-8 border-2 border-primary/20">
          <AvatarImage src="/ai-avatar.png" />
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600">
            <Bot className="h-4 w-4 text-white" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col space-y-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm transition-all duration-200 hover:shadow-sm ${
            isUser
              ? 'bg-primary text-primary-foreground ml-12'
              : 'bg-muted border mr-12'
          }`}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{message.content}</span>
          ) : (
            <FormattedText text={message.content} />
          )}
        </div>
        <span className={`text-xs text-muted-foreground px-2 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatMessageTime(message.timestamp)}
        </span>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 border-2 border-muted">
          <AvatarImage src={currentUser?.photoURL} />
          <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500">
            <User className="h-4 w-4 text-white" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

const AiChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { user, saveAiChatMessage, fetchAiChatHistory, clearAiChatHistory } = useAuth();
  const messagesEndRef = useRef(null);

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  useEffect(() => {
    loadChatHistory();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      setIsInitialLoading(true);
      const history = await fetchAiChatHistory();
      setMessages(history.sort((a, b) => a.timestamp.seconds - b.timestamp.seconds));
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      // Save user message
      const userMsg = await saveAiChatMessage(userMessage, true);
      setMessages(prev => [...prev, userMsg]);

      // Get AI response
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(userMessage);
      const response = result.response;
      const aiReply = response.text();

      // Save AI response
      const aiMsg = await saveAiChatMessage(aiReply, false);
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error message
      const errorMsg = await saveAiChatMessage(
        'Sorry, I encountered an error. Please try again later.',
        false
      );
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClearHistory = async () => {
    try {
      const success = await clearAiChatHistory();
      if (success) {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  if (isInitialLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading chat history...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src="/ai-avatar.png" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600">
                    <Bot className="h-6 w-6 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                  <Sparkles className="h-2 w-2 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Assistant</h1>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Gemini 1.5 Flash
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Ready to help you
                  </span>
                </div>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </Button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 relative">
          <ScrollArea className="h-full">
            <div className="pb-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center space-y-6 max-w-md">
                    <div className="relative">
                      <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <MessageCircle className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-yellow-400 flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-yellow-800" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Start Your Conversation</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        I'm your AI assistant powered by Google Gemini. Ask me anything - from answering questions 
                        to helping with creative writing, problem-solving, coding, or just having a friendly chat!
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <Badge variant="outline" className="justify-center">
                        💬 Natural conversations
                      </Badge>
                      <Badge variant="outline" className="justify-center">
                        🧠 Problem solving & analysis
                      </Badge>
                      <Badge variant="outline" className="justify-center">
                        ✍️ Creative writing assistance
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} user={user} />
                  ))}
                </div>
              )}
              
              {isLoading && (
                <div className="flex justify-start p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600">
                        <Bot className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted border rounded-2xl px-4 py-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-muted-foreground">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="border-t bg-card/50 backdrop-blur-sm p-4">
          <div className="flex space-x-3 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Press Enter to send)"
                disabled={isLoading}
                className="pr-12 py-6 text-sm border-2 focus:border-primary/50 transition-colors"
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="lg"
              className="px-6 py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center max-w-2xl mx-auto">
            AI responses are generated by Google Gemini and may contain inaccuracies. 
            Please verify important information from authoritative sources.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AiChat;