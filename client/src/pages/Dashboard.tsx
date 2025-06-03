import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { DayCard } from '@/components/DayCard';
import { WeekendDayCard } from '@/components/WeekendDayCard';
import { PhotoSlideshow } from '@/components/PhotoSlideshow';
import { ToDoList } from '@/components/ToDoList';
import { Screensaver } from '@/components/Screensaver';
import { SettingsPanel } from '@/components/SettingsPanel';
import { COLORS, WEEKDAY_COLORS } from '@/lib/utils/color';
import { useSettings } from '@/lib/hooks/useSettings';
import { useCalendarEvents, useCalendarFeeds, getEventsForDay, getMealForDay } from '@/lib/hooks/useCalendar';
import { usePhotos } from '@/lib/hooks/usePhotos';
import { useNotes } from '@/lib/hooks/useNotes';
import { useScreensaver } from '@/lib/hooks/useScreensaver';
import { getCurrentWeek } from '@/lib/utils/date';

export default function Dashboard() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [weekdays, setWeekdays] = useState(getCurrentWeek());
  const { settings, feeds, updateSetting, resetToDefaults, addCalendarFeed, updateCalendarFeed, deleteCalendarFeed, refreshCalendars } = useSettings();
  const { events, mealEvents, isRefreshing, refreshCalendars: refreshEvents } = useCalendarEvents();
  const { photos, uploadPhoto } = usePhotos();
  const { notes, addNote, deleteNote } = useNotes();
  const { isScreensaverActive, exitScreensaver } = useScreensaver(settings.screensaverTimeout);

  // Update weekdays when time changes
  useEffect(() => {
    // Update weekdays initially
    setWeekdays(getCurrentWeek());

    // Update weekdays at midnight
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        setWeekdays(getCurrentWeek());
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Handle settings toggle
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // Handle refresh all
  const handleRefreshAll = async () => {
    await refreshCalendars();
    await refreshEvents();
    return true;
  };

  const weekdayColors = settings.theme?.weekdays || ['#F8A195', '#B3C9AB', '#A4CCE3', '#C3B1D0', '#F8A195'];
  const weekendColor = settings.theme?.weekend || '#E8D3A2';

  // Update theme when settings change
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme) {
      weekdayColors.forEach((color, index) => {
        root.style.setProperty(`--day-color-${index}`, color);
      });
      root.style.setProperty('--weekend-color', weekendColor);
    }
  }, [settings.theme, weekdayColors, weekendColor]);

  return (
    <div className="container mx-auto px-4 py-4 h-[100vh] flex flex-col relative">
      {/* Header */}
      <Header 
        familyName={settings.familyName}
        onSettingsClick={toggleSettings}
        timeFormat={settings.timeFormat}
      />

      {/* Main Calendar Content */}
      <div className="flex-grow grid grid-rows-2 gap-4">
        {/* Weekday Row */}
        <div className="grid grid-cols-5 gap-4 min-h-0">
          {weekdays.slice(0, 5).map((day, index) => (
            <DayCard
              key={day.name}
              day={day.name}
              date={day.formattedDate}
              color={weekdayColors[index]}
              meal={getMealForDay(mealEvents, day.date)}
              events={getEventsForDay(events, day.date)}
              timeFormat={settings.timeFormat}
            />
          ))}
        </div>

        {/* Second Row (Weekend, Photos, Tasks) */}
        <div className="grid grid-cols-12 gap-4 min-h-0">
          {/* Weekend Cards */}
          <div className="col-span-5 grid grid-cols-2 gap-4">
            {weekdays.slice(5, 7).map((day, index) => (
              <WeekendDayCard
                key={day.name}
                day={day.name}
                date={day.formattedDate}
                color={WEEKDAY_COLORS[5 + index]}
                meal={getMealForDay(mealEvents, day.date)}
                events={getEventsForDay(events, day.date)}
                timeFormat={settings.timeFormat}
              />
            ))}
          </div>

          {/* Photo Slideshow */}
          <div className="col-span-4">
            <PhotoSlideshow 
              photos={photos}
              color={COLORS.DUSTY_LAVENDER}
              settings={settings}
            />
          </div>

          {/* To Do List */}
          <div className="col-span-3">
            <ToDoList 
              notes={notes}
              color={COLORS.SOFT_CORAL}
              onAddNote={addNote}
              onDeleteNote={deleteNote}
            />
          </div>
        </div>
      </div>

      {/* Screensaver */}
      <Screensaver 
        active={isScreensaverActive}
        photos={photos}
        onExit={exitScreensaver}
      />

      {/* Settings Panel */}
      <SettingsPanel 
        active={isSettingsOpen}
        settings={settings}
        feeds={feeds}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSetting={updateSetting}
        onResetDefaults={resetToDefaults}
        onAddCalendarFeed={addCalendarFeed}
        onUpdateCalendarFeed={updateCalendarFeed}
        onDeleteCalendarFeed={deleteCalendarFeed}
        onRefreshCalendars={handleRefreshAll}
        isRefreshing={isRefreshing}
        uploadPhoto={uploadPhoto}
      />
    </div>
  );
}