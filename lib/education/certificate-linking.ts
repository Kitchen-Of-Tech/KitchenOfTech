/**
 * Certificate Linking Helper
 * Bridges certificates to bootcamp registrations
 * 
 * This module provides utilities to match certificates with bootcamp registrations
 * using multiple matching strategies (email, name, enrollment_id, user_id)
 */

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { SupabaseClient } from "@supabase/supabase-js";

export interface Certificate {
  id: string;
  student_name: string;
  student_email?: string;
  course_name: string;
  issued_date: string;
  credential_code: string;
  user_id?: string;
  enrollment_id?: string;
}

export interface BootcampRegistration {
  id: string;
  name: string;
  email: string;
  user_id?: string;
  enrollment_id?: string;
  bootcamp_id?: string;
}

/**
 * Normalize names for comparison (remove extra spaces, lowercase, etc.)
 */
function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Try to find a certificate for a given registration
 * Uses multiple strategies in order:
 * 1. Email exact match
 * 2. User ID match
 * 3. Enrollment ID match
 * 4. Name similarity (ilike)
 */
export async function getCertificateForRegistration(
  supabase: SupabaseClient,
  registration: BootcampRegistration
): Promise<Certificate | null> {
  // Strategy 1: Match by email if available
  if (registration.email) {
    const { data } = await supabase
      .from("certificates")
      .select("*")
      .ilike("student_email", registration.email)
      .single();

    if (data) {
      console.log(`✅ Certificate matched by email: ${registration.email}`);
      return data;
    }
  }

  // Strategy 2: Match by user_id if available
  if (registration.user_id) {
    const { data } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", registration.user_id)
      .single();

    if (data) {
      console.log(
        `✅ Certificate matched by user_id: ${registration.user_id}`
      );
      return data;
    }
  }

  // Strategy 3: Match by enrollment_id if available
  if (registration.enrollment_id) {
    const { data } = await supabase
      .from("certificates")
      .select("*")
      .eq("enrollment_id", registration.enrollment_id)
      .single();

    if (data) {
      console.log(
        `✅ Certificate matched by enrollment_id: ${registration.enrollment_id}`
      );
      return data;
    }
  }

  // Strategy 4: Match by name (ilike) - less reliable but works as fallback
  const normalizedName = normalizeName(registration.name);
  const { data: allCerts } = await supabase
    .from("certificates")
    .select("*");

  if (allCerts) {
    const match = allCerts.find(
      (cert: Certificate) =>
        normalizeName(cert.student_name || "") === normalizedName ||
        (cert.student_name &&
          cert.student_name
            .toLowerCase()
            .includes(normalizedName.split(" ")[0]))
    );

    if (match) {
      console.log(
        `⚠️ Certificate matched by name (partial): ${registration.name}`
      );
      return match;
    }
  }

  // No match found
  console.log(
    `❌ No certificate found for: ${registration.name} (${registration.email})`
  );
  return null;
}

/**
 * Get all bootcamp registrations for a given bootcamp
 */
export async function getBootcampRegistrations(
  supabase: SupabaseClient,
  bootcampId?: string
) {
  let query = supabase.from("bootcamp_registrations").select("*");

  if (bootcampId) {
    query = query.eq("bootcamp_id", bootcampId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching bootcamp registrations:", error);
    return [];
  }

  return data as BootcampRegistration[];
}

/**
 * Link certificates to registrations and return pairs
 */
export async function linkCertificatesToRegistrations(
  supabase: SupabaseClient,
  bootcampId?: string
): Promise<
  Array<{ registration: BootcampRegistration; certificate: Certificate | null }>
> {
  const registrations = await getBootcampRegistrations(supabase, bootcampId);
  const pairs = [];

  for (const registration of registrations) {
    const certificate = await getCertificateForRegistration(
      supabase,
      registration
    );
    pairs.push({ registration, certificate });
  }

  return pairs;
}

/**
 * Server-side helper to get linked data
 */
export async function getLinkedCertificatesServer(bootcampId?: string) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Forbidden - admin access required");
  }

  return linkCertificatesToRegistrations(supabase, bootcampId);
}
