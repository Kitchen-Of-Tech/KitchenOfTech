-- Add service_name column to testimonials table for categorization
-- This allows CEO/Manager to categorize testimonials by service type when approving

ALTER TABLE public.testimonials
ADD COLUMN IF NOT EXISTS service_name TEXT;

-- Create index for better filtering by service
CREATE INDEX IF NOT EXISTS idx_testimonials_service_name ON public.testimonials(service_name);

-- Add comment
COMMENT ON COLUMN public.testimonials.service_name IS 'Service category assigned when testimonial is approved (e.g., Web Development, Mobile Development, UI/UX Design, etc.)';
