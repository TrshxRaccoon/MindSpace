import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Brain, Heart, Shield, Star, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('peer'); // 'peer' or 'mentor'
  const [loginMethod, setLoginMethod] = useState('google'); // 'google' or 'email'
  
  // Email/Password form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginResult, setLoginResult] = useState(null);
  const [detectedUserType, setDetectedUserType] = useState(null);
  
  const { 
    signInWithGoogleSmart, 
    signInWithEmailPassword, 
    signUpWithEmailPassword, 
    user, 
    loading: authLoading 
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user && !authLoading) {
      console.log('User authenticated, checking login result:', loginResult);
      
      // If we have loginResult from smart Google login, use that for routing
      if (loginResult) {
        console.log(`Routing user to ${loginResult.userType} dashboard based on database check`);
        if (loginResult.userType === 'mentor') {
          navigate('/mentor', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
        // Clear the login result after navigation
        setLoginResult(null);
      } else {
        // Fallback: use userType state for email login
        console.log(`Fallback routing based on selected tab: ${userType}`);
        if (userType === 'mentor') {
          navigate('/mentor', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    }
  }, [user, authLoading, navigate, from, userType, loginResult]);

  const handleSmartGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      
      console.log(`Initiating smart Google login with selected type: ${userType}`);
      const result = await signInWithGoogleSmart(userType);
      setLoginResult(result);
      setDetectedUserType(result.userType);
      
      console.log('Smart Google login result:', {
        userType: result.userType,
        collection: result.collection,
        isNewUser: result.isNewUser || false
      });
      
      // Navigation will be handled by useEffect when user state updates
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      console.error('Smart Google login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      if (isSignUp) {
        await signUpWithEmailPassword(email, password);
      } else {
        await signInWithEmailPassword(email, password);
      }
      // Don't navigate here - let the useEffect handle it
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Failed to authenticate. Please try again.');
      }
      console.error('Email login error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-pulse text-blue-600 mb-4">
              <UserCheck className="h-8 w-8" />
            </div>
            <p className="text-slate-600">Redirecting...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MindSpace
            </h1>
          </div>
          <p className="text-xl text-slate-600">Welcome to your mental wellness journey</p>
          <p className="text-sm text-slate-500">Choose how you'd like to join our community</p>
          
          {/* Smart Login Helper */}
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              💡 <strong>Smart Login:</strong> Google login checks if you're already registered and routes you to the correct dashboard automatically.
              {detectedUserType && (
                <span className="block mt-1 font-medium text-green-700">
                  ✅ Detected as: {detectedUserType === 'peer' ? 'Peer' : 'Mentor'}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Login Options */}
        <Tabs value={userType} onValueChange={setUserType} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="peer" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Join as Peer</span>
            </TabsTrigger>
            <TabsTrigger value="mentor" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>Join as Mentor</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="peer" className="space-y-4">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-2xl text-blue-700">Join as Peer</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Connect with others on similar mental wellness journeys. Share experiences, 
                  find support, and grow together in a safe, anonymous environment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>Peer Support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Anonymous Chat</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span>Mental Wellness</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>Community</span>
                  </div>
                </div>

                {/* Login Method Selection */}
                <Tabs value={loginMethod} onValueChange={setLoginMethod} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="google">Google</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                  </TabsList>

                  <TabsContent value="google" className="space-y-4 mt-4">
                    {error && userType === 'peer' && loginMethod === 'google' && (
                      <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                        {error}
                      </div>
                    )}

                    <Button 
                      onClick={handleSmartGoogleLogin}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-medium"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          <span>Continue with Google as Peer</span>
                        </div>
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="email" className="space-y-4 mt-4">
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="peer-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="peer-email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="peer-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="peer-password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      {error && userType === 'peer' && loginMethod === 'email' && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                          {error}
                        </div>
                      )}

                      <Button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-medium"
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>{isSignUp ? 'Creating Account...' : 'Signing in...'}</span>
                          </div>
                        ) : (
                          <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                        )}
                      </Button>

                      <div className="text-center text-sm">
                        <button
                          type="button"
                          onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError('');
                          }}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mentor" className="space-y-4">
            <Card className="border-purple-200 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Star className="h-6 w-6 text-purple-600" />
                  <CardTitle className="text-2xl text-purple-700">Join as Mentor</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Guide and support others in their mental wellness journey. Share your expertise 
                  and experience to make a positive impact in the community.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Expert Guidance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Professional Tools</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>Help Others</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span>Impact Lives</span>
                  </div>
                </div>

                {/* Login Method Selection */}
                <Tabs value={loginMethod} onValueChange={setLoginMethod} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="google">Google</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                  </TabsList>

                  <TabsContent value="google" className="space-y-4 mt-4">
                    {error && userType === 'mentor' && loginMethod === 'google' && (
                      <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                        {error}
                      </div>
                    )}

                    <Button 
                      onClick={handleSmartGoogleLogin}
                      disabled={loading}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg font-medium"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          <span>Continue with Google as Mentor</span>
                        </div>
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="email" className="space-y-4 mt-4">
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="mentor-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="mentor-email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mentor-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="mentor-password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      {error && userType === 'mentor' && loginMethod === 'email' && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                          {error}
                        </div>
                      )}

                      <Button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg font-medium"
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>{isSignUp ? 'Creating Account...' : 'Signing in...'}</span>
                          </div>
                        ) : (
                          <span>{isSignUp ? 'Create Mentor Account' : 'Sign In as Mentor'}</span>
                        )}
                      </Button>

                      <div className="text-center text-sm">
                        <button
                          type="button"
                          onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError('');
                          }}
                          className="text-purple-600 hover:text-purple-800 underline"
                        >
                          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 space-y-2">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
          <p className="text-xs">Your privacy and anonymity are our top priorities</p>
        </div>
      </div>
    </div>
  );
};

export default Login;