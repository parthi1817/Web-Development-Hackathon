/**
 * ==============================================================================
 * STAT CARD COMPONENT
 * ==============================================================================
 * Renders glassmorphic KPI metric cards (Total Students, Avg Attendance, Avg GPA, etc.)
 * ==============================================================================
 */

import React from "react";

export default function StatCard({ title, value, subtitle, icon, accentColor = "#6366f1", badge }) {
  return (
    <div 
      className="stat-card" 
      style={{ "--stat-accent": accentColor }}
    >
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div className="stat-icon" style={{ borderColor: `${accentColor}33` }}>
          {icon}
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-subtitle">
        {badge && (
          <span 
            className="badge" 
            style={{ 
              backgroundColor: `${accentColor}20`, 
              color: accentColor, 
              borderColor: `${accentColor}40`,
              fontSize: "11px",
              padding: "2px 8px"
            }}
          >
            {badge}
          </span>
        )}
        <span>{subtitle}</span>
      </div>
    </div>
  );
}
