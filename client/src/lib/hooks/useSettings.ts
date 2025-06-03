import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { AppSettings, defaultSettings, CalendarFeed, InsertCalendarFeed } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    timeFormat: "12h",
    screensaverTimeout: 10,
    photoDirectory: "/home/pi/family-photos",
    weatherLocation: "auto",
    weatherUnit: "imperial",
    familyName: "Helland",
    theme: {
      weekdays: ["#F8A195", "#B3C9AB", "#A4CCE3", "#C3B1D0", "#F8A195"],
      weekend: "#E8D3A2"
    }
  });
  
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/settings'],
  });

  useEffect(() => {
    if (data) {
      // Merge settings with defaults for any missing values
      setSettings(prevSettings => ({
        ...prevSettings,
        ...data
      }));
    }
  }, [data]);

  const updateSetting = async (key: string, value: any) => {
    try {
      await apiRequest('PATCH', `/api/settings/${key}`, { value });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      
      // Update local state immediately
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
      
      toast({
        title: "Settings Updated",
        description: "Your settings have been saved",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
      return false;
    }
  };

  const resetToDefaults = async () => {
    try {
      // Update each setting with its default value
      for (const [key, value] of Object.entries(defaultSettings)) {
        await apiRequest('PATCH', `/api/settings/${key}`, { value });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      setSettings(defaultSettings);
      
      toast({
        title: "Settings Reset",
        description: "All settings have been reset to defaults",
      });
      
      return true;
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast({
        title: "Error",
        description: "Failed to reset settings",
        variant: "destructive",
      });
      return false;
    }
  };

  // Calendar feed management
  const { data: feedsData, refetch: refetchFeeds } = useQuery({
    queryKey: ['/api/calendar-feeds'],
  });

  const feeds = feedsData as CalendarFeed[] || [];

  const addCalendarFeed = async (feed: InsertCalendarFeed) => {
    try {
      await apiRequest('POST', '/api/calendar-feeds', feed);
      refetchFeeds();
      toast({
        title: "Calendar Added",
        description: "Your calendar feed has been added",
      });
      return true;
    } catch (error) {
      console.error('Error adding calendar feed:', error);
      toast({
        title: "Error",
        description: "Failed to add calendar feed",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateCalendarFeed = async (id: number, feed: Partial<InsertCalendarFeed>) => {
    try {
      await apiRequest('PATCH', `/api/calendar-feeds/${id}`, feed);
      refetchFeeds();
      toast({
        title: "Calendar Updated",
        description: "Your calendar feed has been updated",
      });
      return true;
    } catch (error) {
      console.error('Error updating calendar feed:', error);
      toast({
        title: "Error",
        description: "Failed to update calendar feed",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCalendarFeed = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/calendar-feeds/${id}`);
      refetchFeeds();
      toast({
        title: "Calendar Removed",
        description: "Your calendar feed has been removed",
      });
      return true;
    } catch (error) {
      console.error('Error deleting calendar feed:', error);
      toast({
        title: "Error",
        description: "Failed to remove calendar feed",
        variant: "destructive",
      });
      return false;
    }
  };

  const refreshCalendars = async () => {
    try {
      await apiRequest('POST', '/api/events/refresh', {});
      toast({
        title: "Calendars Refreshed",
        description: "All calendars have been refreshed",
      });
      return true;
    } catch (error) {
      console.error('Error refreshing calendars:', error);
      toast({
        title: "Error",
        description: "Failed to refresh calendars",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    settings,
    feeds,
    isLoading,
    error,
    updateSetting,
    resetToDefaults,
    addCalendarFeed,
    updateCalendarFeed,
    deleteCalendarFeed,
    refreshCalendars
  };
}
