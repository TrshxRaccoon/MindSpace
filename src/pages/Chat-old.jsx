import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFirebaseRealtimeChat } from '../contexts/FirebaseRealtimeChatContext';
import DashboardLayout from '../components/DashboardLayout';
import FirebaseOnlineMentorsList from '../components/FirebaseOnlineMentorsList';
import FirebaseChatInterface from '../components/FirebaseChatInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowLeft, Users, Clock } from 'lucide-react';

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userChats, isConnected } = useFirebaseRealtimeChat();
  
  const [currentChatId, setCurrentChatId] = useState(id || null);
  const [showMentorsList, setShowMentorsList] = useState(!id);

  // Update current chat when URL parameter changes
  useEffect(() => {
    if (id) {
      setCurrentChatId(id);
      setShowMentorsList(false);
    } else {
      setCurrentChatId(null);
      setShowMentorsList(true);
    }
  }, [id]);

  // Handle starting a chat with a mentor
  const handleStartChat = (chatId, mentor) => {
    setCurrentChatId(chatId);
    setShowMentorsList(false);
    navigate(`/chat/${chatId}`, { replace: true });
  };

  // Handle going back to mentors list
  const handleBackToMentors = () => {
    setShowMentorsList(true);
    setCurrentChatId(null);
    navigate('/chat', { replace: true });
  };

  // Handle selecting an existing chat
  const handleSelectExistingChat = (chatId) => {
    setCurrentChatId(chatId);
    setShowMentorsList(false);
    navigate(`/chat/${chatId}`, { replace: true });
  };

  const formatChatName = (chat) => {
    if (!chat.members || !user) return 'Unknown Chat';
    
    const otherMemberId = Object.keys(chat.members).find(id => id !== user.uid);
    const otherMember = chat.members[otherMemberId];
    
    return otherMember?.displayName || 'Chat';
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      return '';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {showMentorsList ? 'Chat with Mentors' : 'Live Chat'}
            </h2>
            <p className="text-muted-foreground mt-1">
              {showMentorsList 
                ? 'Connect with experienced mentors for guidance and support'
                : 'Real-time conversation with your mentor'
              }
            </p>
          </div>
          {!showMentorsList && (
            <Button onClick={handleBackToMentors} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Mentors
            </Button>
          )}
        </div>

        {showMentorsList ? (
          <div className="space-y-6">
            {/* Online Mentors List */}
            <FirebaseOnlineMentorsList onStartChat={handleStartChat} />

            {/* Recent Chats */}
            {userChats.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <CardTitle className="text-lg">Recent Conversations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userChats
                      .sort((a, b) => {
                        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
                        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
                        return timeB - timeA;
                      })
                      .slice(0, 5)
                      .map((chat) => (
                        <div
                          key={chat.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleSelectExistingChat(chat.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <MessageCircle className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {formatChatName(chat)}
                              </p>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                {chat.lastMessage && (
                                  <span className="truncate max-w-[200px]">
                                    {chat.lastMessage}
                                  </span>
                                )}
                                {chat.lastMessageTime && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center space-x-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{formatLastMessageTime(chat.lastMessageTime)}</span>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Continue Chat
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help Section */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">How to chat with mentors</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Browse available online mentors above</li>
                      <li>• Click "Chat" to start a real-time conversation</li>
                      <li>• Ask questions about your goals, challenges, or career</li>
                      <li>• Mentors are here to provide guidance and support</li>
                      <li>• All conversations are private and secure</li>
                      <li>• Your chat history is saved for future reference</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Chat Interface */
          <FirebaseChatInterface 
            chatId={currentChatId} 
            onBack={handleBackToMentors}
          />
        )}

        {/* Connection Status */}
        {!isConnected && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-yellow-800">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-800"></div>
                <span className="text-sm">Connecting to chat...</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Chat;
    }
  };

  // Get messages for current room
  const roomMessages = messages[id] || [];

  return (
    <DashboardLayout title={`Chat: ${formatRoomName(id)}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Chat Session</h2>
            <p className="text-muted-foreground">
              Having a conversation in chat room: <span className="font-mono font-semibold">{id}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </Badge>
          </div>
        </div>

        {/* Online Mentors Section */}
        <Card className="border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Available Mentors</CardTitle>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-300">
                {onlineMentors} Online
              </Badge>
            </div>
            <CardDescription>
              Professional mentors available to help you right now
            </CardDescription>
          </CardHeader>
          <CardContent>
            {onlineMentors > 0 ? (
              <div className="space-y-3">
                {onlineMentorsList.map((mentor, index) => (
                  <div key={mentor.email || index} className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={mentor.photoURL} alt={mentor.displayName} />
                      <AvatarFallback className="bg-green-200 text-green-700">
                        {mentor.displayName?.charAt(0)?.toUpperCase() || 'M'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {mentor.displayName || 'Anonymous Mentor'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">Online</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Users className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No mentors online right now</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Chat Messages */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <CardTitle>Live Chat - {formatRoomName(id)}</CardTitle>
            </div>
            <CardDescription>
              Real-time chat with peers and mentors
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Messages Area */}
            <div className="space-y-4 mb-4">
              <div className="h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                {roomMessages.length > 0 ? (
                  <div className="space-y-3">
                    {roomMessages.map((msg, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {msg.sender?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {msg.sender?.displayName || 'Anonymous'}
                            </span>
                            {msg.sender?.userType === 'mentor' && (
                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                Mentor
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="flex items-center space-x-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={!isConnected}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || !isConnected}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Connection Status */}
              <div className="text-xs text-gray-500">
                Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'} | 
                Room: {id} | 
                Messages: {roomMessages.length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Chat;