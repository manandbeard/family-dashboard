import { 
  calendarFeeds, 
  notes, 
  settings, 
  events, 
  type CalendarFeed, 
  type InsertCalendarFeed, 
  type Note, 
  type InsertNote, 
  type Setting, 
  type InsertSetting, 
  type Event, 
  type InsertEvent,
  defaultSettings
} from "@shared/schema";

export interface IStorage {
  // Calendar feeds
  getCalendarFeeds(): Promise<CalendarFeed[]>;
  getCalendarFeed(id: number): Promise<CalendarFeed | undefined>;
  createCalendarFeed(feed: InsertCalendarFeed): Promise<CalendarFeed>;
  updateCalendarFeed(id: number, feed: Partial<InsertCalendarFeed>): Promise<CalendarFeed | undefined>;
  deleteCalendarFeed(id: number): Promise<boolean>;

  // Notes
  getNotes(): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  deleteNote(id: number): Promise<boolean>;

  // Settings
  getSetting(key: string): Promise<any>;
  updateSetting(key: string, value: any): Promise<boolean>;
  getAllSettings(): Promise<Record<string, any>>;

  // Events
  getEvents(startDate: Date, endDate: Date): Promise<Event[]>;
  getEventsByCalendar(calendarId: number, startDate: Date, endDate: Date): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  deleteEventsByCalendar(calendarId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private calendarFeeds: Map<number, CalendarFeed>;
  private notes: Map<number, Note>;
  private settings: Map<string, any>;
  private events: Map<number, Event>;
  private calendarFeedCurrentId: number;
  private noteCurrentId: number;
  private eventCurrentId: number;

  constructor() {
    this.calendarFeeds = new Map();
    this.notes = new Map();
    this.settings = new Map();
    this.events = new Map();
    this.calendarFeedCurrentId = 1;
    this.noteCurrentId = 1;
    this.eventCurrentId = 1;

    // Initialize with default settings
    for (const [key, value] of Object.entries(defaultSettings)) {
      this.settings.set(key, value);
    }

    // Don't add a default calendar with an invalid URL
    // We'll let users add their own calendars through the UI
  }

  // Calendar feeds methods
  async getCalendarFeeds(): Promise<CalendarFeed[]> {
    return Array.from(this.calendarFeeds.values());
  }

  async getCalendarFeed(id: number): Promise<CalendarFeed | undefined> {
    return this.calendarFeeds.get(id);
  }

  async createCalendarFeed(feed: InsertCalendarFeed): Promise<CalendarFeed> {
    const id = this.calendarFeedCurrentId++;
    const newFeed: CalendarFeed = { ...feed, id };
    this.calendarFeeds.set(id, newFeed);
    return newFeed;
  }

  async updateCalendarFeed(id: number, feed: Partial<InsertCalendarFeed>): Promise<CalendarFeed | undefined> {
    const existingFeed = this.calendarFeeds.get(id);
    if (!existingFeed) return undefined;
    
    const updatedFeed = { ...existingFeed, ...feed };
    this.calendarFeeds.set(id, updatedFeed);
    return updatedFeed;
  }

  async deleteCalendarFeed(id: number): Promise<boolean> {
    return this.calendarFeeds.delete(id);
  }

  // Notes methods
  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values());
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(note: InsertNote): Promise<Note> {
    const id = this.noteCurrentId++;
    const now = new Date();
    const newNote: Note = { ...note, id, createdAt: now };
    this.notes.set(id, newNote);
    return newNote;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }

  // Settings methods
  async getSetting(key: string): Promise<any> {
    return this.settings.get(key) || null;
  }

  async updateSetting(key: string, value: any): Promise<boolean> {
    this.settings.set(key, value);
    return true;
  }

  async getAllSettings(): Promise<Record<string, any>> {
    const allSettings: Record<string, any> = {};
    for (const [key, value] of this.settings.entries()) {
      allSettings[key] = value;
    }
    return allSettings;
  }

  // Events methods
  async getEvents(startDate: Date, endDate: Date): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => {
      return new Date(event.startTime) >= startDate && new Date(event.startTime) <= endDate;
    });
  }

  async getEventsByCalendar(calendarId: number, startDate: Date, endDate: Date): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => {
      return event.calendarId === calendarId && 
        new Date(event.startTime) >= startDate && 
        new Date(event.startTime) <= endDate;
    });
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.eventCurrentId++;
    const now = new Date();
    const newEvent: Event = { ...event, id, lastUpdated: now };
    this.events.set(id, newEvent);
    return newEvent;
  }

  async deleteEventsByCalendar(calendarId: number): Promise<boolean> {
    let success = true;
    for (const [id, event] of this.events.entries()) {
      if (event.calendarId === calendarId) {
        success = success && this.events.delete(id);
      }
    }
    return success;
  }
}

export const storage = new MemStorage();
