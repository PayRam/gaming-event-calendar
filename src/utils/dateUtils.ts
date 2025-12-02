import { GameEvent } from "@/types/events";

export function parseDate(dateString: string): Date {
  const [day, month, year] = dateString.split("-");
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (startDate === endDate) {
    return formatDate(start);
  }

  const startFormatted = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endFormatted = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startFormatted} - ${endFormatted}`;
}

export function getEventsForDate(events: GameEvent[], date: Date): GameEvent[] {
  return events.filter((event) => {
    const start = parseDate(event.startDate);
    const end = parseDate(event.endDate);
    return date >= start && date <= end;
  });
}

export function sortEventsByDate(events: GameEvent[]): GameEvent[] {
  return [...events].sort((a, b) => {
    const dateA = parseDate(a.startDate);
    const dateB = parseDate(b.startDate);
    return dateA.getTime() - dateB.getTime();
  });
}

export function getMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}
