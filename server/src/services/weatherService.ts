export interface WeatherData {
  condition: 'Clear' | 'Partly Cloudy' | 'Light Rain' | 'Heavy Rain' | 'Sunny';
  temperatureC: number;
  humidityPercent: number;
  precipitationChance: number;
  windSpeedKmh: number;
  advisory: string;
}

export function getCurrentWeather(departureTimeStr?: string): WeatherData {
  const date = departureTimeStr ? new Date(departureTimeStr) : new Date();
  const hour = date.getHours();

  // Deterministic yet realistic variations based on the current hour/date
  const isAfternoon = hour >= 12 && hour <= 16;
  const isNight = hour >= 21 || hour < 6;

  let condition: WeatherData['condition'] = 'Partly Cloudy';
  let temperatureC = 27;
  let precipitationChance = 15;
  let advisory = 'Fair conditions across all urban transit routes.';

  if (isAfternoon) {
    condition = 'Sunny';
    temperatureC = 32;
    precipitationChance = 10;
    advisory = 'Warm conditions: AC public transit (Metro / Electric Bus) recommended over long walks.';
  } else if (isNight) {
    condition = 'Clear';
    temperatureC = 23;
    precipitationChance = 5;
    advisory = 'Clear skies with smooth traffic flow; check night bus frequency.';
  } else if (hour >= 17 && hour <= 19) {
    // Peak evening
    condition = 'Partly Cloudy';
    temperatureC = 28;
    precipitationChance = 25;
    advisory = 'Moderate humidity and heavy peak-hour road congestion. Rail and Metro avoid traffic delays.';
  }

  return {
    condition,
    temperatureC,
    humidityPercent: 62,
    precipitationChance,
    windSpeedKmh: 14,
    advisory,
  };
}
