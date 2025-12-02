"use client";

import { GameEvent } from "@/types/events";
import { parseDate, formatDateRange } from "@/utils/dateUtils";

interface EventCardProps {
  event: GameEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const truncateDescription = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-900">{event.eventName}</h3>
        <span className="px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-semibold rounded-full">
          {event.month}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <svg
            className="w-5 h-5 mt-0.5 flex-shrink-0"
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
          <span>{event.location}</span>
        </div>

        <div className="flex items-start gap-2 text-sm text-gray-600">
          <svg
            className="w-5 h-5 mt-0.5 flex-shrink-0"
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
          <span>{formatDateRange(event.startDate, event.endDate)}</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
        {truncateDescription(event.description)}
      </p>

      <div className="flex gap-3">
        {event.website && (
          <a
            href={event.website}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Learn More
          </a>
        )}
        <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}
