"use client";

import { useState } from "react";
import { GameEvent } from "@/types/events";
import { formatDateRange } from "@/utils/dateUtils";
import { X, MapPin, Calendar } from "lucide-react";
import Image from "next/image";

interface EventDetailModalProps {
  event: GameEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCalendarForm: () => void;
}

export default function EventDetailModal({
  event,
  isOpen,
  onClose,
  onOpenCalendarForm,
}: EventDetailModalProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen || !event) return null;

  const DESCRIPTION_LIMIT = 300; // Character limit before "Read More"
  const shouldShowReadMore = event.description.length > DESCRIPTION_LIMIT;
  const displayDescription =
    isExpanded || !shouldShowReadMore
      ? event.description
      : event.description.slice(0, DESCRIPTION_LIMIT) + "...";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[90vh] p-8">
          {/* Event Title */}
          <h2 className="text-4xl font-bold text-black mb-6 pr-8">
            {event.eventName.toUpperCase()}
          </h2>

          {/* Description */}
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">
              {displayDescription}
            </p>
            {shouldShowReadMore && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[#6A0DAD] font-semibold mt-2 hover:text-[#FF00FF] transition-colors"
              >
                {isExpanded ? "Read Less" : "Read More"}
              </button>
            )}
          </div>

          {/* Location */}
          <div className="flex items-start gap-3 mb-4">
            <MapPin className="w-5 h-5 text-[#6A0DAD] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-black font-semibold">{event.location}</p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-start gap-3 mb-8">
            <Calendar className="w-5 h-5 text-[#6A0DAD] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-black font-semibold">
                {formatDateRange(event.startDate, event.endDate)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            {/* Visit Website Button */}
            <a
              href={event.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#CAFF54] text-black rounded-lg hover:bg-[#CAFF54]/90 font-bold text-base transition-colors"
            >
              VISIT WEBSITE
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
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>

            {/* Add to Google Calendar Button */}
            <button
              onClick={onOpenCalendarForm}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-black text-black rounded-lg hover:bg-gray-50 font-medium text-base transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" />
              </svg>
              ADD TO GOOGLE CALENDAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
