import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import StatCard from '../../components/StatCard.jsx';
import { CalendarCheck, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const MONTHS = [
  'All Months', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MyAttendance() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState('All Months');
  const [yearFilter, setYearFilter] = useState('2026');

  useEffect(() => {
    const fetchMyAttendance = async () => {
      try {
        let url = `/attendance?year=${yearFilter}`;
        if (monthFilter !== 'All Months') {
          url += `&month=${monthFilter}`;
        }
        const res = await api.get(url);
        if (res.data.success) {
          setAttendances(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching employee attendance', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyAttendance();
  }, [monthFilter, yearFilter]);

  if (loading) return <LoadingSpinner message="Retrieving attendance history..." />;

  const totalWorkingDays = attendances.reduce((acc, a) => acc + (a.workingDays || 0), 0);
  const totalPresentDays = attendances.reduce((acc, a) => acc + (a.presentDays || 0), 0);
  const totalAbsentDays = attendances.reduce((acc, a) => acc + (a.absentDays || 0), 0);
  const totalLeaveDays = attendances.reduce((acc, a) => acc + (a.leaveDays || 0), 0);
  const overallRate = totalWorkingDays > 0 ? Math.round((totalPresentDays / totalWorkingDays) * 100) : 100;

  return (
    <div>
      <div className="page-header">
        <div className="page-title-box">
          <h1>My Attendance Record</h1>
          <p>Personal attendance timesheets, leave logs, and punctuality percentages.</p>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="stats-grid">
        <StatCard
          label="Attendance Rate"
          value={`${overallRate}%`}
          subtitle="Cumulative compliance"
          icon={CalendarCheck}
          color="#10b981"
          iconBg="#ecfdf5"
        />
        <StatCard
          label="Total Present Days"
          value={totalPresentDays}
          subtitle={`Out of ${totalWorkingDays} scheduled days`}
          icon={CheckCircle}
          color="#2563eb"
          iconBg="#eff6ff"
        />
        <StatCard
          label="Total Absent Days"
          value={totalAbsentDays}
          subtitle="Unexcused absences"
          icon={XCircle}
          color="#dc2626"
          iconBg="#fef2f2"
        />
        <StatCard
          label="Approved Leave Days"
          value={totalLeaveDays}
          subtitle="Medical / Paid leaves taken"
          icon={Clock}
          color="#d97706"
          iconBg="#fffbeb"
        />
      </div>

      {/* Filter toolbar */}
      <div className="filter-toolbar">
        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Filter Records:</div>
        <div className="filter-selects-group">
          <select
            className="filter-select"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Working Days</th>
              <th>Present Days</th>
              <th>Absent Days</th>
              <th>Approved Leaves</th>
              <th>Monthly Attendance Rate</th>
            </tr>
          </thead>
          <tbody>
            {attendances.length > 0 ? (
              attendances.map((a) => {
                const pct = a.workingDays > 0 ? Math.round((a.presentDays / a.workingDays) * 100) : 0;
                return (
                  <tr key={a._id}>
                    <td style={{ fontWeight: 700 }}>
                      {a.month} {a.year}
                    </td>
                    <td>{a.workingDays} days</td>
                    <td style={{ color: '#059669', fontWeight: 700 }}>{a.presentDays} days</td>
                    <td style={{ color: '#dc2626', fontWeight: 600 }}>{a.absentDays} days</td>
                    <td style={{ color: '#d97706', fontWeight: 600 }}>{a.leaveDays} days</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="progress-track" style={{ width: '100px', height: '8px' }}>
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: pct >= 90 ? '#10b981' : pct >= 75 ? '#3b82f6' : '#ef4444',
                            }}
                          ></div>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>
                  No attendance records recorded for this selected period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
