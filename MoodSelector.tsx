import { useState, useEffect } from 'react';
import { MoodType } from './mood';
import { Button } from './components/ui/button';
import { Textarea } from './components/ui/textarea';

interface MoodSelectorProps {
  onSubmit: (mood: MoodType, note?: string) => void;
  isLoading?: boolean;
}

const MoodSelector = ({ onSubmit, isLoading }: MoodSelectorProps) => {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteLength, setNoteLength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    if (!showNoteInput) {
      setShowNoteInput(true);
    }
    
    // Add bouncy animation effect
    const button = document.querySelector(`[data-mood="${mood}"]`) as HTMLElement;
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1.1)';
        setTimeout(() => {
          button.style.transform = 'scale(1)';
        }, 150);
      }, 100);
    }
  };

  const handleSubmit = async () => {
    if (selectedMood && !isSubmitting) {
      setIsSubmitting(true);
      
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      onSubmit(selectedMood, note.trim() || undefined);
      
      // Reset form with animation
      setTimeout(() => {
        setSelectedMood(null);
        setNote('');
        setShowNoteInput(false);
        setIsSubmitting(false);
      }, 500);
    }
  };

  const getMoodColor = (mood: MoodType) => {
    switch (mood) {
      case 'happy': return 'mood-happy';
      case 'sad': return 'mood-sad';
      case 'angry': return 'mood-angry';
      case 'calm': return 'mood-calm';
      case 'excited': return 'mood-excited';
      default: return '';
    }
  };

  const getMoodLabel = (mood: MoodType) => {
    switch (mood) {
      case 'happy': return 'Happy';
      case 'sad': return 'Sad';
      case 'angry': return 'Angry';
      case 'calm': return 'Calm';
      case 'excited': return 'Excited';
      default: return mood;
    }
  };

  const getMoodDescription = (mood: MoodType) => {
    switch (mood) {
      case 'happy': return 'Feeling joyful and content';
      case 'sad': return 'Feeling down or blue';
      case 'angry': return 'Feeling frustrated or mad';
      case 'calm': return 'Feeling peaceful and relaxed';
      case 'excited': return 'Feeling enthusiastic and eager';
      default: return '';
    }
  };

  const moods: { type: MoodType; emoji: string }[] = [
    { type: 'happy', emoji: '😊' },
    { type: 'sad', emoji: '😢' },
    { type: 'angry', emoji: '😠' },
    { type: 'calm', emoji: '😌' },
    { type: 'excited', emoji: '🎉' }
  ];

  // Auto-save indicator
  useEffect(() => {
    if (note.length > 0) {
      const timer = setTimeout(() => {
        // Auto-save logic could go here
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [note]);

  return (
    <div className="glass-card-strong p-8 space-y-8 animate-fadeIn">
      {/* Section Header */}
      <div className="text-center space-y-3 stagger-1">
        <h2 className="text-3xl font-bold gradient-text">How are you feeling today?</h2>
        <p className="text-gray-600 text-lg">Take a moment to reflect on your current emotional state</p>
      </div>

      {/* Mood Selection */}
      <div className="space-y-8 stagger-2">
        <div className="flex justify-center space-x-8">
          {moods.map(({ type, emoji }) => (
            <div key={type} className="text-center space-y-3">
              <button
                onClick={() => handleMoodSelect(type)}
                className={`mood-button ${selectedMood === type ? 'selected' : ''} ${getMoodColor(type)} gpu-accelerated`}
                disabled={isLoading || isSubmitting}
                data-testid={`mood-${type}`}
                data-mood={type}
                title={getMoodDescription(type)}
              >
                <span className="text-4xl">{emoji}</span>
              </button>
              <div className="space-y-1">
                <div className={`text-sm font-medium transition-colors duration-300 ${
                  selectedMood === type ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {getMoodLabel(type)}
                </div>
                <div className="text-xs text-gray-400 max-w-20">
                  {getMoodDescription(type)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Journal Input */}
      {showNoteInput && (
        <div className="space-y-4 animate-slideUp stagger-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                Add journal thoughts (optional)
              </label>
              <div className="flex items-center space-x-2">
                {noteLength > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    noteLength > 200 ? 'bg-red-100 text-red-600' : 
                    noteLength > 100 ? 'bg-yellow-100 text-yellow-600' : 
                    'bg-green-100 text-green-600'
                  }`}>
                    {noteLength}/300
                  </span>
                )}
                {noteLength > 0 && noteLength < 300 && (
                  <span className="text-green-500 text-xs">💾 Auto-saving...</span>
                )}
              </div>
            </div>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setNoteLength(e.target.value.length);
              }}
              placeholder="How are you feeling? What's on your mind? Share your thoughts..."
              className="input-field min-h-[140px] resize-none transition-all duration-300"
              disabled={isLoading || isSubmitting}
              maxLength={300}
            />
            
            {/* Suggestion Bubbles */}
            {noteLength === 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  "I'm grateful for...",
                  "Today I learned...",
                  "I'm looking forward to...",
                  "I need to work on...",
                  "I'm proud of..."
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setNote(suggestion)}
                    className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4 stagger-4">
        <Button
          onClick={handleSubmit}
          disabled={!selectedMood || isLoading || isSubmitting}
          className="btn-primary w-full relative overflow-hidden"
          data-testid="save-mood-btn"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Saving your mood...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>✨ Save Mood Entry</span>
            </div>
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center stagger-5">
        <p className="text-sm text-gray-500">
          Your mood entries are private and secure. Take time to reflect and be honest with yourself.
        </p>
      </div>
    </div>
  );
};

export default MoodSelector;
