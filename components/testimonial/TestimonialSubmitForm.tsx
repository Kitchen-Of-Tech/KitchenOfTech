"use client";

import { useState, useRef } from "react";
import { Star, Send, Loader2, CheckCircle, Upload, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface TestimonialSubmitFormProps {
  onSuccess?: () => void;
}

export default function TestimonialSubmitForm({ onSuccess }: TestimonialSubmitFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    position: "",
    message: "",
    rating: 5,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);

    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError('Please upload a JPG, PNG, or WEBP image');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setImageError('Image size must not exceed 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('company', formData.company);
      formDataToSend.append('position', formData.position);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('rating', formData.rating.toString());
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const response = await fetch("/api/testimonials/submit", {
        method: "POST",
        body: formDataToSend, // No Content-Type header - browser sets it automatically with boundary
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          company: "",
          position: "",
          message: "",
          rating: 5,
        });
        removeImage();
        if (onSuccess) onSuccess();
        
        // Reset success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.error || "Failed to submit testimonial");
      }
    } catch (err) {
      console.error("Error submitting testimonial:", err);
      setError("Failed to submit testimonial. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  return (
    <GlassCard className="p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Share Your Experience</h2>
        <p className="text-gray-400">
          Your feedback helps us improve and helps others make informed decisions.
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-3 text-green-400">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <div className="font-medium">Testimonial Submitted!</div>
              <div className="text-sm text-green-300 mt-1">
                Thank you! Your testimonial is pending review and will be published soon.
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
              Company
            </label>
            <input
              type="text"
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Company Name"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-300 mb-2">
              Position
            </label>
            <input
              type="text"
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="Job Title"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Photo (Optional)
          </label>
          <div className="space-y-3">
            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center cursor-pointer hover:border-cyan-500/50 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={loading}
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-300 mb-1">Click to upload your photo</p>
                <p className="text-xs text-gray-500">JPG, PNG, or WEBP (max 5MB)</p>
              </div>
            ) : (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-lg object-cover border-2 border-white/20"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={loading}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {imageError && (
              <p className="text-sm text-red-400">{imageError}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Rating <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                disabled={loading}
                className="p-1 transition-transform hover:scale-110 disabled:opacity-50"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= formData.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-600"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-gray-400 self-center">
              {formData.rating} / 5
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
            Your Testimonial <span className="text-red-400">*</span>
          </label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Share your experience with us..."
            required
            rows={6}
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 resize-none"
          />
          <p className="mt-2 text-xs text-gray-500">
            Minimum 50 characters. Be specific about your experience.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || formData.message.length < 50}
          className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Testimonial
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Your testimonial will be reviewed before being published on our website.
        </p>
      </form>
    </GlassCard>
  );
}
