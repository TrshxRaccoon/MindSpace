import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import MoodRadarChart from '../components/MoodRadarChart';
import JournalHeatmap from '../components/JournalHeatmap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  BookOpen, 
  TrendingUp, 
  Calendar,
  BarChart3
} from 'lucide-react';

const Home = () => {
  const { user, userData, fetchUserData } = useAuth();

  useEffect(() => {
    if (user?.email && !userData) {
      fetchUserData(user.email);
    }
  }, [user, userData, fetchUserData]);

  // Get journal statistics
  const getJournalStats = () => {
    if (!userData?.journal) return { total: 0, thisWeek: 0, averageMood: 'N/A' };

    const journal = userData.journal;
    const total = journal.length;
    
    // Calculate this week's entries
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const thisWeek = journal.filter(entry => {
      if (!entry.date) return false;
      
      let entryDate;
      if (entry.date.seconds) {
        entryDate = new Date(entry.date.seconds * 1000);
      } else {
        entryDate = new Date(entry.date);
      }
      
      return entryDate > weekAgo;
    }).length;

    // Calculate most common mood
    const moods = journal.map(entry => entry.mood?.toLowerCase()).filter(Boolean);
    const moodCount = moods.reduce((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});
    
    const averageMood = Object.keys(moodCount).length > 0 
      ? Object.keys(moodCount).reduce((a, b) => moodCount[a] > moodCount[b] ? a : b)
      : 'N/A';

    return { total, thisWeek, averageMood };
  };

  const stats = getJournalStats();

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!</h2>
        <p className="text-muted-foreground">
          Here's an overview of your mental health journey.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Journal entries recorded
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
            <p className="text-xs text-muted-foreground">
              Entries in the last 7 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Common Mood</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{stats.averageMood}</div>
            <p className="text-xs text-muted-foreground">
              Based on your entries
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek > 0 ? '🔥' : '💤'}</div>
            <p className="text-xs text-muted-foreground">
              {stats.thisWeek > 0 ? 'Keep it up!' : 'Start journaling today'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <MoodRadarChart journalData={userData?.journal} />
        <JournalHeatmap journalData={userData?.journal} />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Journal Entries</CardTitle>
          <CardDescription>Your latest thoughts and reflections</CardDescription>
        </CardHeader>
        <CardContent>
          {userData?.journal && userData.journal.length > 0 ? (
            <div className="space-y-3">
              {userData.journal
                .sort((a, b) => {
                  const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
                  const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
                  return dateB - dateA;
                })
                .slice(0, 3)
                .map((entry, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium capitalize">Mood: {entry.mood}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.date?.seconds 
                            ? new Date(entry.date.seconds * 1000).toLocaleDateString()
                            : new Date(entry.date).toLocaleDateString()
                          }
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {entry.entry?.length > 100 
                          ? entry.entry.substring(0, 100) + '...'
                          : entry.entry
                        }
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No journal entries yet.</p>
              <p className="text-sm">Start your mental health journey by writing your first entry!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Home;