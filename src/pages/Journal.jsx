import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Book, Trash2, Calendar, Edit3, BookOpen, Plus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const Journal = () => {
  const { fetchJournals, saveJournalEntry, deleteJournalEntry } = useAuth();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  
  // New entry state
  const [newEntry, setNewEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  
  const moodOptions = [
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'sad', label: 'Sad', emoji: '😢' },
    { value: 'angry', label: 'Angry', emoji: '😠' },
    { value: 'anxious', label: 'Anxious', emoji: '😰' },
    { value: 'calm', label: 'Calm', emoji: '😌' },
    { value: 'excited', label: 'Excited', emoji: '🤗' },
    { value: 'neutral', label: 'Neutral', emoji: '😐' }
  ];

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    try {
      setLoading(true);
      const journalData = await fetchJournals();
      setJournals(journalData);
    } catch (error) {
      console.error('Error loading journals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async () => {
    if (!newEntry.trim() || !selectedMood) {
      alert('Please write something and select a mood before saving.');
      return;
    }

    try {
      setSaving(true);
      const savedEntry = await saveJournalEntry(newEntry, selectedMood);
      if (savedEntry) {
        setNewEntry('');
        setSelectedMood('');
        setIsWriting(false);
        await loadJournals(); // Refresh the list
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
      alert('Failed to save journal entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const startWriting = () => {
    setIsWriting(true);
    setNewEntry('');
    setSelectedMood('');
  };

  const handleDeleteEntry = async (entryIndex) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      try {
        const success = await deleteJournalEntry(entryIndex);
        if (success) {
          await loadJournals(); // Refresh the list
        }
      } catch (error) {
        console.error('Error deleting journal entry:', error);
        alert('Failed to delete journal entry. Please try again.');
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return '';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodEmoji = (mood) => {
    const moodOption = moodOptions.find(option => option.value === mood.toLowerCase());
    return moodOption ? moodOption.emoji : '😐';
  };

  const getNotebookLines = (text) => {
    const lines = text.split('\n');
    const minLines = 15; // Minimum lines to show
    return Math.max(lines.length + 3, minLines); // Add a few extra lines
  };

  return (
    <DashboardLayout title="Journal">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  My Journal
                </h1>
                <p className="text-slate-600 mt-2">Capture your thoughts in beautiful pages</p>
              </div>
            </div>

            {!isWriting && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  onClick={startWriting}
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Edit3 className="h-5 w-5 mr-2" />
                  Start Writing
                </Button>
              </motion.div>
            )}
          </motion.div>

          <AnimatePresence>
            {isWriting && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-12"
              >
                {/* Notebook Writing Page */}
                <div className="relative max-w-4xl mx-auto">
                  {/* Notebook Cover Shadow */}
                  <div className="absolute -inset-6 bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-2xl blur-xl"></div>
                  
                  {/* Main Notebook */}
                  <div className="relative bg-gradient-to-br from-white to-amber-50/30 rounded-2xl shadow-2xl border border-amber-200/50 overflow-hidden">
                    {/* Notebook Binding */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-b from-amber-600 to-orange-600">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-4 h-4 bg-amber-800 rounded-full left-1/2 transform -translate-x-1/2 shadow-inner"
                          style={{ top: `${15 + i * 12}%` }}
                        />
                      ))}
                    </div>

                    {/* Notebook Content */}
                    <div className="pl-16 pr-8 py-8">
                      {/* Date Header */}
                      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-amber-200/50">
                        <div className="flex items-center space-x-2 text-amber-700">
                          <Calendar className="h-4 w-4" />
                          <span className="font-semibold">
                            {new Date().toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsWriting(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </Button>
                      </div>

                      {/* Mood Selection */}
                      <div className="mb-6">
                        <label className="text-sm font-medium text-slate-700 mb-3 block">
                          How are you feeling today?
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {moodOptions.map((mood) => (
                            <motion.button
                              key={mood.value}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedMood(mood.value)}
                              className={cn(
                                "flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200",
                                selectedMood === mood.value
                                  ? "bg-amber-100 border-2 border-amber-400 shadow-md"
                                  : "bg-white border-2 border-slate-200 hover:border-amber-300 hover:bg-amber-50"
                              )}
                            >
                              <span className="text-xl">{mood.emoji}</span>
                              <span className="text-sm font-medium">{mood.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Writing Area */}
                      <div className="relative">
                        {/* Notebook Lines Background */}
                        <div 
                          className="absolute inset-0 opacity-30"
                          style={{
                            backgroundImage: `
                              linear-gradient(to right, #d97706 60px, #d97706 61px, transparent 61px),
                              repeating-linear-gradient(
                                transparent,
                                transparent 31px,
                                #e5e7eb 31px,
                                #e5e7eb 33px
                              )
                            `,
                            backgroundSize: '100% 34px'
                          }}
                        />
                        
                        <Textarea
                          value={newEntry}
                          onChange={(e) => setNewEntry(e.target.value)}
                          placeholder="Dear Journal..."
                          className={cn(
                            "min-h-[400px] resize-none border-0 bg-transparent relative z-10",
                            "text-lg leading-8 font-serif text-slate-700",
                            "placeholder:text-amber-400/60 placeholder:italic placeholder:font-sans",
                            "focus:outline-none focus:ring-0 pl-8"
                          )}
                          style={{
                            lineHeight: '34px',
                            paddingTop: '17px'
                          }}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between mt-8 pt-6 border-t border-amber-200/50">
                        <div className="text-sm text-slate-500">
                          {newEntry.length} characters
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            onClick={() => setIsWriting(false)}
                            className="border-slate-300 hover:bg-slate-50"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveEntry}
                            disabled={!newEntry.trim() || !selectedMood || saving}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Entry'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Journal Entries */}
          <div className="space-y-8">
            {!isWriting && (
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold text-slate-700 text-center mb-8"
              >
                Previous Entries
              </motion.h2>
            )}
            
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-16"
              >
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-500">Loading your journal entries...</p>
                </div>
              </motion.div>
            ) : journals.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="p-6 bg-white/60 rounded-2xl backdrop-blur-sm border border-amber-200/50 max-w-md mx-auto">
                  <Book className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">Your journal is waiting</h3>
                  <p className="text-slate-500">Start your first entry and begin your journey of self-reflection.</p>
                </div>
              </motion.div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {journals.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="group relative"
                  >
                    {/* Journal Page */}
                    <div className="relative bg-gradient-to-br from-white to-amber-50/30 rounded-xl shadow-lg border border-amber-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
                      {/* Left binding simulation */}
                      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-b from-amber-500 to-orange-500 opacity-80">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-amber-700 rounded-full left-1/2 transform -translate-x-1/2"
                            style={{ top: `${20 + i * 30}%` }}
                          />
                        ))}
                      </div>

                      <div className="pl-10 pr-6 py-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-3xl">{getMoodEmoji(entry.mood)}</span>
                            <div>
                              <Badge 
                                variant="outline" 
                                className="text-amber-700 border-amber-300 bg-amber-50"
                              >
                                {entry.mood}
                              </Badge>
                              <p className="text-xs text-slate-500 mt-1 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDate(entry.date)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEntry(index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Content Preview */}
                        <div className="relative">
                          {/* Subtle lines */}
                          <div 
                            className="absolute inset-0 opacity-20"
                            style={{
                              backgroundImage: `
                                repeating-linear-gradient(
                                  transparent,
                                  transparent 19px,
                                  #e5e7eb 19px,
                                  #e5e7eb 20px
                                )
                              `,
                              backgroundSize: '100% 20px'
                            }}
                          />
                          
                          <p className="text-slate-700 text-sm leading-6 relative z-10 font-serif max-h-24 overflow-hidden">
                            {entry.entry || ''}
                          </p>
                          
                          {(entry.entry || '').length > 150 && (
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-amber-200/30">
                          <div className="text-xs text-slate-400">
                            {(entry.entry || '').length} characters
                          </div>
                          <div className="text-xs text-amber-600 font-medium">
                            Entry #{journals.length - index}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Journal;