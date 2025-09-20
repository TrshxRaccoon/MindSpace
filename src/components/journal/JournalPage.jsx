import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Calendar, Save, Edit3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const JournalPage = ({ page, onDelete, isActive }) => {
  const { updateJournalPage } = useAuth();
  const [title, setTitle] = useState(page.title || '');
  const [content, setContent] = useState(page.content || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save functionality
  const saveChanges = useCallback(async () => {
    if (!page.id || isSaving) return;
    
    const hasChanges = 
      title !== (page.title || '') || 
      content !== (page.content || '');
    
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      await updateJournalPage(page.id, {
        title: title || `Page ${page.pageNumber}`,
        content
      });
    } catch (error) {
      console.error('Failed to save page:', error);
    } finally {
      setIsSaving(false);
    }
  }, [title, content, page, updateJournalPage, isSaving]);

  // Auto-save with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      saveChanges();
    }, 1000);

    return () => clearTimeout(timer);
  }, [saveChanges]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      onDelete(page.id);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return '';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={cn(
      "w-full max-w-4xl mx-auto transition-all duration-200 shadow-lg",
      "bg-gradient-to-br from-white via-gray-50/30 to-white",
      isActive ? "ring-2 ring-blue-500/20 shadow-blue-100" : "shadow-gray-200"
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Edit3 className="h-5 w-5 text-gray-400" />
            <Input
              value={title}
              onChange={handleTitleChange}
              placeholder={`Page ${page.pageNumber}`}
              className="text-xl font-semibold border-none px-0 py-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
            />
            {isSaving && (
              <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-600">
                <Save className="h-3 w-3 mr-1" />
                Saving...
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {page.date && (
              <div className="flex items-center space-x-1 text-sm text-muted-foreground bg-gray-50 px-2 py-1 rounded-md">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(page.date)}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Separator className="mt-4" />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Content Area */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 mb-3">
            <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Your thoughts</span>
          </div>
          
          <Textarea
            value={content}
            onChange={handleContentChange}
            placeholder="What's on your mind today? Start writing your thoughts, feelings, or daily reflections..."
            className={cn(
              "min-h-[400px] resize-none border-0 bg-transparent text-base leading-relaxed p-4",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-gray-400 rounded-lg bg-gradient-to-br from-gray-50/50 to-white border border-gray-100"
            )}
            style={{
              lineHeight: '1.8',
              fontFamily: 'ui-serif, Georgia, serif'
            }}
          />
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            {page.lastModified && (
              <span>Last edited: {formatDate(page.lastModified)}</span>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            Page {page.pageNumber}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default JournalPage;