import React, { useState, useEffect, useMemo } from 'react';
import { Utensils, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface FoodEntry {
  id: string;
  date: string;
  value: number;
  user: string;
}

const FoodTracker = () => {
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    value: 0,
  });
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      fetchFoodEntries();
    }
  }, [user, timeframe]);

  const fetchFoodEntries = async () => {
    setIsLoading(true);
    
    let query = supabase
      .from('foods')
      .select('*')
      .eq('user', user?.id)
      .order('date', { ascending: false });
    
    // Apply timeframe filter
    if (timeframe !== 'all') {
      const startDate = new Date();
      if (timeframe === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeframe === 'month') {
        startDate.setDate(startDate.getDate() - 30);
      }
      query = query.gte('date', startDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching food entries:', error);
    } else {
      setFoodEntries(data || []);
    }
    
    setIsLoading(false);
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    const { error } = await supabase
      .from('foods')
      .insert([
        {
          user: user.id,
          date: newEntry.date,
          value: newEntry.value,
        }
      ]);
    
    if (error) {
      console.error('Error adding food entry:', error);
    } else {
      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        value: 0,
      });
      setIsAddingEntry(false);
      fetchFoodEntries();
    }
  };

  const stats = useMemo(() => {
    const totalValue = foodEntries.reduce((sum, entry) => sum + entry.value, 0);
    const avgValue = foodEntries.length > 0 ? totalValue / foodEntries.length : 0;
    
    // Group by date for chart data
    const byDate = foodEntries.reduce((acc, entry) => {
      const date = entry.date;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += entry.value;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalValue,
      avgValue,
      byDate
    };
  }, [foodEntries]);

  // Generate all dates for the selected timeframe
  const timelineData = useMemo(() => {
    const today = new Date();
    const dates: string[] = [];
    
    // Generate dates array based on timeframe
    if (timeframe === 'week') {
      // Get dates for the past 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
    } else if (timeframe === 'month') {
      // Get dates for the past 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
    } else {
      // For 'all', go from earliest entry to today (or last 90 days if no entries)
      if (foodEntries.length > 0) {
        const sortedEntries = [...foodEntries].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        let startDate = new Date(sortedEntries[0].date);
        const endDate = new Date();
        
        // Limit to 90 days max to avoid crowding the UI
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        if (startDate < ninetyDaysAgo) {
          startDate = ninetyDaysAgo;
        }
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          dates.push(new Date(d).toISOString().split('T')[0]);
        }
      } else {
        // Default to last 30 days if no entries
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          dates.push(date.toISOString().split('T')[0]);
        }
      }
    }
    
    // Create entry map for quick lookup
    const entryMap = foodEntries.reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = 0;
      }
      acc[entry.date] += entry.value;
      return acc;
    }, {} as Record<string, number>);
    
    // Create final data with all dates
    return dates.map(date => ({
      date,
      value: entryMap[date] || 0,
      hasData: !!entryMap[date]
    }));
  }, [timeframe, foodEntries]);

  // Calculate max value for height scaling
  const maxValue = useMemo(() => {
    return Math.max(...timelineData.map(item => item.value), 1);
  }, [timelineData]);

  return (
    <><div className="flex mb-4">
          <button
              onClick={() => setIsAddingEntry(true)}
              className="mt-0 ml-8 bg-cardinal text-white font-bold rounded px-4 py-2 hover:bg-white hover:text-black transition-colors "
          >
              New
          </button>
      </div>
      <div className="p-6 m-8 mt-2 bg-darker rounded-lg border border-white/20">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                      <Utensils className="w-6 h-6 text-cardinal" />
                      <h2 className="text-2xl font-bold text-white">Food Score</h2>
                  </div>

                  {/* Timeframe selection */}
                  <div className="flex space-x-2">
                      {['week', 'month', 'all'].map((period) => {
                          const isSelected = timeframe === period;
                          return (
                              <div className="flex flex-col items-center justify-center space-y-2" key={period}>
                                  <button
                                      onClick={() => setTimeframe(period as 'week' | 'month' | 'all')}
                                      className={`px-4 py-1 transition-colors duration-500 text-sm ${isSelected ? 'text-white' : 'text-white/50 hover:text-white/75'}`}
                                  >
                                      {period.charAt(0).toUpperCase() + period.slice(1)}
                                  </button>
                                  <span
                                      className={`relative w-1/2 py-1 h-1 rounded-t-lg animate-fade-in transition-colors ${isSelected
                                              ? 'bg-cardinal shadow-[0_0px_12px_0px_rgba(196,30,58,0.5)]'
                                              : 'bg-transparent'}`} />
                              </div>
                          );
                      })}
                  </div>
              </div>




              {/* Timeline visualization - Simplified with fixed days for week view */}
              <div className="relative mt-12 mb-16">
                  {/* Days of week (only show for week timeframe) */}
                  {timeframe === 'week' && (
                      <div className="flex justify-between mb-12 px-2">
                          {timelineData.map((item, index) => {
                              const { date } = item;
                              const dayDate = new Date(date);
                              const today = new Date();
                              const isToday = dayDate.toDateString() === today.toDateString();
                              const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
                              const dayNum = dayDate.getDate();

                              return (
                                  <div
                                      key={date}
                                      className={`text-center flex-1 font-medium ${isToday ? "text-white [text-shadow:0_0_10px_rgba(255,30,58,0.8),0_0_30px_rgba(255,30,58,1),0_0_50px_rgba(255,30,58,0.6)]" : 'text-gray-400'}`}
                                  >
                                      <div>{dayName}</div>
                                      <div>{dayNum}</div>
                                  </div>
                              );
                          })}
                      </div>
                  )}
                  {/* Month and All timeframes date labels - with fixed positioning */}
                  {(timeframe === 'month' || timeframe === 'all') && (
                      <div className="relative mb-12 h-8 ml-16 mr-16">
                          {/* Calculate 5 evenly distributed dates to show */}
                          {Array.from({ length: 5 }).map((_, i) => {
                              // Calculate index - ensure first and last are exact
                              let index;
                              if (i === 0) {
                                  index = 0; // First item
                              } else if (i === 4) {
                                  index = timelineData.length - 1; // Last item
                              } else {
                                  // Intermediate items
                                  index = Math.floor(i * (timelineData.length - 1) / 4);
                              }

                              const { date } = timelineData[index];
                              const dayDate = new Date(date);

                              // Format date - show month and day
                              const formattedDate = dayDate.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  ...(timeframe === 'all' && { year: '2-digit' })
                              });

                              // Check if this is today's date
                              const today = new Date();
                              const isToday = dayDate.toDateString() === today.toDateString();

                              // Calculate position percentage
                              const position = `${(index / (timelineData.length - 1)) * 100}%`;

                              return (
                                  <div
                                      key={date}
                                      className={`absolute text-center transform -translate-x-1/2 font-medium text-nowrap ${isToday ? "text-white [text-shadow:0_0_10px_rgba(255,30,58,0.8),0_0_30px_rgba(255,30,58,1),0_0_50px_rgba(255,30,58,0.6)]" : 'text-gray-400'}`}
                                      style={{
                                          left: position,
                                          // Adjust for first and last to prevent overflow
                                          transform: i === 0
                                              ? 'translateX(0)'
                                              : i === 4
                                                  ? 'translateX(-100%)'
                                                  : 'translateX(-50%)'
                                      }}
                                  >
                                      <div>{formattedDate}</div>
                                  </div>
                              );
                          })}
                      </div>
                  )}

                  {/* Main visualization area */}
                  <div className="relative h-[350px] bg-darker flex-1 rounded-lg p-2">
                      {/* Horizontal lines (represents 0, 25, 50, 75, 100) */}
                      <div className="absolute left-0 right-0 h-0.5 bg-white top-1/2 transform -translate-y-1/2"></div>
                      <div className="absolute left-0 right-0 h-0.5 bg-gray-700 top-1/4 transform -translate-y-1/2"></div>
                      <div className="absolute left-0 right-0 h-0.5 bg-gray-700 top-3/4 transform -translate-y-1/2"></div>
                      <div className="absolute left-0 right-0 h-0.5 bg-gray-700 top-0 transform -translate-y-1/2"></div>
                      <div className="absolute left-0 right-0 h-0.5 bg-gray-700 top-full transform -translate-y-1/2"></div>

                      {/* Timeline lines */}


                      {/* Timeline points */}
                      <div className="relative h-full flex justify-between">
                          {timelineData.map((item, index) => {
                              const { date, value, hasData } = item;

                              // Normalize value to 0-100 range for positioning
                              // 0 = bottom, 50 = middle line, 100 = top
                              // If no data, we don't show anything
                              if (!hasData) return <div key={date} className="relative flex-1"></div>;

                              // Calculate position - invert the value since 0 is at the bottom in CSS
                              // (0% would be top, 100% would be bottom)
                              const positionPercent = 100 - (value > 100 ? 100 : value < 0 ? 0 : value);

                              return (
                                  <div key={date} className="relative flex-1 h-full">
                                      {/* Data point only - no connecting line */}
                                      <div
                                          className="absolute w-8 h-8 rounded-full bg-cardinal transform -translate-x-1/2 -translate-y-1/2"
                                          style={{
                                              left: '50%',
                                              top: `${positionPercent}%`,
                                              boxShadow: '0 0 10px rgba(196, 30, 58, 0.7)'
                                          }}
                                      >
                                          {/* Value tooltip */}
                                          <div
                                              className="absolute w-auto min-w-8 px-1 text-center text-white text-xs font-bold -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                                          >
                                              {value}
                                          </div>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              </div>



              {/* Add Entry Modal */}
              {isAddingEntry && (
                  <div
                      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-10"
                      onClick={() => setIsAddingEntry(false)}
                  >
                      <div
                          className="bg-darker p-6 rounded-lg w-full max-w-md border border-white/20"
                          onClick={(e) => e.stopPropagation()}
                      >
                          <h3 className="text-xl font-bold text-white mb-4">Add Food Entry</h3>
                          <form onSubmit={handleAddEntry} className="space-y-4">
                              <div>
                                  <label className="block text-sm font-medium text-left text-gray-400">Date</label>
                                  <input
                                      type="date"
                                      value={newEntry.date}
                                      onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                                      className="mt-1 block w-full rounded-md bg-dark text-white px-3 py-2 border border-white/20"
                                      required />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-left text-gray-400">Calories</label>
                                  <input
                                      type="number"
                                      value={newEntry.value}
                                      onChange={(e) => setNewEntry({ ...newEntry, value: parseInt(e.target.value) })}
                                      className="mt-1 block w-full rounded-md bg-dark text-white px-3 py-2 border border-white/20"
                                      min="0"
                                      required />
                              </div>
                              <button
                                  type="submit"
                                  className="w-full bg-cardinal text-white rounded-lg px-4 py-2 hover:bg-cardinal/50 transition-colors"
                              >
                                  Add Entry
                              </button>
                          </form>
                      </div>
                  </div>
              )}
          </div></>
  );
};

export default FoodTracker;