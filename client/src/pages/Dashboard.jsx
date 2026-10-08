/**
 * ==============================================================================
 * DASHBOARD PAGE
 * ==============================================================================
 * Displays high-level analytics:
 * - Total Students enrolled
 * - Batch Average Attendance %
 * - Students at Risk count (< 75% attendance)
 * - Batch Average GPA
 * - Department distribution
 * - Urgent Shortage warning roster
 * ==============================================================================
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import { api } from "../api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardMetrics();
      setData(res);
      setError(null);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "80px 0" }}>
        <div style={{ fontSize: "36px", marginBottom: "16px" }}>⚡</div>
        <h2>Loading Institutional Analytics...</h2>
        <p style={{ color: "var(--text-muted)" }}>Connecting to Express REST API & Database</p>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalStudents: 0,
    avgAttendance: 0,
    atRiskCount: 0,
    avgGPA: 0,
    attendanceThreshold: 75
  };

  const atRiskStudents = data?.atRiskStudents || [];
  const deptDist = data?.departmentDistribution || {};

  return (
    <div className="container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Executive Dashboard</span>
            <span className="badge badge-primary">Spring 2026</span>
          </h1>
          <p className="page-subtitle">
            Institutional overview of active student cohorts, attendance compliance, and academic records.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={loadDashboard} className="btn btn-secondary" id="btn-refresh-dashboard">
            🔄 Refresh
          </button>
          <Link to="/students" className="btn btn-primary" id="btn-quick-add-student">
            + New Student
          </Link>
        </div>
      </div>

      {/* Low-Attendance Alert Banner (if any student is below 75%) */}
      {metrics.atRiskCount > 0 && (
        <div className="alert-banner alert-banner-danger" id="dashboard-risk-alert">
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "28px" }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: "#fff", fontSize: "16px" }}>
                Attendance Shortage Alert: {metrics.atRiskCount} Student{metrics.atRiskCount > 1 ? "s" : ""} Below {metrics.attendanceThreshold}% Requirement!
              </div>
              <p style={{ color: "#fca5a5", fontSize: "13px", marginTop: "2px" }}>
                Students below the mandatory {metrics.attendanceThreshold}% threshold require immediate counseling or attendance regularization.
              </p>
            </div>
          </div>
          <Link to="/attendance" className="btn btn-danger-sm" style={{ whiteSpace: "nowrap" }}>
            Review Attendance &rarr;
          </Link>
        </div>
      )}

      {/* 4 KPI Metric Stat Cards */}
      <div className="stat-grid">
        <StatCard 
          title="Total Students Enrolled"
          value={metrics.totalStudents}
          subtitle="Active across all departments"
          icon="🎓"
          accentColor="#6366f1"
          badge="Cohort"
        />

        <StatCard 
          title="Batch Avg Attendance"
          value={`${metrics.avgAttendance}%`}
          subtitle={`Mandatory minimum: ${metrics.attendanceThreshold}%`}
          icon="📅"
          accentColor={metrics.avgAttendance >= metrics.attendanceThreshold ? "#10b981" : "#f43f5e"}
          badge={metrics.avgAttendance >= metrics.attendanceThreshold ? "Healthy" : "Attention"}
        />

        <StatCard 
          title="Students At Risk"
          value={metrics.atRiskCount}
          subtitle={`Attendance < ${metrics.attendanceThreshold}%`}
          icon="⚠️"
          accentColor={metrics.atRiskCount === 0 ? "#10b981" : "#f43f5e"}
          badge={metrics.atRiskCount === 0 ? "Zero Shortage" : "Action Needed"}
        />

        <StatCard 
          title="Batch Average GPA"
          value={metrics.avgGPA.toFixed(2)}
          subtitle="Out of 4.00 Grade Scale"
          icon="⭐"
          accentColor="#06b6d4"
          badge="CGPA"
        />
      </div>

      {/* Grid: At Risk Roster + Department Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        
        {/* At-Risk Students Card */}
        <div className="glass-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h3 style={{ fontSize: "17px", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🚨</span>
              <span>Students with Attendance Shortage (&lt;{metrics.attendanceThreshold}%)</span>
            </h3>
            <span className="badge badge-danger">{atRiskStudents.length} Flagged</span>
          </div>

          {atRiskStudents.length === 0 ? (
            <div style={{ padding: "30px 10px", textAlign: "center", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>🎉</div>
              <div>All students meet the {metrics.attendanceThreshold}% attendance requirement!</div>
            </div>
          ) : (
            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Dept</th>
                    <th>Attendance</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {atRiskStudents.map(s => (
                    <tr key={s.id}>
                      <td><span className="roll-badge">{s.roll_no}</span></td>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td><span className="badge badge-primary">{s.department}</span></td>
                      <td>
                        <span className="badge badge-danger">
                          {s.percentage}%
                        </span>
                      </td>
                      <td>
                        <Link to="/attendance" className="btn-success-sm" style={{ padding: "4px 8px", fontSize: "11px" }}>
                          Mark +
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Department Breakdown & Quick Stats */}
        <div className="glass-card">
          <h3 style={{ fontSize: "17px", color: "#fff", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🏢</span>
            <span>Department Enrollment Breakdown</span>
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {Object.keys(deptDist).length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No department data available.</p>
            ) : (
              Object.entries(deptDist).map(([dept, count]) => {
                const pct = metrics.totalStudents > 0 ? Math.round((count / metrics.totalStudents) * 100) : 0;
                return (
                  <div key={dept}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 600, color: "#fff" }}>{dept} Department</span>
                      <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                        {count} Student{count > 1 ? "s" : ""} ({pct}%)
                      </span>
                    </div>
                    <div className="progress-bar-container" style={{ height: "10px" }}>
                      <div 
                        className="progress-bar-fill eligible" 
                        style={{ width: `${pct}%`, background: dept === 'CSE' ? '#6366f1' : dept === 'IT' ? '#06b6d4' : '#10b981' }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
              <span>Operational Mode:</span>
              <strong style={{ color: data?.databaseStatus?.connected ? "#34d399" : "#fbbf24" }}>
                {data?.databaseStatus?.mode || "In-Memory Fallback"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
        <Link to="/students" className="glass-card glass-card-interactive" style={{ textDecoration: "none" }}>
          <div style={{ fontSize: "28px", marginBottom: "10px" }}>👥</div>
          <h4 style={{ color: "#fff", marginBottom: "4px" }}>Manage Student Profiles</h4>
          <p style={{ fontSize: "13px" }}>Add new students, filter by department, search by roll number, or delete records.</p>
        </Link>
        <Link to="/attendance" className="glass-card glass-card-interactive" style={{ textDecoration: "none" }}>
          <div style={{ fontSize: "28px", marginBottom: "10px" }}>📅</div>
          <h4 style={{ color: "#fff", marginBottom: "4px" }}>Attendance Tracker</h4>
          <p style={{ fontSize: "13px" }}>One-click Present/Absent logging with real-time percentage and shortage alarms.</p>
        </Link>
        <Link to="/academics" className="glass-card glass-card-interactive" style={{ textDecoration: "none" }}>
          <div style={{ fontSize: "28px", marginBottom: "10px" }}>📚</div>
          <h4 style={{ color: "#fff", marginBottom: "4px" }}>Academic Records & GPA</h4>
          <p style={{ fontSize: "13px" }}>Credit-weighted GPA calculator with course mark cards and performance analysis.</p>
        </Link>
      </div>
    </div>
  );
}
