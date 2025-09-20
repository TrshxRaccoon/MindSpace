import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const MoodRadarChart = ({ journalData }) => {
  // Define mood categories
  const moodCategories = ['happy', 'sad', 'angry', 'anxious', 'loved', 'surprised'];
  
  // Process journal data to count moods
  const processMoodData = () => {
    const moodCounts = {};
    
    // Initialize mood counts
    moodCategories.forEach(mood => {
      moodCounts[mood] = 0;
    });
    
    // Count occurrences of each mood
    if (journalData && journalData.length > 0) {
      journalData.forEach(entry => {
        const mood = entry.mood?.toLowerCase();
        if (mood && moodCounts.hasOwnProperty(mood)) {
          moodCounts[mood]++;
        }
      });
    }
    
    // Convert to chart data format
    return moodCategories.map(mood => ({
      mood: mood.charAt(0).toUpperCase() + mood.slice(1),
      count: moodCounts[mood],
      fullMark: Math.max(...Object.values(moodCounts)) || 10
    }));
  };

  const chartData = processMoodData();
  const hasData = journalData && journalData.length > 0;

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Mood Analysis</CardTitle>
        <CardDescription>
          {hasData 
            ? `Analysis of your mood patterns from ${journalData.length} journal entries`
            : 'No journal entries yet. Start journaling to see your mood patterns!'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid />
                <PolarAngleAxis 
                  dataKey="mood" 
                  tick={{ fontSize: 12 }}
                  className="text-xs"
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 'dataMax']} 
                  tick={false}
                />
                <Radar
                  name="Mood Count"
                  dataKey="count"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-2xl mb-2">📝</p>
              <p className="text-sm sm:text-base">Start writing journal entries</p>
              <p className="text-xs sm:text-sm">to see your mood analysis</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MoodRadarChart;