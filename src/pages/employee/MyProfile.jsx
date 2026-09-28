import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  CreditCard,
  MapPin,
  ShieldAlert,
} from 'lucide-react';

export default function MyProfile() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user?.employeeId) {
          const res = await api.get(`/employees/${user.employeeId}`);
          if (res.data.success) {
            setEmployee(res.data.data);
          }
        } else if (user?.employee) {
          setEmployee(user.employee);
        }
      } catch (err) {
        console.error('Error fetching employee profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) return <LoadingSpinner message="Loading employee profile..." />;

  const emp = employee || user?.employee || {};

  return (
    <div>
      <div className="page-header">
        <div className="page-title-box">
          <h1>My Employee Profile</h1>
          <p>Official employment dossier, corporate credentials, and compensation tier.</p>
        </div>
      </div>

      <div className="alert alert-info">
        <ShieldAlert size={18} style={{ flexShrink: 0 }} />
        <span>
          Policy Notice: Salary grades and department assignments are centrally managed by the HR & Payroll
          Administrator. To request revisions to personal details or banking coordinates, please contact HR.
        </span>
      </div>

      <div className="card-panel" style={{ marginBottom: '24px' }}>
        <div className="card-panel-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {emp.profileImage ? (
              <img
                src={emp.profileImage}
                alt={emp.name || user?.username}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: 'var(--radius-full)',
                  objectFit: 'cover',
                  boxShadow: 'var(--shadow-md)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.2rem',
                  fontWeight: 800,
                }}
              >
                {(emp.name || user?.username || 'E').charAt(0)}
              </div>
            )}

            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {emp.name || user?.username}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                  {emp.employeeId || user?.employeeId}
                </span>
                <span>•</span>
                <span style={{ fontWeight: 600 }}>{emp.designation || 'Staff'}</span>
                <span>•</span>
                <StatusBadge status={emp.status || 'Active'} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="card-panel">
        <div className="card-panel-header">
          <span className="card-panel-title">Employment & Contact Records</span>
        </div>
        <div className="card-panel-body">
          <div className="slip-info-grid" style={{ background: '#fff', border: 'none', padding: 0 }}>
            <div className="slip-info-row">
              <span className="slip-info-label">Full Name:</span>
              <span className="slip-info-val">{emp.name || user?.username}</span>
            </div>
            <div className="slip-info-row">
              <span className="slip-info-label">Employee ID:</span>
              <span className="slip-info-val" style={{ fontFamily: 'var(--font-mono)' }}>
                {emp.employeeId || user?.employeeId}
              </span>
            </div>
            <div className="slip-info-row">
              <span className="slip-info-label">Department:</span>
              <span className="slip-info-val">{emp.department || 'IT'}</span>
            </div>
            <div className="slip-info-row">
              <span className="slip-info-label">Designation:</span>
              <span className="slip-info-val">{emp.designation || 'Staff'}</span>
            </div>
            <div className="slip-info-row">
              <span className="slip-info-label">Official Email:</span>
              <span className="slip-info-val">{emp.email || user?.email}</span>
            </div>
            <div className="slip-info-row">
              <span className="slip-info-label">Contact Phone:</span>
              <span className="slip-info-val">{emp.phone || 'N/A'}</span>
            </div>
            <div className="slip-info-row">
              <span className="slip-info-label">Employment Type:</span>
              <span className="slip-info-val">{emp.employmentType || 'Full-time'}</span>
            </div>
            <div className="slip-info-row">
              <span className="slip-info-label">Date of Joining:</span>
              <span className="slip-info-val">
                {emp.dateOfJoining ? String(emp.dateOfJoining).split('T')[0] : 'N/A'}
              </span>
            </div>
            <div className="slip-info-row">
              <span className="slip-info-label">Date of Birth:</span>
              <span className="slip-info-val">
                {emp.dateOfBirth ? String(emp.dateOfBirth).split('T')[0] : 'N/A'}
              </span>
            </div>
            <div className="slip-info-row">
              <span className="slip-info-label">Gender:</span>
              <span className="slip-info-val">{emp.gender || 'N/A'}</span>
            </div>
            <div className="slip-info-row">
              <span className="slip-info-label">Registered Bank Account:</span>
              <span className="slip-info-val" style={{ fontFamily: 'var(--font-mono)' }}>
                {emp.bankAccountNumber || '••••••••••••'}
              </span>
            </div>
            <div className="slip-info-row">
              <span className="slip-info-label">Current Basic Salary:</span>
              <span className="slip-info-val" style={{ fontWeight: 800, color: 'var(--primary)' }}>
                {formatINR(emp.basicSalary)} / month
              </span>
            </div>
            <div className="slip-info-row" style={{ gridColumn: 'span 2' }}>
              <span className="slip-info-label">Residential Address:</span>
              <span className="slip-info-val">{emp.address || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
