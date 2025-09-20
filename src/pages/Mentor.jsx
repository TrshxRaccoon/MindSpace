import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFirebaseRealtimeChat } from '../contexts/FirebaseRealtimeChatContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Users, 
  MessageCircle, 
  Calendar, 
  BarChart3, 
  Heart,
  Brain,
  Shield,
  Settings,
  LogOut,
  Wifi,
  WifiOff
} from 'lucide-react';

const Mentor = () => {
  const { user, logout } = useAuth();
  const { isConnected, userChats } = useFirebaseRealtimeChat();

  // Note: Mentor online status is automatically handled by FirebaseRealtimeChatContext
  // No manual status management needed

  const handleLogout = async () => {
    try {
      // Status will be automatically set to offline by the context
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mentor Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, Mentor</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                Mentor Mode
              </Badge>
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600 font-medium">
                  Online & Available
                </span>
              </div>
              <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Coming Soon Banner */}
        <div className="mb-8">
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Star className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-purple-700 mb-2">
                    Mentor Platform Coming Soon!
                  </h2>
                  <p className="text-gray-600 max-w-md">
                    We're building powerful tools for mentors to guide and support 
                    peers in their mental wellness journey. Stay tuned!
                  </p>
                </div>
                <Badge className="bg-purple-600 text-white">
                  In Development
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Online Status Card */}
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-green-50 col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isConnected ? (
                    <Wifi className="h-5 w-5 text-green-600" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-red-600" />
                  )}
                  <CardTitle className="text-lg">Connection Status</CardTitle>
                </div>
                <Badge 
                  variant={isConnected ? "success" : "destructive"}
                  className={isConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                >
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  {isConnected 
                    ? "You are automatically available for real-time chat sessions."
                    : "Connection lost. Attempting to reconnect..."
                  }
                </p>
                <div className="text-xs text-gray-500">
                  Your online status is managed automatically. Peers can see when you're available to chat.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Management */}
          <Card className="border-purple-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Active Sessions</CardTitle>
              </div>
              <CardDescription>
                Manage ongoing peer support conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Active chat sessions</span>
                  <Badge variant="secondary">0</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pending requests</span>
                  <Badge variant="secondary">0</Badge>
                </div>
                <Button 
                  size="sm" 
                  className="w-full mt-3 bg-purple-600 hover:bg-purple-700"
                  onClick={() => window.location.href = '/chat'}
                >
                  Go to Chat Room
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Peer Management */}
          <Card className="border-blue-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Peer Management</CardTitle>
              </div>
              <CardDescription>
                Connect with and guide peers on their mental wellness journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>View peer profiles and progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Track engagement metrics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Assign support resources</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communication Hub */}
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Communication Hub</CardTitle>
              </div>
              <CardDescription>
                Secure messaging and video sessions with peers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Encrypted messaging system</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Video call scheduling</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Group session management</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Planning */}
          <Card className="border-purple-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Session Planning</CardTitle>
              </div>
              <CardDescription>
                Schedule and organize mentoring sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Calendar integration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Session templates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Progress tracking</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Dashboard */}
          <Card className="border-indigo-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
              </div>
              <CardDescription>
                Track impact and peer progress metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  <span>Progress visualization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  <span>Outcome tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  <span>Impact reports</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wellness Tools */}
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-600" />
                <CardTitle className="text-lg">Wellness Tools</CardTitle>
              </div>
              <CardDescription>
                Professional resources for mental health support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span>Assessment templates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span>Intervention strategies</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span>Crisis management tools</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings & Profile */}
          <Card className="border-gray-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-lg">Settings & Profile</CardTitle>
              </div>
              <CardDescription>
                Manage your mentor profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>Professional credentials</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>Availability settings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>Privacy controls</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Brain className="h-12 w-12 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Help Us Build the Future of Mental Wellness
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  We're actively developing these features with mental health professionals 
                  and experienced mentors. Your feedback and expertise are invaluable in 
                  creating the most effective platform for peer support.
                </p>
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                  Join Our Beta Program
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Mentor;