-- ============================================================
-- STUDENT MANAGEMENT SYSTEM - SUPABASE DATABASE
-- ============================================================

-- 1. Remove old tables (clean slate)
DROP TABLE IF EXISTS academic_records CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS students CASCADE;


-- ============================================================
-- 2. STUDENTS TABLE
-- ============================================================

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(50) NOT NULL,
    semester INT NOT NULL DEFAULT 1,
    email VARCHAR(255) UNIQUE NOT NULL,
    gpa NUMERIC(3,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 3. ATTENDANCE TABLE
-- ============================================================

CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL
        CHECK (status IN ('Present', 'Absent')),
    subject VARCHAR(100) NOT NULL DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT NOW(),

    FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE
);


-- ============================================================
-- 4. ACADEMIC RECORDS TABLE
-- ============================================================

CREATE TABLE academic_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    subject VARCHAR(100) NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    marks NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    grade VARCHAR(5) NOT NULL DEFAULT 'B',
    created_at TIMESTAMPTZ DEFAULT NOW(),

    FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE
);


-- ============================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_records ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 6. PUBLIC ACCESS POLICIES (Full hackathon testing access)
-- ============================================================

CREATE POLICY "Public full access on students"
ON students
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Public full access on attendance"
ON attendance
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Public full access on academic_records"
ON academic_records
FOR ALL
USING (true)
WITH CHECK (true);


-- ============================================================
-- 7. SAMPLE STUDENTS SEED DATA
-- ============================================================

INSERT INTO students
(id, roll_no, name, department, semester, email, gpa)
VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    'CS2024-001',
    'Aarav Sharma',
    'CSE',
    6,
    'aarav.sharma@institution.edu',
    3.85
),
(
    'a2222222-2222-2222-2222-222222222222',
    'IT2024-042',
    'Priya Patel',
    'IT',
    4,
    'priya.patel@institution.edu',
    3.92
),
(
    'a3333333-3333-3333-3333-333333333333',
    'EC2024-015',
    'Rohan Verma',
    'ECE',
    6,
    'rohan.verma@institution.edu',
    2.65
),
(
    'a4444444-4444-4444-4444-444444444444',
    'CS2024-089',
    'Sneha Kulkarni',
    'CSE',
    4,
    'sneha.k@institution.edu',
    3.70
),
(
    'a5555555-5555-5555-5555-555555555555',
    'IT2024-073',
    'Vikramaditya Nair',
    'IT',
    2,
    'vikram.nair@institution.edu',
    2.90
);


-- ============================================================
-- 8. ATTENDANCE SEED DATA
-- ============================================================

INSERT INTO attendance
(student_id, date, status, subject)
VALUES

-- Aarav Sharma: 4 Present, 1 Absent = 80%
('a1111111-1111-1111-1111-111111111111',
 CURRENT_DATE - INTERVAL '4 days',
 'Present',
 'Data Structures'),

('a1111111-1111-1111-1111-111111111111',
 CURRENT_DATE - INTERVAL '3 days',
 'Present',
 'Operating Systems'),

('a1111111-1111-1111-1111-111111111111',
 CURRENT_DATE - INTERVAL '2 days',
 'Present',
 'Algorithms'),

('a1111111-1111-1111-1111-111111111111',
 CURRENT_DATE - INTERVAL '1 day',
 'Absent',
 'DBMS'),

('a1111111-1111-1111-1111-111111111111',
 CURRENT_DATE,
 'Present',
 'Data Structures'),


-- Priya Patel: 5 Present = 100%

('a2222222-2222-2222-2222-222222222222',
 CURRENT_DATE - INTERVAL '4 days',
 'Present',
 'Operating Systems'),

('a2222222-2222-2222-2222-222222222222',
 CURRENT_DATE - INTERVAL '3 days',
 'Present',
 'DBMS'),

('a2222222-2222-2222-2222-222222222222',
 CURRENT_DATE - INTERVAL '2 days',
 'Present',
 'Data Structures'),

('a2222222-2222-2222-2222-222222222222',
 CURRENT_DATE - INTERVAL '1 day',
 'Present',
 'Algorithms'),

('a2222222-2222-2222-2222-222222222222',
 CURRENT_DATE,
 'Present',
 'Operating Systems'),


-- Rohan Verma: 2 Present, 4 Absent = 33.3% (Shortage Warning)

('a3333333-3333-3333-3333-333333333333',
 CURRENT_DATE - INTERVAL '5 days',
 'Absent',
 'Operating Systems'),

('a3333333-3333-3333-3333-333333333333',
 CURRENT_DATE - INTERVAL '4 days',
 'Present',
 'Data Structures'),

('a3333333-3333-3333-3333-333333333333',
 CURRENT_DATE - INTERVAL '3 days',
 'Absent',
 'Algorithms'),

('a3333333-3333-3333-3333-333333333333',
 CURRENT_DATE - INTERVAL '2 days',
 'Absent',
 'DBMS'),

('a3333333-3333-3333-3333-333333333333',
 CURRENT_DATE - INTERVAL '1 day',
 'Absent',
 'Operating Systems'),

('a3333333-3333-3333-3333-333333333333',
 CURRENT_DATE,
 'Present',
 'Data Structures'),


-- Sneha Kulkarni: 4 Present, 1 Absent = 80%

('a4444444-4444-4444-4444-444444444444',
 CURRENT_DATE - INTERVAL '4 days',
 'Present',
 'DBMS'),

('a4444444-4444-4444-4444-444444444444',
 CURRENT_DATE - INTERVAL '3 days',
 'Present',
 'Data Structures'),

('a4444444-4444-4444-4444-444444444444',
 CURRENT_DATE - INTERVAL '2 days',
 'Present',
 'Operating Systems'),

('a4444444-4444-4444-4444-444444444444',
 CURRENT_DATE - INTERVAL '1 day',
 'Absent',
 'Algorithms'),

('a4444444-4444-4444-4444-444444444444',
 CURRENT_DATE,
 'Present',
 'DBMS'),


-- Vikramaditya Nair: 3 Present, 2 Absent = 60% (Shortage Warning)

('a5555555-5555-5555-5555-555555555555',
 CURRENT_DATE - INTERVAL '4 days',
 'Absent',
 'Algorithms'),

('a5555555-5555-5555-5555-555555555555',
 CURRENT_DATE - INTERVAL '3 days',
 'Present',
 'Data Structures'),

('a5555555-5555-5555-5555-555555555555',
 CURRENT_DATE - INTERVAL '2 days',
 'Absent',
 'DBMS'),

('a5555555-5555-5555-5555-555555555555',
 CURRENT_DATE - INTERVAL '1 day',
 'Present',
 'Operating Systems'),

('a5555555-5555-5555-5555-555555555555',
 CURRENT_DATE,
 'Present',
 'Algorithms');


-- ============================================================
-- 9. ACADEMIC RECORDS SEED DATA
-- ============================================================

INSERT INTO academic_records
(student_id, subject, credits, marks, grade)
VALUES

-- Aarav Sharma
('a1111111-1111-1111-1111-111111111111', 'Data Structures', 4, 92, 'A+'),
('a1111111-1111-1111-1111-111111111111', 'Operating Systems', 4, 88, 'A'),
('a1111111-1111-1111-1111-111111111111', 'Algorithms', 4, 95, 'A+'),
('a1111111-1111-1111-1111-111111111111', 'DBMS', 3, 85, 'A'),

-- Priya Patel
('a2222222-2222-2222-2222-222222222222', 'Data Structures', 4, 96, 'A+'),
('a2222222-2222-2222-2222-222222222222', 'Operating Systems', 4, 94, 'A+'),
('a2222222-2222-2222-2222-222222222222', 'Algorithms', 4, 98, 'A+'),
('a2222222-2222-2222-2222-222222222222', 'DBMS', 3, 91, 'A+'),

-- Rohan Verma
('a3333333-3333-3333-3333-333333333333', 'Data Structures', 4, 62, 'C'),
('a3333333-3333-3333-3333-333333333333', 'Operating Systems', 4, 58, 'D'),
('a3333333-3333-3333-3333-333333333333', 'Algorithms', 4, 65, 'C'),
('a3333333-3333-3333-3333-333333333333', 'DBMS', 3, 71, 'B');
