import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import StatCard from '../../components/StatCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import {
  Users,
  Building2,
  Receipt,
  IndianRupee,
  Clock,
  UserCheck,
  UserX,
  PlusCircle,
  FileText,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentPayrolls, setRecentPayrolls] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, payrollRes, deptRes] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/payroll?limit=5'),
          api.get('/reports/department'),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (payrollRes.data.success) setRecentPayrolls(payrollRes.data.data.slice(0, 5));
        if (deptRes.data.success) setDepartments(deptRes.data.data);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) return <LoadingSpinner message="Loading dashboard metrics..." />;

  // Monthly trends mock/visual data for bar chart
  const monthlySalaryData = [
    { month: 'Jun', amount: 185000, height: 60 },
    { month: 'Jul', amount: 195000, height: 65 },
    { month: 'Aug', amount: 215000, height: 75 },
    { month: 'Sep', amount: stats?.totalSalaryPaid || 225000, height: 85 },
    { month: 'Oct (Est)', amount: 240000, height: 95 },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-box">
          <h1>Payroll Administrator Dashboard</h1>
          <p>Real-time corporate employee payroll overview, attendance status, and financial commitments.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => navigate('/admin/payroll')}>
            <PlusCircle size={16} />
            Generate Payroll
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/employees')}>
            <Users size={16} />
            Manage Employees
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="stats-grid">
        <StatCard
          label="Total Employees"
          value={stats?.totalEmployees || 0}
          subtitle={`${stats?.activeEmployees || 0} currently active`}
          icon={Users}
          color="#2563eb"
          iconBg="#eff6ff"
        />
        <StatCard
          label="Total Departments"
          value={stats?.totalDepartments || 0}
          subtitle="Active operational units"
          icon={Building2}
          color="#7c3aed"
          iconBg="#f5f3ff"
        />
        <StatCard
          label="Total Payrolls Generated"
          value={stats?.totalPayrollGenerated || 0}
          subtitle="Processed cycles"
          icon={Receipt}
          color="#059669"
          iconBg="#ecfdf5"
        />
        <StatCard
          label="Total Salary Disbursed"
          value={formatINR(stats?.totalSalaryPaid)}
          subtitle="Successfully paid to employees"
          icon={IndianRupee}
          color="#16a34a"
          iconBg="#f0fdf4"
        />
        <StatCard
          label="Pending Payrolls"
          value={stats?.pendingPayroll || 0}
          subtitle={`Awaiting release: ${formatINR(stats?.pendingAmount)}`}
          icon={Clock}
          color="#d97706"
          iconBg="#fffbeb"
        />
        <StatCard
          label="Present Employees"
          value={stats?.presentEmployees || 0}
          subtitle="Active attendance records"
          icon={UserCheck}
          color="#0284c7"
          iconBg="#f0f9ff"
        />
        <StatCard
          label="Absent Employees"
          value={stats?.absentEmployees || 0}
          subtitle="Recorded absent days"
          icon={UserX}
          color="#dc2626"
          iconBg="#fef2f2"
        />
      </div>

      {/* Charts & Breakdown Row */}
      <div className="dashboard-grid-2">
        <div className="card-panel">
          <div className="card-panel-header">
            <span className="card-panel-title">Monthly Payroll Disbursement Trend</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Financial Year 2026</span>
          </div>
          <div className="card-panel-body">
            <div className="bar-chart-container">
              {monthlySalaryData.map((item, idx) => (
                <div key={idx} className="bar-col">
                  <span className="bar-val-tooltip">{formatINR(item.amount)}</span>
                  <div className="bar-fill-track">
                    <div
                      className="bar-fill"
                      style={{
                        height: `${item.height}%`,
                        background: idx === 3 ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)' : undefined,
                      }}
                    ></div>
                  </div>
                  <span className="bar-col-label">{item.month}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', paddingTop: '8px' }}>
              <span>🔹 Blue: Historical Cycles</span>
              <span>🟢 Green: Current Disbursed (September 2026)</span>
            </div>
          </div>
        </div>

        <div className="card-panel">
          <div className="card-panel-header">
            <span className="card-panel-title">Department Distribution</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Headcount</span>
          </div>
          <div className="card-panel-body">
            <div className="dept-list-metric">
              {departments.map((dept, idx) => {
                const totalEmps = stats?.totalEmployees || 1;
                const percentage = Math.round((dept.employeeCount / totalEmps) * 100) || 0;
                return (
                  <div key={idx} className="dept-metric-row">
                    <div className="dept-metric-header">
                      <span>{dept.departmentName}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {dept.employeeCount} staff ({percentage}%)
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.max(percentage, 10)}%`,
                          backgroundColor:
                            idx % 3 === 0 ? 'var(--primary)' : idx % 3 === 1 ? '#059669' : '#7c3aed',
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payrolls Table Panel */}
      <div className="card-panel">
        <div className="card-panel-header">
          <span className="card-panel-title">Recent Payroll Generations</span>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => navigate('/admin/payroll')}
          >
            View All Payroll Records <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Payroll ID</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Period</th>
                <th>Gross Salary</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentPayrolls.length > 0 ? (
                recentPayrolls.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.payrollId}</td>
                    <td>
                      <div className="emp-name-strong">{p.employeeName}</div>
                      <div className="emp-id-sub">{p.employeeId}</div>
                    </td>
                    <td><StatusBadge status={p.department} type="department" /></td>
                    <td>{p.month} {p.year}</td>
                    <td>{formatINR(p.grossSalary)}</td>
                    <td style={{ color: 'var(--danger)' }}>-{formatINR(p.totalDeduction)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatINR(p.netSalary)}</td>
                    <td><StatusBadge status={p.paymentStatus} /></td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/admin/payroll/slip/${p._id || p.payrollId}`)}
                      >
                        <FileText size={13} />
                        Slip
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No recent payroll records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
