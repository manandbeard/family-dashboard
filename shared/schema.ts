import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Calendar feed schema
export const calendarFeeds = pgTable("calendar_feeds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  color: text("color").notNull().default("#F8A195"),
  type: text("type").notNull().default("person"), // person, meal, or notes
  active: boolean("active").notNull().default(true),
});

export const insertCalendarFeedSchema = createInsertSchema(calendarFeeds).pick({
  name: true,
  url: true,
  color: true,
  type: true,
  active: true,
});

export type InsertCalendarFeed = z.infer<typeof insertCalendarFeedSchema>;
export type CalendarFeed = typeof calendarFeeds.$inferSelect;

// Note schema
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNoteSchema = createInsertSchema(notes).pick({
  title: true,
  content: true,
  author: true,
});

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

// Settings schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
});

export const insertSettingSchema = createInsertSchema(settings).pick({
  key: true,
  value: true,
});

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

// Events (for caching)
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  calendarId: integer("calendar_id").notNull(),
  eventId: text("event_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  allDay: boolean("all_day").notNull().default(false),
  recurrence: text("recurrence"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).pick({
  calendarId: true,
  eventId: true,
  title: true,
  description: true,
  location: true,
  startTime: true,
  endTime: true,
  allDay: true,
  recurrence: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Default settings
export const defaultSettings = {
  timeFormat: "12h",
  screensaverTimeout: 10, // minutes
  photoDirectory: "./family-photos",
  weatherLocation: "auto", // auto = use IP location
  weatherUnit: "imperial", // imperial or metric
  familyName: "Helland",
  theme: {
    weekdays: ["#F8A195", "#B3C9AB", "#A4CCE3", "#C3B1D0", "#F8A195"],
    weekend: "#E8D3A2"
  }
};

// Types for frontend usage
export interface CalendarEvent {
  id: string;
  calendarId: number;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  color?: string;
  calendarName?: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  unit: string;
}

export interface PhotoItem {
  id: string;
  path: string;
  name: string;
  createdAt: Date;
}

export interface AppSettings {
  timeFormat: "12h" | "24h";
  screensaverTimeout: number;
  photoDirectory: string;
  weatherLocation: string;
  weatherUnit: string;
  familyName: string;
  slideshowInterval: number;
  transitionDuration: number;
  theme?: {
    weekdays: string[];
    weekend: string;
    mode?: 'light' | 'dark';
    accentColor?: string;
    fontSize?: 'small' | 'normal' | 'large';
  };
}