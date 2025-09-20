import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, Smile, Frown, Angry, Zap, Cloud, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const moodOptions = [
  { 
    value: 'happy', 
    label: 'Happy', 
    icon: Smile, 
    emoji: '😊',
    gradient: 'from-green-400 to-emerald-500',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
    borderColor: 'border-green-200',
    description: 'Feeling joyful and positive'
  },
  { 
    value: 'sad', 
    label: 'Sad', 
    icon: Frown, 
    emoji: '😢',
    gradient: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200',
    description: 'Feeling down or melancholic'
  },
  { 
    value: 'angry', 
    label: 'Angry', 
    icon: Angry, 
    emoji: '😠',
    gradient: 'from-red-400 to-rose-500',
    bgColor: 'bg-gradient-to-br from-red-50 to-rose-50',
    borderColor: 'border-red-200',
    description: 'Feeling frustrated or upset'
  },
  { 
    value: 'jealous', 
    label: 'Jealous', 
    icon: Zap, 
    emoji: '😤',
    gradient: 'from-yellow-400 to-orange-500',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    borderColor: 'border-yellow-200',
    description: 'Feeling envious or competitive'
  },
  { 
    value: 'lonely', 
    label: 'Lonely', 
    icon: Cloud, 
    emoji: '😔',
    gradient: 'from-purple-400 to-indigo-500',
    bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50',
    borderColor: 'border-purple-200',
    description: 'Feeling isolated or disconnected'
  }
];

const CreateJournalModal = ({ isOpen, onClose, onJournalCreated }) => {
  const { createJournal } = useAuth();
  const [title, setTitle] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1); // 1: mood selection, 2: title input

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setStep(2);
  };

  const handleCreate = async () => {
    if (!selectedMood || isCreating) return;
    
    setIsCreating(true);
    try {
      const newJournal = await createJournal(title, selectedMood);
      if (newJournal) {
        onJournalCreated(newJournal);
        // Reset form
        setTitle('');
        setSelectedMood('');
        setStep(1);
      }
    } catch (error) {
      console.error('Failed to create journal:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setSelectedMood('');
    setStep(1);
    onClose();
  };

  const selectedMoodData = moodOptions.find(mood => mood.value === selectedMood);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg mx-auto bg-white shadow-2xl border-0">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-900 mb-2">
            {step === 1 ? 'How are you feeling?' : 'Name your journal'}
          </CardTitle>
          <p className="text-muted-foreground">
            {step === 1 
              ? 'Choose your current mood to start your journal entry'
              : 'Give your journal a meaningful title'
            }
          </p>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="pt-6 space-y-6">
          {step === 1 ? (
            // Step 1: Mood Selection
            <div className="grid grid-cols-1 gap-3">
              {moodOptions.map((mood) => {
                const Icon = mood.icon;
                
                return (
                  <div
                    key={mood.value}
                    onClick={() => handleMoodSelect(mood.value)}
                    className={cn(
                      "p-4 rounded-xl cursor-pointer transition-all duration-300",
                      "border-2 hover:shadow-lg hover:scale-[1.02]",
                      "bg-gray-50 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white rounded-full shadow-sm">
                        <span className="text-2xl">{mood.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-lg text-gray-700">
                          {mood.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {mood.description}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Step 2: Title Input
            <div className="space-y-4">
              {/* Selected mood display */}
              <Card className={cn("border-2", selectedMoodData?.bgColor, selectedMoodData?.borderColor)}>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-2xl">{selectedMoodData?.emoji}</span>
                    <span className="font-medium text-gray-900">
                      Feeling {selectedMoodData?.label.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Perfect! Now let's create your journal.
                  </p>
                </CardContent>
              </Card>

              {/* Title input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Journal Title (Optional)
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`Journal ${new Date().toLocaleDateString()}`}
                  className="text-base"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreate();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use a default name based on today's date
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                  disabled={isCreating}
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className={cn(
                    "flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
                    "text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  )}
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create Journal
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Cancel button - always visible */}
          {step === 1 && (
            <>
              <Separator />
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full"
              >
                Cancel
              </Button>
            </>
          )}

          {/* Privacy note */}
          <Separator />
          <div className="text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center space-x-1">
              <span>🔒</span>
              <span>Your journal is private and secure</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateJournalModal;