-- Improved check_certificate_eligibility function with clear, consistent logic
-- All certificates require: all videos completed, all quizzes 70%+, all assignments graded 70%+

DROP FUNCTION IF EXISTS check_certificate_eligibility(UUID);

CREATE OR REPLACE FUNCTION check_certificate_eligibility(p_enrollment_id UUID)
RETURNS TABLE (
  eligible BOOLEAN,
  videos_completed BOOLEAN,
  quizzes_passed BOOLEAN,
  assignments_completed BOOLEAN,
  message TEXT
) AS $$
DECLARE
    v_videos_complete BOOLEAN := false;
    v_quizzes_passed BOOLEAN := true;
    v_assignments_complete BOOLEAN := true;
    v_total_lessons INT;
    v_completed_lessons INT;
    v_total_quizzes INT;
    v_passed_quizzes INT;
    v_total_assignments INT;
    v_graded_assignments INT;
    v_message TEXT := '';
BEGIN
    -- Check if all videos/lessons are completed
    SELECT COUNT(*) INTO v_total_lessons
    FROM lesson_progress
    WHERE enrollment_id = p_enrollment_id;
    
    SELECT COUNT(*) INTO v_completed_lessons
    FROM lesson_progress
    WHERE enrollment_id = p_enrollment_id AND completed = true;
    
    v_videos_complete := (v_total_lessons > 0 AND v_completed_lessons = v_total_lessons);
    
    IF v_total_lessons = 0 THEN
        v_videos_complete := true; -- No lessons = pass
        v_message := v_message || 'No lessons required. ';
    ELSIF NOT v_videos_complete THEN
        v_message := v_message || format('Complete %s/%s lessons. ', v_completed_lessons, v_total_lessons);
    END IF;
    
    -- Count quizzes and check pass rate (70%+ score)
    SELECT COUNT(DISTINCT quiz_id) INTO v_total_quizzes
    FROM quiz_attempts
    WHERE enrollment_id = p_enrollment_id;
    
    SELECT COUNT(DISTINCT quiz_id) INTO v_passed_quizzes
    FROM (
        SELECT quiz_id, MAX(score) as best_score
        FROM quiz_attempts
        WHERE enrollment_id = p_enrollment_id
        GROUP BY quiz_id
        HAVING MAX(score) >= 70
    ) subquery;
    
    -- All quizzes must be passed (70%+) OR no quizzes required
    v_quizzes_passed := (v_total_quizzes = 0 OR v_total_quizzes = v_passed_quizzes);
    
    IF v_total_quizzes = 0 THEN
        v_message := v_message || 'No quizzes required. ';
    ELSIF NOT v_quizzes_passed THEN
        v_message := v_message || format('Pass %s/%s quizzes (70%+ each). ', v_passed_quizzes, v_total_quizzes);
    END IF;
    
    -- Count assignments and check grade (70%+)
    SELECT COUNT(*) INTO v_total_assignments
    FROM assignment_submissions
    WHERE enrollment_id = p_enrollment_id;
    
    SELECT COUNT(*) INTO v_graded_assignments
    FROM assignment_submissions
    WHERE enrollment_id = p_enrollment_id 
    AND status = 'graded' 
    AND COALESCE(grade_percentage, 0) >= 70;
    
    -- All assignments must be graded 70%+ OR no assignments required
    v_assignments_complete := (v_total_assignments = 0 OR v_total_assignments = v_graded_assignments);
    
    IF v_total_assignments = 0 THEN
        v_message := v_message || 'No assignments required.';
    ELSIF NOT v_assignments_complete THEN
        v_message := v_message || format('Complete %s/%s assignments (70%+ grade). ', v_graded_assignments, v_total_assignments);
    END IF;
    
    -- Return all status flags and final eligibility
    RETURN QUERY SELECT 
        (v_videos_complete AND v_quizzes_passed AND v_assignments_complete) as eligible,
        v_videos_complete as videos_completed,
        v_quizzes_passed as quizzes_passed,
        v_assignments_complete as assignments_completed,
        v_message as message;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_certificate_eligibility(UUID) IS 
'Check if a user is eligible for a certificate. Requirements:
- ALL lessons/videos completed (or no lessons)
- ALL quizzes passed at 70%+ (or no quizzes)
- ALL assignments graded at 70%+ (or no assignments)
Returns: eligible flag, individual requirement completion status, and human-readable message';
