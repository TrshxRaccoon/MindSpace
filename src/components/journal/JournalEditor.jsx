import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Save, FileText, ArrowDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const JournalEditor = ({ journal, onUpdate }) => {
  const { addPageToJournal, updateJournalPage } = useAuth();
  const [pages, setPages] = useState(journal.pages || []);
  const [isSaving, setIsSaving] = useState(false);
  const [activePageId, setActivePageId] = useState(pages[0]?.id || '');
  const textareaRefs = useRef({});
  const saveTimeoutRef = useRef(null);

  // Update pages when journal prop changes
  useEffect(() => {
    setPages(journal.pages || []);
    if (!activePageId && journal.pages?.length > 0) {
      setActivePageId(journal.pages[0].id);
    }
  }, [journal, activePageId]);

  // Auto-save functionality with debounce
  const saveContent = useCallback(async (pageId, content) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await updateJournalPage(journal.id, pageId, content);
        
        // Update local state
        const updatedPages = pages.map(page => 
          page.id === pageId ? { ...page, content } : page
        );
        setPages(updatedPages);
        
        // Update parent component
        onUpdate({
          ...journal,
          pages: updatedPages
        });
      } catch (error) {
        console.error('Failed to save page content:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);
  }, [journal, pages, updateJournalPage, onUpdate]);

  // Handle content change
  const handleContentChange = (pageId, content) => {
    // Update local state immediately for responsive UI
    setPages(prevPages => 
      prevPages.map(page => 
        page.id === pageId ? { ...page, content } : page
      )
    );
    
    // Trigger auto-save
    saveContent(pageId, content);
  };

  // Handle adding new page
  const handleAddPage = async () => {
    try {
      const newPage = await addPageToJournal(journal.id);
      if (newPage) {
        setPages(prev => [...prev, newPage]);
        setActivePageId(newPage.id);
        
        // Focus the new page's textarea after a short delay
        setTimeout(() => {
          textareaRefs.current[newPage.id]?.focus();
        }, 100);
        
        // Update parent component
        onUpdate({
          ...journal,
          pages: [...pages, newPage]
        });
      }
    } catch (error) {
      console.error('Failed to add new page:', error);
    }
  };

  // Handle swipe down to create new page (simulated with scroll detection)
  const handleScroll = (e, pageId) => {
    const textarea = e.target;
    const isAtBottom = textarea.scrollTop + textarea.clientHeight >= textarea.scrollHeight - 10;
    const isLastPage = pages.findIndex(p => p.id === pageId) === pages.length - 1;
    
    if (isAtBottom && isLastPage && textarea.value.trim()) {
      // Add subtle visual feedback
      textarea.style.borderBottom = '2px solid #3b82f6';
      setTimeout(() => {
        textarea.style.borderBottom = '';
      }, 200);
    }
  };

  // Auto-resize textarea
  const autoResizeTextarea = (textarea) => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(textarea.scrollHeight, 200) + 'px';
  };

  // Handle key press for creating new page
  const handleKeyDown = (e, pageId) => {
    const textarea = e.target;
    const isLastPage = pages.findIndex(p => p.id === pageId) === pages.length - 1;
    
    // Create new page on Ctrl+Enter or when at bottom and pressing Enter with content
    if (e.key === 'Enter' && (e.ctrlKey || (isLastPage && textarea.selectionStart === textarea.value.length && textarea.value.trim()))) {
      if (textarea.value.trim()) {
        e.preventDefault();
        handleAddPage();
      }
    }
  };

  if (pages.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <p className="text-muted-foreground mb-4">No pages in this journal yet.</p>
          <Button onClick={handleAddPage} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add First Page
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Journal Info */}
      <Card className="bg-gradient-to-r from-gray-50 to-white border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-semibold">{journal.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {pages.length} {pages.length === 1 ? 'page' : 'pages'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isSaving && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border border-blue-200">
                  <Save className="h-3 w-3 mr-1" />
                  Saving...
                </Badge>
              )}
              <Button
                onClick={handleAddPage}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pages */}
      <div className="space-y-6">
        {pages.map((page, index) => {
          const isActive = page.id === activePageId;
          
          return (
            <Card 
              key={page.id} 
              className={cn(
                "transition-all duration-200 notebook-page",
                isActive ? "ring-2 ring-blue-500/20 shadow-lg" : "shadow-sm hover:shadow-md",
                "bg-gradient-to-b from-white to-gray-50/30"
              )}
              onClick={() => setActivePageId(page.id)}
            >
              <CardContent className="p-0">
                {/* Page Header */}
                <div className="p-4 pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-sm font-medium">
                      Page {index + 1}
                    </Badge>
                    {index < pages.length - 1 && (
                      <div className="text-xs text-muted-foreground flex items-center space-x-1">
                        <ArrowDown className="h-3 w-3" />
                        <span>Swipe down for new page</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Writing Area */}
                <div className="p-4 pt-0">
                  <div className="notebook-lines-container relative">
                    <textarea
                      ref={el => textareaRefs.current[page.id] = el}
                      value={page.content || ''}
                      onChange={(e) => {
                        handleContentChange(page.id, e.target.value);
                        autoResizeTextarea(e.target);
                      }}
                      onScroll={(e) => handleScroll(e, page.id)}
                      onKeyDown={(e) => handleKeyDown(e, page.id)}
                      onInput={(e) => autoResizeTextarea(e.target)}
                      placeholder={index === 0 ? "Start writing your thoughts..." : "Continue your story..."}
                      className={cn(
                        "w-full min-h-[300px] p-4 border-0 bg-transparent resize-none",
                        "focus:outline-none focus:ring-0",
                        "text-base leading-7 font-serif",
                        "placeholder:text-gray-400 placeholder:font-sans",
                        "notebook-lines"
                      )}
                      style={{
                        backgroundImage: `
                          linear-gradient(to right, #e5e7eb 0px, #e5e7eb 1px, transparent 1px, transparent 32px, #fca5a5 32px, #fca5a5 33px, transparent 33px),
                          repeating-linear-gradient(
                            transparent,
                            transparent 31px,
                            #e5e7eb 31px,
                            #e5e7eb 32px
                          )
                        `,
                        backgroundSize: '100% 32px',
                        lineHeight: '32px',
                        paddingLeft: '40px'
                      }}
                    />
                    
                    {/* Notebook holes */}
                    <div className="absolute left-2 top-8 bottom-8 flex flex-col justify-center">
                      {[...Array(Math.ceil(300 / 40))].map((_, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full bg-gray-200 border-2 border-gray-300 mb-6"
                          style={{ marginBottom: '32px' }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Page Footer */}
                  <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-muted-foreground text-center">
                    {page.content?.length || 0} characters • 
                    {index === pages.length - 1 && (
                      <span className="ml-2">
                        Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+Enter</kbd> or scroll to bottom to add new page
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Page Button - Always visible at bottom */}
      <Card className="border-dashed border-2 border-gray-300 bg-gray-50/50">
        <CardContent className="p-8 text-center">
          <Button
            onClick={handleAddPage}
            variant="ghost"
            size="lg"
            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          >
            <Plus className="h-6 w-6 mr-2" />
            Add New Page
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Or scroll to the bottom of the last page and press Enter
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default JournalEditor;