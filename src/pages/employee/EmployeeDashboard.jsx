import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import StatCard from '../../components/StatCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import {
  CreditCard,
  CalendarCheck,
  FileText,
  User,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [payRes, attRes] = await Promise.all([
          api.get('/payroll'),
          api.get('/attendance'),
        ]);

        if (payRes.data.success) setPayrolls(payRes.data.data);
        if (attRes.data.success) setAttendance(attRes.data.data);
      } catch (err) {
        console.error('Error fetching employee dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) return <LoadingSpinner message="Loading employee portal..." />;

  const latestPayroll = payrolls[0] || null;
  const latestAttendance = attendance[0] || null;
  const attendanceRate = latestAttendance && latestAttendance.workingDays > 0
    ? Math.round((latestAttendance.presentDays / latestAttendance.workingDays) * 100)
    : 100;

  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: '#fff',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 32px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: 'var(--radius-full)',
              background: '#fff',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
          >
            {user?.employee?.profileImage ? (
              <img
                src={user.employee.profileImage}
                alt={user?.username}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              (user?.username || 'E').charAt(0)
            )}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#bfdbfe', fontWeight: 600 }}>EMPLOYEE SELF-SERVICE</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '2px' }}>
              Welcome back, {user?.employee?.name || user?.username}!
            </h1>
            <div style={{ fontSize: '0.88rem', color: '#dbeafe', marginTop: '4px' }}>
              {user?.employee?.designation || 'Staff'} • {user?.employee?.department || 'Department'} • ID: {user?.employeeId}
            </div>
          </div>
        </div>

        {latestPayroll && (
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/admin/payroll/slip/${latestPayroll._id || latestPayroll.payrollId}`)}
            style={{ background: '#fff', color: 'var(--primary)', border: 'none', fontWeight: 700 }}
          >
            <FileText size={16} />
            View Latest Payslip ({latestPayroll.month})
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="stats-grid">
        <StatCard
          label="Current Net Take-Home"
          value={formatINR(latestPayroll?.netSalary || user?.employee?.basicSalary)}
          subtitle={latestPayroll ? `${latestPayroll.month} ${latestPayroll.year}` : 'Active Rate'}
          icon={CreditCard}
          color="#2563eb"
          iconBg="#eff6ff"
        />
        <StatCard
          label="Disbursement Status"
          value={latestPayroll?.paymentStatus || 'Processed'}
          subtitle={latestPayroll?.paymentDate ? `Paid on ${String(latestPayroll.paymentDate).split('T')[0]}` : 'Monthly Cycle'}
          icon={CheckCircle}
          color={latestPayroll?.paymentStatus === 'Paid' ? '#059669' : '#d97706'}
          iconBg={latestPayroll?.paymentStatus === 'Paid' ? '#ecfdf5' : '#fffbeb'}
        />
        <StatCard
          label="Present Working Days"
          value={`${latestAttendance?.presentDays || 0} / ${latestAttendance?.workingDays || 0}`}
          subtitle={`${latestAttendance?.month || 'Current'} Attendance`}
          icon={CalendarCheck}
          color="#0284c7"
          iconBg="#f0f9ff"
        />
        <StatCard
          label="Attendance Compliance"
          value={`${attendanceRate}%`}
          subtitle="Monthly punctuality rate"
          icon={TrendingUp}
          color="#7c3aed"
          iconBg="#f5f3ff"
        />
      </div>

      {/* Salary Overview & Recent Payroll History */}
      <div className="dashboard-grid-2">
        {/* Left: Latest Salary Breakdown */}
        <div className="card-panel">
          <div className="card-panel-header">
            <span className="card-panel-title">My Compensation Snapshot</span>
            {latestPayroll && <StatusBadge status={latestPayroll.paymentStatus} />}
          </div>
          <div className="card-panel-body">
            {latestPayroll ? (
              <div className="calc-summary-card" style={{ background: '#fff', border: 'none', padding: 0 }}>
                <div className="calc-breakdown-row">
                  <span>Basic Monthly Salary:</span>
                  <strong style={{ fontWeight: 600 }}>{formatINR(latestPayroll.basicSalary)}</strong>
                </div>
                <div className="calc-breakdown-row">
                  <span>House Rent Allowance (HRA):</span>
                  <strong style={{ fontWeight: 600 }}>{formatINR(latestPayroll.hra)}</strong>
                </div>
                <div className="calc-breakdown-row">
                  <span>Transport Allowance:</span>
                  <strong style={{ fontWeight: 600 }}>{formatINR(latestPayroll.transportAllowance)}</strong>
                </div>
                <div className="calc-breakdown-row">
                  <span>Other Allowances:</span>
                  <strong style={{ fontWeight: 600 }}>{formatINR(latestPayroll.otherAllowance)}</strong>
                </div>
                <div className="calc-breakdown-row" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '6px' }}>
                  <span>Gross Earnings:</span>
                  <strong style={{ color: '#16a34a', fontWeight: 700 }}>{formatINR(latestPayroll.grossSalary)}</strong>
                </div>
                <div className="calc-breakdown-row">
                  <span>Provident Fund (PF):</span>
                  <span style={{ color: '#dc2626' }}>-{formatINR(latestPayroll.pf)}</span>
                </div>
                <div className="calc-breakdown-row">
                  <span>Income Tax (TDS):</span>
                  <span style={{ color: '#dc2626' }}>-{formatINR(latestPayroll.tax)}</span>
                </div>
                <div className="calc-breakdown-row">
                  <span>Other Deductions:</span>
                  <span style={{ color: '#dc2626' }}>-{formatINR(latestPayroll.otherDeduction)}</span>
                </div>
                <div className="calc-breakdown-row total">
                  <span>NET MONTHLY TAKE-HOME:</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {formatINR(latestPayroll.netSalary)}
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No payroll records generated yet.</p>
            )}
          </div>
        </div>

        {/* Right: Quick Self-Service Links */}
        <div className="card-panel">
          <div className="card-panel-header">
            <span className="card-panel-title">Employee Quick Actions</span>
          </div>
          <div className="card-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              className="btn btn-secondary btn-block"
              style={{ justifyContent: 'space-between', padding: '14px 18px', textAlign: 'left' }}
              onClick={() => navigate('/employee/payroll')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CreditCard size={18} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight: 600 }}>My Payroll Records</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>View past slips and disbursement history</div>
                </div>
              </div>
              <ArrowRight size={16} />
            </button>

            <button
              className="btn btn-secondary btn-block"
              style={{ justifyContent: 'space-between', padding: '14px 18px', textAlign: 'left' }}
              onClick={() => navigate('/employee/attendance')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CalendarCheck size={18} color="#059669" />
                <div>
                  <div style={{ fontWeight: 600 }}>My Attendance History</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Track working days, leaves and attendance rate</div>
                </div>
              </div>
              <ArrowRight size={16} />
            </button>

            <button
              className="btn btn-secondary btn-block"
              style={{ justifyContent: 'space-between', padding: '14px 18px', textAlign: 'left' }}
              onClick={() => navigate('/employee/profile')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User size={18} color="#7c3aed" />
                <div>
                  <div style={{ fontWeight: 600 }}>Personal Profile & Bank Details</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official records and registered information</div>
                </div>
              </div>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
