/**
 * ==============================================================================
 * NAVBAR COMPONENT
 * ==============================================================================
 * Displays header navigation with active route highlights and live Supabase /
 * Fallback Mode indicator pill for live hackathon judging.
 * ==============================================================================
 */

import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { api } from "../api";

export default function Navbar() {
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    mode: "Checking...",
    loading: true
  });

  useEffect(() => {
    // Check backend and Supabase connectivity status
    api.getHealth()
      .then(res => {
        setDbStatus({
          connected: res.database?.connected || false,
          mode: res.database?.mode || "Fallback Mode",
          loading: false
        });
      })
      .catch(() => {
        setDbStatus({
          connected: false,
          mode: "Demo Resilient Fallback",
          loading: false
        });
      });
  }, []);

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Brand Identity */}
          <NavLink to="/" className="brand-logo" id="nav-brand-logo">
            <div className="brand-icon">🎓</div>
            <div>
              <span>EduPulse</span>
              <span className="brand-badge">SMS v1.0</span>
            </div>
          </NavLink>

          {/* Navigation Route Links */}
          <ul className="nav-links">
            <li>
              <NavLink 
                to="/" 
                end
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                id="nav-link-dashboard"
              >
                📊 Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/students" 
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                id="nav-link-students"
              >
                👥 Students
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/attendance" 
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                id="nav-link-attendance"
              >
                📅 Attendance
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/academics" 
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                id="nav-link-academics"
              >
                📚 Academics
              </NavLink>
            </li>
          </ul>

          {/* Real-time DB Status Badge (Crucial for Demo Judging) */}
          <div 
            className="status-pill" 
            id="nav-db-status" 
            title={dbStatus.connected ? "Connected to Supabase PostgreSQL" : "Demo Resilience Active: In-memory fallback prevents crash"}
          >
            <span className={`status-dot ${dbStatus.connected ? "connected" : "fallback"}`}></span>
            <span style={{ color: dbStatus.connected ? "#34d399" : "#fbbf24" }}>
              {dbStatus.connected ? "Supabase Live" : "Demo Fallback Active"}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
