import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import {
  FileBarChart,
  Download,
  Building2,
  CalendarCheck,
  Receipt,
  Users,
  Printer,
  TrendingUp,
} from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('payroll');
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState('September');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Reports data
  const [payrollReport, setPayrollReport] = useState({ summary: {}, data: [] });
  const [deptReport, setDeptReport] = useState([]);
  const [attendanceReport, setAttendanceReport] = useState({ summary: {}, data: [] });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [payRes, deptRes, attRes] = await Promise.all([
        api.get(`/reports/payroll?month=${selectedMonth}&year=${selectedYear}`),
        api.get('/reports/department'),
        api.get(`/reports/attendance?month=${selectedMonth}&year=${selectedYear}`),
      ]);

      if (payRes.data.success) setPayrollReport(payRes.data);
      if (deptRes.data.success) setDeptReport(deptRes.data.data);
      if (attRes.data.success) setAttendanceReport(attRes.data);
    } catch (err) {
      console.error('Error fetching reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedMonth, selectedYear]);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // CSV Export utility
  const exportToCSV = (data, filename) => {
    if (!data || !data.length) return;
    const headers = Object.keys(data[0]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...data.map((row) =>
          headers
            .map((field) => {
              const val = row[field] !== undefined && row[field] !== null ? String(row[field]) : '';
              return `"${val.replace(/"/g, '""')}"`;
            })
            .join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCurrent = () => {
    if (activeTab === 'payroll') {
      const exportData = payrollReport.data.map((p) => ({
        PayrollID: p.payrollId,
        EmployeeID: p.employeeId,
        EmployeeName: p.employeeName,
        Department: p.department,
        Month: p.month,
        Year: p.year,
        BasicSalary: p.basicSalary,
        GrossSalary: p.grossSalary,
        TotalDeductions: p.totalDeduction,
        NetSalary: p.netSalary,
        PaymentStatus: p.paymentStatus,
        PaymentDate: p.paymentDate || 'N/A',
      }));
      exportToCSV(exportData, `Payroll_Report_${selectedMonth}_${selectedYear}`);
    } else if (activeTab === 'department') {
      exportToCSV(deptReport, 'Department_Salary_Budget_Report');
    } else if (activeTab === 'attendance') {
      const exportData = attendanceReport.data.map((a) => ({
        EmployeeID: a.employeeId,
        EmployeeName: a.employeeName,
        Department: a.department,
        Month: a.month,
        Year: a.year,
        WorkingDays: a.workingDays,
        PresentDays: a.presentDays,
        AbsentDays: a.absentDays,
        LeaveDays: a.leaveDays,
        AttendancePercent: `${a.attendancePercentage}%`,
      }));
      exportToCSV(exportData, `Attendance_Report_${selectedMonth}_${selectedYear}`);
    }
  };

  if (loading) return <LoadingSpinner message="Aggregating corporate reports..." />;

  return (
    <div>
      <div className="page-header">
        <div className="page-title-box">
          <h1>Payroll & HR Reports</h1>
          <p>Analytical summaries, cost centers, attendance metrics, and exportable data sheets.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={16} />
            Print Report
          </button>
          <button className="btn btn-primary" onClick={handleExportCurrent}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          className={`btn ${activeTab === 'payroll' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('payroll')}
        >
          <Receipt size={14} /> Monthly Payroll Report
        </button>
        <button
          className={`btn ${activeTab === 'department' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('department')}
        >
          <Building2 size={14} /> Department Cost Report
        </button>
        <button
          className={`btn ${activeTab === 'attendance' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('attendance')}
        >
          <CalendarCheck size={14} /> Attendance Compliance
        </button>
      </div>

      {/* Month/Year selector toolbar */}
      {activeTab !== 'department' && (
        <div className="filter-toolbar no-print" style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Reporting Period:</div>
          <div className="filter-selects-group">
            <select
              className="filter-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              className="filter-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>
      )}

      {/* TAB 1: PAYROLL REPORT */}
      {activeTab === 'payroll' && (
        <div>
          {/* Summary Row */}
          <div className="stats-grid" style={{ marginBottom: '20px' }}>
            <div className="stat-card" style={{ '--card-color': '#2563eb' }}>
              <div className="stat-content">
                <span className="stat-label">Total Gross Payout</span>
                <span className="stat-value">{formatINR(payrollReport.summary.totalGross)}</span>
                <span className="stat-subtitle">{payrollReport.summary.totalRecords} employees processed</span>
              </div>
            </div>
            <div className="stat-card" style={{ '--card-color': '#dc2626' }}>
              <div className="stat-content">
                <span className="stat-label">Total Withheld Deductions</span>
                <span className="stat-value" style={{ color: '#dc2626' }}>
                  {formatINR(payrollReport.summary.totalDeductions)}
                </span>
                <span className="stat-subtitle">PF, TDS & Adjustments</span>
              </div>
            </div>
            <div className="stat-card" style={{ '--card-color': '#16a34a' }}>
              <div className="stat-content">
                <span className="stat-label">Net Salary Disbursed</span>
                <span className="stat-value" style={{ color: '#16a34a' }}>
                  {formatINR(payrollReport.summary.totalNet)}
                </span>
                <span className="stat-subtitle">
                  {payrollReport.summary.paidCount} Paid • {payrollReport.summary.pendingCount} Pending
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payroll ID</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Basic Salary</th>
                  <th>Gross Salary</th>
                  <th>Deductions</th>
                  <th>Net Payout</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payrollReport.data.length > 0 ? (
                  payrollReport.data.map((p) => (
                    <tr key={p._id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.payrollId}</td>
                      <td>
                        <div className="emp-name-strong">{p.employeeName}</div>
                        <div className="emp-id-sub">{p.employeeId}</div>
                      </td>
                      <td>
                        <StatusBadge status={p.department} type="department" />
                      </td>
                      <td>{formatINR(p.basicSalary)}</td>
                      <td>{formatINR(p.grossSalary)}</td>
                      <td style={{ color: '#dc2626' }}>-{formatINR(p.totalDeduction)}</td>
                      <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{formatINR(p.netSalary)}</td>
                      <td>
                        <StatusBadge status={p.paymentStatus} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>
                      No payroll records found for {selectedMonth} {selectedYear}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENT REPORT */}
      {activeTab === 'department' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Total Headcount</th>
                <th>Active Employees</th>
                <th>Monthly Base Budget</th>
                <th>Actual Disbursed Salary</th>
              </tr>
            </thead>
            <tbody>
              {deptReport.map((d, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700 }}>{d.departmentName}</td>
                  <td>{d.employeeCount} staff</td>
                  <td>
                    <span className="badge badge-paid">{d.activeCount} active</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatINR(d.totalBasicBudget)}</td>
                  <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{formatINR(d.totalSalaryDisbursed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: ATTENDANCE REPORT */}
      {activeTab === 'attendance' && (
        <div>
          <div className="stats-grid" style={{ marginBottom: '20px' }}>
            <div className="stat-card" style={{ '--card-color': '#0ea5e9' }}>
              <div className="stat-content">
                <span className="stat-label">Average Attendance</span>
                <span className="stat-value">{attendanceReport.summary.averageAttendance || 0}%</span>
                <span className="stat-subtitle">Across all active staff</span>
              </div>
            </div>
            <div className="stat-card" style={{ '--card-color': '#10b981' }}>
              <div className="stat-content">
                <span className="stat-label">Total Present Mandays</span>
                <span className="stat-value">{attendanceReport.summary.totalPresentDays || 0}</span>
                <span className="stat-subtitle">{attendanceReport.summary.totalRecords || 0} staff logged</span>
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Period</th>
                  <th>Working Days</th>
                  <th>Present Days</th>
                  <th>Absent Days</th>
                  <th>Leaves</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {attendanceReport.data.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <div className="emp-name-strong">{a.employeeName}</div>
                      <div className="emp-id-sub">{a.employeeId}</div>
                    </td>
                    <td>
                      <StatusBadge status={a.department} type="department" />
                    </td>
                    <td>
                      {a.month} {a.year}
                    </td>
                    <td>{a.workingDays}</td>
                    <td style={{ color: '#059669', fontWeight: 700 }}>{a.presentDays}</td>
                    <td style={{ color: '#dc2626' }}>{a.absentDays}</td>
                    <td style={{ color: '#d97706' }}>{a.leaveDays}</td>
                    <td style={{ fontWeight: 700 }}>{a.attendancePercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
