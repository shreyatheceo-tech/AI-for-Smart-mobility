import React from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets } from 'lucide-react';
import { WeatherData } from '../types/index.js';

interface WeatherWidgetProps {
  weather: WeatherData;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather }) => {
  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'Sunny':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'Light Rain':
      case 'Heavy Rain':
        return <CloudRain className="w-5 h-5 text-cyan-400" />;
      default:
        return <Cloud className="w-5 h-5 text-slate-300" />;
    }
  };

  return (
    <div className="rounded-2xl p-4 bg-slate-900/60 border border-slate-800/80 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getWeatherIcon()}
          <div>
            <div className="font-bold text-white text-sm">{weather.temperatureC}°C</div>
            <div className="text-[11px] text-slate-400">{weather.condition}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>{weather.precipitationChance}% rain</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-slate-400" />
            <span>{weather.windSpeedKmh} km/h</span>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-300 bg-slate-950/50 p-2 rounded-lg border border-slate-800/60 leading-tight">
        🌦️ <span className="text-cyan-300 font-medium">Transit Advisory:</span> {weather.advisory}
      </div>
    </div>
  );
};
