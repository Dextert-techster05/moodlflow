import { useEffect, useRef, useCallback } from 'react';
import { MoodStats } from './mood';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface AnalyticsDashboardProps {
  stats: MoodStats;
  isLoading?: boolean;
}

const AnalyticsDashboard = ({ stats, isLoading }: AnalyticsDashboardProps) => {
  const doughnutRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLCanvasElement>(null);
  const doughnutChart = useRef<Chart | null>(null);
  const barChart = useRef<Chart | null>(null);
  const chartsInitialized = useRef(false);

  // Create doughnut chart
  const createDoughnutChart = useCallback(() => {
    if (!doughnutRef.current || doughnutChart.current) return;

    const ctx = doughnutRef.current.getContext('2d');
    if (!ctx) return;

    const total = Object.values(stats.moodDistribution).reduce((a, b) => a + b, 0);
    const percentages = Object.entries(stats.moodDistribution).map(([mood, count]) => 
      total > 0 ? Math.round((count / total) * 100) : 0
    );

    doughnutChart.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Happy', 'Calm', 'Excited', 'Sad', 'Angry'],
        datasets: [{
          data: percentages,
          backgroundColor: [
            'rgba(255, 138, 0, 0.8)', // Orange for happy
            'rgba(16, 185, 129, 0.8)', // Green for calm
            'rgba(139, 92, 246, 0.8)', // Purple for excited
            'rgba(59, 130, 246, 0.8)', // Blue for sad
            'rgba(239, 68, 68, 0.8)'  // Red for angry
          ],
          borderColor: [
            '#FF8A00', // Orange for happy
            '#10B981', // Green for calm
            '#8B5CF6', // Purple for excited
            '#3B82F6', // Blue for sad
            '#EF4444'  // Red for angry
          ],
          borderWidth: 3,
          hoverBorderWidth: 5,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#1F2937',
            bodyColor: '#6B7280',
            borderColor: '#E5E7EB',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  }, [stats.moodDistribution]);

  // Create bar chart
  const createBarChart = useCallback(() => {
    if (!barRef.current || barChart.current) return;

    const ctx = barRef.current.getContext('2d');
    if (!ctx) return;

    // Ensure we have data for the bar chart
    const weeklyData = stats.weeklyData && stats.weeklyData.length > 0 
      ? stats.weeklyData 
      : [
          { day: 'Mon', score: 3 },
          { day: 'Tue', score: 4 },
          { day: 'Wed', score: 3 },
          { day: 'Thu', score: 5 },
          { day: 'Fri', score: 4 },
          { day: 'Sat', score: 4 },
          { day: 'Sun', score: 3 }
        ];

    barChart.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: weeklyData.map(d => d.day),
        datasets: [{
          label: 'Mood Score',
          data: weeklyData.map(d => d.score),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: '#3B82F6',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)',
          hoverBorderColor: '#1D4ED8',
          hoverBorderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            grid: {
              color: 'rgba(0, 0, 0, 0.08)'
            },
            ticks: {
              color: 'rgba(0, 0, 0, 0.7)',
              font: {
                size: 12
              },
              stepSize: 1
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'rgba(0, 0, 0, 0.7)',
              font: {
                size: 12
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#1F2937',
            bodyColor: '#6B7280',
            borderColor: '#E5E7EB',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  }, [stats.weeklyData]);

  // Update chart data without recreating
  const updateChartData = useCallback(() => {
    if (doughnutChart.current) {
      const total = Object.values(stats.moodDistribution).reduce((a, b) => a + b, 0);
      const percentages = Object.entries(stats.moodDistribution).map(([mood, count]) => 
        total > 0 ? Math.round((count / total) * 100) : 0
      );
      
      doughnutChart.current.data.datasets[0].data = percentages;
      doughnutChart.current.update('none'); // Update without animation to prevent blinking
    }

    if (barChart.current) {
      const weeklyData = stats.weeklyData && stats.weeklyData.length > 0 
        ? stats.weeklyData 
        : [
            { day: 'Mon', score: 3 },
            { day: 'Tue', score: 4 },
            { day: 'Wed', score: 3 },
            { day: 'Thu', score: 5 },
            { day: 'Fri', score: 4 },
            { day: 'Sat', score: 4 },
            { day: 'Sun', score: 3 }
          ];
      
      barChart.current.data.labels = weeklyData.map(d => d.day);
      barChart.current.data.datasets[0].data = weeklyData.map(d => d.score);
      barChart.current.update('none'); // Update without animation to prevent blinking
    }
  }, [stats.moodDistribution, stats.weeklyData]);

  // Initialize charts
  useEffect(() => {
    if (!isLoading && !chartsInitialized.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        createDoughnutChart();
        createBarChart();
        chartsInitialized.current = true;
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoading, createDoughnutChart, createBarChart]);

  // Update chart data when stats change
  useEffect(() => {
    if (chartsInitialized.current && !isLoading) {
      updateChartData();
    }
  }, [updateChartData, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (doughnutChart.current) {
        doughnutChart.current.destroy();
        doughnutChart.current = null;
      }
      if (barChart.current) {
        barChart.current.destroy();
        barChart.current = null;
      }
      chartsInitialized.current = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="glass-card-strong p-8 space-y-6 stagger-1">
          <h2 className="text-3xl font-bold gradient-text">Mood Distribution</h2>
          <div className="skeleton h-80 rounded-2xl" />
        </div>
        <div className="glass-card p-8 space-y-6 stagger-2">
          <h2 className="text-3xl font-bold gradient-text">Last 7 Days Trend</h2>
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const total = Object.values(stats.moodDistribution).reduce((a, b) => a + b, 0);
  const moodPercentages = {
    happy: total > 0 ? Math.round((stats.moodDistribution.happy / total) * 100) : 0,
    calm: total > 0 ? Math.round((stats.moodDistribution.calm / total) * 100) : 0,
    excited: total > 0 ? Math.round((stats.moodDistribution.excited / total) * 100) : 0,
    sad: total > 0 ? Math.round((stats.moodDistribution.sad / total) * 100) : 0,
    angry: total > 0 ? Math.round((stats.moodDistribution.angry / total) * 100) : 0,
  };

  const moodColors = {
    happy: 'bg-gradient-to-r from-orange-400 to-yellow-400',
    calm: 'bg-gradient-to-r from-green-400 to-teal-400',
    excited: 'bg-gradient-to-r from-purple-400 to-pink-400',
    sad: 'bg-gradient-to-r from-blue-400 to-purple-400',
    angry: 'bg-gradient-to-r from-red-400 to-orange-400'
  };

  const moodEmojis = {
    happy: '😊',
    calm: '😌',
    excited: '🎉',
    sad: '😢',
    angry: '😠'
  };

  return (
    <div className="space-y-8">
      {/* Mood Distribution Chart */}
      <div className="glass-card-strong p-8 space-y-6 stagger-1">
        <h2 className="text-3xl font-bold gradient-text">Mood Distribution</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative h-[320px]">
            <canvas ref={doughnutRef} data-testid="mood-distribution-chart" />
          </div>
          <div className="space-y-4">
            {Object.entries(moodPercentages).map(([mood, percentage]) => (
              <div key={mood} className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/70 transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full ${moodColors[mood as keyof typeof moodColors]} flex items-center justify-center text-white text-sm font-bold`}>
                    {moodEmojis[mood as keyof typeof moodEmojis]}
                  </div>
                  <span className="text-gray-700 capitalize font-medium">{mood}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${moodColors[mood as keyof typeof moodColors]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-gray-900 min-w-[3rem]" data-testid={`percentage-${mood}`}>
                    {percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Mood Trend */}
      <div className="glass-card p-8 space-y-6 stagger-2">
        <h2 className="text-3xl font-bold gradient-text">Last 7 Days Trend</h2>
        <div className="relative h-80">
          <canvas ref={barRef} data-testid="weekly-trend-chart" />
        </div>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4 stagger-3 hover:scale-[1.02] transition-transform duration-300">
          <h3 className="text-xl font-semibold text-blue-600 flex items-center space-x-2">
            <span>📈</span>
            <span>Weekly Insights</span>
          </h3>
          <div className="space-y-3 text-gray-700">
            <p data-testid="insight-trend" className="flex items-center space-x-2">
              <span>📊</span>
              <span>Your mood has been trending {stats.weeklyData && stats.weeklyData.some(d => d.score >= 4) ? 'upward' : 'stable'} this week</span>
            </p>
            <p data-testid="insight-streak" className="flex items-center space-x-2">
              <span>💪</span>
              <span>{stats.streakCount}-day streak - keep it going!</span>
            </p>
            <p data-testid="insight-entries" className="flex items-center space-x-2">
              <span>📝</span>
              <span>{stats.thisWeek} entries this week</span>
            </p>
          </div>
        </div>
        
        <div className="glass-card p-6 space-y-4 stagger-4 hover:scale-[1.02] transition-transform duration-300">
          <h3 className="text-xl font-semibold text-purple-600 flex items-center space-x-2">
            <span>📊</span>
            <span>Monthly Stats</span>
          </h3>
          <div className="space-y-3 text-gray-700">
            <p data-testid="stat-total" className="flex items-center space-x-2">
              <span>📈</span>
              <span>{stats.totalEntries} total entries</span>
            </p>
            <p data-testid="stat-average" className="flex items-center space-x-2">
              <span>😊</span>
              <span>Most common mood: {stats.averageMood.charAt(0).toUpperCase() + stats.averageMood.slice(1)}</span>
            </p>
            <p data-testid="stat-journals" className="flex items-center space-x-2">
              <span>📖</span>
              <span>{stats.totalEntries} journal entries written</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
