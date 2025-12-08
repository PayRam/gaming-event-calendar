"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Lottie from "lottie-react";
import doneAnimation from "@/../../public/Done.json";

interface AddToCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; industry: string; email: string }) => void;
  eventName: string;
}

export default function AddToCalendarModal({
  isOpen,
  onClose,
  onSubmit,
  eventName,
}: AddToCalendarModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    email: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    industry: "",
    email: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: "",
      industry: "",
      email: "",
    };

    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    // Industry validation
    if (!formData.industry.trim()) {
      newErrors.industry = "Industry is required";
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

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit the form data
      await onSubmit(formData);

      // Show success screen
      setIsSubmitting(false);
      setShowSuccess(true);

      // Auto close after 3 seconds
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      industry: "",
      email: "",
    });
    setErrors({
      name: "",
      industry: "",
      email: "",
    });
    setIsSubmitting(false);
    setShowSuccess(false);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when user starts typing
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative">
        {/* Close button */}
        {!isSubmitting && !showSuccess && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Content */}
        <div className="p-8">
          {/* Loading State */}
          {isSubmitting && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#CAFF54] mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">
                  Processing your request...
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {showSuccess && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-64 h-64 mx-auto mb-4">
                  <Lottie animationData={doneAnimation} loop={false} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Added to Calendar!
                </h3>
                <p className="text-gray-600">
                  You'll receive the calendar invite shortly.
                </p>
              </div>
            </div>
          )}

          {/* Form Content */}
          {!isSubmitting && !showSuccess && (
            <>
              <h2 className="text-2xl font-bold text-black mb-2 pr-8">
                Add to Calendar
              </h2>
              <p className="text-gray-600 mb-6 text-sm">
                Please provide your details to add{" "}
                <span className="font-semibold">{eventName}</span> to your
                calendar
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#01E46F] focus:border-transparent outline-none transition-all ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Industry */}
                <div>
                  <label
                    htmlFor="industry"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#01E46F] focus:border-transparent outline-none transition-all ${
                      errors.industry ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your industry"
                  />
                  {errors.industry && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.industry}
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

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-[#CAFF54] text-black rounded-lg hover:bg-[#CAFF54]/90 font-bold text-base transition-colors"
                >
                  SUBMIT
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
