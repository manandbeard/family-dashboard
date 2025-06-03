import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWeather } from '@/lib/hooks/useWeather';
import { getCurrentTimeFormatted, getCurrentDateFormatted } from '@/lib/utils/date';
import { COLORS } from '@/lib/utils/color';

interface HeaderProps {
  familyName: string;
  onSettingsClick: () => void;
  timeFormat: "12h" | "24h";
}

export function Header({ familyName, onSettingsClick, timeFormat }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const { weather, isLoading } = useWeather();
  
  useEffect(() => {
    // Update time immediately
    updateDateTime();
    
    // Update time every minute
    const interval = setInterval(updateDateTime, 60000);
    
    return () => clearInterval(interval);
  }, [timeFormat]);
  
  const updateDateTime = () => {
    setCurrentTime(getCurrentTimeFormatted(timeFormat === "24h"));
    setCurrentDate(getCurrentDateFormatted());
  };
  
  const getWeatherIcon = () => {
    // Map weather condition to icon
    switch(weather.icon) {
      case 'sun':
        return <i className="fas fa-sun text-yellow-400 mr-2"></i>;
      case 'cloud':
        return <i className="fas fa-cloud text-gray-400 mr-2"></i>;
      case 'cloud-rain':
        return <i className="fas fa-cloud-rain text-blue-400 mr-2"></i>;
      case 'cloud-drizzle':
        return <i className="fas fa-cloud-rain text-blue-300 mr-2"></i>;
      case 'cloud-lightning':
        return <i className="fas fa-bolt text-yellow-500 mr-2"></i>;
      case 'cloud-snow':
        return <i className="fas fa-snowflake text-blue-200 mr-2"></i>;
      case 'cloud-fog':
        return <i className="fas fa-smog text-gray-300 mr-2"></i>;
      case 'wind':
        return <i className="fas fa-wind text-gray-400 mr-2"></i>;
      default:
        return <i className="fas fa-sun text-yellow-400 mr-2"></i>;
    }
  };
  
  return (
    <header className="flex justify-between items-center mb-4 py-2">
      <h1 className="text-3xl font-bold text-[#111111]">{familyName} Family Calendar</h1>
      
      <div className="flex items-center space-x-8">
        {/* Time and Date Display */}
        <div className="text-right">
          <p className="text-2xl font-bold">{currentTime}</p>
          <p className="text-sm text-[#7A7A7A]">{currentDate}</p>
        </div>
        
        {/* Weather Display */}
        <div className="flex items-center bg-white py-1 px-3 rounded-full shadow-soft">
          {getWeatherIcon()}
          <span className="text-md font-medium">{weather.temperature}°{weather.unit}</span>
          <span className="mx-1 text-[#7A7A7A]">|</span>
          <span className="text-sm text-[#7A7A7A]">{weather.condition}</span>
          {weather.city && <span className="ml-1 text-xs text-[#7A7A7A]">({weather.city})</span>}
        </div>
        
        {/* Settings Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onSettingsClick}
          className="text-[#7A7A7A] hover:text-[#111111] transition-colors"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
}
