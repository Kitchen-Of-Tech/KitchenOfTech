import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

/**
 * Submit meeting request to Supabase
 */
export async function submitMeetingRequest(data: {
  name: string;
  email: string;
  company?: string;
  message: string;
  preferred_date?: string;
}) {
  const { data: result, error } = await supabase
    .from("meeting_requests")
    .insert([
      {
        ...data,
        status: "pending",
        created_at: new Date().toISOString(),
      },
    ] as any)
    .select()
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Failed to submit meeting request");
  }

  return result;
}

/**
 * Submit contact form to Supabase
 */
export async function submitContactForm(data: {
  form_type: string;
  data: Record<string, unknown>;
}) {
  const { data: result, error } = await supabase
    .from("contact_submissions")
    .insert([
      {
        ...data,
        created_at: new Date().toISOString(),
      },
    ] as any)
    .select()
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Failed to submit contact form");
  }

  return result;
}

/**
 * Log analytics event to Supabase
 */
export async function logAnalyticsEvent(data: {
  event_type: string;
  page: string;
  metadata?: Record<string, unknown>;
}) {
  const { error } = await supabase.from("analytics_events").insert([
    {
      ...data,
      created_at: new Date().toISOString(),
    },
  ] as any);

  if (error) {
    console.error("Analytics error:", error);
  }
}
