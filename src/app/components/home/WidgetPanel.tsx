import { X, Clock, Calendar, CheckSquare, Calculator, StickyNote, Bookmark, Cloud, Timer, Target } from 'lucide-react';
import type { WidgetConfig } from '../../App';

interface WidgetPanelProps {
  widgets: WidgetConfig[];
  onToggle: (id: string) => void;
  onAdd: (type: string) => void;
  onClose: () => void;
  theme: string;
}

const AVAILABLE_WIDGETS = [
  { type: 'clock', name: 'Clock', icon: Clock, description: 'Digital clock with date' },
  { type: 'calendar', name: 'Calendar', icon: Calendar, description: 'Monthly calendar view' },
  { type: 'todo', name: 'Todo List', icon: CheckSquare, description: 'Task management' },
  { type: 'calculator', name: 'Calculator', icon: Calculator, description: 'Basic calculator' },
  { type: 'notes', name: 'Quick Notes', icon: StickyNote, description: 'Jot down notes' },
  { type: 'bookmarks', name: 'Bookmarks', icon: Bookmark, description: 'Save favorite links' },
  { type: 'weather', name: 'Weather', icon: Cloud, description: 'Offline weather display' },
  { type: 'timer', name: 'Timer', icon: Timer, description: 'Stopwatch & countdown' },
  { type: 'habits', name: 'Habit Tracker', icon: Target, description: 'Track daily habits' },
];

export function WidgetPanel({ widgets, onToggle, onAdd, onClose, theme }: WidgetPanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-md overflow-y-auto shadow-2xl ${
        theme === 'dark' ? 'bg-gray-900 border-l border-gray-700' : 'bg-white border-l border-gray-200'
      }`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Widget Manager
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Widgets */}
          {widgets.length > 0 && (
            <div className="mb-8">
              <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Your Widgets
              </h3>
              <div className="space-y-2">
                {widgets.map(widget => (
                  <div
                    key={widget.id}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                    }`}
                  >
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                      {widget.title}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={widget.visible}
                        onChange={() => onToggle(widget.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Widget */}
          <div>
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Add New Widget
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_WIDGETS.map(({ type, name, icon: Icon, description }) => (
                <button
                  key={type}
                  onClick={() => { onAdd(type); }}
                  className={`p-4 rounded-xl text-left transition-all hover:scale-[1.02] ${
                    theme === 'dark'
                      ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    {name}
                  </div>
                  <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
