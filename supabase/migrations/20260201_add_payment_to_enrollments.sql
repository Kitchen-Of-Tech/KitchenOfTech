-- Add payment_transaction_id column to course_enrollments table
ALTER TABLE course_enrollments 
ADD COLUMN IF NOT EXISTS payment_transaction_id UUID REFERENCES payment_transactions(id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_payment ON course_enrollments(payment_transaction_id);

-- Comment for documentation
COMMENT ON COLUMN course_enrollments.payment_transaction_id IS 'Links enrollment to payment transaction for paid courses';
