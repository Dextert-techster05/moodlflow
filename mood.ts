export type MoodType = 'happy' | 'sad' | 'angry' | 'calm' | 'excited';

export interface MoodEntry {
  id: string;
  mood: MoodType;
  emoji: string;
  note?: string;
  date: Date;
  time: string;
}

export interface MoodStats {
  totalEntries: number;
  averageMood: MoodType;
  streakCount: number;
  thisWeek: number;
  moodDistribution: Record<MoodType, number>;
  weeklyData: Array<{
    day: string;
    score: number;
  }>;
}

export type ViewType = 'home' | 'analytics' | 'calendar';
