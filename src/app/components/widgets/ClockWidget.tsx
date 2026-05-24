import { useState, useEffect } from 'react';

export function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  const dateStr = time.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="text-center py-4">
      <div className="text-5xl font-mono font-bold tracking-tight text-blue-500 dark:text-blue-400">
        {String(displayHours).padStart(2, '0')}
        <span className="animate-pulse">:</span>
        {String(minutes).padStart(2, '0')}
        <span className="text-3xl text-blue-400/70 dark:text-blue-300/70">
          :{String(seconds).padStart(2, '0')}
        </span>
        <span className="text-lg ml-2 text-blue-400/80 dark:text-blue-300/80">{ampm}</span>
      </div>
      <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        {dateStr}
      </div>
    </div>
  );
}
