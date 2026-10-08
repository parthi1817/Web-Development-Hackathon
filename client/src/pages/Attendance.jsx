/**
 * ==============================================================================
 * ATTENDANCE TRACKER & COMPLIANCE PAGE
 * ==============================================================================
 * Features:
 * 1. One-click "Present" / "Absent" logging buttons per student.
 * 2. Real-time Attendance Percentage calculation: (Present / Total) * 100.
 * 3. Dynamic Threshold Badging:
 *    - Green: "Eligible >= 75%"
 *    - Red: "Shortage Alert < 75%"
 * 4. Batch "Mark All Present" convenience button.
 *
 * 👨‍🏫 JUDGE DEFENSE QUESTION 1:
 * "How do you change the attendance warning threshold from 75% to 80%?"
 * -> In `server/server.js`, modify `ATTENDANCE_THRESHOLD = 80;`
 * -> In this frontend file, note the `THRESHOLD` constant on line 32:
 *    Change `const THRESHOLD = 75;` to `const THRESHOLD = 80;` to adjust the
 *    visual warning and badge cut-off on the client side as well!
 * ==============================================================================
 */

import React, { useState, useEffect } from "react";
import { api } from "../api";

export default function Attendance() {
  // 👨‍🏫 JUDGE DEFENSE: Front-end warning threshold
  const THRESHOLD = 75; // <-- Change to 80 to alter shortage threshold on client!

  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("Data Structures");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [toast, setToast] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    loadAttendance();
  }, []);

  const showNotification = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.getAttendance();
      setAttendanceData(res.data || []);
    } catch (err) {
      showNotification(err.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  // Mark attendance for a single student
  const handleMark = async (studentId, status, studentName) => {
    try {
      setSubmittingId(studentId);
      await api.markAttendance({
        student_id: studentId,
        status,
        subject: selectedSubject,
        date: selectedDate
      });

      // Update state locally for instantaneous feedback without refetch lag
      setAttendanceData(prev => prev.map(item => {
        if (item.student_id === studentId) {
          const newTotal = item.totalDays + 1;
          const newPresent = status === "Present" ? item.presentDays + 1 : item.presentDays;
          const newAbsent = status === "Absent" ? item.absentDays + 1 : item.absentDays;
          // Live attendance calculation formula: (Present / Total) * 100
          const newPct = parseFloat(((newPresent / newTotal) * 100).toFixed(1));
          const isEligible = newPct >= THRESHOLD;

          return {
            ...item,
            totalDays: newTotal,
            presentDays: newPresent,
            absentDays: newAbsent,
            percentage: newPct,
            isEligible,
            statusLabel: isEligible ? "Eligible" : "Shortage Alert"
          };
        }
        return item;
      }));

      showNotification(`Marked ${studentName} as ${status}!`);
    } catch (err) {
      showNotification(err.message || "Failed to mark attendance", "danger");
    } finally {
      setSubmittingId(null);
    }
  };

  // Mark all students present in one click
  const handleMarkAllPresent = async () => {
    if (!window.confirm(`Mark all ${attendanceData.length} students as Present for ${selectedSubject}?`)) {
      return;
    }

    try {
      setLoading(true);
      for (const item of attendanceData) {
        await api.markAttendance({
          student_id: item.student_id,
          status: "Present",
          subject: selectedSubject,
          date: selectedDate
        });
      }
      showNotification(`Marked all students as Present for ${selectedSubject}!`);
      loadAttendance();
    } catch (err) {
      showNotification(err.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Toast Notification */}
      {toast && (
        <div className="toast" style={{ borderColor: toast.type === "danger" ? "#f43f5e" : "#10b981" }}>
          <span>{toast.type === "danger" ? "❌" : "✅"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Attendance Tracker</span>
            <span className="badge badge-warning">Min Required: {THRESHOLD}%</span>
          </h1>
          <p className="page-subtitle">
            Log daily student presence and monitor live compliance against institutional standards.
          </p>
        </div>
        <button 
          onClick={handleMarkAllPresent} 
          className="btn btn-primary"
          id="btn-mark-all-present"
          disabled={loading || attendanceData.length === 0}
        >
          ✓ Mark All Present Today
        </button>
      </div>

      {/* Session Controls: Date & Subject */}
      <div className="glass-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center", justifyContent: "space-between" }}>
          
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
            {/* Subject Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                Course Session:
              </label>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="input-field"
                style={{ width: "auto", minWidth: "180px", padding: "8px 12px" }}
                id="select-attendance-subject"
              >
                <option value="Data Structures">Data Structures</option>
                <option value="Operating Systems">Operating Systems</option>
                <option value="Algorithms">Algorithms</option>
                <option value="DBMS">Database Management</option>
              </select>
            </div>

            {/* Date Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                Session Date:
              </label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field"
                style={{ width: "auto", padding: "7px 12px" }}
                id="input-attendance-date"
              />
            </div>
          </div>

          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Showing live calculations based on logged class days
          </div>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="glass-card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: "var(--text-muted)" }}>
            ⚡ Computing Live Attendance Records...
          </div>
        ) : attendanceData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <p>No students enrolled yet. Add students first in the Student Directory.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Classes (Attended / Total)</th>
                  <th style={{ width: "200px" }}>Live Attendance %</th>
                  <th>Status Badge</th>
                  <th style={{ textAlign: "center", width: "180px" }}>Quick Log Action</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map(item => {
                  const isEligible = item.percentage >= THRESHOLD;

                  return (
                    <tr key={item.student_id}>
                      {/* Roll No */}
                      <td>
                        <span className="roll-badge">{item.roll_no}</span>
                      </td>

                      {/* Student Name */}
                      <td style={{ fontWeight: 600 }}>
                        {item.name}
                      </td>

                      {/* Department */}
                      <td>
                        <span className="badge badge-primary">{item.department}</span>
                      </td>

                      {/* Sessions Ratio */}
                      <td>
                        <span style={{ fontWeight: 600, color: "#fff" }}>{item.presentDays}</span>
                        <span style={{ color: "var(--text-muted)" }}> / {item.totalDays} sessions</span>
                      </td>

                      {/* Percentage & Visual Meter */}
                      <td>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 700, color: isEligible ? "#34d399" : "#fb7185", fontSize: "14px" }}>
                            {item.percentage}%
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            target: {THRESHOLD}%
                          </span>
                        </div>
                        <div className="progress-bar-container">
                          <div 
                            className={`progress-bar-fill ${isEligible ? "eligible" : "shortage"}`}
                            style={{ width: `${Math.min(100, item.percentage)}%` }}
                          />
                        </div>
                      </td>

                      {/* Dynamic Badge */}
                      <td>
                        {isEligible ? (
                          <span className="badge badge-success">
                            ✓ Eligible (&ge;{THRESHOLD}%)
                          </span>
                        ) : (
                          <span className="badge badge-danger">
                            ⚠️ Shortage Alert (&lt;{THRESHOLD}%)
                          </span>
                        )}
                      </td>

                      {/* Quick Log Buttons */}
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button
                            onClick={() => handleMark(item.student_id, "Present", item.name)}
                            disabled={submittingId === item.student_id}
                            className="btn-success-sm"
                            title="Mark Present"
                            id={`btn-mark-present-${item.roll_no}`}
                          >
                            ✓ Present
                          </button>
                          <button
                            onClick={() => handleMark(item.student_id, "Absent", item.name)}
                            disabled={submittingId === item.student_id}
                            className="btn-danger-sm"
                            title="Mark Absent"
                            id={`btn-mark-absent-${item.roll_no}`}
                          >
                            ✕ Absent
                          </button>
                        </div>
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
