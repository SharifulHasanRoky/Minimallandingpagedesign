import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';

export function TimerWidget() {
  const [mode, setMode] = useState<'stopwatch' | 'countdown'>('stopwatch');
  const [time, setTime] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [countdownInput, setCountdownInput] = useState(300); // 5 min default
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTime(prev => {
          if (mode === 'countdown') {
            if (prev <= 0) {
              setIsRunning(false);
              return 0;
            }
            return prev - 1;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, mode]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const reset = () => {
    setIsRunning(false);
    setTime(mode === 'countdown' ? countdownInput : 0);
  };

  const switchMode = (newMode: 'stopwatch' | 'countdown') => {
    setIsRunning(false);
    setMode(newMode);
    setTime(newMode === 'countdown' ? countdownInput : 0);
  };

  return (
    <div className="text-center">
      {/* Mode Tabs */}
      <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 mb-4">
        <button
          onClick={() => switchMode('stopwatch')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            mode === 'stopwatch'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Stopwatch
        </button>
        <button
          onClick={() => switchMode('countdown')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            mode === 'countdown'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Countdown
        </button>
      </div>

      {/* Countdown Input */}
      {mode === 'countdown' && !isRunning && time === countdownInput && (
        <div className="mb-3 flex items-center justify-center gap-2">
          <input
            type="number"
            value={Math.floor(countdownInput / 60)}
            onChange={(e) => {
              const mins = Math.max(0, Number(e.target.value));
              setCountdownInput(mins * 60);
              setTime(mins * 60);
            }}
            className="w-16 px-2 py-1 text-center text-sm rounded border bg-transparent border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none"
          />
          <span className="text-xs text-gray-500">min</span>
        </div>
      )}

      {/* Time Display */}
      <div className="text-4xl font-mono font-bold text-gray-800 dark:text-white mb-4">
        {formatTime(time)}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`p-3 rounded-full transition-colors ${
            isRunning
              ? 'bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50'
              : 'bg-green-100 dark:bg-green-900/30 text-green-500 hover:bg-green-200 dark:hover:bg-green-900/50'
          }`}
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button
          onClick={reset}
          className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
