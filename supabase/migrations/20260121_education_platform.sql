-- =====================================================
-- KITCHEN OF TECH - EDUCATION PLATFORM DATABASE SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. INSTRUCTORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS instructors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    bio TEXT,
    expertise TEXT[],
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_students INTEGER DEFAULT 0,
    total_courses INTEGER DEFAULT 0,
    social_links JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. COUPONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
    discount_value DECIMAL(10,2) NOT NULL,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    applicable_courses UUID[], -- NULL means all courses
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_discount_type CHECK (discount_type IN ('percentage', 'fixed')),
    CONSTRAINT check_discount_value CHECK (discount_value >= 0)
);

-- =====================================================
-- 3. COURSE ENROLLMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id VARCHAR(255) NOT NULL, -- Sanity course ID
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    progress DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active',
    payment_amount DECIMAL(10,2) DEFAULT 0.00,
    coupon_used VARCHAR(50),
    last_accessed_lesson VARCHAR(255),
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_id VARCHAR(100),
    CONSTRAINT check_progress CHECK (progress >= 0 AND progress <= 100),
    CONSTRAINT check_status CHECK (status IN ('active', 'completed', 'expired', 'suspended')),
    UNIQUE(user_id, course_id)
);

-- =====================================================
-- 4. LESSON PROGRESS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE,
    lesson_id VARCHAR(255) NOT NULL, -- Sanity lesson ID
    completed BOOLEAN DEFAULT FALSE,
    time_spent INTEGER DEFAULT 0, -- in seconds
    video_progress DECIMAL(5,2) DEFAULT 0.00, -- percentage watched
    completed_at TIMESTAMPTZ,
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    CONSTRAINT check_video_progress CHECK (video_progress >= 0 AND video_progress <= 100),
    UNIQUE(enrollment_id, lesson_id)
);

-- =====================================================
-- 5. QUIZ ATTEMPTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE,
    quiz_id VARCHAR(255) NOT NULL, -- Sanity quiz ID
    attempt_number INTEGER DEFAULT 1,
    answers JSONB NOT NULL, -- Store user's answers
    score DECIMAL(5,2) NOT NULL,
    passed BOOLEAN DEFAULT FALSE,
    time_taken INTEGER, -- in seconds
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_score CHECK (score >= 0 AND score <= 100)
);

-- =====================================================
-- 6. ASSIGNMENT SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE,
    assignment_id VARCHAR(255) NOT NULL, -- Sanity assignment ID
    facebook_post_url TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'submitted',
    grade DECIMAL(5,2),
    feedback TEXT,
    graded_at TIMESTAMPTZ,
    graded_by UUID REFERENCES auth.users(id),
    CONSTRAINT check_status CHECK (status IN ('submitted', 'graded', 'resubmit')),
    CONSTRAINT check_grade CHECK (grade IS NULL OR (grade >= 0 AND grade <= 100)),
    UNIQUE(enrollment_id, assignment_id)
);

-- =====================================================
-- 7. COURSE REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS course_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE,
    course_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    review TEXT,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_rating CHECK (rating >= 1 AND rating <= 5),
    UNIQUE(user_id, course_id)
);

-- =====================================================
-- 8. COURSE DISCUSSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS course_discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id VARCHAR(255) NOT NULL,
    lesson_id VARCHAR(255), -- NULL for course-level discussions
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES course_discussions(id) ON DELETE CASCADE, -- For replies
    question TEXT NOT NULL,
    answer TEXT,
    upvotes INTEGER DEFAULT 0,
    is_instructor_answer BOOLEAN DEFAULT FALSE,
    is_best_answer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. CERTIFICATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_id VARCHAR(100) UNIQUE NOT NULL,
    enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id VARCHAR(255) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    instructor_name VARCHAR(255) NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    final_score DECIMAL(5,2),
    skills TEXT[],
    certificate_url TEXT, -- PDF URL
    CONSTRAINT check_final_score CHECK (final_score >= 0 AND final_score <= 100)
);

-- =====================================================
-- 10. COURSE ANALYTICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS course_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    enrollments INTEGER DEFAULT 0,
    completions INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    avg_rating DECIMAL(3,2),
    total_reviews INTEGER DEFAULT 0,
    UNIQUE(course_id, date)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_enrollments_status ON course_enrollments(status);
CREATE INDEX idx_lesson_progress_enrollment ON lesson_progress(enrollment_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX idx_quiz_attempts_enrollment ON quiz_attempts(enrollment_id);
CREATE INDEX idx_assignments_enrollment ON assignment_submissions(enrollment_id);
CREATE INDEX idx_assignments_status ON assignment_submissions(status);
CREATE INDEX idx_reviews_course ON course_reviews(course_id);
CREATE INDEX idx_reviews_user ON course_reviews(user_id);
CREATE INDEX idx_discussions_course ON course_discussions(course_id);
CREATE INDEX idx_discussions_lesson ON course_discussions(lesson_id);
CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_certificate_id ON certificates(certificate_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_instructors_user ON instructors(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_analytics ENABLE ROW LEVEL SECURITY;

-- Instructors: Public read, authenticated users can read, only instructor can update their own
CREATE POLICY "Instructors are viewable by everyone" ON instructors FOR SELECT USING (true);
CREATE POLICY "Instructors can update own profile" ON instructors FOR UPDATE USING (auth.uid() = user_id);

-- Coupons: Only authenticated users can read active coupons
CREATE POLICY "Active coupons are viewable by authenticated users" ON coupons FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
CREATE POLICY "Admins can manage coupons" ON coupons FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
);

-- Course Enrollments: Users can see their own enrollments
CREATE POLICY "Users can view own enrollments" ON course_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own enrollments" ON course_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own enrollments" ON course_enrollments FOR UPDATE USING (auth.uid() = user_id);

-- Lesson Progress: Users can see and update their own progress
CREATE POLICY "Users can view own lesson progress" ON lesson_progress FOR SELECT USING (
    EXISTS (SELECT 1 FROM course_enrollments WHERE course_enrollments.id = lesson_progress.enrollment_id AND course_enrollments.user_id = auth.uid())
);
CREATE POLICY "Users can create own lesson progress" ON lesson_progress FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM course_enrollments WHERE course_enrollments.id = lesson_progress.enrollment_id AND course_enrollments.user_id = auth.uid())
);
CREATE POLICY "Users can update own lesson progress" ON lesson_progress FOR UPDATE USING (
    EXISTS (SELECT 1 FROM course_enrollments WHERE course_enrollments.id = lesson_progress.enrollment_id AND course_enrollments.user_id = auth.uid())
);

-- Quiz Attempts: Users can see and create their own attempts
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts FOR SELECT USING (
    EXISTS (SELECT 1 FROM course_enrollments WHERE course_enrollments.id = quiz_attempts.enrollment_id AND course_enrollments.user_id = auth.uid())
);
CREATE POLICY "Users can create own quiz attempts" ON quiz_attempts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM course_enrollments WHERE course_enrollments.id = quiz_attempts.enrollment_id AND course_enrollments.user_id = auth.uid())
);

-- Assignment Submissions: Users can see and create their own submissions
CREATE POLICY "Users can view own submissions" ON assignment_submissions FOR SELECT USING (
    EXISTS (SELECT 1 FROM course_enrollments WHERE course_enrollments.id = assignment_submissions.enrollment_id AND course_enrollments.user_id = auth.uid())
);
CREATE POLICY "Users can create own submissions" ON assignment_submissions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM course_enrollments WHERE course_enrollments.id = assignment_submissions.enrollment_id AND course_enrollments.user_id = auth.uid())
);

-- Course Reviews: Users can see all reviews, create/update own
CREATE POLICY "Reviews are viewable by everyone" ON course_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create own reviews" ON course_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON course_reviews FOR UPDATE USING (auth.uid() = user_id);

-- Discussions: Everyone can read, authenticated users can post
CREATE POLICY "Discussions are viewable by everyone" ON course_discussions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post discussions" ON course_discussions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own discussions" ON course_discussions FOR UPDATE USING (auth.uid() = user_id);

-- Certificates: Public read for verification, users can see own
CREATE POLICY "Certificates are publicly viewable" ON certificates FOR SELECT USING (true);

-- Analytics: Only admins and instructors can view
CREATE POLICY "Admins and instructors can view analytics" ON course_analytics FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (
            auth.users.raw_user_meta_data->>'role' = 'admin' 
            OR EXISTS (SELECT 1 FROM instructors WHERE instructors.user_id = auth.uid())
        )
    )
);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update enrollment progress
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE course_enrollments
    SET 
        progress = (
            SELECT COALESCE(AVG(CASE WHEN completed THEN 100 ELSE 0 END), 0)
            FROM lesson_progress
            WHERE enrollment_id = NEW.enrollment_id
        ),
        updated_at = NOW()
    WHERE id = NEW.enrollment_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_enrollment_progress
AFTER INSERT OR UPDATE ON lesson_progress
FOR EACH ROW
EXECUTE FUNCTION update_enrollment_progress();

-- Function to update instructor stats
CREATE OR REPLACE FUNCTION update_instructor_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- This will be called when courses are created/deleted in application logic
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check certificate eligibility
CREATE OR REPLACE FUNCTION check_certificate_eligibility(p_enrollment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_video_complete BOOLEAN;
    v_quiz_passed BOOLEAN;
    v_assignments_complete BOOLEAN;
BEGIN
    -- Check if all videos are completed
    SELECT COALESCE(BOOL_AND(completed), false) INTO v_video_complete
    FROM lesson_progress
    WHERE enrollment_id = p_enrollment_id;
    
    -- Check if all quizzes have at least one passing attempt (>=80%)
    SELECT COALESCE(BOOL_AND(passed), false) INTO v_quiz_passed
    FROM (
        SELECT quiz_id, MAX(score) >= 80 as passed
        FROM quiz_attempts
        WHERE enrollment_id = p_enrollment_id
        GROUP BY quiz_id
    ) subquery;
    
    -- Check if all assignments are submitted
    SELECT COALESCE(COUNT(*) > 0, false) INTO v_assignments_complete
    FROM assignment_submissions
    WHERE enrollment_id = p_enrollment_id AND status = 'submitted';
    
    RETURN v_video_complete AND v_quiz_passed AND v_assignments_complete;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA FOR TESTING (Optional - Remove in production)
-- =====================================================

-- Insert sample coupon for free courses
INSERT INTO coupons (code, discount_type, discount_value, max_uses, valid_until, is_active)
VALUES ('FREE100', 'percentage', 100, NULL, '2027-12-31', true)
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE instructors IS 'Stores instructor profiles and statistics';
COMMENT ON TABLE coupons IS 'Manages discount coupons for courses';
COMMENT ON TABLE course_enrollments IS 'Tracks student enrollments and overall progress';
COMMENT ON TABLE lesson_progress IS 'Tracks individual lesson completion and time spent';
COMMENT ON TABLE quiz_attempts IS 'Records all quiz attempts with scores and answers';
COMMENT ON TABLE assignment_submissions IS 'Stores assignment submissions with Facebook post links';
COMMENT ON TABLE course_reviews IS 'User reviews and ratings for courses';
COMMENT ON TABLE course_discussions IS 'Q&A discussions for courses and lessons';
COMMENT ON TABLE certificates IS 'Generated certificates for course completions';
COMMENT ON TABLE course_analytics IS 'Daily analytics data for courses';
