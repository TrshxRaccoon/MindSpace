import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const JournalHeatmap = ({ journalData }) => {
  // Generate proper heatmap grid starting from Sunday of the week containing 365 days ago
  const generateHeatmapGrid = () => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setDate(today.getDate() - 364); // 365 days total (including today)
    
    // Find the Sunday of the week containing oneYearAgo
    const startDate = new Date(oneYearAgo);
    const dayOfWeek = startDate.getDay(); // 0 = Sunday
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    // Generate all dates from that Sunday to the Saturday of the week containing today
    const endDate = new Date(today);
    const todayDayOfWeek = endDate.getDay();
    const daysToAdd = 6 - todayDayOfWeek; // Days to reach Saturday
    endDate.setDate(endDate.getDate() + daysToAdd);
    
    const dates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
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

  const dates = generateHeatmapGrid();
  const dateCountMap = processJournalData();
  
  // Group dates into weeks (7 days each)
  const weeks = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

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
      <CardContent className="p-4">
        <div className="flex flex-col space-y-2">
          {/* Scrollable container for the heatmap */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[700px] flex flex-col space-y-2">
              {/* Month labels */}
              <div className="flex space-x-1 mb-2 pl-16">
                {weeks.map((week, weekIndex) => {
                  const weekStart = week[0];
                  if (!weekStart) return <div key={weekIndex} className="w-3" />;
                  
                  // Show month name on first week of month or first week overall
                  const isFirstWeekOfMonth = weekStart.getDate() <= 7 || weekIndex === 0;
                  const monthName = monthNames[weekStart.getMonth()];
                  
                  return (
                    <div key={weekIndex} className="w-3 text-xs text-gray-500 text-left">
                      {isFirstWeekOfMonth ? monthName.slice(0, 3) : ''}
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
                <div className="flex space-x-1">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col space-y-1">
                      {week.map((date, dayIndex) => {
                        const dateStr = date.toDateString();
                        const count = dateCountMap[dateStr] || 0;
                        const intensityClass = getIntensityLevel(count);
                        const today = new Date();
                        const isToday = date.toDateString() === today.toDateString();
                        const isFuture = date > today;
                        
                        return (
                          <div
                            key={dayIndex}
                            className={`w-3 h-3 border rounded-sm ${
                              isFuture 
                                ? 'bg-gray-50 border-gray-200 opacity-30' 
                                : intensityClass
                            } ${
                              isToday ? 'ring-1 ring-blue-500' : ''
                            } hover:scale-110 transition-transform cursor-pointer`}
                            title={`${dateStr}: ${isFuture ? 'Future' : `${count} ${count === 1 ? 'entry' : 'entries'}`}`}
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
            ← Swipe to see full year →
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JournalHeatmap;