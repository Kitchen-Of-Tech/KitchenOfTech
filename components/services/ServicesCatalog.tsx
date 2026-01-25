'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import type { Service, ServiceCategory, ServiceSubcategory } from '@/types';
import { ServiceCard } from './ServiceCard';
import { GlassCard } from '@/components/ui/GlassCard';

interface ServicesCatalogProps {
  services: Service[];
  categories: ServiceCategory[];
  subcategories: ServiceSubcategory[];
}

export function ServicesCatalog({ services, categories, subcategories }: ServicesCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  // Filter services based on search and category selection
  const filteredServices = services.filter((service) => {
    const matchesSearch = 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || service.category?._id === selectedCategory;
    const matchesSubcategory = !selectedSubcategory || service.subcategory?._id === selectedSubcategory;

    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  // Group services by category and subcategory
  const groupedServices = filteredServices.reduce((acc, service) => {
    const categoryId = service.category?._id || 'uncategorized';
    const subcategoryId = service.subcategory?._id || 'uncategorized';
    
    if (!acc[categoryId]) {
      acc[categoryId] = {};
    }
    if (!acc[categoryId][subcategoryId]) {
      acc[categoryId][subcategoryId] = [];
    }
    acc[categoryId][subcategoryId].push(service);
    
    return acc;
  }, {} as Record<string, Record<string, Service[]>>);

  // Get active subcategories for selected category
  const activeSubcategories = selectedCategory
    ? subcategories.filter((sub) => sub.category._id === selectedCategory)
    : [];

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      setSelectedCategory(categoryId);
      setSelectedSubcategory(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  return (
    <div className="space-y-12">
      {/* Search and Filters */}
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={clearFilters}
            className={`px-6 py-2 rounded-full transition-all ${
              !selectedCategory && !searchQuery
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            All Services
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryClick(category._id)}
              className={`px-6 py-2 rounded-full transition-all ${
                selectedCategory === category._id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
              style={{
                backgroundColor: selectedCategory === category._id && category.color?.hex
                  ? `${category.color.hex}40`
                  : undefined,
                borderColor: selectedCategory === category._id && category.color?.hex
                  ? category.color.hex
                  : undefined,
              }}
            >
              {category.title}
            </button>
          ))}
        </div>

        {/* Subcategory Pills (show when category is selected) */}
        <AnimatePresence>
          {selectedCategory && activeSubcategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 justify-center"
            >
              {activeSubcategories.map((subcategory) => (
                <button
                  key={subcategory._id}
                  onClick={() =>
                    setSelectedSubcategory(
                      selectedSubcategory === subcategory._id ? null : subcategory._id
                    )
                  }
                  className={`px-4 py-1.5 text-sm rounded-full transition-all ${
                    selectedSubcategory === subcategory._id
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {subcategory.title}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Display */}
        {(selectedCategory || searchQuery) && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-white/60 text-sm">Active filters:</span>
            {searchQuery && (
              <span className="px-3 py-1 bg-white/10 rounded-full text-white text-sm flex items-center gap-2">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery('')} className="hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="px-3 py-1 bg-white/10 rounded-full text-white text-sm flex items-center gap-2">
                {categories.find((c) => c._id === selectedCategory)?.title}
                <button onClick={() => setSelectedCategory(null)} className="hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-center">
        <p className="text-white/60">
          Showing <span className="text-white font-semibold">{filteredServices.length}</span>{' '}
          {filteredServices.length === 1 ? 'service' : 'services'}
        </p>
      </div>

      {/* Services Grid */}
      <div className="space-y-16">
        {Object.entries(groupedServices).length === 0 ? (
          <GlassCard className="p-12 text-center">
            <div className="space-y-4">
              <p className="text-white/60 text-lg">No services found matching your criteria</p>
              <button
                onClick={clearFilters}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Clear filters and show all services
              </button>
            </div>
          </GlassCard>
        ) : (
          Object.entries(groupedServices).map(([categoryId, subcategoryGroups]) => {
            const category = categories.find((c) => c._id === categoryId);

            return (
              <motion.div
                key={categoryId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Category Header */}
                {category && (
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-gradient">
                      {category.title}
                    </h2>
                    {category.description && (
                      <p className="text-white/60 max-w-2xl mx-auto">{category.description}</p>
                    )}
                  </div>
                )}

                {/* Subcategory Groups */}
                {Object.entries(subcategoryGroups).map(([subcategoryId, servicesInSub]) => {
                  const subcategory = subcategories.find((s) => s._id === subcategoryId);

                  return (
                    <div key={subcategoryId} className="space-y-6">
                      {/* Subcategory Header */}
                      {subcategory && subcategory._id !== 'uncategorized' && (
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                          <h3 className="text-xl font-semibold text-white/90">
                            {subcategory.title}
                          </h3>
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </div>
                      )}

                      {/* Services Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {servicesInSub.map((service, index) => (
                          <ServiceCard
                            key={service._id}
                            service={service}
                            index={index}
                            categoryColor={category?.color?.hex}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
