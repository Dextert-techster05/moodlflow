import { useState, useEffect } from 'react';
import { ViewType, MoodType } from './mood';
import { useMoodData } from './useMoodData';
import ParticleBackground from './ParticleBackground';
import MoodSelector from './MoodSelector';
import RecentEntries from './RecentEntries';
import AnalyticsDashboard from './AnalyticsDashboard';
import Navigation from './Navigation';
import { useToast } from './use-toast';

const MoodTracker = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const { addMoodEntry, getStats, getRecentEntries, isLoading: dataLoading } = useMoodData();
  const { toast } = useToast();

  const stats = getStats();
  const recentEntries = getRecentEntries(3);

  // Animated counter effect
  const [animatedStats, setAnimatedStats] = useState({
    streakCount: 0,
    totalEntries: 0,
    thisWeek: 0
  });

  useEffect(() => {
    const animateCounters = () => {
      setAnimatedStats({
        streakCount: stats.streakCount,
        totalEntries: stats.totalEntries,
        thisWeek: stats.thisWeek
      });
    };

    const timer = setTimeout(animateCounters, 500);
    return () => clearTimeout(timer);
  }, [stats]);

  const handleViewChange = async (view: ViewType) => {
    setIsLoading(true);
    
    // Simulate loading delay for smooth transitions
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setCurrentView(view);
    setIsLoading(false);
  };

  const handleMoodSubmit = (mood: MoodType, note?: string) => {
    const entry = addMoodEntry(mood, note);
    
    // Show celebration effect
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
    
    toast({
      title: "Mood saved! ✨",
      description: `Your ${mood} mood has been recorded.`,
    });
  };

  const renderLoadingView = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="glass-card-strong p-8 text-center max-w-md animate-bounceIn">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-6"></div>
        <p className="text-gray-600 text-lg">Loading your mood data...</p>
      </div>
    </div>
  );

  const renderHomeView = () => (
    <div className="animate-fadeIn space-y-8">
      {/* Floating Background Shapes */}
      <div className="floating-shape shape-1"></div>
      <div className="floating-shape shape-2"></div>
      <div className="floating-shape shape-3"></div>

      {/* Header Section */}
      <div className="text-center space-y-4 stagger-1">
        <h1 className="text-5xl font-bold gradient-text text-shadow">MoodFlow</h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Track your emotional journey with mindful awareness
        </p>
      </div>

      {/* Current Streak Card */}
      <div className="glass-card-strong p-8 space-y-6 stagger-2">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">Current Streak</h2>
            <p className="text-gray-600">Keep building momentum!</p>
          </div>
          <div className="text-center relative">
            <div className="text-6xl mb-3">🔥</div>
            <div className="text-5xl font-bold gradient-text counter" data-testid="streak-count">
              {animatedStats.streakCount}
            </div>
            <div className="text-sm text-gray-500">days</div>
            
            {/* Progress Ring */}
            <svg className="absolute inset-0 w-full h-full progress-ring" viewBox="0 0 120 120">
              <circle
                className="progress-ring-circle"
                stroke="url(#streakGradient)"
                strokeWidth="4"
                fill="transparent"
                r="52"
                cx="60"
                cy="60"
                strokeDasharray={`${(animatedStats.streakCount / 30) * 330} 330`}
              />
              <defs>
                <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 text-center space-y-3 stagger-3 hover:scale-105 transition-transform duration-300">
          <div className="text-4xl font-bold text-purple-600 mb-2 counter" data-testid="total-entries">
            {animatedStats.totalEntries}
          </div>
          <div className="text-gray-600">Total Entries</div>
        </div>
        <div className="glass-card p-6 text-center space-y-3 stagger-4 hover:scale-105 transition-transform duration-300">
          <div className="text-4xl font-bold text-green-600 mb-2" data-testid="average-mood">
            {stats.totalEntries > 0 ? (
              stats.averageMood === 'happy' ? '😊' :
              stats.averageMood === 'sad' ? '😢' :
              stats.averageMood === 'angry' ? '😠' :
              stats.averageMood === 'calm' ? '😌' : '🎉'
            ) : '😐'}
          </div>
          <div className="text-gray-600">Average Mood</div>
        </div>
        <div className="glass-card p-6 text-center space-y-3 stagger-5 hover:scale-105 transition-transform duration-300">
          <div className="text-4xl font-bold text-blue-600 mb-2 counter" data-testid="this-week">
            {animatedStats.thisWeek}
          </div>
          <div className="text-gray-600">This Week</div>
        </div>
      </div>

      {/* Mood Entry Section */}
      <MoodSelector onSubmit={handleMoodSubmit} isLoading={dataLoading} />

      {/* Recent Entries */}
      <RecentEntries entries={recentEntries} isLoading={dataLoading} />
    </div>
  );

  const renderAnalyticsView = () => (
    <div className="animate-fadeIn">
      <div className="mb-8 stagger-1">
        <h2 className="text-3xl font-bold gradient-text mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600">Gain insights into your emotional patterns</p>
      </div>
      <AnalyticsDashboard stats={stats} isLoading={isLoading} />
    </div>
  );

  const renderCalendarView = () => (
    <div className="animate-fadeIn">
      <div className="mb-8 stagger-1">
        <h2 className="text-3xl font-bold gradient-text mb-2">Mood Calendar</h2>
        <p className="text-gray-600">View your mood history over time</p>
      </div>
      <div className="glass-card p-8 text-center stagger-2">
        <div className="text-5xl mb-4 animate-float">📅</div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">Calendar View</h3>
        <p className="text-gray-600">Calendar functionality coming soon!</p>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return renderLoadingView();
    }

    switch (currentView) {
      case 'home':
        return renderHomeView();
      case 'analytics':
        return renderAnalyticsView();
      case 'calendar':
        return renderCalendarView();
      default:
        return renderHomeView();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />
      
      {/* Celebration Effect */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="celebration-particle absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: ['#FF8A00', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-4xl relative z-10">
        {renderContent()}
      </div>

      {/* Navigation */}
      <Navigation currentView={currentView} onViewChange={handleViewChange} />
    </div>
  );
};

export default MoodTracker;
