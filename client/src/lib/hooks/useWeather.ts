import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWeatherIcon } from '../utils/color';
import { WeatherData } from '@shared/schema';

export function useWeather() {
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 0,
    condition: 'Clear',
    icon: 'sun',
    unit: 'F'
  });

  const { data: settings } = useQuery({ queryKey: ['/api/settings'] });
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/weather', settings?.weatherLocation],
    refetchInterval: 1000 * 60 * 30, // Refresh every 30 minutes
  });

  useEffect(() => {
    if (data) {
      setWeatherData({
        temperature: data.temperature,
        condition: data.condition,
        icon: getWeatherIcon(data.condition),
        unit: data.unit
      });
    }
  }, [data]);

  return {
    weather: weatherData,
    isLoading,
    error
  };
}
