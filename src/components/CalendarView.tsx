"use client";

import { useMemo } from "react";

import { GameEvent } from "@/types/events";
import { getMonthYear, parseDate } from "@/utils/dateUtils";

interface CalendarViewProps {
  events: GameEvent[];
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

interface CalendarDayCell {
  date: Date;
  isCurrentMonth: boolean;
}

interface NormalizedEvent {
  event: GameEvent;
  start: Date;
  end: Date;
  totalDuration: number;
}

interface WeekEventSegment {
  event: GameEvent;
  segmentStart: Date;
  segmentEnd: Date;
  startCol: number;
  endCol: number;
  totalDuration: number;
  isStartOfEvent: boolean;
  isEndOfEvent: boolean;
  rowIndex: number;
}

interface WeekLayout {
  segments: WeekEventSegment[];
  rowCount: number;
}

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const DAY_HEADER_HEIGHT = 80;
const EVENT_ROW_HEIGHT = 72;
const BASE_CELL_HEIGHT = 160;

const dayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const differenceInDays = (start: Date, end: Date) =>
  Math.round(
    (startOfDay(end).getTime() - startOfDay(start).getTime()) / MS_IN_DAY
  );

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const computeWeekHeight = (rowCount: number) => {
  if (rowCount <= 0) {
    return BASE_CELL_HEIGHT;
  }
  return DAY_HEADER_HEIGHT + rowCount * EVENT_ROW_HEIGHT;
};

const getRadiusClasses = (segment: WeekEventSegment) => {
  if (segment.totalDuration <= 1) {
    return "rounded-lg";
  }

  if (segment.isStartOfEvent && segment.isEndOfEvent) {
    return "rounded-lg";
  }

  if (segment.isStartOfEvent) {
    return "rounded-l-lg rounded-r-md";
  }

  if (segment.isEndOfEvent) {
    return "rounded-r-lg rounded-l-md";
  }

  return "rounded-none";
};

export default function CalendarView({
  events,
  currentDate,
  onPrevMonth,
  onNextMonth,
}: CalendarViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo<CalendarDayCell[]>(() => {
    const firstOfMonth = startOfDay(new Date(year, month, 1));
    const weekdayOffset = (firstOfMonth.getDay() + 6) % 7;
    const calendarStart = startOfDay(new Date(firstOfMonth));
    calendarStart.setDate(firstOfMonth.getDate() - weekdayOffset);

    const cells: CalendarDayCell[] = [];
    for (let i = 0; i < 42; i += 1) {
      const date = startOfDay(new Date(calendarStart));
      date.setDate(calendarStart.getDate() + i);
      cells.push({
        date,
        isCurrentMonth: date.getMonth() === month,
      });
    }
    return cells;
  }, [year, month]);

  const weeks = useMemo(() => {
    const chunked: CalendarDayCell[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      chunked.push(calendarDays.slice(i, i + 7));
    }
    return chunked;
  }, [calendarDays]);

  const normalizedEvents = useMemo<NormalizedEvent[]>(() => {
    return events.map((event) => {
      const start = startOfDay(parseDate(event.startDate));
      const end = startOfDay(parseDate(event.endDate));

      return {
        event,
        start,
        end,
        totalDuration: differenceInDays(start, end) + 1,
      };
    });
  }, [events]);

  const weekLayouts = useMemo<WeekLayout[]>(() => {
    return weeks.map((week) => {
      const weekStart = startOfDay(week[0]?.date ?? currentDate);
      const weekEnd = startOfDay(week[6]?.date ?? currentDate);

      const segments: WeekEventSegment[] = [];

      normalizedEvents.forEach(({ event, start, end, totalDuration }) => {
        if (end < weekStart || start > weekEnd) {
          return;
        }

        const segmentStart = start > weekStart ? start : weekStart;
        const segmentEnd = end < weekEnd ? end : weekEnd;

        const startCol = differenceInDays(weekStart, segmentStart) + 1;
        const endCol = differenceInDays(weekStart, segmentEnd) + 1;

        segments.push({
          event,
          segmentStart,
          segmentEnd,
          startCol: Math.max(1, startCol),
          endCol: Math.min(7, endCol),
          totalDuration,
          isStartOfEvent: segmentStart.getTime() === start.getTime(),
          isEndOfEvent: segmentEnd.getTime() === end.getTime(),
          rowIndex: 0,
        });
      });

      segments.sort((a, b) => {
        if (b.totalDuration !== a.totalDuration) {
          return b.totalDuration - a.totalDuration;
        }

        const startDiff = a.segmentStart.getTime() - b.segmentStart.getTime();
        if (startDiff !== 0) {
          return startDiff;
        }

        return a.event.eventName.localeCompare(b.event.eventName);
      });

      const rows: WeekEventSegment[][] = [];

      segments.forEach((segment) => {
        let placed = false;

        for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
          const conflict = rows[rowIndex].some((existing) => {
            return (
              segment.startCol <= existing.endCol &&
              segment.endCol >= existing.startCol
            );
          });

          if (!conflict) {
            segment.rowIndex = rowIndex;
            rows[rowIndex].push(segment);
            placed = true;
            break;
          }
        }

        if (!placed) {
          segment.rowIndex = rows.length;
          rows.push([segment]);
        }
      });

      return {
        segments,
        rowCount: rows.length,
      };
    });
  }, [weeks, normalizedEvents, currentDate]);

  const weekHeights = useMemo(() => {
    return weekLayouts.map((layout) => computeWeekHeight(layout.rowCount));
  }, [weekLayouts]);

  const today = startOfDay(new Date());

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
          aria-label="Previous month"
        >
          <svg
            className="w-5 h-5"
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

        <h2 className="text-3xl font-semibold text-gray-900">
          {getMonthYear(currentDate)}
        </h2>

        <button
          onClick={onNextMonth}
          className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
          aria-label="Next month"
        >
          <svg
            className="w-5 h-5"
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

      <div className="grid grid-cols-7 gap-3 mb-4">
        {dayNames.map((name) => (
          <div
            key={name}
            className="text-xs font-semibold tracking-wide uppercase text-gray-400 text-center"
          >
            {name}
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {weeks.map((week, weekIndex) => {
          const layout = weekLayouts[weekIndex];
          const weekHeight = weekHeights[weekIndex];

          return (
            <div
              key={weekIndex}
              className="relative"
              style={{ minHeight: `${weekHeight}px` }}
            >
              {/* Day cells background */}
              <div className="grid grid-cols-7 gap-3">
                {week.map((cell) => {
                  const isTodayCell = isSameDay(cell.date, today);

                  return (
                    <div
                      key={getDateKey(cell.date)}
                      className={`rounded-xl border transition-colors ${
                        cell.isCurrentMonth
                          ? "bg-white border-gray-200"
                          : "bg-gray-50 border-gray-100 text-gray-400"
                      } ${
                        isTodayCell ? "ring-2 ring-blue-500 ring-offset-2" : ""
                      }`}
                      style={{ minHeight: `${weekHeight}px` }}
                    >
                      <div className="p-4">
                        <span className="block text-xs font-medium uppercase tracking-wide text-gray-400">
                          {cell.date.toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </span>
                        <span
                          className={`text-xl font-semibold ${
                            cell.isCurrentMonth
                              ? "text-gray-900"
                              : "text-gray-400"
                          }`}
                        >
                          {cell.date.getDate()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Event cards positioned absolutely */}
              {layout.segments.map((segment, idx) => {
                const eventUrl =
                  segment.event.website || segment.event.link || "#";
                const isMultiDay = segment.totalDuration > 1;
                const radiusClasses = getRadiusClasses(segment);

                // Calculate percentage-based positioning
                const leftPercent = ((segment.startCol - 1) / 7) * 100;
                const widthPercent =
                  ((segment.endCol - segment.startCol + 1) / 7) * 100;
                const topOffset =
                  DAY_HEADER_HEIGHT + segment.rowIndex * EVENT_ROW_HEIGHT;

                return (
                  <div
                    key={`${segment.event.eventName}-${segment.event.startDate}-${idx}`}
                    className="absolute"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      top: `${topOffset}px`,
                      paddingLeft: "12px",
                      paddingRight: "12px",
                    }}
                  >
                    <div
                      className={`flex h-[60px] items-center justify-between gap-3 px-4 py-3 shadow-sm transition-all hover:shadow-md ${
                        isMultiDay
                          ? "bg-amber-50 border border-amber-200 text-amber-900"
                          : "bg-white border border-gray-200 text-gray-900"
                      } ${radiusClasses}`}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold leading-tight">
                          {segment.event.eventName}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span role="img" aria-hidden="true">
                            📍
                          </span>
                          <span className="truncate">
                            {segment.event.location}
                          </span>
                        </div>
                      </div>
                      <a
                        href={eventUrl}
                        className="whitespace-nowrap text-xs font-medium text-blue-600 hover:text-blue-700"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Learn More →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
