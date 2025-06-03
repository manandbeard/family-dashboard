import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchCalendarEvents, refreshAllCalendars, scheduleCalendarRefresh } from "./ical";
import { getWeatherByLocation, scheduleWeatherUpdates } from "./weather";
import { getPhotos, getPhotoFile, saveUploadedPhoto } from "./photos";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertCalendarFeedSchema, insertNoteSchema } from "@shared/schema";
import { z } from "zod";

// Setup multer for file uploads
const memStorage = multer.memoryStorage();
const upload = multer({ 
  storage: memStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'image/bmp', 
      'image/webp'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Calendar feeds endpoints
  app.get("/api/calendar-feeds", async (req: Request, res: Response) => {
    try {
      const feeds = await storage.getCalendarFeeds();
      res.json(feeds);
    } catch (error) {
      res.status(500).json({ message: "Error fetching calendar feeds" });
    }
  });

  app.post("/api/calendar-feeds", async (req: Request, res: Response) => {
    try {
      const validatedData = insertCalendarFeedSchema.parse(req.body);
      const feed = await storage.createCalendarFeed(validatedData);
      // Fetch events for the new calendar
      await fetchCalendarEvents(feed.id);
      res.status(201).json(feed);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid calendar feed data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating calendar feed" });
      }
    }
  });

  app.patch("/api/calendar-feeds/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCalendarFeedSchema.partial().parse(req.body);
      const updatedFeed = await storage.updateCalendarFeed(id, validatedData);
      
      if (!updatedFeed) {
        return res.status(404).json({ message: "Calendar feed not found" });
      }
      
      // If the URL was updated, refresh the events
      if (req.body.url) {
        await fetchCalendarEvents(id);
      }
      
      res.json(updatedFeed);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid calendar feed data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error updating calendar feed" });
      }
    }
  });

  app.delete("/api/calendar-feeds/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCalendarFeed(id);
      
      if (!success) {
        return res.status(404).json({ message: "Calendar feed not found" });
      }
      
      // Delete associated events
      await storage.deleteEventsByCalendar(id);
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting calendar feed" });
    }
  });

  // Calendar events endpoints
  app.get("/api/events", async (req: Request, res: Response) => {
    try {
      const startDate = req.query.start ? new Date(req.query.start as string) : new Date();
      const endDate = req.query.end ? new Date(req.query.end as string) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      const events = await storage.getEvents(startDate, endDate);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Error fetching events" });
    }
  });

  app.post("/api/events/refresh", async (req: Request, res: Response) => {
    try {
      const success = await refreshAllCalendars();
      if (success) {
        res.json({ message: "Calendars refreshed successfully" });
      } else {
        res.status(500).json({ message: "Some calendars failed to refresh" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error refreshing calendars" });
    }
  });

  // Notes endpoints
  app.get("/api/notes", async (req: Request, res: Response) => {
    try {
      const notes = await storage.getNotes();
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notes" });
    }
  });

  app.post("/api/notes", async (req: Request, res: Response) => {
    try {
      const validatedData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(validatedData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid note data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating note" });
      }
    }
  });

  app.delete("/api/notes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteNote(id);
      
      if (!success) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting note" });
    }
  });

  // Weather endpoint
  app.get("/api/weather", async (req: Request, res: Response) => {
    try {
      const location = req.query.location as string || await storage.getSetting('weatherLocation') || 'auto';
      const weather = await getWeatherByLocation(location);
      res.json(weather);
    } catch (error) {
      res.status(500).json({ message: "Error fetching weather data" });
    }
  });

  // Photos endpoints
  app.get("/api/photos", async (req: Request, res: Response) => {
    try {
      const photos = await getPhotos();
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Error fetching photos" });
    }
  });

  app.get("/api/photos/:filename", async (req: Request, res: Response) => {
    try {
      const photoPath = await getPhotoFile(req.params.filename);
      
      if (!photoPath) {
        return res.status(404).json({ message: "Photo not found" });
      }
      
      res.sendFile(photoPath);
    } catch (error) {
      res.status(500).json({ message: "Error fetching photo" });
    }
  });

  app.post("/api/photos/upload", upload.single('photo'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No photo uploaded" });
      }
      
      const success = await saveUploadedPhoto(req.file);
      
      if (success) {
        res.status(201).json({ message: "Photo uploaded successfully" });
      } else {
        res.status(500).json({ message: "Error saving photo" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error uploading photo" });
    }
  });

  // Settings endpoints
  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching settings" });
    }
  });

  app.patch("/api/settings/:key", async (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      
      if (value === undefined) {
        return res.status(400).json({ message: "Value is required" });
      }
      
      const success = await storage.updateSetting(key, value);
      
      if (success) {
        res.json({ key, value });
      } else {
        res.status(500).json({ message: "Error updating setting" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error updating setting" });
    }
  });

  // Schedule periodic refreshes
  scheduleCalendarRefresh();
  scheduleWeatherUpdates();

  const httpServer = createServer(app);
  return httpServer;
}
