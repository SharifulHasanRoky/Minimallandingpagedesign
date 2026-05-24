import { useState } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets } from 'lucide-react';

// Offline weather widget - shows a configurable weather display
// Since it's offline, user sets their own weather info
export function WeatherWidget() {
  const [weather, setWeather] = useState(() => {
    try {
      const stored = localStorage.getItem('pc-home-weather');
      return stored ? JSON.parse(stored) : {
        temp: 24,
        condition: 'sunny',
        humidity: 45,
        wind: 12,
        city: 'My City',
      };
    } catch {
      return { temp: 24, condition: 'sunny', humidity: 45, wind: 12, city: 'My City' };
    }
  });
  const [editing, setEditing] = useState(false);

  const saveWeather = () => {
    localStorage.setItem('pc-home-weather', JSON.stringify(weather));
    setEditing(false);
  };

  const getIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-12 h-12 text-yellow-400" />;
      case 'cloudy': return <Cloud className="w-12 h-12 text-gray-400" />;
      case 'rainy': return <CloudRain className="w-12 h-12 text-blue-400" />;
      case 'snowy': return <CloudSnow className="w-12 h-12 text-blue-200" />;
      default: return <Sun className="w-12 h-12 text-yellow-400" />;
    }
  };

  if (editing) {
    return (
      <div className="space-y-2">
        <input
          value={weather.city}
          onChange={(e) => setWeather({ ...weather, city: e.target.value })}
          placeholder="City name"
          className="w-full px-2 py-1 text-sm rounded border bg-transparent border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none"
        />
        <div className="flex gap-2">
          <input
            type="number"
            value={weather.temp}
            onChange={(e) => setWeather({ ...weather, temp: Number(e.target.value) })}
            className="w-16 px-2 py-1 text-sm rounded border bg-transparent border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none"
          />
          <span className="text-sm text-gray-500 self-center">°C</span>
        </div>
        <select
          value={weather.condition}
          onChange={(e) => setWeather({ ...weather, condition: e.target.value })}
          className="w-full px-2 py-1 text-sm rounded border bg-transparent border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none"
        >
          <option value="sunny">Sunny</option>
          <option value="cloudy">Cloudy</option>
          <option value="rainy">Rainy</option>
          <option value="snowy">Snowy</option>
        </select>
        <div className="flex gap-2">
          <button onClick={saveWeather} className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Save</button>
          <button onClick={() => setEditing(false)} className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center cursor-pointer" onClick={() => setEditing(true)} title="Click to edit">
      <div className="flex items-center justify-center mb-2">
        {getIcon(weather.condition)}
      </div>
      <div className="text-3xl font-bold text-gray-800 dark:text-white">{weather.temp}°C</div>
      <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{weather.condition}</div>
      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{weather.city}</div>
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Droplets className="w-3 h-3" /> {weather.humidity}%
        </span>
        <span className="flex items-center gap-1">
          <Wind className="w-3 h-3" /> {weather.wind}km/h
        </span>
      </div>
    </div>
  );
}
