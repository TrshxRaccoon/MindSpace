import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, TrendingUp, Heart, BarChart3, Activity, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const MoodAnalytics = () => {
  const { getJournalSessions } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const sessionData = await getJournalSessions();
        setSessions(sessionData);
      } catch (error) {
        console.error('Failed to load session data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [getJournalSessions]);

  const getMoodStats = () => {
    const moodCounts = {};
    sessions.forEach(session => {
      if (session.mood && session.mood !== 'neutral') {
        moodCounts[session.mood] = (moodCounts[session.mood] || 0) + 1;
      }
    });

    const total = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(moodCounts).map(([mood, count]) => ({
      mood: mood.charAt(0).toUpperCase() + mood.slice(1),
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  };

  const getRecentMoods = () => {
    return sessions
      .filter(session => session.mood && session.mood !== 'neutral')
      .slice(-7)
      .reverse();
  };

  const moodColors = {
    happy: {
      bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
      text: 'text-green-800',
      border: 'border-green-200',
      gradient: 'from-green-400 to-emerald-500'
    },
    sad: {
      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      gradient: 'from-blue-400 to-cyan-500'
    },
    angry: {
      bg: 'bg-gradient-to-br from-red-50 to-rose-50',
      text: 'text-red-800',
      border: 'border-red-200',
      gradient: 'from-red-400 to-rose-500'
    },
    jealous: {
      bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      gradient: 'from-yellow-400 to-orange-500'
    },
    lonely: {
      bg: 'bg-gradient-to-br from-purple-50 to-indigo-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
      gradient: 'from-purple-400 to-indigo-500'
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-white">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your mood analytics...</p>
        </CardContent>
      </Card>
    );
  }

  const moodStats = getMoodStats();
  const recentMoods = getRecentMoods();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border-none shadow-md">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-pink-700 to-purple-700 bg-clip-text text-transparent">
                Mood Analytics
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Track your emotional patterns and insights
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Total Sessions</p>
                <p className="text-3xl font-bold text-blue-900">{sessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-pink-700">Mood Entries</p>
                <p className="text-3xl font-bold text-pink-900">{moodStats.reduce((sum, stat) => sum + stat.count, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Most Common</p>
                <p className="text-3xl font-bold text-green-900">{moodStats[0]?.mood || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Mood Distribution */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span>Mood Distribution</span>
            </CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="space-y-4">
            {moodStats.length > 0 ? (
              moodStats.map((stat) => {
                const moodColor = moodColors[stat.mood.toLowerCase()];
                return (
                  <div key={stat.mood} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className={`${moodColor?.bg} ${moodColor?.text} ${moodColor?.border} border`}>
                          <Sparkles className="h-3 w-3 mr-1" />
                          {stat.mood}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{stat.count} sessions</span>
                      </div>
                      <span className="text-sm font-semibold">{stat.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`bg-gradient-to-r ${moodColor?.gradient} h-3 rounded-full transition-all duration-1000 ease-out shadow-sm`}
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No mood data available yet</p>
                <p className="text-sm">Start journaling to see your patterns!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <span>Recent Sessions</span>
            </CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="space-y-3">
            {recentMoods.length > 0 ? (
              recentMoods.map((session) => {
                const moodColor = moodColors[session.mood];
                return (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <Badge className={`${moodColor?.bg} ${moodColor?.text} ${moodColor?.border} border`}>
                      {session.mood.charAt(0).toUpperCase() + session.mood.slice(1)}
                    </Badge>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(session.date.seconds * 1000).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recent sessions</p>
                <p className="text-sm">Your mood history will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MoodAnalytics;