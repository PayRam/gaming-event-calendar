"use client";

import { GameEvent } from "@/types/events";
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthYear,
  parseDate,
} from "@/utils/dateUtils";

interface CalendarViewProps {
  events: GameEvent[];
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

interface EventBar {
  event: GameEvent;
  startDay: number;
  endDay: number;
  startCol: number;
  span: number;
  isStart: boolean;
  isEnd: boolean;
}

export default function CalendarView({
  events,
  currentDate,
  onPrevMonth,
  onNextMonth,
}: CalendarViewProps) {
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

  // Get events for current month and organize them
  const getEventBars = (): EventBar[] => {
    const eventBars: EventBar[] = [];

    events.forEach((event) => {
      const startDate = parseDate(event.startDate);
      const endDate = parseDate(event.endDate);

      // Check if event is in current month
      const eventStartMonth = startDate.getMonth();
      const eventStartYear = startDate.getFullYear();
      const eventEndMonth = endDate.getMonth();
      const eventEndYear = endDate.getFullYear();

      const isInMonth =
        (eventStartYear === year && eventStartMonth === month) ||
        (eventEndYear === year && eventEndMonth === month) ||
        (startDate < new Date(year, month, 1) &&
          endDate > new Date(year, month + 1, 0));

      if (!isInMonth) return;

      // Calculate start and end days within the month
      let startDay = 1;
      let endDay = daysInMonth;

      if (eventStartYear === year && eventStartMonth === month) {
        startDay = startDate.getDate();
      }

      if (eventEndYear === year && eventEndMonth === month) {
        endDay = endDate.getDate();
      }

      // Calculate which column (day of week) the event starts
      const startCol = new Date(year, month, startDay).getDay();

      // Check if it's a multi-day event
      const isMultiDay = startDate.toDateString() !== endDate.toDateString();

      if (isMultiDay) {
        // For multi-day events, create bars that span across weeks
        let currentDay = startDay;
        while (currentDay <= endDay) {
          const currentCol = new Date(year, month, currentDay).getDay();
          const daysUntilWeekEnd = 6 - currentCol;
          const remainingDays = endDay - currentDay;
          const span = Math.min(daysUntilWeekEnd, remainingDays) + 1;

          eventBars.push({
            event,
            startDay: currentDay,
            endDay: Math.min(currentDay + span - 1, endDay),
            startCol: currentCol,
            span,
            isStart: currentDay === startDay,
            isEnd: currentDay + span - 1 >= endDay,
          });

          currentDay += span;
        }
      } else {
        // Single day event
        eventBars.push({
          event,
          startDay,
          endDay,
          startCol,
          span: 1,
          isStart: true,
          isEnd: true,
        });
      }
    });

    return eventBars;
  };

  const eventBars = getEventBars();

  // Group events by week and day for rendering
  const getWeeks = () => {
    const weeks: number[][] = [];
    let week: number[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      week.push(0);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    // Add remaining empty cells
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(0);
      }
      weeks.push(week);
    }

    return weeks;
  };

  const weeks = getWeeks();

  // Get events for a specific day (single-day events only for stacking)
  const getSingleDayEvents = (day: number) => {
    if (!day) return [];
    return eventBars.filter(
      (bar) => bar.startDay === day && bar.isStart && bar.isEnd
    );
  };

  // Get multi-day event bars that span across a specific day
  const getMultiDayEventBars = (weekIndex: number) => {
    const weekStart = weekIndex * 7 - firstDayOfMonth + 1;
    return eventBars.filter(
      (bar) =>
        !bar.isEnd ||
        !bar.isStart ||
        (bar.startDay >= weekStart && bar.startDay < weekStart + 7)
    );
  };

  const isToday = (day: number) => {
    return (
      day &&
      new Date().getDate() === day &&
      new Date().getMonth() === month &&
      new Date().getFullYear() === year
    );
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
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-sm text-gray-700 py-2 px-1"
          >
            {day.slice(0, 3)}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="relative">
            {/* Week row with day cells */}
            <div className="grid grid-cols-7 gap-1 relative">
              {week.map((day, dayIndex) => {
                const singleDayEvents = getSingleDayEvents(day);

                return (
                  <div
                    key={dayIndex}
                    className={`min-h-[120px] p-2 border ${
                      day
                        ? "bg-white border-gray-200"
                        : "bg-gray-50 border-gray-100"
                    } relative`}
                  >
                    {day > 0 && (
                      <>
                        {/* Day number */}
                        <div
                          className={`text-sm font-semibold mb-1 ${
                            isToday(day)
                              ? "bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center"
                              : "text-gray-700"
                          }`}
                        >
                          {day}
                        </div>

                        {/* Single day events stacked */}
                        {singleDayEvents.length > 0 && (
                          <div className="space-y-1 mt-8">
                            {singleDayEvents.slice(0, 2).map((bar, i) => (
                              <div
                                key={i}
                                className="bg-yellow-400 text-gray-900 text-xs font-semibold px-2 py-1 rounded cursor-pointer hover:bg-yellow-500 transition-colors"
                                title={bar.event.eventName}
                              >
                                <div className="truncate">
                                  {bar.event.eventName}
                                </div>
                              </div>
                            ))}
                            {singleDayEvents.length > 2 && (
                              <div className="text-xs text-gray-500 pl-2">
                                +{singleDayEvents.length - 2} more
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

            {/* Multi-day event bars overlaid on top */}
            <div className="absolute top-0 left-0 right-0 pointer-events-none pt-9">
              {getMultiDayEventBars(weekIndex)
                .filter((bar) => {
                  const weekStart = weekIndex * 7 - firstDayOfMonth + 1;
                  const weekEnd = weekStart + 6;
                  return bar.startDay >= weekStart && bar.startDay <= weekEnd;
                })
                .map((bar, barIndex) => {
                  const offsetFromWeekStart = bar.startCol;

                  return (
                    <div
                      key={`${bar.event.eventName}-${bar.startDay}-${barIndex}`}
                      className="absolute pointer-events-auto"
                      style={{
                        left: `calc(${(offsetFromWeekStart / 7) * 100}% + ${
                          offsetFromWeekStart * 0.25
                        }rem)`,
                        width: `calc(${(bar.span / 7) * 100}% - ${0.25}rem)`,
                        top: `${barIndex * 2}rem`,
                      }}
                    >
                      <div
                        className={`bg-yellow-100 border-l-4 border-yellow-500 text-gray-900 text-xs font-semibold px-2 py-1 cursor-pointer hover:bg-yellow-200 transition-colors ${
                          bar.isStart ? "rounded-l" : ""
                        } ${bar.isEnd ? "rounded-r" : ""}`}
                        title={bar.event.eventName}
                      >
                        <div className="truncate">
                          {bar.isStart && bar.event.eventName}
                        </div>
                        <div className="text-[10px] text-gray-600 truncate">
                          {bar.isStart && `📍 ${bar.event.location}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
