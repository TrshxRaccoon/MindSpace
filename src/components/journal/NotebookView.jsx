import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Book, Calendar, ChevronLeft, ChevronRight, FileText, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import JournalPage from './JournalPage';
import SessionMoodModal from './SessionMoodModal';
import { cn } from '@/lib/utils';

const NotebookView = () => {
  const { 
    fetchJournalPages, 
    createJournalPage, 
    deleteJournalPage, 
    recordJournalSession, 
    shouldAskForMood 
  } = useAuth();
  const [pages, setPages] = useState([]);
  const [activePageId, setActivePageId] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [moodModalShown, setMoodModalShown] = useState(false);

  // Load journal pages on component mount
  useEffect(() => {
    const loadPages = async () => {
      try {
        const journalPages = await fetchJournalPages();
        setPages(journalPages);
        if (journalPages.length > 0 && !activePageId) {
          setActivePageId(journalPages[0].id);
        }
      } catch (error) {
        console.error('Failed to load journal pages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPages();
  }, [fetchJournalPages, activePageId]);

  // Check if mood modal should be shown - only once per session
  useEffect(() => {
    const checkMoodRequirement = async () => {
      if (!moodModalShown && !sessionStorage.getItem('moodAskedThisSession')) {
        const shouldAsk = await shouldAskForMood();
        if (shouldAsk) {
          setShowMoodModal(true);
          sessionStorage.setItem('moodAskedThisSession', 'true');
        }
        setMoodModalShown(true);
      }
    };

    if (!loading) {
      checkMoodRequirement();
    }
  }, [loading, shouldAskForMood, moodModalShown]);

  const handleCreatePage = async () => {
    if (creating) return;
    
    setCreating(true);
    try {
      const newPage = await createJournalPage();
      if (newPage) {
        setPages(prev => [...prev, newPage]);
        setActivePageId(newPage.id);
      }
    } catch (error) {
      console.error('Failed to create new page:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePage = async (pageId) => {
    try {
      await deleteJournalPage(pageId);
      
      // Update local state
      const updatedPages = pages
        .filter(page => page.id !== pageId)
        .map((page, index) => ({
          ...page,
          pageNumber: index + 1
        }));
      
      setPages(updatedPages);
      
      // Update active page if deleted page was active
      if (activePageId === pageId) {
        if (updatedPages.length > 0) {
          setActivePageId(updatedPages[0].id);
        } else {
          setActivePageId('');
        }
      }
    } catch (error) {
      console.error('Failed to delete page:', error);
    }
  };

  const navigateToPage = (direction) => {
    if (pages.length === 0) return;
    
    const currentIndex = pages.findIndex(page => page.id === activePageId);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : pages.length - 1;
    } else {
      newIndex = currentIndex < pages.length - 1 ? currentIndex + 1 : 0;
    }
    
    setActivePageId(pages[newIndex].id);
  };

  const handleMoodSubmit = async (mood) => {
    try {
      await recordJournalSession(mood);
      setShowMoodModal(false);
    } catch (error) {
      console.error('Failed to record session mood:', error);
    }
  };

  const activePage = pages.find(page => page.id === activePageId);
  const currentPageIndex = pages.findIndex(page => page.id === activePageId);
  const totalPages = pages.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-none shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Book className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                  My Journal
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Your personal space for thoughts and reflections
                </p>
              </div>
              <Badge variant="secondary" className="bg-white/60 text-blue-700 border border-blue-200">
                <Sparkles className="h-3 w-3 mr-1" />
                {totalPages} {totalPages === 1 ? 'page' : 'pages'}
              </Badge>
            </div>
            <Button 
              onClick={handleCreatePage}
              disabled={creating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              {creating ? 'Creating...' : 'New Page'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {pages.length === 0 ? (
        // Empty state with better design
        <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-white border-dashed border-2 border-gray-200">
          <CardContent>
            <div className="max-w-md mx-auto space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <FileText className="h-10 w-10 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  Welcome to Your Journal
                </h3>
                <p className="text-gray-600">
                  Start your journaling journey by creating your first page. 
                  Write your thoughts, track your progress, and reflect on your experiences.
                </p>
              </div>
              <Button 
                onClick={handleCreatePage}
                disabled={creating}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Page
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Sidebar with pages */}
          <div className="xl:col-span-1">
            <Card className="h-fit sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center space-x-2">
                  <Book className="h-4 w-4" />
                  <span>Pages</span>
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-1 p-3">
                    {pages.map((page, index) => {
                      const isActive = page.id === activePageId;
                      const pageDate = page.date?.seconds 
                        ? new Date(page.date.seconds * 1000).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })
                        : '';
                      
                      return (
                        <div
                          key={page.id}
                          onClick={() => setActivePageId(page.id)}
                          className={cn(
                            "p-3 rounded-lg cursor-pointer transition-all duration-200",
                            "border hover:border-gray-300 hover:shadow-sm",
                            isActive 
                              ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-md" 
                              : "bg-white border-gray-100 hover:bg-gray-50"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={cn(
                              "text-sm font-medium truncate",
                              isActive ? "text-blue-900" : "text-gray-900"
                            )}>
                              {page.title || `Page ${page.pageNumber}`}
                            </span>
                            <Badge variant="outline" className="text-xs shrink-0 ml-2">
                              {index + 1}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{pageDate || 'Today'}</span>
                          </div>
                          {page.content && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                              {page.content.substring(0, 60)}
                              {page.content.length > 60 && '...'}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main content area */}
          <div className="xl:col-span-4">
            <div className="space-y-6">
              {/* Navigation controls */}
              {totalPages > 1 && (
                <Card className="bg-white/60 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateToPage('prev')}
                        className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Previous</span>
                      </Button>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-white/80 text-gray-700">
                          Page {currentPageIndex + 1} of {totalPages}
                        </Badge>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateToPage('next')}
                        className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <span>Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Active page */}
              {activePage && (
                <JournalPage
                  page={activePage}
                  onDelete={handleDeletePage}
                  isActive={true}
                />
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Session Mood Modal - only show once per session */}
      <SessionMoodModal
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onSubmit={handleMoodSubmit}
      />
    </div>
  );
};

export default NotebookView;