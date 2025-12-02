"use client";

import { GameEvent } from "@/types/events";
import {
  getEventsForDate,
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthYear,
} from "@/utils/dateUtils";

interface CalendarViewProps {
  events: GameEvent[];
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export default function CalendarView({
  events,
  currentDate,
  onPrevMonth,
  onNextMonth,
}: CalendarViewProps) {
  console.log("CalendarView rendering with", events.length, "events");
  console.log("Current date:", currentDate);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Create array of days with empty slots for alignment
  const days: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    const date = new Date(year, month, day);
    return getEventsForDate(events, date);
  };

  return (
    <div className="p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onPrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-gray-900">
          {getMonthYear(currentDate)}
        </h2>

        <button
          onClick={onNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-sm text-gray-700 py-2"
          >
            {day.slice(0, 3)}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isToday =
            day &&
            new Date().getDate() === day &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year;

          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border rounded-lg ${
                day
                  ? "bg-white border-gray-200 hover:shadow-md transition-shadow"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              {day && (
                <>
                  <div
                    className={`text-sm font-semibold mb-1 ${
                      isToday
                        ? "bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center"
                        : "text-gray-700"
                    }`}
                  >
                    {day}
                  </div>

                  {dayEvents.length > 0 && (
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event, i) => (
                        <div
                          key={i}
                          className="text-xs bg-yellow-100 text-gray-900 p-1 rounded truncate hover:bg-yellow-200 cursor-pointer"
                          title={event.eventName}
                        >
                          {event.eventName}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 pl-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
