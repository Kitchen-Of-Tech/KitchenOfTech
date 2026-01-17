-- Kitchen of Tech - Supabase Database Schema

-- Create meeting_requests table
CREATE TABLE IF NOT EXISTS public.meeting_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    message TEXT NOT NULL,
    preferred_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_type TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    page TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meeting_requests_status ON public.meeting_requests(status);
CREATE INDEX IF NOT EXISTS idx_meeting_requests_created_at ON public.meeting_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_form_type ON public.contact_submissions(form_type);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page ON public.analytics_events(page);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.meeting_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public inserts (for forms)
CREATE POLICY "Allow public insert on meeting_requests" ON public.meeting_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on contact_submissions" ON public.contact_submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on analytics_events" ON public.analytics_events
    FOR INSERT WITH CHECK (true);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for meeting_requests
CREATE TRIGGER update_meeting_requests_updated_at
    BEFORE UPDATE ON public.meeting_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.meeting_requests IS 'Stores meeting requests from clients';
COMMENT ON TABLE public.contact_submissions IS 'Stores various contact form submissions';
COMMENT ON TABLE public.analytics_events IS 'Stores custom analytics events for tracking';
