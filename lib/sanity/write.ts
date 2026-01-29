/**
 * Sanity Write API Utilities
 * Handle testimonial creation, updates, and image uploads to Sanity CMS
 */

import { createClient, type SanityClient } from '@sanity/client';

// Create Sanity client with write permissions
const sanityWriteClient: SanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false, // Disable CDN for write operations
});

export interface TestimonialData {
  clientName: string;
  email: string;
  clientCompany?: string;
  position?: string;
  testimonial: string;
  rating: number;
  projectType?: string;
  status?: 'pending' | 'approved' | 'rejected';
  verifiedBadge?: boolean;
  featured?: boolean;
  linkToken?: string;
}

export interface TestimonialUpdate {
  status?: 'pending' | 'approved' | 'rejected';
  verifiedBadge?: boolean;
  featured?: boolean;
  approvedAt?: string;
  rejectedAt?: string;
}

/**
 * Upload an image to Sanity Assets
 * @param file - File object or Buffer
 * @param filename - Name of the file
 * @returns Asset reference
 */
export async function uploadImageToSanity(
  file: File | Buffer | Blob,
  filename?: string
): Promise<{ _type: 'image'; asset: { _type: 'reference'; _ref: string } }> {
  try {
    let buffer: Buffer;
    let contentType: string;

    // Handle different input types
    if (file instanceof File || file instanceof Blob) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      contentType = file.type || 'image/jpeg';
      filename = filename || (file instanceof File ? file.name : 'image.jpg');
    } else {
      buffer = file;
      contentType = 'image/jpeg';
      filename = filename || 'image.jpg';
    }

    // Upload to Sanity Assets
    const asset = await sanityWriteClient.assets.upload('image', buffer, {
      filename: filename,
      contentType: contentType,
    });

    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    };
  } catch (error) {
    console.error('Error uploading image to Sanity:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Create a new testimonial in Sanity
 * @param data - Testimonial data
 * @param clientImageFile - Optional client photo file
 * @returns Created testimonial document
 */
export async function createTestimonial(
  data: TestimonialData,
  clientImageFile?: File | Buffer | Blob
) {
  try {
    // Upload client image if provided
    let clientImage;
    if (clientImageFile) {
      clientImage = await uploadImageToSanity(clientImageFile, `client-${Date.now()}.jpg`);
    }

    // Create testimonial document
    const testimonial = await sanityWriteClient.create({
      _type: 'testimonial',
      clientName: data.clientName,
      email: data.email,
      clientCompany: data.clientCompany || null,
      position: data.position || null,
      testimonial: data.testimonial,
      rating: data.rating,
      projectType: data.projectType || null,
      status: data.status || 'pending',
      verifiedBadge: data.verifiedBadge || false,
      featured: data.featured || false,
      linkToken: data.linkToken || null,
      clientImage: clientImage || null,
      submittedAt: new Date().toISOString(),
    });

    return testimonial;
  } catch (error) {
    console.error('Error creating testimonial in Sanity:', error);
    throw new Error('Failed to create testimonial');
  }
}

/**
 * Update testimonial status (approve/reject)
 * @param testimonialId - Sanity document ID
 * @param updates - Fields to update
 * @returns Updated testimonial document
 */
export async function updateTestimonial(
  testimonialId: string,
  updates: TestimonialUpdate
) {
  try {
    // Add timestamp based on status
    if (updates.status === 'approved' && !updates.approvedAt) {
      updates.approvedAt = new Date().toISOString();
      updates.rejectedAt = undefined;
    } else if (updates.status === 'rejected' && !updates.rejectedAt) {
      updates.rejectedAt = new Date().toISOString();
      updates.approvedAt = undefined;
    }

    const testimonial = await sanityWriteClient
      .patch(testimonialId)
      .set(updates as any)
      .commit();

    return testimonial;
  } catch (error) {
    console.error('Error updating testimonial in Sanity:', error);
    throw new Error('Failed to update testimonial');
  }
}

/**
 * Delete a testimonial from Sanity
 * @param testimonialId - Sanity document ID
 */
export async function deleteTestimonial(testimonialId: string) {
  try {
    await sanityWriteClient.delete(testimonialId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting testimonial from Sanity:', error);
    throw new Error('Failed to delete testimonial');
  }
}

/**
 * Fetch testimonials from Sanity with filters
 * @param status - Filter by status (optional)
 * @param limit - Number of results (optional)
 * @returns Array of testimonials
 */
export async function fetchTestimonials(
  status?: 'pending' | 'approved' | 'rejected',
  limit?: number
) {
  try {
    let query = '*[_type == "testimonial"';
    
    if (status) {
      query += ` && status == "${status}"`;
    }
    
    query += '] | order(submittedAt desc)';
    
    if (limit) {
      query += ` [0...${limit}]`;
    }

    const testimonials = await sanityWriteClient.fetch(query);
    return testimonials;
  } catch (error) {
    console.error('Error fetching testimonials from Sanity:', error);
    throw new Error('Failed to fetch testimonials');
  }
}

/**
 * Fetch a single testimonial by ID
 * @param testimonialId - Sanity document ID
 * @returns Testimonial document
 */
export async function fetchTestimonialById(testimonialId: string) {
  try {
    const testimonial = await sanityWriteClient.fetch(
      `*[_type == "testimonial" && _id == $id][0]`,
      { id: testimonialId }
    );
    
    if (!testimonial) {
      throw new Error('Testimonial not found');
    }
    
    return testimonial;
  } catch (error) {
    console.error('Error fetching testimonial from Sanity:', error);
    throw new Error('Failed to fetch testimonial');
  }
}

/**
 * Get testimonial statistics
 * @returns Statistics object
 */
export async function getTestimonialStats() {
  try {
    const stats = await sanityWriteClient.fetch(`{
      "total": count(*[_type == "testimonial"]),
      "pending": count(*[_type == "testimonial" && status == "pending"]),
      "approved": count(*[_type == "testimonial" && status == "approved"]),
      "rejected": count(*[_type == "testimonial" && status == "rejected"]),
      "featured": count(*[_type == "testimonial" && featured == true]),
      "verified": count(*[_type == "testimonial" && verifiedBadge == true])
    }`);
    
    return stats;
  } catch (error) {
    console.error('Error fetching testimonial stats from Sanity:', error);
    throw new Error('Failed to fetch statistics');
  }
}

export default sanityWriteClient;
