import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sortEventsByTime, getWeekStartAndEnd } from '../utils/date';
import { CalendarEvent, CalendarFeed } from '@shared/schema';

export function useCalendarFeeds() {
  const [feeds, setFeeds] = useState<CalendarFeed[]>([]);

  const { data, isLoading, error } = useQuery<CalendarFeed[]>({
    queryKey: ['/api/calendar-feeds'],
  });

  useEffect(() => {
    if (data) {
      setFeeds(data);
    }
  }, [data]);

  return {
    feeds,
    isLoading,
    error
  };
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [mealEvents, setMealEvents] = useState<CalendarEvent[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { start, end } = getWeekStartAndEnd();
  const startStr = start.toISOString();
  const endStr = end.toISOString();

  const { data, isLoading, error, refetch } = useQuery<any[]>({
    queryKey: [`/api/events?start=${startStr}&end=${endStr}`],
  });

  const { data: feedsData } = useQuery<CalendarFeed[]>({
    queryKey: ['/api/calendar-feeds'],
  });

  useEffect(() => {
    if (data && feedsData && Array.isArray(data) && Array.isArray(feedsData)) {
      // Convert to CalendarEvent format
      const calendarEvents: CalendarEvent[] = data.map((event: any) => {
        const calendar = feedsData.find(feed => feed.id === event.calendarId);
        return {
          id: event.eventId,
          calendarId: event.calendarId,
          title: event.title,
          description: event.description,
          location: event.location,
          startTime: new Date(event.startTime),
          endTime: new Date(event.endTime),
          allDay: event.allDay,
          color: calendar ? calendar.color : "#F8A195", // Use calendar color if available
          calendarName: calendar ? calendar.name : "" // Include calendar name
        };
      });

      // Separate meal events from regular events
      const meals: CalendarEvent[] = [];
      const regular: CalendarEvent[] = [];

      calendarEvents.forEach(event => {
        const calendar = feedsData.find((feed: CalendarFeed) => feed.id === event.calendarId);
        if (calendar && calendar.type === 'meal') {
          meals.push(event);
        } else if (calendar && (
          calendar.name.toLowerCase().includes('to do') || 
          calendar.name.toLowerCase() === 'todo'
        )) {
          // Skip To Do calendar events - they will be shown in the To Do List
        } else {
          regular.push(event);
        }
      });

      setMealEvents(sortEventsByTime(meals));
      setEvents(sortEventsByTime(regular));
    }
  }, [data, feedsData]);

  const refreshCalendars = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/events/refresh', { method: 'POST' });
      await refetch();
    } catch (error) {
      console.error('Error refreshing calendars:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    events,
    mealEvents,
    isLoading,
    isRefreshing,
    error,
    refreshCalendars
  };
}

export function getEventsForDay(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events.filter(event => {
    const eventDate = new Date(event.startTime);
    return (
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    );
  });
}

export function getMealForDay(mealEvents: CalendarEvent[], date: Date): CalendarEvent | null {
  const dayMeals = getEventsForDay(mealEvents, date);
  return dayMeals.length > 0 ? dayMeals[0] : null;
}
