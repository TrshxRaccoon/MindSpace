import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFirebaseChat } from '../contexts/FirebaseChatContext';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  MessageCircle, 
  Users, 
  UserCheck,
  Clock,
  Loader2,
  Send,
  Wifi,
  WifiOff
} from 'lucide-react';

const Chat = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { 
    isConnected, 
    onlineMentors, 
    onlineMentorsList, 
    messages, 
    joinRoom, 
    sendMessage 
  } = useFirebaseChat();
  
  const [messageInput, setMessageInput] = useState('');
  const [hasJoined, setHasJoined] = useState(false);

  // Join room when component mounts
  useEffect(() => {
    if (id && isConnected && !hasJoined) {
      joinRoom(id);
      setHasJoined(true);
    }

    return () => {
      if (id && hasJoined) {
        // No explicit leaveRoom needed with Firebase, cleanup is handled by onSnapshot unsubscribe
      }
    };
  }, [id, isConnected, hasJoined, joinRoom]);

  // Format chat room name for display
  const formatRoomName = (roomId) => {
    return roomId
      ?.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || 'Unknown Room';
  };

  // Handle sending message
  const handleSendMessage = () => {
    if (messageInput.trim() && id) {
      sendMessage(id, messageInput);
      setMessageInput('');
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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