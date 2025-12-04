"use client";

import { useState } from "react";
import Image from "next/image";
import { Twitter, Mail, ArrowUp } from "lucide-react";
import CalendarView from "@/components/CalendarView";
import CardView from "@/components/CardView";
import eventsData from "@/../../public/data/events.json";

type ViewMode = "calendar" | "card";

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [currentDate, setCurrentDate] = useState(new Date());

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
      {/* Header Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image
                src="/payram_horizontalVividGreen.svg"
                alt="B Gaming Logo"
                width={180}
                height={40}
                priority
                className="h-10 w-auto"
              />
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button className="text-gray-700 hover:text-gray-900 font-medium">
                GAMES
              </button>
              <button className="text-gray-700 hover:text-gray-900 font-medium">
                MARKETING
              </button>
              <button className="text-gray-700 hover:text-gray-900 font-medium">
                PARTNERS
              </button>
              <button className="text-gray-700 hover:text-gray-900 font-medium">
                BLOG
              </button>
              <button className="text-gray-700 hover:text-gray-900 font-medium">
                ABOUT
              </button>
              <button className="p-2 text-gray-700 hover:text-gray-900">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <button className="px-6 py-2 bg-[#01E46F] text-black rounded-md hover:bg-[#01E46F]/80 font-medium">
                CONTACT US
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
              iGAMING EVENTS &<br />
              CONFERENCES
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl">
              Discover top iGaming events and conferences with our iGaming
              events calendar. Stay updated on crucial dates, venues, and
              networking opportunities in the industry.
            </p>
            <button className="px-8 py-4 bg-[#CAFF54] text-black rounded-md hover:bg-[#01E46F]/90 font-bold text-lg transition-colors">
              SUBMIT YOUR EVENT
            </button>
          </div>
        </div>
      </section>

      {/* View Toggle Section */}
      <div className="bg-gray-50 py-6 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end">
            <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
              <button
                onClick={() => setViewMode("card")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  viewMode === "card"
                    ? "bg-[#01E46F] shadow-sm text-black"
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
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  viewMode === "calendar"
                    ? "bg-[#01E46F] shadow-sm text-black"
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
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto bg-gray-50">
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

      {/* Footer */}
      <footer className="mt-8 md:mt-20 py-8 md:py-16 bg-[#CAFF54]">
        <div className="container mx-auto px-6 md:px-12 lg:px-16">
          {/* First Row - Logo and Social Links */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-8 md:mb-12">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image
                src="/PayRam_longshadow_long_1.svg"
                alt="PayRam Logo"
                width={400}
                height={88}
                priority
                className="w-64 md:w-[400px] h-auto"
              />
            </div>

            {/* Social Links and Back to Top */}
            <div className="flex items-center gap-3 md:gap-4">
              <a
                href="https://www.linkedin.com/company/payram"
                className="flex items-center gap-2 text-gray-900 hover:text-black transition-colors text-sm md:text-base"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span>LinkedIn</span>
              </a>
              <a
                href="https://payram.short.gy/payram-faucet-x"
                className="flex items-center gap-2 text-gray-900 hover:text-black transition-colors text-sm md:text-base"
              >
                <Twitter className="w-4 h-4 md:w-5 md:h-5" />
                <span>Twitter</span>
              </a>
              <a
                href="mailto:dev@payram.com"
                className="flex items-center gap-2 text-gray-900 hover:text-black transition-colors text-sm md:text-base"
              >
                <Mail className="w-4 h-4 md:w-5 md:h-5" />
                <span>Email</span>
              </a>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="ml-2 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black hover:bg-gray-900 transition-colors flex items-center justify-center text-[#CAFF54]"
              >
                <ArrowUp className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>

          {/* Second Row - Copyright */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-900">
            <span className="whitespace-nowrap">© 2025 — Copyright</span>
            <span className="hidden md:inline">|</span>
            <div className="flex flex-wrap gap-2 md:gap-4">
              <a
                href="https://payram.com/privacy-policy"
                className="hover:text-black transition-colors whitespace-nowrap"
              >
                Privacy Policy
              </a>
              <a
                href="https://payram.com/terms-and-conditions"
                className="hover:text-black transition-colors whitespace-nowrap"
              >
                Terms & Conditions
              </a>
              <a
                href="https://payram.com/cookie-policy"
                className="hover:text-black transition-colors whitespace-nowrap"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
