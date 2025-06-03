import axios from 'axios';
import ical from 'node-ical';
import { storage } from './storage';
import { InsertEvent, InsertNote } from '@shared/schema';

// Function to fetch and parse iCal feeds
export async function fetchCalendarEvents(calendarId: number): Promise<boolean> {
  try {
    // Get the calendar feed
    const calendar = await storage.getCalendarFeed(calendarId);
    if (!calendar) {
      console.error(`Calendar with ID ${calendarId} not found`);
      return false;
    }

    // Fetch the iCal data
    const response = await axios.get(calendar.url);
    if (response.status !== 200) {
      console.error(`Failed to fetch calendar data from ${calendar.url}`);
      return false;
    }

    // Parse the iCal data
    const parsedEvents = ical.parseICS(response.data);
    
    // Clear existing events for this calendar
    await storage.deleteEventsByCalendar(calendarId);
    
    // Process and store events
    for (const [key, event] of Object.entries(parsedEvents)) {
      if (event.type !== 'VEVENT') continue;
      
      // Skip events without necessary data
      if (!event.start || !event.end || !event.summary) continue;
      
      const eventData: InsertEvent = {
        calendarId,
        eventId: key,
        title: event.summary,
        description: event.description || '',
        location: event.location || '',
        startTime: event.start,
        endTime: event.end,
        allDay: !event.start.hasOwnProperty('tz'),
        recurrence: event.rrule ? JSON.stringify(event.rrule.options) : null
      };
      
      await storage.createEvent(eventData);
      
      // If this is a notes calendar or a To Do list, extract notes from events
      if ((calendar.type === 'notes' || 
          calendar.type === 'todo' ||
          calendar.name.toLowerCase().includes('to do') || 
          calendar.name.toLowerCase() === 'todo') && 
          (event.description || event.summary)) {
        // Get author from organizer if available
        let author = 'Calendar';
        if (event.organizer) {
          // Try to extract a name from the organizer string or object
          if (typeof event.organizer === 'string') {
            const match = event.organizer.match(/CN=([^:]+):/);
            author = match ? match[1] : 'Calendar';
          } else if (typeof event.organizer === 'object') {
            author = event.organizer.params?.CN || event.organizer.val || 'Calendar';
          }
        }
        
        const noteData: InsertNote = {
          title: event.summary,
          content: event.description,
          author: author
        };
        
        await storage.createNote(noteData);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error fetching calendar events for ID ${calendarId}:`, error);
    return false;
  }
}

// Function to refresh all calendar feeds
export async function refreshAllCalendars(): Promise<boolean> {
  try {
    const calendars = await storage.getCalendarFeeds();
    
    const results = await Promise.all(
      calendars.map(calendar => fetchCalendarEvents(calendar.id))
    );
    
    return results.every(result => result === true);
  } catch (error) {
    console.error('Error refreshing all calendars:', error);
    return false;
  }
}

// Schedule periodic refresh every 15 minutes
export function scheduleCalendarRefresh() {
  // Initial refresh
  refreshAllCalendars();
  
  // Set interval for periodic refresh (every 15 minutes)
  setInterval(refreshAllCalendars, 15 * 60 * 1000);
}
