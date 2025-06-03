import { COLORS, getTextColor } from '@/lib/utils/color';
import { CalendarEvent } from '@shared/schema';
import { getTimeDisplay, isEventInProgress } from '@/lib/utils/date';

interface WeekendDayCardProps {
  day: string;
  date: string;
  color: string;
  meal: CalendarEvent | null;
  events: CalendarEvent[];
  timeFormat: "12h" | "24h";
}

export function WeekendDayCard({ day, date, color, meal, events, timeFormat }: WeekendDayCardProps) {
  const backgroundColor = color || '#E8D3A2';
  const textColor = getTextColor(backgroundColor);

  const renderEvent = (event: CalendarEvent) => {
    const inProgress = isEventInProgress(event.startTime, event.endTime);
    const timeString = event.allDay 
      ? 'All Day' 
      : getTimeDisplay(event.startTime, timeFormat === "24h");

    return (
      <div 
        key={event.id} 
        className={`mb-3 pb-3 border-b border-[${COLORS.DIVIDER_GRAY}] last:border-b-0 last:pb-0 ${
          inProgress ? 'bg-yellow-50 -mx-4 px-4 py-1 rounded' : ''
        }`}
      >
        <div className="flex items-start">
          <span className="text-sm font-bold mr-2">{timeString}</span>
          <div>
            <h4 className="font-bold">{event.title}</h4>
            {event.location && <p className="text-sm text-[#7A7A7A]">{event.location}</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="day-card rounded-xl bg-white shadow-soft flex flex-col overflow-hidden h-full">
      {/* Day Header */}
      <div className="px-4 py-2 text-white" style={{ backgroundColor: color }}>
        <div className="flex justify-between items-center">
          <h2 className="font-bold" style={{ color: textColor }}>{day}</h2>
          <span className="text-sm opacity-80" style={{ color: textColor }}>{date}</span>
        </div>
      </div>

      {/* Meal Section */}
      <div className="meal-section">
        <h3 className="text-sm font-bold text-[#7A7A7A] uppercase tracking-wide mb-1">MEAL</h3>
        <p className="text-sm">
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