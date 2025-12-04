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
    startDate: "",
    endDate: "",
    description: "",
    website: "",
  });

  const [errors, setErrors] = useState({
    eventName: "",
    email: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
    website: "",
    dateLogic: "",
  });

  // Validate date format (DD-MM-YYYY)
  const validateDateFormat = (dateStr: string): boolean => {
    const regex = /^\d{2}-\d{2}-\d{4}$/;
    if (!regex.test(dateStr)) return false;

    const [day, month, year] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };

  // Convert DD-MM-YYYY string to Date object
  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Get today's date at midnight for comparison
  const getTodayDate = (): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate URL format
  const validateURL = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors = {
      eventName: "",
      email: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      website: "",
      dateLogic: "",
    };

    let isValid = true;

    // Event Name validation
    if (!formData.eventName.trim()) {
      newErrors.eventName = "Event name is required";
      isValid = false;
    } else if (formData.eventName.trim().length < 3) {
      newErrors.eventName = "Event name must be at least 3 characters";
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
      isValid = false;
    }

    // Start Date validation
    if (!formData.startDate.trim()) {
      newErrors.startDate = "Start date is required";
      isValid = false;
    } else if (!validateDateFormat(formData.startDate)) {
      newErrors.startDate =
        "Date must be in DD-MM-YYYY format (e.g., 30-11-2025)";
      isValid = false;
    }

    // End Date validation
    if (!formData.endDate.trim()) {
      newErrors.endDate = "End date is required";
      isValid = false;
    } else if (!validateDateFormat(formData.endDate)) {
      newErrors.endDate =
        "Date must be in DD-MM-YYYY format (e.g., 30-11-2025)";
      isValid = false;
    }

    // Date logic validation (only if both dates are valid format)
    if (
      validateDateFormat(formData.startDate) &&
      validateDateFormat(formData.endDate)
    ) {
      const startDate = parseDate(formData.startDate);
      const endDate = parseDate(formData.endDate);
      const today = getTodayDate();

      if (startDate < today) {
        newErrors.dateLogic = "Start date must be today or in the future";
        isValid = false;
      } else if (endDate < today) {
        newErrors.dateLogic = "End date must be today or in the future";
        isValid = false;
      } else if (startDate > endDate) {
        newErrors.dateLogic = "Start date cannot be after end date";
        isValid = false;
      }
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
      isValid = false;
    }

    // Website validation
    if (!formData.website.trim()) {
      newErrors.website = "Website URL is required";
      isValid = false;
    } else if (!validateURL(formData.website)) {
      newErrors.website =
        "Please enter a valid URL (e.g., https://example.com)";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Get month name from date string (DD-MM-YYYY)
  const getMonthFromDate = (dateStr: string): string => {
    const [day, month, year] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", { month: "long" });
  };

  // Generate link from event name and timestamp
  const generateLink = (eventName: string): string => {
    const cleanName = eventName.replace(/\s+/g, "");
    const timestamp = Date.now();
    return `/${cleanName}${timestamp}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    if (!validateForm()) {
      return;
    }

    // Prepare submission data with derived fields
    const submissionData = {
      eventName: formData.eventName.trim(),
      email: formData.email.trim(),
      location: formData.location.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: formData.description.trim(),
      website: formData.website.trim(),
      month: getMonthFromDate(formData.startDate),
      link: generateLink(formData.eventName),
    };

    // Handle form submission
    console.log("Form submitted:", submissionData);

    // Reset form and close modal
    setFormData({
      eventName: "",
      email: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      website: "",
    });
    setErrors({
      eventName: "",
      email: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      website: "",
      dateLogic: "",
    });
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when user starts typing
    setErrors({
      ...errors,
      [name]: "",
      dateLogic: "", // Clear date logic error when any date field changes
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
                    Event Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="eventName"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#01E46F] focus:border-transparent outline-none transition-all ${
                      errors.eventName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter event name"
                  />
                  {errors.eventName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.eventName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Email ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#01E46F] focus:border-transparent outline-none transition-all ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#01E46F] focus:border-transparent outline-none transition-all ${
                      errors.location ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Event location"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Event Start Date */}
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Event Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#01E46F] focus:border-transparent outline-none transition-all ${
                      errors.startDate ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="DD-MM-YYYY (e.g., 30-11-2025)"
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.startDate}
                    </p>
                  )}
                </div>

                {/* Event End Date */}
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Event End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#01E46F] focus:border-transparent outline-none transition-all ${
                      errors.endDate ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="DD-MM-YYYY (e.g., 30-11-2025)"
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.endDate}
                    </p>
                  )}
                </div>

                {/* Date Logic Error Message */}
                {errors.dateLogic && (
                  <div className="text-red-600 text-sm font-medium p-3 bg-red-50 rounded-lg">
                    {errors.dateLogic}
                  </div>
                )}

                {/* Event Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Event Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#01E46F] focus:border-transparent outline-none transition-all resize-none ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Tell us about your event"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Event Website */}
                <div>
                  <label
                    htmlFor="website"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Event Website <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#01E46F] focus:border-transparent outline-none transition-all ${
                      errors.website ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="https://example.com"
                  />
                  {errors.website && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.website}
                    </p>
                  )}
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
                  src="/vector-asset-2.png"
                  alt="iGaming Events"
                  width={300}
                  height={300}
                  className="w-full max-w-xs h-auto object-contain mt-10"
                />
              </div>

              {/* Welcome Text */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome to our iGaming Events Calendar, your hub for industry
                  gatherings! Have an event to share?
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
