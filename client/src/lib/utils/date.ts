import { format, addDays, startOfWeek, endOfWeek, isAfter, isBefore, isSameDay } from "date-fns";

export interface WeekdayInfo {
  name: string;
  shortName: string;
  date: Date;
  formattedDate: string;
}

export function getCurrentWeek(): WeekdayInfo[] {
  const today = new Date();
  const startOfTheWeek = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
  
  const weekdays: WeekdayInfo[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = addDays(startOfTheWeek, i);
    weekdays.push({
      name: format(date, 'EEEE'),
      shortName: format(date, 'EEE'),
      date,
      formattedDate: format(date, 'MMM d')
    });
  }
  
  return weekdays;
}

export function getWeekdayNames(): string[] {
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
}

export function getTimeDisplay(date: Date, use24Hour: boolean = false): string {
  return format(date, use24Hour ? 'HH:mm' : 'h:mm a');
}

export function getCurrentTimeFormatted(use24Hour: boolean = false): string {
  return format(new Date(), use24Hour ? 'HH:mm' : 'h:mm a');
}

export function getCurrentDateFormatted(): string {
  return format(new Date(), 'EEEE, MMMM d, yyyy');
}

export function isEventInProgress(startTime: Date, endTime: Date): boolean {
  const now = new Date();
  return isAfter(now, startTime) && isBefore(now, endTime);
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function sortEventsByTime(events: any[]): any[] {
  return [...events].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
}

export function getWeekStartAndEnd(): { start: Date, end: Date } {
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 1 });
  const end = endOfWeek(today, { weekStartsOn: 1 });
  
  return { start, end };
}
