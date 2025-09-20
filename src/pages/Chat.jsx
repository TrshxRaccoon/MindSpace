import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOnlineMentors } from '../contexts/OnlineMentorsContext';
import { db } from '../firebase-init';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { 
  MessageCircle, 
  Users, 
  UserCheck,
  Clock,
  Loader2
} from 'lucide-react';

const Chat = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { onlineMentors, onlineMentorsCount, isLoading } = useOnlineMentors();

  // Format chat room name for display
  const formatRoomName = (roomId) => {
    return roomId
      ?.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || 'Unknown Room';
  };

  // Test Firestore connection
  const testFirestore = async () => {
    try {
      console.log('Testing Firestore connection...');
      const testDoc = await addDoc(collection(db, 'test'), {
        message: 'Test from Chat page',
        timestamp: serverTimestamp(),
        user: user?.email || 'anonymous'
      });
      console.log('✅ Firestore test successful! Document ID:', testDoc.id);
      alert('Firestore test successful! Check console for details.');
    } catch (error) {
      console.error('❌ Firestore test failed:', error);
      alert('Firestore test failed! Check console for error details.');
    }
  };

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
        </div>

        {/* Online Mentors Section */}
        <Card className="border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Available Mentors</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                <Badge className="bg-green-100 text-green-700 border-green-300">
                  {onlineMentorsCount} Online
                </Badge>
              </div>
            </div>
            <CardDescription>
              Professional mentors available to help you right now
            </CardDescription>
          </CardHeader>
          <CardContent>
            {onlineMentorsCount > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">
                    {onlineMentorsCount} mentor{onlineMentorsCount !== 1 ? 's' : ''} ready to help
                  </span>
                </div>
                
                {/* List of online mentors */}
                <div className="grid gap-3">
                  {onlineMentors.slice(0, 5).map((mentor, index) => (
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
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>
                            Online since {mentor.joinedAt?.toDate?.() 
                              ? mentor.joinedAt.toDate().toLocaleTimeString() 
                              : 'Recently'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-green-600 font-medium">Online</span>
                      </div>
                    </div>
                  ))}
                  
                  {onlineMentorsCount > 5 && (
                    <div className="text-center text-sm text-gray-500 p-2">
                      + {onlineMentorsCount - 5} more mentor{onlineMentorsCount - 5 !== 1 ? 's' : ''} available
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No mentors online right now</p>
                <p className="text-sm">
                  Mentors typically come online during peak hours. You can still use the chat for peer support!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <CardTitle>Chat Feature</CardTitle>
            </div>
            <CardDescription>Coming Soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Chat functionality for "{formatRoomName(id || '')}" will be implemented here. 
                This will include real-time messaging, AI support, and conversation history.
              </p>

              {/* User info */}
              <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
                <p><strong>Your Info:</strong></p>
                <p>Name: {user?.displayName || 'Anonymous'}</p>
                <p>Email: {user?.email || 'Not available'}</p>
                <p>Room: {formatRoomName(id || '')}</p>
              </div>

              {/* Debug section */}
              <div className="border p-3 rounded-lg bg-yellow-50">
                <p className="font-medium text-sm mb-2">🔧 Debug Info:</p>
                <div className="text-xs space-y-1 mb-3">
                  <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
                  <p>Online Mentors Count: {onlineMentorsCount}</p>
                  <p>Mentors Data: {JSON.stringify(onlineMentors, null, 2)}</p>
                </div>
                <Button 
                  onClick={testFirestore}
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-xs"
                >
                  Test Firestore Connection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Chat;