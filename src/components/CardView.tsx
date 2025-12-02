"use client";

import { GameEvent } from "@/types/events";
import { sortEventsByDate } from "@/utils/dateUtils";
import EventCard from "./EventCard";

interface CardViewProps {
  events: GameEvent[];
}

export default function CardView({ events }: CardViewProps) {
  const sortedEvents = sortEventsByDate(events);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {sortedEvents.map((event, index) => (
        <EventCard key={`${event.eventName}-${index}`} event={event} />
      ))}
    </div>
  );
}
