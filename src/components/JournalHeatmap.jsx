import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const JournalHeatmap = ({ journalData }) => {
  // Generate last 365 days
  const generateDatesArray = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(new Date(date));
    }
    
    return dates;
  };

  // Process journal data to create date-count mapping
  const processJournalData = () => {
    const dateCountMap = {};
    
    if (journalData && journalData.length > 0) {
      journalData.forEach(entry => {
        if (entry.date) {
          // Convert timestamp to date string
          let dateStr;
          if (entry.date.seconds) {
            // Firestore timestamp
            dateStr = new Date(entry.date.seconds * 1000).toDateString();
          } else if (typeof entry.date === 'string') {
            // String date
            dateStr = new Date(entry.date).toDateString();
          } else {
            // Regular Date object
            dateStr = new Date(entry.date).toDateString();
          }
          
          dateCountMap[dateStr] = (dateCountMap[dateStr] || 0) + 1;
        }
      });
    }
    
    return dateCountMap;
  };

  // Get intensity level based on entry count
  const getIntensityLevel = (count) => {
    if (count === 0) return 'bg-gray-100 border-gray-200';
    if (count === 1) return 'bg-green-100 border-green-200';
    if (count === 2) return 'bg-green-200 border-green-300';
    if (count === 3) return 'bg-green-300 border-green-400';
    return 'bg-green-400 border-green-500';
  };

  const dates = generateDatesArray();
  const dateCountMap = processJournalData();
  
  // Group dates by weeks
  const weeks = [];
  let currentWeek = [];
  
  dates.forEach((date, index) => {
    currentWeek.push(date);
    
    // If it's Sunday (0) or the last date, start a new week
    if (date.getDay() === 6 || index === dates.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Journal Activity</CardTitle>
        <CardDescription>
          Your journaling activity over the past year - each square represents a day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          {/* Scrollable container for smaller screens */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px] flex flex-col space-y-2">
              {/* Month labels */}
              <div className="flex space-x-1 mb-2 pl-16">
                {Array.from({ length: 52 }, (_, weekIndex) => {
                  const weekStart = weeks[weekIndex]?.[0];
                  if (!weekStart) return <div key={weekIndex} className="w-3" />;
                  
                  const isFirstOfMonth = weekStart.getDate() <= 7;
                  const monthName = monthNames[weekStart.getMonth()];
                  
                  return (
                    <div key={weekIndex} className="w-3 text-xs text-gray-500 text-left">
                      {isFirstOfMonth ? monthName.slice(0, 3) : ''}
                    </div>
                  );
                })}
              </div>
              
              {/* Heatmap grid */}
              <div className="flex space-x-1">
                {/* Day labels */}
                <div className="flex flex-col space-y-1 mr-2 w-12 flex-shrink-0">
                  {dayNames.map((day, index) => (
                    <div key={day} className="text-xs text-gray-500 h-3 flex items-center">
                      {index % 2 === 1 ? day.slice(0, 3) : ''}
                    </div>
                  ))}
                </div>
                
                {/* Calendar grid */}
                <div className="flex space-x-1 flex-1">
                  {weeks.slice(0, 52).map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col space-y-1">
                      {Array.from({ length: 7 }, (_, dayIndex) => {
                        const date = week[dayIndex];
                        if (!date) return (
                          <div key={dayIndex} className="w-3 h-3 sm:w-3 sm:h-3" />
                        );
                        
                        const dateStr = date.toDateString();
                        const count = dateCountMap[dateStr] || 0;
                        const intensityClass = getIntensityLevel(count);
                        
                        return (
                          <div
                            key={dayIndex}
                            className={`w-3 h-3 sm:w-3 sm:h-3 border rounded-sm ${intensityClass} hover:scale-110 transition-transform cursor-pointer`}
                            title={`${dateStr}: ${count} ${count === 1 ? 'entry' : 'entries'}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 space-y-2 sm:space-y-0">
            <div className="text-xs text-gray-500">
              {journalData ? `${journalData.length} entries in the past year` : 'No entries yet'}
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500 mr-2">Less</span>
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className={`w-3 h-3 border rounded-sm ${getIntensityLevel(level)}`}
                />
              ))}
              <span className="text-xs text-gray-500 ml-2">More</span>
            </div>
          </div>
          
          {/* Mobile scroll hint */}
          <div className="text-xs text-gray-400 text-center sm:hidden">
            ← Scroll to see full year →
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JournalHeatmap;