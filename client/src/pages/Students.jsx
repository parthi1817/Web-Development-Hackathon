/**
 * ==============================================================================
 * STUDENTS DIRECTORY & ENROLLMENT PAGE
 * ==============================================================================
 * Features:
 * 1. Add Student Form:
 *    - Fields: Roll No, Name, Department (CSE, IT, ECE), Semester, Email
 *    - Disallows duplicate Roll Numbers with server-side validation feedback
 * 2. Instant Search Filter:
 *    - Real-time instant filtering by name or roll number
 * 3. Department Tabs:
 *    - Filter by CSE, IT, ECE, or All
 * 4. Immediate Delete:
 *    - Instant UI removal with backend API synchronization
 *
 * 👨‍🏫 JUDGE DEFENSE QUESTION 4:
 * "How do you add a new field (e.g., Phone Number) across React UI -> Node.js API -> Supabase DB?"
 * 1. In this file:
 *    - Add `phone_number: ""` to `newStudent` state (line 42).
 *    - Add an `<input name="phone_number" value={newStudent.phone_number} onChange={handleInputChange} placeholder="+1 555-0199" />`
 *      to the form below (around line 170).
 * 2. In `server/server.js`:
 *    - In `POST /api/students`, destructure `phone_number = req.body.phone_number`.
 *    - Pass `phone_number` to `supabase.from('students').insert([...])` or fallbackData.
 * 3. In `server/schema.sql` (Supabase DB):
 *    - Run `ALTER TABLE students ADD COLUMN phone_number VARCHAR(20);`.
 * ==============================================================================
 */

import React, { useState, useEffect, useMemo } from "react";
import { api } from "../api";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State for New Student Registration
  // 👨‍🏫 NOTE: To add Phone Number or other fields, add them here:
  const [newStudent, setNewStudent] = useState({
    roll_no: "",
    name: "",
    department: "CSE",
    semester: 1,
    email: "",
    gpa: "3.50"
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  const showNotification = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await api.getStudents();
      setStudents(res.data || []);
    } catch (err) {
      showNotification(err.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form submission handler
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSubmitting(true);

    try {
      const response = await api.createStudent(newStudent);
      
      if (response.success) {
        showNotification(`Student ${newStudent.name} (${newStudent.roll_no}) enrolled successfully!`);
        // Prepend new student to local state for instantaneous UI update
        setStudents(prev => [response.data, ...prev]);
        
        // Reset form
        setNewStudent({
          roll_no: "",
          name: "",
          department: "CSE",
          semester: 1,
          email: "",
          gpa: "3.50"
        });
        setShowAddForm(false);
      }
    } catch (err) {
      setFormError(err.message || "Failed to register student");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete student handler with immediate UI update
  const handleDelete = async (id, name, roll_no) => {
    if (!window.confirm(`Are you sure you want to delete student "${name}" (${roll_no})?`)) {
      return;
    }

    try {
      await api.deleteStudent(id);
      // Immediately remove student from local UI state
      setStudents(prev => prev.filter(s => s.id !== id));
      showNotification(`Student ${name} deleted successfully.`);
    } catch (err) {
      showNotification(err.message || "Failed to delete student", "danger");
    }
  };

  // Real-time Instant Search & Department Filter
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.roll_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === "All" || student.department === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [students, searchQuery, selectedDept]);

  return (
    <div className="container">
      {/* Toast Notification */}
      {toast && (
        <div className="toast" style={{ borderColor: toast.type === "danger" ? "#f43f5e" : "#10b981" }}>
          <span>{toast.type === "danger" ? "❌" : "✅"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Student Directory</span>
            <span className="badge badge-primary">{students.length} Total</span>
          </h1>
          <p className="page-subtitle">
            Manage cohort enrollment, view academic status, and update records.
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn btn-primary"
          id="btn-toggle-add-student"
        >
          {showAddForm ? "✖ Close Form" : "+ Enroll New Student"}
        </button>
      </div>

      {/* Expandable "Add Student" Form Card */}
      {showAddForm && (
        <div className="glass-card" style={{ marginBottom: "28px", border: "1px solid rgba(99, 102, 241, 0.4)" }} id="add-student-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h3 style={{ color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>📝</span>
              <span>Enroll New Student</span>
            </h3>
            <span className="badge badge-primary">REST API Validation Enabled</span>
          </div>

          {formError && (
            <div style={{ background: "rgba(244, 63, 94, 0.15)", border: "1px solid rgba(244, 63, 94, 0.4)", padding: "12px 16px", borderRadius: "8px", color: "#fb7185", marginBottom: "16px", fontSize: "14px" }}>
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleAddStudent}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              {/* Roll Number */}
              <div className="input-group">
                <label className="input-label">Roll Number *</label>
                <input 
                  type="text" 
                  name="roll_no" 
                  value={newStudent.roll_no} 
                  onChange={handleInputChange} 
                  placeholder="e.g. CS2026-101" 
                  className="input-field" 
                  id="input-student-roll"
                  required 
                />
              </div>

              {/* Student Name */}
              <div className="input-group">
                <label className="input-label">Full Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  value={newStudent.name} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Ananya Sen" 
                  className="input-field" 
                  id="input-student-name"
                  required 
                />
              </div>

              {/* Department */}
              <div className="input-group">
                <label className="input-label">Department *</label>
                <select 
                  name="department" 
                  value={newStudent.department} 
                  onChange={handleInputChange} 
                  className="input-field"
                  id="select-student-dept"
                >
                  <option value="CSE">CSE (Computer Science)</option>
                  <option value="IT">IT (Information Tech)</option>
                  <option value="ECE">ECE (Electronics & Comm)</option>
                </select>
              </div>

              {/* Semester */}
              <div className="input-group">
                <label className="input-label">Semester</label>
                <select 
                  name="semester" 
                  value={newStudent.semester} 
                  onChange={handleInputChange} 
                  className="input-field"
                  id="select-student-sem"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div className="input-group">
                <label className="input-label">Email Address *</label>
                <input 
                  type="email" 
                  name="email" 
                  value={newStudent.email} 
                  onChange={handleInputChange} 
                  placeholder="e.g. ananya@institution.edu" 
                  className="input-field" 
                  id="input-student-email"
                  required 
                />
              </div>

              {/* Initial GPA */}
              <div className="input-group">
                <label className="input-label">Initial GPA (0.0 - 4.0)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  max="4" 
                  name="gpa" 
                  value={newStudent.gpa} 
                  onChange={handleInputChange} 
                  placeholder="3.50" 
                  className="input-field" 
                  id="input-student-gpa"
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={formSubmitting}
                id="btn-submit-student"
              >
                {formSubmitting ? "Enrolling..." : "✓ Confirm Enrollment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Department Filter Controls */}
      <div className="glass-card" style={{ marginBottom: "24px", padding: "16px 20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          
          {/* Instant Search Bar */}
          <div className="search-bar">
            <span>🔍</span>
            <input 
              type="text" 
              placeholder="Search by name, roll no, or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="input-search-students"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Department Filter Pills */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Filter Dept:</span>
            {["All", "CSE", "IT", "ECE"].map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`btn ${selectedDept === dept ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "6px 14px", fontSize: "13px" }}
                id={`filter-dept-${dept.toLowerCase()}`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="glass-card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: "var(--text-muted)" }}>
            ⚡ Loading Student Directory...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</div>
            <h3 style={{ color: "#fff" }}>No Students Found</h3>
            <p style={{ marginTop: "4px" }}>
              {searchQuery ? `No results matching "${searchQuery}" in ${selectedDept} Department.` : "No students currently enrolled."}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name & Contact</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Current GPA</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => {
                  const initial = student.name ? student.name.charAt(0).toUpperCase() : "?";
                  const gpaNum = parseFloat(student.gpa) || 0.0;
                  const gpaClass = gpaNum >= 3.5 ? "gpa-high" : gpaNum >= 3.0 ? "gpa-mid" : "gpa-low";

                  return (
                    <tr key={student.id}>
                      {/* Roll Number */}
                      <td>
                        <span className="roll-badge">{student.roll_no}</span>
                      </td>

                      {/* Name & Avatar */}
                      <td>
                        <div className="student-meta">
                          <div className="avatar-circle">{initial}</div>
                          <div>
                            <div className="student-name">{student.name}</div>
                            <div className="student-email">{student.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td>
                        <span className="badge badge-primary">{student.department}</span>
                      </td>

                      {/* Semester */}
                      <td>
                        <span style={{ color: "var(--text-secondary)" }}>Sem {student.semester}</span>
                      </td>

                      {/* GPA */}
                      <td>
                        <span className={`gpa-display-pill ${gpaClass}`} style={{ fontSize: "13px", padding: "2px 10px" }}>
                          ⭐ {gpaNum.toFixed(2)}
                        </span>
                      </td>

                      {/* Action (Delete) */}
                      <td style={{ textAlign: "right" }}>
                        <button 
                          onClick={() => handleDelete(student.id, student.name, student.roll_no)}
                          className="btn-danger-sm"
                          title="Delete Student"
                          id={`btn-delete-${student.id}`}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
