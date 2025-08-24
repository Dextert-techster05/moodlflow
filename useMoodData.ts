import { useState, useEffect } from 'react';
import { MoodEntry, MoodStats, MoodType } from './mood';

const STORAGE_KEY = 'moodflow_data';

const MOOD_EMOJIS: Record<MoodType, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  calm: '😌',
  excited: '🎉'
};

export const useMoodData = () => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const entriesWithDates = parsed.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date)
        }));
        setEntries(entriesWithDates);
      } catch (error) {
        console.error('Error parsing saved mood data:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever entries change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, isLoading]);

  const addMoodEntry = (mood: MoodType, note?: string) => {
    const now = new Date();
    const newEntry: MoodEntry = {
      id: crypto.randomUUID(),
      mood,
      emoji: MOOD_EMOJIS[mood],
      note,
      date: now,
      time: now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };

    setEntries(prev => [newEntry, ...prev]);
    return newEntry;
  };

  const getStats = (): MoodStats => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    
    const thisWeekEntries = entries.filter(entry => entry.date >= weekStart);
    
    // Calculate mood distribution
    const moodCounts: Record<MoodType, number> = {
      happy: 0,
      sad: 0,
      angry: 0,
      calm: 0,
      excited: 0
    };

    entries.forEach(entry => {
      moodCounts[entry.mood]++;
    });

    // Calculate most common mood
    const mostCommonMood = Object.entries(moodCounts).reduce((a, b) => 
      moodCounts[a[0] as MoodType] > moodCounts[b[0] as MoodType] ? a : b
    )[0] as MoodType;

    // Calculate streak
    let streakCount = 0;
    const sortedEntries = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
    
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      
      if (entryDate.getTime() === currentDate.getTime()) {
        streakCount++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (entryDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    // Generate weekly data for chart
    const weeklyData = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      
      const dayEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.toDateString() === date.toDateString();
      });
      
      // Calculate average mood score for the day (1-5 scale)
      const moodScores: Record<MoodType, number> = {
        angry: 1,
        sad: 2,
        calm: 3,
        happy: 4,
        excited: 5
      };
      
      const averageScore = dayEntries.length > 0 
        ? dayEntries.reduce((sum, entry) => sum + moodScores[entry.mood], 0) / dayEntries.length
        : 0;
      
      weeklyData.push({
        day: days[i],
        score: Math.round(averageScore)
      });
    }

    return {
      totalEntries: entries.length,
      averageMood: mostCommonMood,
      streakCount,
      thisWeek: thisWeekEntries.length,
      moodDistribution: moodCounts,
      weeklyData
    };
  };

  const getRecentEntries = (limit: number = 3) => {
    return entries.slice(0, limit);
  };

  return {
    entries,
    isLoading,
    addMoodEntry,
    getStats,
    getRecentEntries
  };
};
