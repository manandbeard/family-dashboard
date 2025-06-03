import axios from 'axios';
import { storage } from './storage';

interface OpenWeatherResponse {
  main: {
    temp: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  name: string;
}

export async function getWeatherByLocation(location: string = 'auto'): Promise<any> {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const units = await storage.getSetting('weatherUnit') || 'imperial';
    
    // If no API key is provided, return default weather data
    if (!apiKey) {
      console.log('No OpenWeather API key provided, using default weather data');
      return getDefaultWeather(units);
    }
    
    let url: string;
    if (location === 'auto') {
      try {
        // Get IP-based location
        const ipResponse = await axios.get('https://ipapi.co/json/');
        url = `https://api.openweathermap.org/data/2.5/weather?q=${ipResponse.data.city}&units=${units}&appid=${apiKey}`;
      } catch (err) {
        console.error('Error getting location by IP:', err);
        // Fall back to a default location
        url = `https://api.openweathermap.org/data/2.5/weather?q=New York&units=${units}&appid=${apiKey}`;
      }
    } else if (/^\d+$/.test(location)) {
      // Zip code
      url = `https://api.openweathermap.org/data/2.5/weather?zip=${location}&units=${units}&appid=${apiKey}`;
    } else {
      // City name
      url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${units}&appid=${apiKey}`;
    }
    
    const response = await axios.get<OpenWeatherResponse>(url);
    
    if (response.status !== 200) {
      throw new Error(`Weather API returned status ${response.status}`);
    }
    
    return {
      temperature: Math.round(response.data.main.temp),
      condition: response.data.weather[0].main,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      city: response.data.name,
      unit: units === 'imperial' ? 'F' : 'C'
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return getDefaultWeather(await storage.getSetting('weatherUnit') || 'imperial');
  }
}

function getDefaultWeather(units: string) {
  return {
    temperature: units === 'imperial' ? 72 : 22,
    condition: 'Clear',
    description: 'clear sky',
    icon: '01d',
    city: 'Unknown',
    unit: units === 'imperial' ? 'F' : 'C'
  };
}

export function scheduleWeatherUpdates() {
  // Update weather every 30 minutes
  setInterval(async () => {
    const location = await storage.getSetting('weatherLocation');
    await getWeatherByLocation(location);
  }, 30 * 60 * 1000);
}
