-- Test Certificate Eligibility Function
-- This script tests the check_certificate_eligibility function

-- Test 1: Check if function exists
SELECT 
    proname as function_name,
    pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname = 'check_certificate_eligibility';

-- Test 2: Sample test with a fake enrollment ID (will return false for all if doesn't exist)
-- Replace 'test-uuid' with an actual enrollment_id from your database to test
SELECT * FROM check_certificate_eligibility('00000000-0000-0000-0000-000000000000');

-- Test 3: Check quiz_attempts structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'quiz_attempts'
ORDER BY ordinal_position;

-- Test 4: Check assignment_submissions structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'assignment_submissions'
ORDER BY ordinal_position;

-- Test 5: Check lesson_progress structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'lesson_progress'
ORDER BY ordinal_position;

-- Test 6: Get actual enrollments to test with
SELECT 
    e.id as enrollment_id,
    e.user_id,
    c.course_slug,
    e.overall_progress,
    e.certificate_issued
FROM enrollments e
LEFT JOIN profiles p ON e.user_id = p.id
LEFT JOIN LATERAL (
    SELECT course_id as course_slug FROM enrollments WHERE id = e.id LIMIT 1
) c ON true
LIMIT 5;

COMMENT ON SCRIPT IS 'Run this in Supabase SQL Editor to verify the certificate eligibility function is working correctly';
