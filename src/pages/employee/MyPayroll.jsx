import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { CreditCard, FileText, Search, Download } from 'lucide-react';

const MONTHS = [
  'All Months', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MyPayroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState('All Months');
  const [yearFilter, setYearFilter] = useState('2026');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyPayrolls = async () => {
      try {
        let url = `/payroll?year=${yearFilter}`;
        if (monthFilter !== 'All Months') {
          url += `&month=${monthFilter}`;
        }
        const res = await api.get(url);
        if (res.data.success) {
          setPayrolls(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching employee payroll', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPayrolls();
  }, [monthFilter, yearFilter]);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) return <LoadingSpinner message="Retrieving payroll and compensation statements..." />;

  return (
    <div>
      <div className="page-header">
        <div className="page-title-box">
          <h1>My Payroll & Compensation</h1>
          <p>Historical salary statements, allowances breakdown, tax deductions, and official payslips.</p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="filter-toolbar">
        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Filter Payroll Statements:</div>
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

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Payroll Reference</th>
              <th>Pay Period</th>
              <th>Basic Salary</th>
              <th>Gross Salary</th>
              <th>Total Deductions</th>
              <th>Net Disbursed</th>
              <th>Disbursement Status</th>
              <th>Payment Date</th>
              <th>Salary Slip</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.length > 0 ? (
              payrolls.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.payrollId}</td>
                  <td style={{ fontWeight: 700 }}>
                    {p.month} {p.year}
                  </td>
                  <td>{formatINR(p.basicSalary)}</td>
                  <td style={{ fontWeight: 600 }}>{formatINR(p.grossSalary)}</td>
                  <td style={{ color: 'var(--danger)', fontWeight: 600 }}>-{formatINR(p.totalDeduction)}</td>
                  <td style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>
                    {formatINR(p.netSalary)}
                  </td>
                  <td>
                    <StatusBadge status={p.paymentStatus} />
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {p.paymentDate ? String(p.paymentDate).split('T')[0] : 'Pending Release'}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/admin/payroll/slip/${p._id || p.payrollId}`)}
                    >
                      <FileText size={14} /> View & Print Slip
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '32px' }}>
                  <CreditCard size={36} className="table-empty-icon" />
                  <h4>No payroll records found for this period.</h4>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
