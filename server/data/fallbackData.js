/**
 * ==============================================================================
 * DEMO RESILIENCE FALLBACK DATA STORE
 * ==============================================================================
 * This in-memory data store activates automatically if:
 * 1. SUPABASE_URL or SUPABASE_KEY are missing / set to placeholder values.
 * 2. Supabase connection encounters network issues or timeout during live demo.
 *
 * CRITICAL FOR HACKATHON JUDGING:
 * Ensures the prototype NEVER crashes on stage and allows full interactive CRUD:
 * - Adding new students
 * - Deleting students
 * - Marking attendance (Present / Absent)
 * - Real-time GPA recalculation & low-attendance alerts
 * ==============================================================================
 */

// Initial Seed Students
let studentsStore = [
  {
    id: "stu-001",
    roll_no: "CS2024-001",
    name: "Aarav Sharma",
    department: "CSE",
    semester: 6,
    email: "aarav.sharma@institution.edu",
    gpa: 3.85,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: "stu-002",
    roll_no: "IT2024-042",
    name: "Priya Patel",
    department: "IT",
    semester: 4,
    email: "priya.patel@institution.edu",
    gpa: 3.92,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    id: "stu-003",
    roll_no: "EC2024-015",
    name: "Rohan Verma",
    department: "ECE",
    semester: 6,
    email: "rohan.verma@institution.edu",
    gpa: 2.65,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: "stu-004",
    roll_no: "CS2024-089",
    name: "Sneha Kulkarni",
    department: "CSE",
    semester: 4,
    email: "sneha.k@institution.edu",
    gpa: 3.70,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: "stu-005",
    roll_no: "IT2024-073",
    name: "Vikramaditya Nair",
    department: "IT",
    semester: 2,
    email: "vikram.nair@institution.edu",
    gpa: 2.90,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  }
];

// Initial Attendance Records
let attendanceStore = [
  // Aarav Sharma: 4 Present, 1 Absent = 80.0% (Eligible >= 75%)
  { id: "att-101", student_id: "stu-001", date: "2026-10-01", status: "Present", subject: "Data Structures" },
  { id: "att-102", student_id: "stu-001", date: "2026-10-02", status: "Present", subject: "Operating Systems" },
  { id: "att-103", student_id: "stu-001", date: "2026-10-03", status: "Present", subject: "Algorithms" },
  { id: "att-104", student_id: "stu-001", date: "2026-10-04", status: "Absent", subject: "DBMS" },
  { id: "att-105", student_id: "stu-001", date: "2026-10-05", status: "Present", subject: "Data Structures" },

  // Priya Patel: 5 Present, 0 Absent = 100.0% (Eligible >= 75%)
  { id: "att-201", student_id: "stu-002", date: "2026-10-01", status: "Present", subject: "Operating Systems" },
  { id: "att-202", student_id: "stu-002", date: "2026-10-02", status: "Present", subject: "DBMS" },
  { id: "att-203", student_id: "stu-002", date: "2026-10-03", status: "Present", subject: "Data Structures" },
  { id: "att-204", student_id: "stu-002", date: "2026-10-04", status: "Present", subject: "Algorithms" },
  { id: "att-205", student_id: "stu-002", date: "2026-10-05", status: "Present", subject: "Operating Systems" },

  // Rohan Verma: 2 Present, 4 Absent = 33.3% (SHORTAGE ALERT < 75%)
  { id: "att-301", student_id: "stu-003", date: "2026-09-30", status: "Absent", subject: "Operating Systems" },
  { id: "att-302", student_id: "stu-003", date: "2026-10-01", status: "Present", subject: "Data Structures" },
  { id: "att-303", student_id: "stu-003", date: "2026-10-02", status: "Absent", subject: "Algorithms" },
  { id: "att-304", student_id: "stu-003", date: "2026-10-03", status: "Absent", subject: "DBMS" },
  { id: "att-305", student_id: "stu-003", date: "2026-10-04", status: "Absent", subject: "Operating Systems" },
  { id: "att-306", student_id: "stu-003", date: "2026-10-05", status: "Present", subject: "Data Structures" },

  // Sneha Kulkarni: 4 Present, 1 Absent = 80.0% (Eligible >= 75%)
  { id: "att-401", student_id: "stu-004", date: "2026-10-01", status: "Present", subject: "DBMS" },
  { id: "att-402", student_id: "stu-004", date: "2026-10-02", status: "Present", subject: "Data Structures" },
  { id: "att-403", student_id: "stu-004", date: "2026-10-03", status: "Present", subject: "Operating Systems" },
  { id: "att-404", student_id: "stu-004", date: "2026-10-04", status: "Absent", subject: "Algorithms" },
  { id: "att-405", student_id: "stu-004", date: "2026-10-05", status: "Present", subject: "DBMS" },

  // Vikramaditya Nair: 3 Present, 2 Absent = 60.0% (SHORTAGE ALERT < 75%)
  { id: "att-501", student_id: "stu-005", date: "2026-10-01", status: "Absent", subject: "Algorithms" },
  { id: "att-502", student_id: "stu-005", date: "2026-10-02", status: "Present", subject: "Data Structures" },
  { id: "att-503", student_id: "stu-005", date: "2026-10-03", status: "Absent", subject: "DBMS" },
  { id: "att-504", student_id: "stu-005", date: "2026-10-04", status: "Present", subject: "Operating Systems" },
  { id: "att-505", student_id: "stu-005", date: "2026-10-05", status: "Present", subject: "Algorithms" }
];

// Initial Academic Subject Records
let academicRecordsStore = [
  // Aarav Sharma
  { id: "acad-1", student_id: "stu-001", subject: "Data Structures", credits: 4, marks: 92, grade: "A+" },
  { id: "acad-2", student_id: "stu-001", subject: "Operating Systems", credits: 4, marks: 88, grade: "A" },
  { id: "acad-3", student_id: "stu-001", subject: "Algorithms", credits: 4, marks: 95, grade: "A+" },
  { id: "acad-4", student_id: "stu-001", subject: "DBMS", credits: 3, marks: 85, grade: "A" },

  // Priya Patel
  { id: "acad-5", student_id: "stu-002", subject: "Data Structures", credits: 4, marks: 96, grade: "A+" },
  { id: "acad-6", student_id: "stu-002", subject: "Operating Systems", credits: 4, marks: 94, grade: "A+" },
  { id: "acad-7", student_id: "stu-002", subject: "Algorithms", credits: 4, marks: 98, grade: "A+" },
  { id: "acad-8", student_id: "stu-002", subject: "DBMS", credits: 3, marks: 91, grade: "A+" },

  // Rohan Verma
  { id: "acad-9", student_id: "stu-003", subject: "Data Structures", credits: 4, marks: 62, grade: "C" },
  { id: "acad-10", student_id: "stu-003", subject: "Operating Systems", credits: 4, marks: 58, grade: "D" },
  { id: "acad-11", student_id: "stu-003", subject: "Algorithms", credits: 4, marks: 65, grade: "C" },
  { id: "acad-12", student_id: "stu-003", subject: "DBMS", credits: 3, marks: 71, grade: "B" }
];

// ==============================================================================
// IN-MEMORY HELPER FUNCTIONS
// ==============================================================================

export const fallbackData = {
  // --- Students ---
  getStudents: () => [...studentsStore],
  
  getStudentById: (id) => studentsStore.find(s => s.id === id),
  
  getStudentByRoll: (roll_no) => studentsStore.find(s => s.roll_no.toLowerCase() === roll_no.toLowerCase()),
  
  addStudent: (student) => {
    const newStudent = {
      id: "stu-" + Date.now().toString().slice(-6),
      roll_no: student.roll_no.trim().toUpperCase(),
      name: student.name.trim(),
      department: student.department.trim(),
      semester: parseInt(student.semester) || 1,
      email: student.email.trim().toLowerCase(),
      gpa: parseFloat(student.gpa) || 3.00,
      created_at: new Date().toISOString()
    };
    studentsStore.unshift(newStudent);
    return newStudent;
  },

  deleteStudent: (id) => {
    const initialLen = studentsStore.length;
    studentsStore = studentsStore.filter(s => s.id !== id);
    // Cascade delete attendance and academics
    attendanceStore = attendanceStore.filter(a => a.student_id !== id);
    academicRecordsStore = academicRecordsStore.filter(r => r.student_id !== id);
    return studentsStore.length < initialLen;
  },

  // --- Attendance ---
  getAttendance: () => [...attendanceStore],

  markAttendance: (student_id, status, subject = "General", date = null) => {
    const record = {
      id: "att-" + Date.now().toString().slice(-6),
      student_id,
      date: date || new Date().toISOString().split("T")[0],
      status: status === "Absent" ? "Absent" : "Present",
      subject: subject || "General"
    };
    attendanceStore.unshift(record);
    return record;
  },

  // --- Academics ---
  getAcademicRecords: () => [...academicRecordsStore],

  updateAcademicRecord: (student_id, subject, marks, credits) => {
    let existing = academicRecordsStore.find(r => r.student_id === student_id && r.subject === subject);
    const gradeFromMarks = (m) => {
      if (m >= 90) return "A+";
      if (m >= 80) return "A";
      if (m >= 70) return "B";
      if (m >= 60) return "C";
      if (m >= 50) return "D";
      return "F";
    };

    if (existing) {
      existing.marks = marks;
      existing.credits = credits;
      existing.grade = gradeFromMarks(marks);
      return existing;
    } else {
      const newRec = {
        id: "acad-" + Date.now().toString().slice(-6),
        student_id,
        subject,
        credits: parseInt(credits) || 3,
        marks: parseFloat(marks) || 0,
        grade: gradeFromMarks(marks)
      };
      academicRecordsStore.push(newRec);
      return newRec;
    }
  }
};
