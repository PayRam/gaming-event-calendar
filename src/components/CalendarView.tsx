"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";

import { GameEvent } from "@/types/events";
import { getMonthYear, parseDate } from "@/utils/dateUtils";
import EventDetailModal from "./EventDetailModal";
import AddToCalendarModal from "./AddToCalendarModal";

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
  visibleRowCount: number;
  dayEventCounts: Map<number, number>;
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
  return DAY_HEADER_HEIGHT + rowCount * EVENT_ROW_HEIGHT + 40; // Added 40px for button space
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

      // Calculate event counts per day
      const dayEventCounts = new Map<number, number>();
      for (let col = 1; col <= 7; col++) {
        const eventsInDay = segments.filter(
          (seg) => seg.startCol <= col && seg.endCol >= col
        );
        dayEventCounts.set(col, eventsInDay.length);
      }

      const maxEventsPerDay = Math.max(...Array.from(dayEventCounts.values()));
      const visibleRowCount = Math.min(maxEventsPerDay, 2);

      return {
        segments,
        rowCount: rows.length,
        visibleRowCount,
        dayEventCounts,
      };
    });
  }, [weeks, normalizedEvents, currentDate]);

  const weekHeights = useMemo(() => {
    return weekLayouts.map((layout) => computeWeekHeight(layout.rowCount));
  }, [weekLayouts]);

  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  const handleEventClick = (event: GameEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleOpenCalendarForm = () => {
    setIsModalOpen(false); // Close event detail modal
    // Delay opening calendar modal to ensure smooth transition
    setTimeout(() => {
      setIsCalendarModalOpen(true);
    }, 100);
  };

  const handleCalendarFormSubmit = async (data: {
    name: string;
    industry: string;
    email: string;
  }) => {
    if (!selectedEvent) return;

    try {
      // Send calendar invite via email API
      const response = await fetch("/api/send-calendar-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: data.name,
          userEmail: data.email,
          userIndustry: data.industry,
          eventName: selectedEvent.eventName,
          eventDescription: selectedEvent.description,
          eventLocation: selectedEvent.location,
          startDate: selectedEvent.startDate,
          endDate: selectedEvent.endDate,
          eventWebsite: selectedEvent.website,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send calendar invite");
      }

      const result = await response.json();
      console.log("Calendar invite sent:", result);

      // Close the form modal
      setIsCalendarModalOpen(false);

      // Show success message
      alert("Calendar invite has been sent to your email!");
    } catch (error) {
      console.error("Error sending calendar invite:", error);
      alert("Failed to send calendar invite. Please try again.");
    }
  };

  const toggleDayExpansion = (dateKey: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  };

  const toggleWeekExpansion = (weekIndex: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekIndex)) {
        next.delete(weekIndex);
      } else {
        next.add(weekIndex);
      }
      return next;
    });
  };

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
            className="text-xs font-semibold tracking-wide uppercase text-black text-center"
          >
            {name}
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {weeks.map((week, weekIndex) => {
          const layout = weekLayouts[weekIndex];
          const isWeekExpanded = expandedWeeks.has(weekIndex);
          const effectiveRowCount = isWeekExpanded
            ? layout.rowCount
            : Math.min(layout.rowCount, 2);
          const weekHeight = computeWeekHeight(effectiveRowCount);
          const hiddenRowCount = Math.max(layout.rowCount - 2, 0);

          // Find the day with the most events in this week
          const dayEventCounts = week.map((cell, dayIdx) => {
            const dayCol = dayIdx + 1;
            const eventsInDay = layout.segments.filter(
              (seg) => seg.startCol <= dayCol && seg.endCol >= dayCol
            );
            return { dayIdx, count: eventsInDay.length };
          });
          const maxEventDay = dayEventCounts.reduce((max, curr) =>
            curr.count > max.count ? curr : max
          );

          return (
            <div
              key={weekIndex}
              className="relative"
              style={{ minHeight: `${weekHeight}px` }}
            >
              {/* Day cells background */}
              <div className="grid grid-cols-7 gap-3">
                {week.map((cell, dayIdx) => {
                  const isTodayCell = isSameDay(cell.date, today);
                  const dayCol = dayIdx + 1;
                  const dateKey = getDateKey(cell.date);
                  const eventsInThisDay = layout.segments.filter(
                    (seg) => seg.startCol <= dayCol && seg.endCol >= dayCol
                  );
                  const isExpanded = expandedDays.has(dateKey);
                  const hiddenCount = Math.max(eventsInThisDay.length - 3, 0);

                  return (
                    <div
                      key={dateKey}
                      className={`rounded-xl border transition-colors ${
                        cell.isCurrentMonth
                          ? "bg-white border-gray-200"
                          : "bg-gray-50 border-gray-100 text-gray-400"
                      } ${
                        isTodayCell ? "ring-2 ring-blue-500 ring-offset-2" : ""
                      }`}
                      style={{ minHeight: `${weekHeight}px` }}
                    >
                      <div className="p-4 flex flex-col h-full">
                        <div>
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

                // Check if this event should be hidden based on week expansion
                const shouldHide = segment.rowIndex >= 2 && !isWeekExpanded;

                if (shouldHide) return null;

                // Calculate percentage-based positioning
                const leftPercent = ((segment.startCol - 1) / 7) * 100;
                const widthPercent =
                  ((segment.endCol - segment.startCol + 1) / 7) * 100;
                const topOffset =
                  DAY_HEADER_HEIGHT + segment.rowIndex * EVENT_ROW_HEIGHT;

                return (
                  <div
                    key={`${segment.event.eventName}-${segment.event.startDate}-${idx}`}
                    className="absolute z-10"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      top: `${topOffset}px`,
                      paddingLeft: "12px",
                      paddingRight: "12px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEventClick(segment.event);
                      }}
                      className={`flex h-[60px] items-center gap-3 px-4 py-3 shadow-sm transition-all hover:shadow-md cursor-pointer w-full text-left ${
                        isMultiDay
                          ? "bg-[#FF00FF] border border-[#6A0DAD] text-gray-900"
                          : "bg-[#CAFF54] border border-[#6A0DAD] text-gray-900"
                      } ${radiusClasses}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold leading-tight">
                          {segment.event.eventName}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-black">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {segment.event.location}
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}

              {/* Expansion button positioned after the last visible event row */}
              {hiddenRowCount > 0 && !isWeekExpanded && (
                <div
                  className="absolute z-20"
                  style={{
                    left: `${(maxEventDay.dayIdx / 7) * 100}%`,
                    width: `${(1 / 7) * 100}%`,
                    top: `${DAY_HEADER_HEIGHT + 2 * EVENT_ROW_HEIGHT + 1}px`,
                    paddingLeft: "12px",
                    paddingRight: "12px",
                  }}
                >
                  <button
                    onClick={() => toggleWeekExpansion(weekIndex)}
                    className="px-2 py-1 bg-[#01E46F] backdrop-blur-sm rounded text-xs text-black hover:text-black-700 hover:bg-[#01E46F] font-medium text-left shadow-md border border-blue-200"
                  >
                    +{hiddenRowCount} more
                  </button>
                </div>
              )}
              {hiddenRowCount > 0 && isWeekExpanded && (
                <div
                  className="absolute z-20"
                  style={{
                    left: `${(maxEventDay.dayIdx / 7) * 100}%`,
                    width: `${(1 / 7) * 100}%`,
                    top: `${
                      DAY_HEADER_HEIGHT + layout.rowCount * EVENT_ROW_HEIGHT + 8
                    }px`,
                    paddingLeft: "12px",
                    paddingRight: "12px",
                  }}
                >
                  <button
                    onClick={() => toggleWeekExpansion(weekIndex)}
                    className="px-2 py-1 bg-[#01E46F] backdrop-blur-sm rounded text-xs text-black hover:text-black-700 hover:bg-[#01E46F] font-medium text-left shadow-md border border-gray-200"
                  >
                    Show less
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOpenCalendarForm={handleOpenCalendarForm}
      />

      {/* Add to Calendar Form Modal */}
      <AddToCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        onSubmit={handleCalendarFormSubmit}
        eventName={selectedEvent?.eventName || ""}
      />
    </div>
  );
}
