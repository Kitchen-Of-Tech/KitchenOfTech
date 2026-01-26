import { z } from 'zod';

/**
 * Testimonial submission validation schema
 */
export const createTestimonialSchema = z.object({
  client_name: z
    .string()
    .min(2, 'Client name must be at least 2 characters')
    .max(100, 'Client name must not exceed 100 characters'),
  company: z
    .string()
    .max(100, 'Company name must not exceed 100 characters')
    .optional(),
  position: z
    .string()
    .max(100, 'Position must not exceed 100 characters')
    .optional(),
  content: z
    .string()
    .min(10, 'Testimonial must be at least 10 characters')
    .max(1000, 'Testimonial must not exceed 1000 characters'),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must not exceed 5'),
  project_name: z
    .string()
    .max(200, 'Project name must not exceed 200 characters')
    .optional(),
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .optional(),
  image_url: z
    .string()
    .url('Invalid image URL')
    .optional()
});

/**
 * Testimonial update validation schema
 */
export const updateTestimonialSchema = z.object({
  client_name: z
    .string()
    .min(2, 'Client name must be at least 2 characters')
    .max(100, 'Client name must not exceed 100 characters')
    .optional(),
  company: z
    .string()
    .max(100, 'Company name must not exceed 100 characters')
    .optional(),
  position: z
    .string()
    .max(100, 'Position must not exceed 100 characters')
    .optional(),
  content: z
    .string()
    .min(10, 'Testimonial must be at least 10 characters')
    .max(1000, 'Testimonial must not exceed 1000 characters')
    .optional(),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must not exceed 5')
    .optional(),
  status: z
    .enum(['pending', 'approved', 'rejected'])
    .optional(),
  featured: z.boolean().optional()
});

/**
 * Testimonial link generation validation schema
 */
export const createTestimonialLinkSchema = z.object({
  project_name: z
    .string()
    .min(2, 'Project name must be at least 2 characters')
    .max(200, 'Project name must not exceed 200 characters'),
  client_email: z
    .string()
    .email('Invalid email address')
    .toLowerCase(),
  client_name: z
    .string()
    .min(2, 'Client name must be at least 2 characters')
    .max(100, 'Client name must not exceed 100 characters'),
  expires_at: z
    .string()
    .datetime('Invalid date format')
    .optional()
});

// Export types
export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>;
export type CreateTestimonialLinkInput = z.infer<typeof createTestimonialLinkSchema>;
