import { COLORS, getTextColor } from '@/lib/utils/color';
import { CalendarEvent } from '@shared/schema';
import { getTimeDisplay, isEventInProgress } from '@/lib/utils/date';

interface DayCardProps {
  day: string;
  date: string;
  color: string;
  meal: CalendarEvent | null;
  events: CalendarEvent[];
  timeFormat: "12h" | "24h";
}

export function DayCard({ day, date, color, meal, events, timeFormat }: DayCardProps) {
  const backgroundColor = color || settings?.theme?.weekdays?.[0] || '#F8A195';
  const textColor = getTextColor(backgroundColor);

  const renderEvent = (event: CalendarEvent) => {
    const inProgress = isEventInProgress(event.startTime, event.endTime);
    const timeString = event.allDay 
      ? 'All Day' 
      : getTimeDisplay(event.startTime, timeFormat === "24h");

    // Find the calendar name based on the calendarId
    let calendarName = "";
    if (event.calendarName) {
      calendarName = event.calendarName;
    }

    return (
      <div 
        key={event.id} 
        className={`mb-3 pb-3 border-b border-[${COLORS.DIVIDER_GRAY}] last:border-b-0 last:pb-0 ${
          inProgress ? 'bg-yellow-50 -mx-4 px-4 py-1 rounded' : ''
        }`}
      >
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-1 mb-0.5">
            {event.color && (
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: event.color }} 
              />
            )}
            <h4 className="font-bold text-base">
              {calendarName && `${calendarName} - `}{event.title}
            </h4>
          </div>
          {event.location && <p className="text-sm text-[#7A7A7A] mb-1">{event.location}</p>}
          <div className="text-sm text-[#7A7A7A]">{timeString}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="day-card rounded-xl bg-white shadow-soft flex flex-col overflow-hidden">
      {/* Day Header */}
      <div className="px-4 py-2 text-white" style={{ backgroundColor }}>
        <div className="flex justify-between items-center">
          <h2 className="font-bold" style={{ color: textColor }}>{day}</h2>
          <span className="text-sm opacity-80" style={{ color: textColor }}>{date}</span>
        </div>
      </div>

      {/* Meal Section */}
      <div className="meal-section px-4 py-2">
        <h3 className="text-xs font-bold text-[#7A7A7A] uppercase tracking-wide mb-0.5">MEAL</h3>
        <p className="text-sm truncate">
          {meal ? meal.title : "No meal planned"}
        </p>
      </div>

      {/* Events Section */}
      <div className="flex-grow p-4 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-sm text-[#7A7A7A] text-center italic">No events scheduled</p>
        ) : (
          events.map(event => renderEvent(event))
        )}
      </div>
    </div>
  );
}