export interface Database {
  public: {
    Tables: {
      meeting_requests: {
        Row: {
          id: string;
          name: string;
          email: string;
          company: string | null;
          message: string;
          preferred_date: string | null;
          status: "pending" | "confirmed" | "completed" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          company?: string | null;
          message: string;
          preferred_date?: string | null;
          status?: "pending" | "confirmed" | "completed" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          company?: string | null;
          message?: string;
          preferred_date?: string | null;
          status?: "pending" | "confirmed" | "completed" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
      };
      contact_submissions: {
        Row: {
          id: string;
          form_type: string;
          data: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          form_type: string;
          data: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          form_type?: string;
          data?: Record<string, unknown>;
          created_at?: string;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          event_type: string;
          page: string;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          page: string;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          page?: string;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
      };
    };
  };
}
