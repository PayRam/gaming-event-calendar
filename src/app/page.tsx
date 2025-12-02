"use client";

import { useState } from "react";
import CalendarView from "@/components/CalendarView";
import CardView from "@/components/CardView";
import eventsData from "@/../../public/data/events.json";

type ViewMode = "calendar" | "card";

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [currentDate, setCurrentDate] = useState(new Date());

  console.log("Current view mode:", viewMode);
  console.log("Events data loaded:", eventsData.events.length, "events");

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                iGaming Events & Conferences
              </h1>
              <p className="text-gray-600 mt-2">
                Discover top iGaming events and conferences. Stay updated on
                crucial dates, venues, and networking opportunities.
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("card")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  viewMode === "card"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                aria-label="Card view"
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
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                <span className="font-medium">Cards</span>
              </button>
              <button
                onClick={() => {
                  console.log("Calendar button clicked");
                  setViewMode("calendar");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  viewMode === "calendar"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                aria-label="Calendar view"
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="font-medium">Calendar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {viewMode === "calendar" ? (
          <CalendarView
            events={eventsData.events}
            currentDate={currentDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
        ) : (
          <CardView events={eventsData.events} />
        )}
      </main>

      {/* Stats Footer */}
      <footer className="mt-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {eventsData.events.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400 mt-1">
                Total Events
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {new Set(eventsData.events.map((e) => e.location)).size}
              </div>
              <div className="text-gray-600 dark:text-gray-400 mt-1">
                Locations
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                2025-2026
              </div>
              <div className="text-gray-600 dark:text-gray-400 mt-1">
                Event Year
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
