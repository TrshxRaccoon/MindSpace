import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Brain, Heart, Shield, Star } from 'lucide-react';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('peer'); // 'peer' or 'mentor'
  const [adminLoading, setAdminLoading] = useState(false);
  const [loginResult, setLoginResult] = useState(null);
  const [detectedUserType, setDetectedUserType] = useState(null);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  
  const { 
    signInWithGoogleAsPeer,
    signInWithGoogleAsMentor,
    signInWithGoogle, 
    user, 
    loading: authLoading 
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user && !authLoading && !isAdminLogin) {
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
        // Fallback: use userType state for routing
        console.log(`Fallback routing based on selected tab: ${userType}`);
        if (userType === 'mentor') {
          navigate('/mentor', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    }
  }, [user, authLoading, navigate, from, userType, loginResult, isAdminLogin]);

  const handlePeerLogin = async () => {
    try {
      setError('');
      setLoading(true);
      
      const result = await signInWithGoogleAsPeer();
      setLoginResult(result);
      setDetectedUserType(result.userType);
      
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      console.error('Google peer login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMentorLogin = async () => {
    try {
      setError('');
      setLoading(true);
      
      const result = await signInWithGoogleAsMentor();
      setLoginResult(result);
      setDetectedUserType(result.userType);
      
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      console.error('Google mentor login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    try {
      setError('');
      setAdminLoading(true);
      setIsAdminLogin(true); // Set flag to prevent useEffect navigation
      
      // First authenticate with Google
      console.log('🚀 Starting Google authentication...');
      const user = await signInWithGoogle();
      console.log('📋 Google auth response (user):', user);
      
      if (!user) {
        throw new Error('Google authentication failed - no user data received');
      }
      
      const userEmail = user.email;
      console.log('🔐 Admin Login Attempt - User Email:', userEmail);
      
      if (!userEmail) {
        throw new Error('No email found in user profile');
      }
      
      // Check if user is admin by checking if document with email as ID exists
      const { doc, getDoc, collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('../firebase-init');
      
      // First, let's get all admins to see the structure
      console.log('📋 Fetching all admin documents...');
      const adminsCollectionRef = collection(db, 'admins');
      const allAdminsSnapshot = await getDocs(adminsCollectionRef);
      
      console.log('📊 All Admin Documents:');
      console.log('- Total admin documents found:', allAdminsSnapshot.size);
      allAdminsSnapshot.forEach((adminDoc) => {
        console.log(`- Document ID: "${adminDoc.id}"`);
        console.log(`- Document Data:`, adminDoc.data());
        console.log(`- Document exists:`, adminDoc.exists());
      });
      
      // Now check for the specific user
      console.log(`🔍 Looking for specific admin document with ID: "${userEmail}"`);
      const adminDocRef = doc(db, 'admins', userEmail);
      const adminSnapshot = await getDoc(adminDocRef);
      
      console.log('🎯 Specific Admin Document Check:');
      console.log('- Document exists:', adminSnapshot.exists());
      console.log('- Document ID:', adminSnapshot.id);
      console.log('- Document data:', adminSnapshot.data());
      
      if (!adminSnapshot.exists()) {
        console.log('❌ Admin check failed - User is not authorized');
        // User is not an admin
        setError('You are not authorized to access the admin panel.');
        // Sign out the user since they're not an admin
        const { signOut } = await import('firebase/auth');
        const { auth } = await import('../firebase-init');
        await signOut(auth);
        setIsAdminLogin(false); // Reset flag
        return;
      }
      
      console.log('✅ Admin check passed - Navigating to admin panel');
      // User is admin, navigate to admin panel
      navigate('/admin', { replace: true });
      
    } catch (error) {
      console.log('❌ Admin login error occurred:', error);
      console.log('Error message:', error.message);
      console.log('Error code:', error.code);
      setError('Failed to authenticate as admin. Please try again.');
      console.error('Admin login error:', error);
      setIsAdminLogin(false); // Reset flag on error
    } finally {
      console.log('🏁 Admin login process completed');
      setAdminLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left Side - Dark/Black - Join as Peer */}
      <div className="relative h-full flex-col bg-muted p-10 text-white flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Brain className="mr-2 h-6 w-6" />
          MindSpace
        </div>
        
        {/* Peer Login Section */}
        <div className="relative z-20 flex-1 flex flex-col justify-center space-y-6 max-w-md mx-auto w-full">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Users className="h-8 w-8 text-blue-400" />
              <h2 className="text-3xl font-bold">Join as Peer</h2>
            </div>
            <p className="text-gray-300 text-lg">
              Connect with others on similar mental wellness journeys
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm mt-6">
              <div className="flex items-center space-x-2 text-gray-300">
                <Heart className="h-4 w-4 text-red-400" />
                <span>Peer Support</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Shield className="h-4 w-4 text-green-400" />
                <span>Anonymous Chat</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Brain className="h-4 w-4 text-purple-400" />
                <span>Mental Wellness</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Users className="h-4 w-4 text-blue-400" />
                <span>Community</span>
              </div>
            </div>

            {error && userType === 'peer' && (
              <div className="bg-red-900/20 border border-red-500 text-red-200 text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <Button 
              onClick={handlePeerLogin}
              disabled={loading && userType === 'peer'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg mt-6"
            >
              {loading && userType === 'peer' ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-sm text-gray-400">
              "Your safe space for mental wellness and personal growth."
            </p>
          </blockquote>
        </div>
      </div>

      {/* Right Side - Light/White - Join as Mentor */}
      <div className="lg:p-8 bg-white">
        <div className="mx-auto flex w-full h-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Star className="h-8 w-8 text-purple-600" />
              <h2 className="text-3xl font-bold text-gray-900">Join as Mentor</h2>
            </div>
            <p className="text-gray-600 text-lg">
              Guide and support others in their mental wellness journey
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm mt-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Expert Guidance</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Professional Tools</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Help Others</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Brain className="h-4 w-4 text-purple-500" />
                <span>Impact Lives</span>
              </div>
            </div>

            {error && userType === 'mentor' && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <Button 
              onClick={handleMentorLogin}
              disabled={loading && userType === 'mentor'}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg mt-6"
            >
              {loading && userType === 'mentor' ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </div>
              )}
            </Button>
          </div>

          {/* Smart Login Helper */}
          {detectedUserType && (
            <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 text-center">
                ✅ <strong>Detected as: {detectedUserType === 'peer' ? 'Peer' : 'Mentor'}</strong>
              </p>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-gray-700">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-gray-700">
              Privacy Policy
            </a>
            .
          </p>
          
          {/* Admin Login Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-500">Administrative Access</p>
              
              {error && !userType && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              
              <Button 
                onClick={handleAdminLogin}
                disabled={adminLoading}
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50"
              >
                {adminLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
                    <span>Verifying Admin Access...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-600" />
                    <span>Login as Admin</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;