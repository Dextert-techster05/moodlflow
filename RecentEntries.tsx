import { useState } from 'react';
import { MoodEntry } from './mood';

interface RecentEntriesProps {
  entries: MoodEntry[];
  isLoading?: boolean;
}

const RecentEntries = ({ entries, isLoading }: RecentEntriesProps) => {
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);



  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'calm': return '😌';
      case 'excited': return '🎉';
      default: return '😐';
    }
  };

  const getMoodGradient = (mood: string) => {
    switch (mood) {
      case 'happy': return 'from-orange-400 to-yellow-400';
      case 'sad': return 'from-blue-400 to-purple-400';
      case 'angry': return 'from-red-400 to-orange-400';
      case 'calm': return 'from-green-400 to-teal-400';
      case 'excited': return 'from-purple-400 to-pink-400';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const toggleExpanded = (entryId: string) => {
    setExpandedEntry(expandedEntry === entryId ? null : entryId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-3 stagger-1">
          <h2 className="text-3xl font-bold gradient-text">Recent Entries</h2>
          <p className="text-gray-600 text-lg">Your latest mood reflections</p>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 space-y-4 animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center space-x-4">
                <div className="skeleton w-12 h-12 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-24"></div>
                  <div className="skeleton h-3 w-32"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-3 stagger-1">
          <h2 className="text-3xl font-bold gradient-text">Recent Entries</h2>
          <p className="text-gray-600 text-lg">Your latest mood reflections</p>
        </div>
        
        <div className="glass-card p-12 text-center space-y-4 animate-bounceIn stagger-2">
          <div className="text-6xl mb-4 animate-float">📝</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">No mood entries yet</h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            Start tracking your mood above to see your emotional journey unfold
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3 stagger-1">
        <h2 className="text-3xl font-bold gradient-text">Recent Entries</h2>
        <p className="text-gray-600 text-lg">Your latest mood reflections</p>
      </div>
      
      <div className="space-y-4 relative">
        {/* Timeline Connector */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200 opacity-30"></div>
        
        {entries.map((entry, index) => (
          <div 
            key={entry.id} 
            className="glass-card p-6 space-y-4 hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative"
            onClick={() => toggleExpanded(entry.id)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Timeline Dot */}
            <div className={`absolute left-6 top-8 w-3 h-3 rounded-full bg-gradient-to-r ${getMoodGradient(entry.mood)} opacity-80 group-hover:scale-125 transition-transform duration-300`}></div>
            
            <div className="flex items-start justify-between pl-8">
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 rounded-full border-3 flex items-center justify-center text-2xl bg-gradient-to-r ${getMoodGradient(entry.mood)} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {getMoodEmoji(entry.mood)}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl font-semibold text-gray-900 capitalize">
                      {entry.mood}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {formatDate(entry.date)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatTime(entry.date)}
                  </div>
                </div>
              </div>
              
              {/* Expand/Collapse Indicator */}
              <div className="text-gray-400 group-hover:text-gray-600 transition-colors duration-300">
                {expandedEntry === entry.id ? '−' : '+'}
              </div>
            </div>
            
            {/* Expandable Note Section */}
            {expandedEntry === entry.id && (
              <div className="pl-8 animate-slideUp">
                {entry.note ? (
                  <div className="space-y-3">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                    <p className="text-gray-700 text-sm leading-relaxed bg-gray-50/50 p-4 rounded-xl border-l-4 border-blue-200 backdrop-blur-sm">
                      {entry.note}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>💭 Journal entry</span>
                      <span>•</span>
                      <span>{entry.note.length} characters</span>
                    </div>
                  </div>
                ) : (
                  <div className="pl-8 animate-slideUp">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                    <p className="text-gray-400 text-sm italic py-4">
                      No journal entry for this mood
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Quick Actions */}
            <div className="pl-8 flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors duration-200">
                Edit
              </button>
              <button className="text-xs bg-gray-50 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-100 transition-colors duration-200">
                Share
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {entries.length > 0 && (
        <div className="text-center stagger-5">
          <p className="text-sm text-gray-500">
            Showing your {entries.length} most recent mood entries
          </p>
          <button className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-colors duration-200">
            View All Entries →
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentEntries;
