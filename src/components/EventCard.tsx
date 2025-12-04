"use client";

import { useState } from "react";
import { GameEvent } from "@/types/events";
import { parseDate, formatDateRange } from "@/utils/dateUtils";
import EventDetailModal from "./EventDetailModal";

interface EventCardProps {
  event: GameEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <>
      <div
        className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-[#6A0DAD] relative cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Compass icon */}
        <div className="absolute top-5 left-5 w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>

        {/* Event title */}
        <h3 className="text-xl font-bold text-[#6A0DAD] mb-4 mt-12">
          {event.eventName}
        </h3>

        {/* Location and date info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-sm text-black">
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-medium">Location: {event.location}</span>
          </div>

          <div className="flex items-start gap-2 text-sm text-black">
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="font-medium">
              {formatDateRange(event.startDate, event.endDate)}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-black mb-6 leading-relaxed">
          {truncateDescription(event.description)}
        </p>

        {/* View Details button */}
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="inline-block px-6 py-2.5 bg-[#FF00FF] text-black text-sm font-bold rounded-full hover:bg-[#01E46F]/90 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={event}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
