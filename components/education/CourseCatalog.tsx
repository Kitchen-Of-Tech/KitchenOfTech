"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, Filter, Star, Clock, BookOpen, Users, 
  TrendingUp, Award, Play, CheckCircle 
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { Course } from "@/types/education";

interface CourseCatalogProps {
  courses: Course[];
}

const categories = [
  "All",
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Data Science",
  "Machine Learning",
  "Digital Marketing",
  "Business",
  "Cloud Computing",
  "Cybersecurity",
];

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];

const priceFilters = ["All", "Free", "Paid"];

export default function CourseCatalog({ courses }: CourseCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [sortBy, setSortBy] = useState<"popular" | "rating" | "newest">("popular");
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter((course) => {
      // Search filter
      const matchesSearch = 
        searchQuery === "" ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = 
        selectedCategory === "All" ||
        course.category === selectedCategory.toLowerCase().replace(" ", "-");

      // Level filter
      const matchesLevel = 
        selectedLevel === "All Levels" ||
        course.level === selectedLevel.toLowerCase();

      // Price filter
      const matchesPrice = 
        selectedPrice === "All" ||
        (selectedPrice === "Free" && course.isFree) ||
        (selectedPrice === "Paid" && !course.isFree);

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
    });

    // Sort
    if (sortBy === "popular") {
      filtered.sort((a, b) => (b.totalEnrollments || 0) - (a.totalEnrollments || 0));
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => 
        new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
      );
    }

    return filtered;
  }, [courses, searchQuery, selectedCategory, selectedLevel, selectedPrice, sortBy]);

  const featuredCourses = courses.filter((course) => course.featured).slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="container-custom relative z-10">
          <ScrollReveal animation="fade-up">
            <div className="text-center max-w-4xl mx-auto mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="text-white">Learn </span>
                <span className="text-gradient">Skills</span>
                <span className="text-white"> That Matter</span>
              </h1>
              <p className="text-xl text-white/70 mb-8">
                Master in-demand skills with expert-led courses. Build projects, earn certificates, and advance your career.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    placeholder="Search for courses, skills, or instructors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-primary/50 backdrop-blur-xl"
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Quick Stats */}
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <GlassCard className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{courses.length}</div>
                <div className="text-sm text-white/70">Courses Available</div>
              </GlassCard>
              <GlassCard className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {courses.reduce((sum, c) => sum + (c.totalEnrollments || 0), 0)}+
                </div>
                <div className="text-sm text-white/70">Students Enrolled</div>
              </GlassCard>
              <GlassCard className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {courses.filter(c => c.isFree).length}
                </div>
                <div className="text-sm text-white/70">Free Courses</div>
              </GlassCard>
              <GlassCard className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {new Set(courses.map(c => c.category)).size}
                </div>
                <div className="text-sm text-white/70">Categories</div>
              </GlassCard>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="py-16 container-custom">
          <ScrollReveal animation="fade-up">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">
                <TrendingUp className="w-8 h-8 text-primary inline-block mr-3" />
                Featured Courses
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredCourses.map((course, index) => (
              <ScrollReveal key={course._id} animation="fade-up" delay={index * 100}>
                <CourseCard course={course} featured />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* Filters and Course Grid */}
      <section className="py-16 container-custom">
        {/* Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>

            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <GlassCard className="p-6 mb-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">Category</label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category
                            ? "bg-primary text-white"
                            : "bg-white/5 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">Level</label>
                  <div className="space-y-2">
                    {levels.map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedLevel === level
                            ? "bg-primary text-white"
                            : "bg-white/5 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">Price</label>
                  <div className="space-y-2">
                    {priceFilters.map((price) => (
                      <button
                        key={price}
                        onClick={() => setSelectedPrice(price)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedPrice === price
                            ? "bg-primary text-white"
                            : "bg-white/5 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {price}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <ScrollReveal key={course._id} animation="fade-up" delay={(index % 6) * 50}>
                <CourseCard course={course} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <GlassCard className="p-12 text-center">
            <div className="text-white/50 mb-4">
              <BookOpen className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No courses found</h3>
              <p>Try adjusting your filters or search query</p>
            </div>
          </GlassCard>
        )}
      </section>
    </div>
  );
}

// Course Card Component
function CourseCard({ course, featured = false }: { course: Course; featured?: boolean }) {
  const displayPrice = course.isFree ? "FREE" : `$${course.price}`;
  const hasDiscount = course.compareAtPrice && course.compareAtPrice > course.price;

  return (
    <Link href={`/education/${course.slug.current}`}>
      <GlassCard className={`group overflow-hidden hover:scale-105 transition-all duration-300 ${featured ? "border-primary/50" : ""}`}>
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={course.thumbnail.asset.url}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {course.isFree && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
              FREE
            </div>
          )}
          {featured && (
            <div className="absolute top-3 right-3 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
              FEATURED
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Category & Level */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
              {course.category.replace("-", " ").toUpperCase()}
            </span>
            <span className="text-xs px-2 py-1 bg-white/10 text-white/70 rounded">
              {course.level.toUpperCase()}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          {/* Instructor */}
          <div className="flex items-center gap-2 mb-4">
            {course.instructor.profileImage && (
              <Image
                src={course.instructor.profileImage}
                alt={course.instructor.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
            <span className="text-sm text-white/70">{course.instructor.name}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm text-white/60">
            {course.averageRating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{course.averageRating.toFixed(1)}</span>
                <span>({course.totalReviews})</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.totalEnrollments || 0}</span>
            </div>
            {course.totalDuration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{course.totalDuration}h</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              {hasDiscount && (
                <span className="text-sm text-white/50 line-through mr-2">
                  ${course.compareAtPrice}
                </span>
              )}
              <span className={`text-xl font-bold ${course.isFree ? "text-green-400" : "text-primary"}`}>
                {displayPrice}
              </span>
            </div>
            {course.totalLessons && (
              <div className="flex items-center gap-1 text-sm text-white/60">
                <BookOpen className="w-4 h-4" />
                <span>{course.totalLessons} lessons</span>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
