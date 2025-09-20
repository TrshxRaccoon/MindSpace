import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Book, Calendar, ArrowLeft, FileText, Sparkles, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import JournalEditor from './JournalEditor';
import CreateJournalModal from './CreateJournalModal';
import { cn } from '@/lib/utils';

const JournalView = () => {
  const { fetchJournals, deleteJournal } = useAuth();
  const [journals, setJournals] = useState([]);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load journals on component mount
  useEffect(() => {
    const loadJournals = async () => {
      try {
        const userJournals = await fetchJournals();
        setJournals(userJournals);
      } catch (error) {
        console.error('Failed to load journals:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJournals();
  }, [fetchJournals]);

  const handleJournalCreated = (newJournal) => {
    setJournals(prev => [newJournal, ...prev]);
    setSelectedJournal(newJournal);
    setShowCreateModal(false);
  };

  const handleDeleteJournal = async (journalId) => {
    if (window.confirm('Are you sure you want to delete this journal? This action cannot be undone.')) {
      try {
        await deleteJournal(journalId);
        setJournals(prev => prev.filter(j => j.id !== journalId));
        if (selectedJournal?.id === journalId) {
          setSelectedJournal(null);
        }
      } catch (error) {
        console.error('Failed to delete journal:', error);
      }
    }
  };

  const handleJournalUpdate = (updatedJournal) => {
    setJournals(prev => 
      prev.map(j => j.id === updatedJournal.id ? updatedJournal : j)
    );
    setSelectedJournal(updatedJournal);
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return '';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMoodIcon = (mood) => {
    const moodIcons = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      jealous: '😤',
      lonely: '😔',
      neutral: '😐'
    };
    return moodIcons[mood] || '📝';
  };

  const getMoodColor = (mood) => {
    const colors = {
      happy: 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-800 border-green-200',
      sad: 'bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-800 border-blue-200',
      angry: 'bg-gradient-to-br from-red-50 to-rose-50 text-red-800 border-red-200',
      jealous: 'bg-gradient-to-br from-yellow-50 to-orange-50 text-yellow-800 border-yellow-200',
      lonely: 'bg-gradient-to-br from-purple-50 to-indigo-50 text-purple-800 border-purple-200',
      neutral: 'bg-gradient-to-br from-gray-50 to-slate-50 text-gray-800 border-gray-200'
    };
    return colors[mood] || colors.neutral;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // Show journal editor when a journal is selected
  if (selectedJournal) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedJournal(null)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Journals</span>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getMoodIcon(selectedJournal.mood)}</span>
            <h3 className="text-lg font-semibold">{selectedJournal.title}</h3>
            <Badge className={cn("border", getMoodColor(selectedJournal.mood))}>
              {selectedJournal.mood}
            </Badge>
          </div>
        </div>
        
        <JournalEditor 
          journal={selectedJournal} 
          onUpdate={handleJournalUpdate}
        />
      </div>
    );
  }

  // Main journals list view
  return (
    <div className="space-y-6">
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
                  My Journals
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Create journals and write your thoughts
                </p>
              </div>
              <Badge variant="secondary" className="bg-white/60 text-blue-700 border border-blue-200">
                <Sparkles className="h-3 w-3 mr-1" />
                {journals.length} {journals.length === 1 ? 'journal' : 'journals'}
              </Badge>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Journal
            </Button>
          </div>
        </CardHeader>
      </Card>

      {journals.length === 0 ? (
        // Empty state
        <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-white border-dashed border-2 border-gray-200">
          <CardContent>
            <div className="max-w-md mx-auto space-y-6">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <FileText className="h-10 w-10 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  Start Your First Journal
                </h3>
                <p className="text-gray-600">
                  Create your first journal to begin documenting your thoughts, experiences, and emotional journey.
                </p>
              </div>
              <Button 
                onClick={() => setShowCreateModal(true)}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Journal
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Journals grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journals.map((journal) => (
            <Card 
              key={journal.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
                "bg-gradient-to-br from-white to-gray-50/50 border shadow-sm",
                getMoodColor(journal.mood).includes('green') && "hover:shadow-green-100",
                getMoodColor(journal.mood).includes('blue') && "hover:shadow-blue-100",
                getMoodColor(journal.mood).includes('red') && "hover:shadow-red-100",
                getMoodColor(journal.mood).includes('yellow') && "hover:shadow-yellow-100",
                getMoodColor(journal.mood).includes('purple') && "hover:shadow-purple-100"
              )}
              onClick={() => setSelectedJournal(journal)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getMoodIcon(journal.mood)}</span>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold truncate">
                        {journal.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(journal.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className={cn("text-xs border", getMoodColor(journal.mood))}>
                    {journal.mood}
                  </Badge>
                </div>
              </CardHeader>
              
              <Separator />
              
              <CardContent className="pt-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Pages: {journal.pages?.length || 0}</span>
                    <span>Updated: {formatDate(journal.lastModified)}</span>
                  </div>
                  
                  {journal.pages?.[0]?.content && (
                    <div className="text-sm text-gray-600 bg-gray-50/50 p-3 rounded-lg">
                      <p className="line-clamp-2 leading-relaxed">
                        {journal.pages[0].content.substring(0, 100)}
                        {journal.pages[0].content.length > 100 && '...'}
                      </p>
                    </div>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteJournal(journal.id);
                    }}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    Delete Journal
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Journal Modal */}
      <CreateJournalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onJournalCreated={handleJournalCreated}
      />
    </div>
  );
};

export default JournalView;