import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Search, SortAsc, Loader2, RefreshCw, MessageSquare, Heart } from 'lucide-react';

const Posts = () => {
  const { fetchPosts } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await fetchPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPosts = async () => {
    try {
      setRefreshing(true);
      const fetchedPosts = await fetchPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error refreshing posts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort posts
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          const dateA = a.date?.seconds ? a.date.seconds : new Date(a.date).getTime() / 1000;
          const dateB = b.date?.seconds ? b.date.seconds : new Date(b.date).getTime() / 1000;
          return dateB - dateA; // Newest first
        
        case 'likes':
          return (b.likes || 0) - (a.likes || 0);
        
        case 'comments':
          const commentsCountA = a.comments ? Object.keys(a.comments).length : 0;
          const commentsCountB = b.comments ? Object.keys(b.comments).length : 0;
          return commentsCountB - commentsCountA;
        
        default:
          return 0;
      }
    });
  }, [posts, searchTerm, sortBy]);

  const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
  const totalComments = posts.reduce((sum, post) => {
    const commentsCount = post.comments ? Object.keys(post.comments).length : 0;
    return sum + commentsCount;
  }, 0);

  return (
    <DashboardLayout title="Posts">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Community Posts</h2>
            <p className="text-muted-foreground">
              Share your thoughts and connect with others on their mental health journey.
            </p>
          </div>
          <CreatePostModal onPostCreated={refreshPosts} />
        </div>

     
        {/* Search and Sort Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Find Posts</CardTitle>
            <CardDescription>
              Search through community posts and sort by your preference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts by title, content, or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SortAsc className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Latest First</SelectItem>
                    <SelectItem value="likes">Most Liked</SelectItem>
                    <SelectItem value="comments">Most Commented</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshPosts}
                  disabled={refreshing}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>
            
            {/* Active Filters */}
            {searchTerm && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading posts...</span>
            </div>
          </div>
        ) : filteredAndSortedPosts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAndSortedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onUpdate={refreshPosts}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              {searchTerm ? (
                <>
                  <h3 className="text-lg font-medium mb-2">No posts found</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    No posts match your search for "{searchTerm}". Try adjusting your search terms or clear the filter to see all posts.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm('')}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-4">
                    Be the first to share your thoughts with the community! Create a post to start the conversation.
                  </p>
                  <CreatePostModal onPostCreated={refreshPosts} />
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Posts;