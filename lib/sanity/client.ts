import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { Image as SanityImageSource } from "sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  useCdn: process.env.NODE_ENV === "production", // Use CDN in production for better caching
  token: process.env.SANITY_API_TOKEN,
  perspective: 'published', // Only fetch published content
  stega: {
    enabled: false, // Disable visual editing for better performance
  },
});

// Write client with authentication token for mutations
export const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  useCdn: false, // Don't use CDN for write operations
  token: process.env.SANITY_API_TOKEN,
  perspective: 'published',
});

const builder = createImageUrlBuilder(client);

/**
 * Generate image URL from Sanity image source
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/**
 * Fetch data from Sanity with error handling and caching
 * 
 * @param query - GROQ query string
 * @param params - Query parameters
 * @param tags - Cache tags for revalidation
 * @param revalidate - Cache duration in seconds (default: 1 hour)
 */
export async function sanityFetch<T = unknown>({
  query,
  params = {},
  tags = [],
  revalidate = 3600,
}: {
  query: string;
  params?: Record<string, unknown>;
  tags?: string[];
  revalidate?: number | false;
}): Promise<T> {
  try {
    return await client.fetch<T>(query, params, {
      next: {
        revalidate, // Configurable cache duration
        tags,
      },
    });
  } catch (error) {
    console.error("Sanity fetch error:", error);
    throw error;
  }
}
