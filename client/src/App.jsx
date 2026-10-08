/**
 * ==============================================================================
 * APPLICATION ROOT & REACT ROUTER CONFIGURATION
 * ==============================================================================
 * Central routing tree using React Router v7:
 * - /           -> Dashboard (Executive KPIs & At-Risk Alerts)
 * - /students   -> Student Directory & Enrollment
 * - /attendance -> Real-time Attendance Tracker & Compliance Formulas
 * - /academics  -> Academic Records, Transcripts & Live GPA Calculator
 * ==============================================================================
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import AcademicRecords from "./pages/AcademicRecords";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Navigation Bar */}
        <Navbar />

        {/* Dynamic Route View */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/academics" element={<AcademicRecords />} />
            {/* Catch-all redirect to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Institutional Footer */}
        <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "24px 0", background: "rgba(10, 13, 20, 0.95)", marginTop: "auto" }}>
          <div className="container" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", fontSize: "13px", color: "var(--text-muted)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🎓</span>
              <span>EduPulse SMS &bull; Centralized Institutional Management System</span>
            </div>
            <div>
              <span>3-Tier Architecture: </span>
              <span style={{ color: "var(--text-secondary)" }}>React 19 + Express API + Supabase PostgreSQL</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
