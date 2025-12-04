"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface SubmitEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmitEventModal({
  isOpen,
  onClose,
}: SubmitEventModalProps) {
  const [formData, setFormData] = useState({
    eventName: "",
    email: "",
    location: "",
    date: "",
    description: "",
    sideEvents: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    // Reset form and close modal
    setFormData({
      eventName: "",
      email: "",
      location: "",
      date: "",
      description: "",
      sideEvents: "",
    });
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[90vh] p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left side - Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Name */}
                <div>
                  <label
                    htmlFor="eventName"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Event Name
                  </label>
                  <input
                    type="text"
                    id="eventName"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01E46F] focus:border-transparent outline-none transition-all"
                    placeholder="Enter event name"
                  />
                </div>

                {/* Your Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01E46F] focus:border-transparent outline-none transition-all"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Where */}
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Where
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01E46F] focus:border-transparent outline-none transition-all"
                    placeholder="Event location"
                  />
                </div>

                {/* When */}
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    When
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01E46F] focus:border-transparent outline-none transition-all"
                    placeholder="dd-mm-yyyy"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01E46F] focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Tell us about your event"
                  />
                </div>

                {/* Side Events */}
                <div>
                  <label
                    htmlFor="sideEvents"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Does this event have any side events?
                  </label>
                  <textarea
                    id="sideEvents"
                    name="sideEvents"
                    value={formData.sideEvents}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01E46F] focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Describe any side events"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-[#CAFF54] text-black rounded-lg hover:bg-[#CAFF54]/90 font-bold text-base transition-colors"
                >
                  SUBMIT AN EVENT
                </button>
              </form>
            </div>

            {/* Right side - Info and Image */}
            <div className="flex flex-col">
              {/* Image */}
              <div className="mb-6 flex justify-center">
                <Image
                  src="/favicon.ico"
                  alt="iGaming Events"
                  width={200}
                  height={200}
                  className="w-48 h-auto"
                />
              </div>

              {/* Welcome Text */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome to our iGaming Events Calendar, your hub for industry
                  gatherings! Have an evendsfdt to share?
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Submit it here to ensure it's featured among the top iGaming
                  happenings. Let's unite the gaming community and make your
                  event a part of our dynamic calendar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
