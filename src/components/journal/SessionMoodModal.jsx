import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, Smile, Frown, Angry, Zap, Cloud, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const sessionMoodOptions = [
  { 
    value: 'happy', 
    label: 'Happy', 
    icon: Smile, 
    gradient: 'from-green-400 to-emerald-500',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
    borderColor: 'border-green-200',
    description: 'Feeling joyful and positive'
  },
  { 
    value: 'sad', 
    label: 'Sad', 
    icon: Frown, 
    gradient: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200',
    description: 'Feeling down or melancholic'
  },
  { 
    value: 'angry', 
    label: 'Angry', 
    icon: Angry, 
    gradient: 'from-red-400 to-rose-500',
    bgColor: 'bg-gradient-to-br from-red-50 to-rose-50',
    borderColor: 'border-red-200',
    description: 'Feeling frustrated or upset'
  },
  { 
    value: 'jealous', 
    label: 'Jealous', 
    icon: Zap, 
    gradient: 'from-yellow-400 to-orange-500',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    borderColor: 'border-yellow-200',
    description: 'Feeling envious or competitive'
  },
  { 
    value: 'lonely', 
    label: 'Lonely', 
    icon: Cloud, 
    gradient: 'from-purple-400 to-indigo-500',
    bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50',
    borderColor: 'border-purple-200',
    description: 'Feeling isolated or disconnected'
  }
];

const SessionMoodModal = ({ isOpen, onClose, onSubmit }) => {
  const [selectedMood, setSelectedMood] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedMood || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(selectedMood);
      onClose();
    } catch (error) {
      console.error('Failed to record mood:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onSubmit('neutral');
    onClose();
  };

  if (!isOpen) return null;

  const selectedMoodData = sessionMoodOptions.find(mood => mood.value === selectedMood);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg mx-auto bg-white shadow-2xl border-0">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-900 mb-2">
            How are you feeling today?
          </CardTitle>
          <p className="text-muted-foreground">
            Let's start your journaling session by checking in with your emotions.
          </p>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="pt-6 space-y-6">
          {/* Mood Grid */}
          <div className="grid grid-cols-1 gap-3">
            {sessionMoodOptions.map((mood) => {
              const Icon = mood.icon;
              const isSelected = selectedMood === mood.value;
              
              return (
                <div
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={cn(
                    "p-4 rounded-xl cursor-pointer transition-all duration-300",
                    "border-2 hover:shadow-lg hover:scale-[1.02]",
                    isSelected 
                      ? `${mood.bgColor} ${mood.borderColor} shadow-lg scale-[1.02]`
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      "p-3 rounded-full transition-all",
                      isSelected 
                        ? `bg-gradient-to-br ${mood.gradient} text-white shadow-md`
                        : "bg-white text-gray-500 shadow-sm"
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className={cn(
                        "font-semibold text-lg transition-colors",
                        isSelected ? "text-gray-900" : "text-gray-700"
                      )}>
                        {mood.label}
                      </div>
                      <div className={cn(
                        "text-sm transition-colors",
                        isSelected ? "text-gray-600" : "text-gray-500"
                      )}>
                        {mood.description}
                      </div>
                    </div>
                    {isSelected && (
                      <Badge className="bg-white/90 text-gray-700 border border-gray-200">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Selected
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected mood preview */}
          {selectedMoodData && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <selectedMoodData.icon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    Perfect! You're feeling {selectedMoodData.label.toLowerCase()} today
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  This helps us understand your emotional journey over time.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action buttons */}
          <div className="flex space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Skip for now
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedMood || isSubmitting}
              className={cn(
                "flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
                "text-white shadow-lg hover:shadow-xl transition-all duration-200",
                (!selectedMood || isSubmitting) && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSubmitting ? 'Recording...' : 'Continue to Journal'}
            </Button>
          </div>

          {/* Privacy note */}
          <Separator />
          <div className="text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center space-x-1">
              <span>🔒</span>
              <span>Your mood data is private and secure</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionMoodModal;