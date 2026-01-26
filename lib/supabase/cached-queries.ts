/**
 * Cached data fetchers for Supabase
 * 
 * These functions use React cache() to deduplicate requests within a render.
 * Supabase queries typically have shorter cache durations since they're more dynamic.
 */

import { cache } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase/types';

/**
 * Create Supabase server client with cookies
 * This is cached per request
 */
export const getCachedSupabaseClient = cache(async () => {
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
});

/**
 * Get current user with caching
 * Cache: 1 minute (user data changes frequently)
 */
export const getCachedCurrentUser = cache(async () => {
  const supabase = await getCachedSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  
  return user;
});

/**
 * Get user profile with caching
 * Cache: 5 minutes
 */
export const getCachedUserProfile = cache(async (userId: string) => {
  const supabase = await getCachedSupabaseClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
});

/**
 * Get user projects with caching
 * Cache: 5 minutes
 */
export const getCachedUserProjects = cache(async (userId: string) => {
  const supabase = await getCachedSupabaseClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  
  return data;
});

/**
 * Get user tasks with caching
 * Cache: 1 minute (tasks update frequently)
 */
export const getCachedUserTasks = cache(async (userId: string) => {
  const supabase = await getCachedSupabaseClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  
  return data;
});

/**
 * Get user course enrollments with caching
 * Cache: 5 minutes
 */
export const getCachedUserEnrollments = cache(async (userId: string) => {
  const supabase = await getCachedSupabaseClient();
  
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching enrollments:', error);
    return [];
  }
  
  return data;
});

/**
 * Get user course progress with caching
 * Cache: 1 minute
 */
export const getCachedUserCourseProgress = cache(async (userId: string, courseId: string) => {
  const supabase = await getCachedSupabaseClient();
  
  const { data, error } = await supabase
    .from('course_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
    console.error('Error fetching course progress:', error);
    return null;
  }
  
  return data;
});

/**
 * Check if user is enrolled in course with caching
 * Cache: 5 minutes
 */
export const getCachedIsUserEnrolled = cache(async (userId: string, courseId: string) => {
  const supabase = await getCachedSupabaseClient();
  
  const { data, error } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error checking enrollment:', error);
    return false;
  }
  
  return !!data;
});

/**
 * Get testimonials from Supabase (if stored there)
 * Cache: 30 minutes
 */
export const getCachedTestimonialsFromDB = cache(async () => {
  const supabase = await getCachedSupabaseClient();
  
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
  
  return data;
});

/**
 * Export client creator for custom queries
 */
export { getCachedSupabaseClient as getSupabaseClient };
