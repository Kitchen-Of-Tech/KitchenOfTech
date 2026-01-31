-- Fix check_certificate_eligibility to properly check quiz and assignment requirements
-- Drop the existing function first since we're changing the return type
DROP FUNCTION IF EXISTS check_certificate_eligibility(UUID);

-- Create the new function with detailed return values
CREATE OR REPLACE FUNCTION check_certificate_eligibility(p_enrollment_id UUID)
RETURNS TABLE (
  eligible BOOLEAN,
  videos_completed BOOLEAN,
  quizzes_passed BOOLEAN,
  assignments_completed BOOLEAN
) AS $$
DECLARE
    v_videos_complete BOOLEAN := false;
    v_quizzes_passed BOOLEAN := true;
    v_assignments_complete BOOLEAN := true;
    v_total_quizzes INT;
    v_passed_quizzes INT;
    v_total_assignments INT;
    v_graded_assignments INT;
BEGIN
    -- Check if all videos/lessons are completed
    SELECT COALESCE(
        (SELECT COUNT(*) FROM lesson_progress WHERE enrollment_id = p_enrollment_id AND completed = true) > 0
        AND NOT EXISTS (
            SELECT 1 FROM lesson_progress 
            WHERE enrollment_id = p_enrollment_id AND completed = false
        ),
        false
    ) INTO v_videos_complete;
    
    -- Count total quizzes for this enrollment's course
    -- Note: This would ideally query the course structure from Sanity
    -- For now, we check if any quiz exists and if it's passed
    SELECT COUNT(DISTINCT quiz_id) INTO v_total_quizzes
    FROM quiz_attempts
    WHERE enrollment_id = p_enrollment_id;
    
    -- Count quizzes with passing score (>= 70%)
    SELECT COUNT(DISTINCT quiz_id) INTO v_passed_quizzes
    FROM (
        SELECT quiz_id, MAX(score) as best_score
        FROM quiz_attempts
        WHERE enrollment_id = p_enrollment_id
        GROUP BY quiz_id
        HAVING MAX(score) >= 70
    ) subquery;
    
    -- Check if all quizzes have been passed
    -- If no quizzes exist, consider it passed
    v_quizzes_passed := (v_total_quizzes = 0) OR (v_total_quizzes = v_passed_quizzes);
    
    -- Count total assignments for this enrollment
    SELECT COUNT(*) INTO v_total_assignments
    FROM assignment_submissions
    WHERE enrollment_id = p_enrollment_id;
    
    -- Count graded and approved assignments
    SELECT COUNT(*) INTO v_graded_assignments
    FROM assignment_submissions
    WHERE enrollment_id = p_enrollment_id 
    AND status = 'graded' 
    AND grade_percentage >= 70;
    
    -- Check if all assignments are graded and passed
    -- If no assignments exist, consider it complete
    v_assignments_complete := (v_total_assignments = 0) OR (v_total_assignments = v_graded_assignments);
    
    -- Return all status flags
    RETURN QUERY SELECT 
        (v_videos_complete AND v_quizzes_passed AND v_assignments_complete) as eligible,
        v_videos_complete as videos_completed,
        v_quizzes_passed as quizzes_passed,
        v_assignments_complete as assignments_completed;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_certificate_eligibility IS 'Enhanced certificate eligibility check with detailed status flags. Returns eligibility and completion status for videos, quizzes (70% pass), and assignments (70% grade).';
