'use client';

import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, ChevronDown } from 'lucide-react';

interface MeetingFormProps {
  preselectedService?: {
    slug: string;
    title: string;
  };
  onClose?: () => void;
  onSuccess?: () => void;
}

interface ServiceCategory {
  _id: string;
  title: string;
  slug: { current: string };
}

interface ServiceSubcategory {
  _id: string;
  title: string;
  slug: { current: string };
  category: {
    _id: string;
    title: string;
  };
}

interface Service {
  _id: string;
  title: string;
  slug: { current: string };
  category: {
    _id: string;
    title: string;
  };
  subcategory?: {
    _id: string;
    title: string;
  };
}

export default function MeetingForm({
  preselectedService,
  onClose,
  onSuccess,
}: MeetingFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    selectedCategory: '',
    selectedSubcategory: '',
    selectedService: '',
  });

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [subcategories, setSubcategories] = useState<ServiceSubcategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<ServiceSubcategory[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);

  // Fetch services data on mount
  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        const [categoriesRes, subcategoriesRes, servicesRes] = await Promise.all([
          fetch('/api/services/categories'),
          fetch('/api/services/subcategories'),
          fetch('/api/services'),
        ]);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }

        if (subcategoriesRes.ok) {
          const subcategoriesData = await subcategoriesRes.json();
          setSubcategories(subcategoriesData);
        }

        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setServices(servicesData);

          // If preselected service, auto-select it and its category/subcategory
          if (preselectedService) {
            const selectedService = servicesData.find(
              (s: Service) => s.slug.current === preselectedService.slug
            );

            if (selectedService) {
              setFormData(prev => ({
                ...prev,
                selectedCategory: selectedService.category._id,
                selectedSubcategory: selectedService.subcategory?._id || '',
                selectedService: selectedService._id,
              }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServicesData();
  }, [preselectedService]);

  // Filter subcategories based on selected category
  useEffect(() => {
    if (formData.selectedCategory) {
      const filtered = subcategories.filter(
        sub => sub.category._id === formData.selectedCategory
      );
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
      setFormData(prev => ({ ...prev, selectedSubcategory: '', selectedService: '' }));
    }
  }, [formData.selectedCategory, subcategories]);

  // Filter services based on selected category and subcategory
  useEffect(() => {
    let filtered = services.filter(
      service => service.category._id === formData.selectedCategory
    );

    if (formData.selectedSubcategory) {
      filtered = filtered.filter(
        service => service.subcategory?._id === formData.selectedSubcategory
      );
    }

    setFilteredServices(filtered);

    // Clear service selection if it's no longer in filtered list
    if (formData.selectedService) {
      const stillExists = filtered.some(s => s._id === formData.selectedService);
      if (!stillExists) {
        setFormData(prev => ({ ...prev, selectedService: '' }));
      }
    }
  }, [formData.selectedCategory, formData.selectedSubcategory, services, formData.selectedService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate name
    if (!formData.name.trim()) {
      setError('Full name is required');
      return;
    }

    // Validate at least one contact method
    if (!formData.email.trim() && !formData.whatsapp.trim()) {
      setError('Please provide at least one contact method (Email or WhatsApp)');
      return;
    }

    // Validate email format if provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setError('Please provide a valid email address');
        return;
      }
    }

    // Validate service selection
    if (!formData.selectedService) {
      setError('Please select a service');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedService = services.find(s => s._id === formData.selectedService);

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          phone: formData.whatsapp.trim() || undefined,
          service_slug: selectedService?.slug.current,
          service_title: selectedService?.title,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit meeting request');
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        whatsapp: '',
        selectedCategory: '',
        selectedSubcategory: '',
        selectedService: '',
      });

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="glass rounded-2xl p-8 border border-white/10 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
          <svg
            className="w-10 h-10 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">
          Request Sent Successfully!
        </h3>
        <p className="text-white/70 mb-6 leading-relaxed">
          Thank you for your interest. Our team will contact you shortly.
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/80 hover:to-blue-600/80 text-white font-medium rounded-lg transition-all shadow-lg shadow-primary/20"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-8 md:p-10 border border-white/10 relative max-w-2xl mx-auto">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Request a Meeting
        </h2>
        <p className="text-white/60">
          Fill in your details and select a service to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="flex items-center gap-2 text-white font-medium mb-2">
            <User className="w-4 h-4 text-primary" />
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="John Doe"
          />
        </div>

        {/* Email & WhatsApp Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="flex items-center gap-2 text-white font-medium mb-2">
              <Mail className="w-4 h-4 text-primary" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="john@example.com"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className="flex items-center gap-2 text-white font-medium mb-2">
              <Phone className="w-4 h-4 text-primary" />
              WhatsApp Number
            </label>
            <input
              type="tel"
              id="whatsapp"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>

        <p className="text-white/40 text-sm -mt-2">
          * At least one contact method is required
        </p>

        {/* Service Selection */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-white font-medium">
            <ChevronDown className="w-4 h-4 text-primary" />
            Select Service <span className="text-red-500">*</span>
          </label>

          {loadingServices ? (
            <div className="text-white/60 text-center py-4">Loading services...</div>
          ) : (
            <>
              {/* Category Dropdown */}
              <div>
                <label htmlFor="category" className="block text-white/70 text-sm mb-2">
                  1. Choose Category
                </label>
                <select
                  id="category"
                  value={formData.selectedCategory}
                  onChange={(e) => setFormData({
                    ...formData,
                    selectedCategory: e.target.value,
                    selectedSubcategory: '',
                    selectedService: ''
                  })}
                  required
                  disabled={!!preselectedService}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" className="bg-gray-900">Select a category...</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id} className="bg-gray-900">
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Dropdown */}
              {formData.selectedCategory && filteredSubcategories.length > 0 && (
                <div>
                  <label htmlFor="subcategory" className="block text-white/70 text-sm mb-2">
                    2. Choose Subcategory (Optional)
                  </label>
                  <select
                    id="subcategory"
                    value={formData.selectedSubcategory}
                    onChange={(e) => setFormData({
                      ...formData,
                      selectedSubcategory: e.target.value,
                      selectedService: ''
                    })}
                    disabled={!!preselectedService}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-gray-900">All subcategories</option>
                    {filteredSubcategories.map((sub) => (
                      <option key={sub._id} value={sub._id} className="bg-gray-900">
                        {sub.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Service Dropdown */}
              {formData.selectedCategory && filteredServices.length > 0 && (
                <div>
                  <label htmlFor="service" className="block text-white/70 text-sm mb-2">
                    {filteredSubcategories.length > 0 ? '3' : '2'}. Choose Service
                  </label>
                  <select
                    id="service"
                    value={formData.selectedService}
                    onChange={(e) => setFormData({ ...formData, selectedService: e.target.value })}
                    required
                    disabled={!!preselectedService}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-gray-900">Select a service...</option>
                    {filteredServices.map((service) => (
                      <option key={service._id} value={service._id} className="bg-gray-900">
                        {service.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {preselectedService && (
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
                  <p className="text-primary font-medium">
                    ✓ Service pre-selected: {preselectedService.title}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || loadingServices}
          className="w-full px-6 py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
