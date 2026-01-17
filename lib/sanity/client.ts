import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { Image as SanityImageSource } from "sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  useCdn: process.env.NODE_ENV === "production",
  token: process.env.SANITY_API_TOKEN,
});

const builder = imageUrlBuilder(client);

/**
 * Generate image URL from Sanity image source
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/**
 * Fetch data from Sanity with error handling
 */
export async function sanityFetch<T = any>({
  query,
  params = {},
  tags = [],
}: {
  query: string;
  params?: Record<string, any>;
  tags?: string[];
}): Promise<T> {
  try {
    return await client.fetch<T>(query, params, {
      next: {
        revalidate: 3600, // Revalidate every hour
        tags,
      },
    });
  } catch (error) {
    console.error("Sanity fetch error:", error);
    throw error;
  }
}
