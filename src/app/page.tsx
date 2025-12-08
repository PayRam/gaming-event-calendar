"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Twitter, Mail, ArrowUp, Menu, X } from "lucide-react";
import CalendarView from "@/components/CalendarView";
import CardView from "@/components/CardView";
import SubmitEventModal from "@/components/SubmitEventModal";
import eventsData from "@/../../public/data/events.json";
import BackgroundPaths from "@/components/BackgroundPaths";

type ViewMode = "calendar" | "card";

interface GameEvent {
  eventName: string;
  month: string;
  location: string;
  link: string;
  unprocessedDate: string;
  description: string;
  website: string;
  startDate: string;
  endDate: string;
}

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState<GameEvent[]>(eventsData.events);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Fetch events from API with fallback to local JSON
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/reviewed-events");
        if (response.ok) {
          const data = await response.json();
          if (data.events && Array.isArray(data.events)) {
            setEvents(data.events);
            console.log("Loaded events from API:", data.events.length);
          } else {
            console.warn("API returned invalid data, using fallback");
            setEvents(eventsData.events);
          }
        } else {
          console.warn("API request failed, using fallback events");
          setEvents(eventsData.events);
        }
      } catch (error) {
        console.error("Error fetching events, using fallback:", error);
        setEvents(eventsData.events);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  const faqs = [
    {
      question:
        "What are the biggest iGaming events in Asia and Europe for 2025?",
      answer:
        "The iGaming calendar for 2025 features major gambling conferences and sports betting conferences across Europe and Asia. They include ICE Barcelona, Europe's top gambling trade show, and SiGMA Asia, a major online gambling and casino conference. iGB Live! London focuses on affiliates and marketing, while SBC Summit Lisbon covers sports betting, payments, and branding. SiGMA Central Europe in Italy offers networking and trade opportunities, and G2E Asia @ the Philippines highlights casino technology and regional expansion. These events are essential for professionals in iGaming, sports betting, and online casinos.",
    },
    {
      question:
        "How often do major iGaming exhibitions take place in Latin America vs North America?",
      answer:
        "Latin America hosts multiple iGaming conferences and exhibitions yearly in Brazil, Argentina, Mexico, and Colombia, with events like SiGMA Americas and SBC Summit Latinoamérica focusing on sports betting, online gambling, and casinos. North America, including United States and Canada, features major annual events, including the Global Gaming Expo (G2E) in Las Vegas, attracting global operators from Eurasia and Africa. While Latin America sees a rising number of trade shows and seminars, North America dominates in scale, technology, and innovation.",
    },
    {
      question:
        "What are the top gaming conferences in emerging markets like Africa and South Asia?",
      answer:
        "In Africa and South Asia, several top gaming events in 2025 cater to the rapidly growing sports betting and online casino markets. The SBC Summit Africa is a major gambling conference focused on sports betting and online gambling trends across the African continent, including East Africa. Another key event in Africa is the Gaming Africa Summit, which covers technology, innovation, and casino developments. In South Asia, SiGMA Asia in the Philippines explores sports betting and digital transformation, bringing together key players from Eurasia, South Asia, and the broader Asian market. Meanwhile, Sri Lanka is an emerging hub for online casino and sports betting conferences, attracting industry leaders across the region.",
    },
    {
      question:
        "When is the next Global Gaming Expo and iGB Affiliate event in Barcelona and London?",
      answer:
        "The next Global Gaming Expo (G2E) will take place in Las Vegas, United States from October 6–9, 2025, focusing on casino, gambling, and sports betting topics. For iGB Affiliate events, the next iGB Affiliate is scheduled for January 20–21, 2026, in Barcelona, bringing together professionals in online gambling, marketing, and brand innovation.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

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
      <nav className="bg-[#CAFF54] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0 -ml-4">
              <Image
                src="/payram_horizontalBrightPink.svg"
                alt="B Gaming Logo"
                width={180}
                height={40}
                priority
                className="h-10 w-auto"
              />
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
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
            </div>

            {/* Desktop Submit Button */}
            <div className="hidden lg:block -mr-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-[#FF00FF] text-white rounded-md hover:bg-[#01E46F]/90 hover:text-black font-bold text-lg transition-colors"
              >
                SUBMIT YOUR EVENT
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden -mr-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-[#01E46F]/20 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-[#01E46F]/20 transition-colors">
                GAMES
              </button>
              <button className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-[#01E46F]/20 transition-colors">
                MARKETING
              </button>
              <button className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-[#01E46F]/20 transition-colors">
                PARTNERS
              </button>
              <button className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-[#01E46F]/20 transition-colors">
                BLOG
              </button>
              <button className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-[#01E46F]/20 transition-colors">
                ABOUT
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 mt-2 bg-[#FF00FF] text-white rounded-md hover:bg-[#01E46F] hover:text-black font-bold transition-colors"
              >
                SUBMIT YOUR EVENT
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-white py-12 md:py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <BackgroundPaths />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">
              iGAMING EVENTS &<br />
              CONFERENCES
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-6 md:mb-8 mx-auto max-w-3xl px-4">
              Discover top iGaming events and conferences with our iGaming
              events calendar. Stay updated on crucial dates, venues, and
              networking opportunities in the industry.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 md:px-8 py-3 md:py-4 bg-[#CAFF54] text-black rounded-md hover:bg-[#01E46F]/90 font-bold text-base md:text-lg transition-colors w-full sm:w-auto"
            >
              SUBMIT YOUR EVENT
            </button>
          </div>
        </div>
      </section>

      {/* View Toggle Section */}
      <div className="bg-gray-50 py-4 md:py-6 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center md:justify-end">
            <div className="flex gap-1 md:gap-2 bg-white p-1 rounded-lg border border-gray-200 w-full md:w-auto">
              <button
                onClick={() => setViewMode("card")}
                className={`flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-md transition-colors flex-1 md:flex-initial ${
                  viewMode === "card"
                    ? "bg-[#01E46F] shadow-sm text-black"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                aria-label="Card view"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
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
                <span className="font-medium text-sm md:text-base">Cards</span>
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-md transition-colors flex-1 md:flex-initial ${
                  viewMode === "calendar"
                    ? "bg-[#01E46F] shadow-sm text-black"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                aria-label="Calendar view"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
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
                <span className="font-medium text-sm md:text-base">
                  Calendar
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto bg-gray-50 px-4 sm:px-6 lg:px-8">
        {isLoadingEvents ? (
          <div className="flex items-center justify-center py-12 md:py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-[#01E46F] mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm md:text-base">
                Loading events...
              </p>
            </div>
          </div>
        ) : viewMode === "calendar" ? (
          <CalendarView
            events={events}
            currentDate={currentDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
        ) : (
          <CardView events={events} />
        )}
      </main>

      {/* FAQ & Newsletter Section */}
      <section className="bg-white py-12 md:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
            {/* FAQ - Left Side */}
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between py-5 text-left hover:text-gray-600 transition-colors"
                    >
                      <h3 className="text-lg md:text-xl font-bold text-gray-700 pr-6">
                        {faq.question}
                      </h3>
                      <svg
                        className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                          openFaqIndex === index ? "transform rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openFaqIndex === index ? "max-h-96 pb-5" : "max-h-0"
                      }`}
                    >
                      <p className="text-gray-600 text-base leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter - Right Side */}
            <div className="lg:pl-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8">
                Subscribe to our{" "}
                <span className="italic font-normal">Newsletter</span>
              </h2>
              <div className="rounded-2xl md:rounded-3xl shadow-lg border-2 border-gray-200 overflow-hidden">
                <iframe
                  src="https://payram.substack.com/embed"
                  width="480"
                  height="400"
                  style={{ border: "none", background: "transparent" }}
                  frameBorder="0"
                  scrolling="no"
                  className="w-full h-[320px] sm:h-[360px] md:h-[400px]"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-6 md:mt-1 lg:mt-2 py-6 md:py-8 lg:py-16 bg-[#CAFF54]">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
          {/* First Row - Logo and Social Links */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8 mb-6 md:mb-8 lg:mb-12">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image
                src="/PayRam_longshadow_long_1.svg"
                alt="PayRam Logo"
                width={400}
                height={88}
                priority
                className="w-48 sm:w-64 md:w-80 lg:w-[400px] h-auto"
              />
            </div>

            {/* Social Links and Back to Top */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
              <a
                href="https://www.linkedin.com/company/payram"
                className="flex items-center gap-1 sm:gap-2 text-gray-900 hover:text-black transition-colors text-xs sm:text-sm md:text-base"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span className="hidden sm:inline">LinkedIn</span>
              </a>
              <a
                href="https://payram.short.gy/payram-faucet-x"
                className="flex items-center gap-1 sm:gap-2 text-gray-900 hover:text-black transition-colors text-xs sm:text-sm md:text-base"
              >
                <Twitter className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Twitter</span>
              </a>
              <a
                href="mailto:dev@payram.com"
                className="flex items-center gap-1 sm:gap-2 text-gray-900 hover:text-black transition-colors text-xs sm:text-sm md:text-base"
              >
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Email</span>
              </a>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="ml-1 sm:ml-2 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-black hover:bg-gray-900 transition-colors flex items-center justify-center text-[#CAFF54]"
              >
                <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>

          {/* Second Row - Copyright */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-900">
            <span className="whitespace-nowrap">© 2025 — Copyright</span>
            <span className="hidden sm:inline">|</span>
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

      {/* Submit Event Modal */}
      <SubmitEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
