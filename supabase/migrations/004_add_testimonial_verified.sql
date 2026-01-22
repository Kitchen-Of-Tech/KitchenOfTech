-- Add is_verified column to testimonials table
-- This allows marking testimonials as verified/featured

ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Create index for verified testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_verified ON public.testimonials(is_verified);

-- Update RLS policy to allow reading verified testimonials publicly
DROP POLICY IF EXISTS "Anyone can read approved testimonials" ON public.testimonials;

CREATE POLICY "Anyone can read approved testimonials"
  ON public.testimonials FOR SELECT
  USING (status = 'approved');
