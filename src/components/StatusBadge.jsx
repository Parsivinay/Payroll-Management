import React from 'react';

export default function StatusBadge({ status, type = 'status' }) {
  if (!status) return null;

  const normalized = String(status).toLowerCase();

  let badgeClass = 'badge-active';
  if (normalized === 'paid' || normalized === 'active' || normalized === 'present') {
    badgeClass = 'badge-paid';
  } else if (normalized === 'pending' || normalized === 'leave') {
    badgeClass = 'badge-pending';
  } else if (normalized === 'inactive' || normalized === 'absent') {
    badgeClass = 'badge-inactive';
  } else if (type === 'department') {
    badgeClass = 'badge-department';
  }

  return <span className={`badge ${badgeClass}`}>{status}</span>;
}
