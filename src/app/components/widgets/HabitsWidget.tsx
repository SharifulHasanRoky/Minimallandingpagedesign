import { useState, useEffect } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  completedDays: string[]; // ISO date strings
}

export function HabitsWidget({ id }: { id: string }) {
  const storageKey = `pc-home-habits-${id}`;
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [
        { id: '1', name: 'Exercise', completedDays: [] },
        { id: '2', name: 'Read 30 min', completedDays: [] },
        { id: '3', name: 'Drink water', completedDays: [] },
      ];
    } catch { return []; }
  });
  const [newHabit, setNewHabit] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(habits));
  }, [habits, storageKey]);

  const addHabit = () => {
    if (!newHabit.trim()) return;
    setHabits(prev => [...prev, { id: Date.now().toString(), name: newHabit.trim(), completedDays: [] }]);
    setNewHabit('');
  };

  const toggleToday = (habitId: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const done = h.completedDays.includes(today);
      return {
        ...h,
        completedDays: done
          ? h.completedDays.filter(d => d !== today)
          : [...h.completedDays, today],
      };
    }));
  };

  const removeHabit = (habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <div>
      {/* Habits list with streak */}
      <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
        {habits.map(habit => (
          <div key={habit.id} className="group">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => toggleToday(habit.id)}
                className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  habit.completedDays.includes(today)
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                }`}
              >
                {habit.completedDays.includes(today) && <Check className="w-3 h-3" />}
              </button>
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">{habit.name}</span>
              <button
                onClick={() => removeHabit(habit.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            {/* Mini streak dots */}
            <div className="flex gap-0.5 ml-7">
              {last7Days.map(day => (
                <div
                  key={day}
                  className={`w-3 h-3 rounded-sm ${
                    habit.completedDays.includes(day)
                      ? 'bg-green-400 dark:bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  title={day}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add habit */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addHabit()}
          placeholder="New habit..."
          className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-transparent border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <button onClick={addHabit} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
