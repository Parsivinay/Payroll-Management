import React from 'react';

export default function StatCard({ label, value, subtitle, icon: Icon, color = '#2563eb', iconBg = '#eff6ff' }) {
  return (
    <div className="stat-card" style={{ '--card-color': color }}>
      <div className="stat-content">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {subtitle && <span className="stat-subtitle">{subtitle}</span>}
      </div>
      {Icon && (
        <div
          className="stat-icon-box"
          style={{ '--icon-bg': iconBg, '--icon-color': color }}
        >
          <Icon size={24} />
        </div>
      )}
    </div>
  );
}
