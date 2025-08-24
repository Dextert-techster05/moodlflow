import { ViewType } from './mood';
import { Home, BarChart3, Calendar } from 'lucide-react';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  const navItems = [
    { id: 'home' as ViewType, label: 'Home', icon: Home },
    { id: 'analytics' as ViewType, label: 'Analytics', icon: BarChart3 },
    { id: 'calendar' as ViewType, label: 'Calendar', icon: Calendar }
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass-card-strong px-8 py-4 backdrop-blur-xl">
        <div className="flex items-center space-x-8">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = currentView === id;
            return (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`nav-tab flex flex-col items-center space-y-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50/80 backdrop-blur-sm font-medium scale-110' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 backdrop-blur-sm hover:scale-105'
                }`}
                data-testid={`nav-${id}`}
              >
                <Icon 
                  size={22} 
                  className={`transition-all duration-300 ${
                    isActive ? 'text-blue-600 scale-110' : 'text-gray-500'
                  }`}
                />
                <span className="text-xs font-medium">{label}</span>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
