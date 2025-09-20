import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  deleteDoc, 
  updateDoc, 
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase-init';
import { 
  Shield, 
  AlertTriangle, 
  Trash2, 
  CheckCircle, 
  XCircle,
  LogOut,
  RefreshCw,
  Flag,
  User,
  Calendar,
  MessageSquare
} from 'lucide-react';

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Verify admin access
    verifyAdminAccess();
    fetchFlaggedPosts();
  }, [user, navigate]);

  const verifyAdminAccess = async () => {
    try {
      if (!user?.email) {
        navigate('/login');
        return;
      }
      
      // Check if user is admin by checking if document with email as ID exists
      const adminDocRef = doc(db, 'admins', user.email);
      const adminSnapshot = await getDoc(adminDocRef);
      
      if (!adminSnapshot.exists()) {
        console.error('Unauthorized admin access attempt');
        await logout();
        navigate('/login');
      }
    } catch (error) {
      console.error('Error verifying admin access:', error);
      navigate('/login');
    }
  };

  const fetchFlaggedPosts = async () => {
    try {
      setLoading(true);
      const flaggedRef = collection(db, 'flagged');
      const q = query(flaggedRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      
      const posts = [];
      snapshot.forEach((doc) => {
        const postData = { id: doc.id, ...doc.data() };
        console.log('Flagged post data:', postData);
        posts.push(postData);
      });
      
      setFlaggedPosts(posts);
    } catch (error) {
      console.error('Error fetching flagged posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      setActionLoading(prev => ({ ...prev, [postId]: 'deleting' }));
      
      // Delete from flagged collection
      await deleteDoc(doc(db, 'flagged', postId));
      
      // Remove from local state
      setFlaggedPosts(prev => prev.filter(post => post.id !== postId));
      
      console.log('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [postId]: null }));
    }
  };

  const handleUnflagPost = async (post) => {
    try {
      setActionLoading(prev => ({ ...prev, [post.id]: 'unflagging' }));
      
      // Add to posts collection
      await addDoc(collection(db, 'posts'), {
        title: post.title,
        content: post.content,
        user: post.user,
        username: post.username,
        date: post.date,
        likes: post.likes || 0,
        likedBy: post.likedBy || [],
        comments: post.comments || {},
        verifiedAt: serverTimestamp(),
        adminApproved: true
      });
      
      // Delete from flagged collection
      await deleteDoc(doc(db, 'flagged', post.id));
      
      // Remove from local state
      setFlaggedPosts(prev => prev.filter(p => p.id !== post.id));
      
      console.log('Post unflagged and moved to posts collection');
    } catch (error) {
      console.error('Error unflagging post:', error);
      alert('Error unflagging post. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [post.id]: null }));
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading flagged content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={fetchFlaggedPosts}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={logout}
                variant="outline"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Flagged Content Review
          </h2>
          <p className="text-gray-600">
            Review and moderate flagged posts. Delete inappropriate content or unflag false positives.
          </p>
          
          <div className="mt-4 flex items-center space-x-4">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Flag className="h-3 w-3" />
              <span>{flaggedPosts.length} Flagged Posts</span>
            </Badge>
          </div>
        </div>

        {/* Flagged Posts Grid */}
        {flaggedPosts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Flagged Content
              </h3>
              <p className="text-gray-600 text-center">
                All posts have been reviewed. Great job keeping the community safe!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {flaggedPosts.map((post) => (
              <Card key={post.id} className="border-red-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-medium text-gray-900">
                        {post.title || 'Untitled Post'}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge 
                          className={`${getSeverityColor(post.llm_verification?.severity)} border`}
                        >
                          {post.llm_verification?.severity || 'Unknown'} Risk
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {post.llm_verification?.reason || 'Flagged'}
                        </Badge>
                      </div>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Post Content */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>

                  {/* Post Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{typeof post.username === 'object' ? JSON.stringify(post.username) : (post.username || 'Unknown')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>{Object.keys(post.comments || {}).length} Comments</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Flag className="h-4 w-4" />
                      <span>{typeof post.numberOfFlags === 'object' ? JSON.stringify(post.numberOfFlags) : (post.numberOfFlags || 0)} Flags</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <Button 
                      onClick={() => handleDeletePost(post.id)}
                      disabled={actionLoading[post.id] === 'deleting'}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      {actionLoading[post.id] === 'deleting' ? (
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          <span>Deleting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Post</span>
                        </div>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={() => handleUnflagPost(post)}
                      disabled={actionLoading[post.id] === 'unflagging'}
                      variant="outline"
                      className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                    >
                      {actionLoading[post.id] === 'unflagging' ? (
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                          <span>Unflagging...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>Unflag & Approve</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;