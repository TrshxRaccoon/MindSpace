import React, { useState, useEffect } from 'react';
import { useFirebaseRealtimeChat } from '../contexts/FirebaseRealtimeChatContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageCircle, Loader2, UserCheck, Wifi, WifiOff } from 'lucide-react';

const FirebaseOnlineMentorsList = ({ onStartChat }) => {
  const { onlineMentors, isConnected, createChatWithMentor } = useFirebaseRealtimeChat();
  const [loadingChat, setLoadingChat] = useState(null);

  const handleStartChat = async (mentor) => {
    setLoadingChat(mentor.id);
    try {
      const chatId = await createChatWithMentor(mentor.id, mentor);
      if (chatId && onStartChat) {
        onStartChat(chatId, mentor);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    } finally {
      setLoadingChat(null);
    }
  };

  return (
    <Card className="border-green-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">Available Mentors</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <Badge className="bg-green-100 text-green-700 border-green-300">
              {onlineMentors.length} Online
            </Badge>
          </div>
        </div>
        <CardDescription>
          Professional mentors available to chat with you right now
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Connecting to chat...</p>
            </div>
          </div>
        ) : onlineMentors.length > 0 ? (
          <div className="space-y-3">
            {onlineMentors.map((mentor) => (
              <div key={mentor.id} className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-200 rounded-full">
                    <span className="text-lg font-medium text-green-700">
                      {mentor.username?.charAt(0)?.toUpperCase() || 'M'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {mentor.username || 'Anonymous Mentor'}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">Online Now</span>
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                        Mentor
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleStartChat(mentor)}
                  disabled={loadingChat === mentor.id}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 min-w-[80px]"
                >
                  {loadingChat === mentor.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="mx-auto h-16 w-16 mb-4 opacity-40" />
            <h3 className="font-medium mb-2 text-lg">No mentors online</h3>
            <p className="text-sm">Mentors will appear here when they're available to chat</p>
            <p className="text-xs mt-2 text-gray-400">Check back in a few minutes</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FirebaseOnlineMentorsList;