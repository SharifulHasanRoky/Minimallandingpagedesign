import { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Home } from './components/home/Home';
import { WidgetPanel } from './components/home/WidgetPanel';
import { Settings, Plus, Moon, Sun, RotateCcw } from 'lucide-react';

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  size: 'small' | 'medium' | 'large';
  position: number;
  visible: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  userName: string;
  wallpaper: string;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'clock-1', type: 'clock', title: 'Clock', size: 'medium', position: 0, visible: true },
  { id: 'calendar-1', type: 'calendar', title: 'Calendar', size: 'medium', position: 1, visible: true },
  { id: 'todo-1', type: 'todo', title: 'Todo List', size: 'large', position: 2, visible: true },
  { id: 'calculator-1', type: 'calculator', title: 'Calculator', size: 'medium', position: 3, visible: true },
  { id: 'notes-1', type: 'notes', title: 'Quick Notes', size: 'large', position: 4, visible: true },
  { id: 'bookmarks-1', type: 'bookmarks', title: 'Bookmarks', size: 'medium', position: 5, visible: true },
  { id: 'weather-1', type: 'weather', title: 'Weather', size: 'small', position: 6, visible: true },
  { id: 'timer-1', type: 'timer', title: 'Timer', size: 'small', position: 7, visible: true },
  { id: 'habits-1', type: 'habits', title: 'Habit Tracker', size: 'medium', position: 8, visible: true },
];

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  userName: 'User',
  wallpaper: 'gradient-1',
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load from storage:', e);
  }
  return defaultValue;
}

function saveToStorage(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
}

export default function App() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() =>
    loadFromStorage('pc-home-widgets', DEFAULT_WIDGETS)
  );
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadFromStorage('pc-home-settings', DEFAULT_SETTINGS)
  );
  const [showPanel, setShowPanel] = useState(false);

  // Apply theme
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Persist to localStorage
  useEffect(() => {
    saveToStorage('pc-home-widgets', widgets);
  }, [widgets]);

  useEffect(() => {
    saveToStorage('pc-home-settings', settings);
  }, [settings]);

  const moveWidget = useCallback((dragIndex: number, hoverIndex: number) => {
    setWidgets((prev) => {
      const updated = [...prev];
      const visibleWidgets = updated.filter(w => w.visible).sort((a, b) => a.position - b.position);
      const dragWidget = visibleWidgets[dragIndex];
      const hoverWidget = visibleWidgets[hoverIndex];
      if (!dragWidget || !hoverWidget) return prev;
      
      const dragPos = dragWidget.position;
      dragWidget.position = hoverWidget.position;
      hoverWidget.position = dragPos;
      
      return updated;
    });
  }, []);

  const toggleWidget = useCallback((id: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  }, []);

  const resizeWidget = useCallback((id: string, size: 'small' | 'medium' | 'large') => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, size } : w));
  }, []);

  const addWidget = useCallback((type: string) => {
    const count = widgets.filter(w => w.type === type).length;
    const titles: Record<string, string> = {
      clock: 'Clock', calendar: 'Calendar', todo: 'Todo List',
      calculator: 'Calculator', notes: 'Quick Notes', bookmarks: 'Bookmarks',
      weather: 'Weather', timer: 'Timer', habits: 'Habit Tracker',
    };
    const newWidget: WidgetConfig = {
      id: `${type}-${Date.now()}`,
      type,
      title: `${titles[type] || type} ${count + 1}`,
      size: 'medium',
      position: widgets.length,
      visible: true,
    };
    setWidgets(prev => [...prev, newWidget]);
  }, [widgets]);

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  }, []);

  const resetAll = useCallback(() => {
    if (confirm('Reset everything to default? All your data will be lost.')) {
      setWidgets(DEFAULT_WIDGETS);
      setSettings(DEFAULT_SETTINGS);
      localStorage.clear();
    }
  }, []);

  const toggleTheme = () => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`min-h-screen transition-colors duration-300 ${
        settings.theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        {/* Top Bar */}
        <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${
          settings.theme === 'dark' 
            ? 'bg-gray-900/80 border-gray-700/50' 
            : 'bg-white/80 border-gray-200/50'
        }`}>
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <h1 className={`text-lg font-bold ${settings.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                PC Home
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  settings.theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Toggle Theme"
              >
                {settings.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowPanel(true)}
                className={`p-2 rounded-lg transition-colors ${
                  settings.theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Add Widget"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={resetAll}
                className={`p-2 rounded-lg transition-colors ${
                  settings.theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Reset All"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Home
            widgets={widgets}
            settings={settings}
            moveWidget={moveWidget}
            removeWidget={removeWidget}
            resizeWidget={resizeWidget}
          />
        </main>

        {/* Widget Panel */}
        {showPanel && (
          <WidgetPanel
            widgets={widgets}
            onToggle={toggleWidget}
            onAdd={addWidget}
            onClose={() => setShowPanel(false)}
            theme={settings.theme}
          />
        )}
      </div>
    </DndProvider>
  );
}
