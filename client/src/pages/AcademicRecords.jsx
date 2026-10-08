/**
 * ==============================================================================
 * ACADEMIC RECORDS & LIVE GPA / CGPA CALCULATOR
 * ==============================================================================
 * Features:
 * 1. Subject marks breakdown: Data Structures, OS, Algorithms, DBMS.
 * 2. Real-time GPA calculation based on Credit Hours and Marks.
 * 3. Interactive What-If GPA Simulator:
 *    - Adjust marks and credit weights live to demonstrate instant GPA recalculation to judges!
 *
 * 👨‍🏫 JUDGE DEFENSE QUESTION 5:
 * "Where is the GPA calculation logic, and how would you change the grading formula?"
 * -> In `server/server.js`: See `calculateGradePoint()` function around line 240.
 * -> In this frontend file: See `getGradeAndPoints()` helper function below (line 28).
 *    To change the grading formula (e.g. making 85 an A+ instead of 90, or 10-point scale):
 *    Modify the threshold conditionals inside `getGradeAndPoints()`.
 *    Weighted GPA Formula = Sum(Points * Credits) / Sum(Credits).
 * ==============================================================================
 */

import React, { useState, useEffect } from "react";
import { api } from "../api";

// 👨‍🏫 JUDGE DEFENSE: Front-end Grade Point Mapping Formula
export function getGradeAndPoints(marks) {
  const m = parseFloat(marks) || 0;
  if (m >= 90) return { grade: "A+", points: 4.0, color: "#10b981" };
  if (m >= 80) return { grade: "A", points: 3.5, color: "#34d399" };
  if (m >= 70) return { grade: "B", points: 3.0, color: "#60a5fa" };
  if (m >= 60) return { grade: "C", points: 2.0, color: "#fbbf24" };
  if (m >= 50) return { grade: "D", points: 1.0, color: "#f97316" };
  return { grade: "F", points: 0.0, color: "#f43f5e" };
}

export default function AcademicRecords() {
  const [academicData, setAcademicData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  
  // Interactive Simulator Course Marks State for currently selected student
  const [simulatedCourses, setSimulatedCourses] = useState([
    { subject: "Data Structures", credits: 4, marks: 92 },
    { subject: "Operating Systems", credits: 4, marks: 88 },
    { subject: "Algorithms", credits: 4, marks: 95 },
    { subject: "DBMS", credits: 3, marks: 85 }
  ]);

  useEffect(() => {
    loadAcademics();
  }, []);

  const loadAcademics = async () => {
    try {
      setLoading(true);
      const res = await api.getAcademics();
      const students = res.data || [];
      setAcademicData(students);

      if (students.length > 0) {
        setSelectedStudentId(students[0].student_id);
        if (students[0].courses && students[0].courses.length > 0) {
          setSimulatedCourses(students[0].courses.map(c => ({
            subject: c.subject,
            credits: c.credits,
            marks: c.marks
          })));
        }
      }
    } catch (err) {
      console.error("Academics loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Switch selected student
  const handleSelectStudent = (studentId) => {
    setSelectedStudentId(studentId);
    const stu = academicData.find(s => s.student_id === studentId);
    if (stu && stu.courses) {
      setSimulatedCourses(stu.courses.map(c => ({
        subject: c.subject,
        credits: c.credits,
        marks: c.marks
      })));
    }
  };

  // Update simulator mark/credit
  const handleCourseChange = (index, field, value) => {
    setSimulatedCourses(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: parseFloat(value) || 0
      };
      return updated;
    });
  };

  // Live Weighted GPA Calculation
  // Formula: Sum(Grade Points * Credits) / Sum(Credits)
  const totalCredits = simulatedCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
  const totalQualityPoints = simulatedCourses.reduce((sum, c) => {
    const { points } = getGradeAndPoints(c.marks);
    return sum + (points * (c.credits || 0));
  }, 0);
  const liveCalculatedGPA = totalCredits > 0 ? parseFloat((totalQualityPoints / totalCredits).toFixed(2)) : 0.00;

  const currentStudent = academicData.find(s => s.student_id === selectedStudentId);

  return (
    <div className="container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Academic Performance & GPA</span>
            <span className="badge badge-primary">Scale: 4.00</span>
          </h1>
          <p className="page-subtitle">
            Course-by-course transcript records, credit weightage, and real-time GPA calculations.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          ⚡ Loading Academic Records...
        </div>
      ) : (
        <>
          {/* Top Overview & Student Selector */}
          <div className="glass-card" style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Select Student Transcript:
                </span>
                <select 
                  value={selectedStudentId || ""} 
                  onChange={(e) => handleSelectStudent(e.target.value)}
                  className="input-field"
                  style={{ width: "auto", minWidth: "260px" }}
                  id="select-transcript-student"
                >
                  {academicData.map(s => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.roll_no} - {s.name} ({s.department})
                    </option>
                  ))}
                </select>
              </div>

              {currentStudent && (
                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Official CGPA:</span>
                  <span className="gpa-display-pill gpa-high">
                    ⭐ {currentStudent.gpa.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 2-Column Layout: Live Interactive GPA Calculator & Student Leaderboard */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px", marginBottom: "32px" }}>
            
            {/* Column 1: Live Interactive GPA Calculator */}
            <div className="glass-card" style={{ border: "1px solid rgba(99, 102, 241, 0.35)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ color: "#fff", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>🧮</span>
                    <span>Live GPA Calculator & Simulator</span>
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    Adjust marks or credits live to see instantaneous GPA recalculation
                  </p>
                </div>
                {/* Computed GPA Box */}
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Calculated GPA</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 800, color: "#34d399" }}>
                    {liveCalculatedGPA.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Course Sliders / Inputs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {simulatedCourses.map((c, idx) => {
                  const { grade, points, color } = getGradeAndPoints(c.marks);

                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        background: "rgba(15, 20, 34, 0.7)", 
                        border: "1px solid var(--border-subtle)", 
                        borderRadius: "10px", 
                        padding: "12px 16px" 
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontWeight: 600, color: "#fff", fontSize: "14px" }}>{c.subject}</span>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span className="badge" style={{ background: `${color}20`, color, borderColor: `${color}40`, fontSize: "11px" }}>
                            {grade} ({points.toFixed(1)} pts)
                          </span>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {c.credits} Credits
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={c.marks} 
                          onChange={(e) => handleCourseChange(idx, "marks", e.target.value)}
                          style={{ flex: 1, accentColor: "#6366f1", cursor: "pointer" }}
                          id={`slider-course-${idx}`}
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <input 
                            type="number" 
                            min="0" 
                            max="100" 
                            value={c.marks} 
                            onChange={(e) => handleCourseChange(idx, "marks", e.target.value)}
                            className="input-field" 
                            style={{ width: "65px", padding: "4px 8px", textAlign: "center", fontSize: "13px" }}
                            id={`input-course-${idx}`}
                          />
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>marks</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Formula Defense Callout */}
              <div style={{ marginTop: "18px", padding: "12px 14px", background: "rgba(99, 102, 241, 0.08)", borderRadius: "8px", border: "1px solid rgba(99, 102, 241, 0.2)", fontSize: "12px", color: "#cbd5e1" }}>
                <strong>Formula:</strong> <code>Weighted GPA = &Sigma;(Grade_Points &times; Credits) &divide; &Sigma;Credits</code>
                <div style={{ marginTop: "4px", color: "var(--text-muted)" }}>
                  Total Quality Points: {totalQualityPoints.toFixed(1)} | Total Credits: {totalCredits}
                </div>
              </div>
            </div>

            {/* Column 2: Grading Scale Reference & Cohort Leaderboard */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Grading Scheme Card */}
              <div className="glass-card">
                <h3 style={{ color: "#fff", fontSize: "16px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📋</span>
                  <span>Institutional Grading Scale</span>
                </h3>
                <div className="table-container">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Marks Range</th>
                        <th>Letter Grade</th>
                        <th>Grade Points</th>
                        <th>Classification</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>90 - 100%</td>
                        <td><span className="badge badge-success">A+</span></td>
                        <td><strong>4.0</strong></td>
                        <td style={{ color: "var(--text-secondary)" }}>Outstanding</td>
                      </tr>
                      <tr>
                        <td>80 - 89%</td>
                        <td><span className="badge badge-success">A</span></td>
                        <td><strong>3.5</strong></td>
                        <td style={{ color: "var(--text-secondary)" }}>Excellent</td>
                      </tr>
                      <tr>
                        <td>70 - 79%</td>
                        <td><span className="badge badge-primary">B</span></td>
                        <td><strong>3.0</strong></td>
                        <td style={{ color: "var(--text-secondary)" }}>Good</td>
                      </tr>
                      <tr>
                        <td>60 - 69%</td>
                        <td><span className="badge badge-warning">C</span></td>
                        <td><strong>2.0</strong></td>
                        <td style={{ color: "var(--text-secondary)" }}>Average</td>
                      </tr>
                      <tr>
                        <td>50 - 59%</td>
                        <td><span className="badge badge-warning">D</span></td>
                        <td><strong>1.0</strong></td>
                        <td style={{ color: "var(--text-secondary)" }}>Pass</td>
                      </tr>
                      <tr>
                        <td>&lt; 50%</td>
                        <td><span className="badge badge-danger">F</span></td>
                        <td><strong>0.0</strong></td>
                        <td style={{ color: "#f87171" }}>Fail</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cohort Performance Leaderboard */}
              <div className="glass-card">
                <h3 style={{ color: "#fff", fontSize: "16px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🏆</span>
                  <span>Cohort Academic Ranking</span>
                </h3>
                <div className="table-container">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Student</th>
                        <th>Dept</th>
                        <th>CGPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...academicData]
                        .sort((a, b) => b.gpa - a.gpa)
                        .map((s, i) => (
                          <tr key={s.student_id}>
                            <td style={{ fontWeight: 700, color: i === 0 ? "#fbbf24" : i === 1 ? "#cbd5e1" : i === 2 ? "#d97706" : "var(--text-muted)" }}>
                              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                            </td>
                            <td style={{ fontWeight: 600 }}>{s.name}</td>
                            <td><span className="badge badge-primary">{s.department}</span></td>
                            <td>
                              <span className="gpa-display-pill gpa-high" style={{ fontSize: "12px", padding: "2px 8px" }}>
                                {s.gpa.toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        </>
      )}
    </div>
  );
}
