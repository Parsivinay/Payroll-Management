import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import Modal from '../../components/Modal.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  FileText,
  CheckCircle,
  AlertCircle,
  Trash2,
  Check,
  RefreshCw,
  Calculator,
} from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PayrollManagement() {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Generate Modal
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [calcForm, setCalcForm] = useState({
    employeeId: '',
    month: 'September',
    year: 2026,
    basicSalary: 30000,
    hraPercent: 20,
    hra: 6000,
    transportAllowance: 2000,
    otherAllowance: 1000,
    pfPercent: 10,
    pf: 3000,
    taxPercent: 5,
    tax: 1500,
    otherDeduction: 500,
    paymentStatus: 'Pending',
    paymentDate: '',
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [notification, setNotification] = useState({ text: '', type: '' });

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [payRes, empRes, deptRes] = await Promise.all([
        api.get('/payroll'),
        api.get('/employees'),
        api.get('/departments'),
      ]);
      if (payRes.data.success) setPayrolls(payRes.data.data);
      if (empRes.data.success) setEmployees(empRes.data.data);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
    } catch (err) {
      console.error('Error fetching payroll', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotify = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification({ text: '', type: '' }), 4000);
  };

  // Recalculate salary preview values
  const recalculateForm = (basic, hraPct, trans, otherA, pfPct, taxPct, otherD) => {
    const b = Math.max(0, Number(basic) || 0);
    const hraVal = Math.round((b * (Number(hraPct) || 0)) / 100);
    const transVal = Math.max(0, Number(trans) || 0);
    const otherAVal = Math.max(0, Number(otherA) || 0);
    const gross = b + hraVal + transVal + otherAVal;

    const pfVal = Math.round((b * (Number(pfPct) || 0)) / 100);
    const taxVal = Math.round((gross * (Number(taxPct) || 0)) / 100);
    const otherDVal = Math.max(0, Number(otherD) || 0);
    const totalDed = pfVal + taxVal + otherDVal;
    const net = Math.max(0, gross - totalDed);

    return {
      basicSalary: b,
      hra: hraVal,
      transportAllowance: transVal,
      otherAllowance: otherAVal,
      grossSalary: gross,
      pf: pfVal,
      tax: taxVal,
      otherDeduction: otherDVal,
      totalDeduction: totalDed,
      netSalary: net,
    };
  };

  const handleOpenGenerate = () => {
    const defaultEmp = employees[0];
    const basic = defaultEmp ? defaultEmp.basicSalary : 30000;
    const preview = recalculateForm(basic, 20, 2000, 1000, 10, 5, 500);

    setSelectedEmp(defaultEmp || null);
    setCalcForm({
      employeeId: defaultEmp?.employeeId || '',
      month: 'September',
      year: 2026,
      hraPercent: 20,
      pfPercent: 10,
      taxPercent: 5,
      paymentStatus: 'Pending',
      paymentDate: '',
      ...preview,
    });
    setFormError('');
    setIsGenerateOpen(true);
  };

  const handleSelectEmployee = (empId) => {
    const emp = employees.find((e) => e.employeeId === empId);
    setSelectedEmp(emp || null);
    const basic = emp ? emp.basicSalary : 30000;
    const preview = recalculateForm(
      basic,
      calcForm.hraPercent,
      calcForm.transportAllowance,
      calcForm.otherAllowance,
      calcForm.pfPercent,
      calcForm.taxPercent,
      calcForm.otherDeduction
    );
    setCalcForm((prev) => ({
      ...prev,
      employeeId: empId,
      ...preview,
    }));
  };

  const handleCalcFieldChange = (field, val) => {
    const updated = { ...calcForm, [field]: val };
    const preview = recalculateForm(
      field === 'basicSalary' ? val : updated.basicSalary,
      field === 'hraPercent' ? val : updated.hraPercent,
      field === 'transportAllowance' ? val : updated.transportAllowance,
      field === 'otherAllowance' ? val : updated.otherAllowance,
      field === 'pfPercent' ? val : updated.pfPercent,
      field === 'taxPercent' ? val : updated.taxPercent,
      field === 'otherDeduction' ? val : updated.otherDeduction
    );
    setCalcForm({ ...updated, ...preview });
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!calcForm.employeeId) {
      setFormError('Please select an employee.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/payroll/generate', calcForm);
      if (res.data.success) {
        showNotify(`Payroll generated successfully for ${calcForm.employeeId} (${calcForm.month} ${calcForm.year})`);
        setIsGenerateOpen(false);
        await fetchData();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to generate payroll.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePaymentStatus = async (payroll) => {
    try {
      const nextStatus = payroll.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
      const paymentDate = nextStatus === 'Paid' ? new Date().toISOString().split('T')[0] : null;
      const res = await api.put(`/payroll/${payroll._id || payroll.payrollId}`, {
        paymentStatus: nextStatus,
        paymentDate,
      });
      if (res.data.success) {
        showNotify(`Payroll marked as ${nextStatus}.`);
        await fetchData();
      }
    } catch (err) {
      showNotify('Failed to update status', 'danger');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.delete(`/payroll/${deleteTarget._id || deleteTarget.payrollId}`);
      if (res.data.success) {
        showNotify('Payroll record removed.');
        setDeleteTarget(null);
        await fetchData();
      }
    } catch (err) {
      showNotify('Delete failed', 'danger');
    }
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Filtered
  const filteredPayrolls = payrolls.filter((p) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      p.payrollId.toLowerCase().includes(s) ||
      p.employeeId.toLowerCase().includes(s) ||
      (p.employeeName && p.employeeName.toLowerCase().includes(s));

    const matchesDept = !deptFilter || (p.department && p.department.toLowerCase() === deptFilter.toLowerCase());
    const matchesStatus = !statusFilter || p.paymentStatus.toLowerCase() === statusFilter.toLowerCase();
    const matchesMonth = !monthFilter || p.month.toLowerCase() === monthFilter.toLowerCase();
    const matchesYear = !yearFilter || String(p.year) === String(yearFilter);

    return matchesSearch && matchesDept && matchesStatus && matchesMonth && matchesYear;
  });

  if (loading) return <LoadingSpinner message="Loading payroll records..." />;

  return (
    <div>
      <div className="page-header">
        <div className="page-title-box">
          <h1>Payroll Management</h1>
          <p>Automate monthly salary computations, allowance configurations, deductions, and payment disbursement.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleOpenGenerate}>
            <Calculator size={16} />
            Generate Monthly Payroll
          </button>
        </div>
      </div>

      {notification.text && (
        <div className={`alert alert-${notification.type === 'danger' ? 'danger' : 'success'}`}>
          {notification.type === 'danger' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="search-input-box">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search Payroll ID, Employee Name, Employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-selects-group">
          <select className="filter-select" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d.departmentName}>
                {d.departmentName}
              </option>
            ))}
          </select>

          <select className="filter-select" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
            <option value="">All Months</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select className="filter-select" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
            <option value="">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>

          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Payroll ID</th>
              <th>Employee</th>
              <th>Department</th>
              <th>Period</th>
              <th>Basic</th>
              <th>Gross Salary</th>
              <th>Total Deductions</th>
              <th>Net Salary</th>
              <th>Payment Status</th>
              <th>Disbursed Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayrolls.length > 0 ? (
              filteredPayrolls.map((p) => (
                <tr key={p._id || p.payrollId}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.payrollId}</td>
                  <td>
                    <div className="emp-name-strong">{p.employeeName}</div>
                    <div className="emp-id-sub">{p.employeeId}</div>
                  </td>
                  <td>
                    <StatusBadge status={p.department} type="department" />
                  </td>
                  <td>
                    {p.month} {p.year}
                  </td>
                  <td>{formatINR(p.basicSalary)}</td>
                  <td style={{ fontWeight: 600 }}>{formatINR(p.grossSalary)}</td>
                  <td style={{ color: 'var(--danger)', fontWeight: 600 }}>-{formatINR(p.totalDeduction)}</td>
                  <td style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
                    {formatINR(p.netSalary)}
                  </td>
                  <td>
                    <button
                      onClick={() => handleTogglePaymentStatus(p)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                      title="Click to toggle Paid/Pending"
                    >
                      <StatusBadge status={p.paymentStatus} />
                    </button>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {p.paymentDate ? String(p.paymentDate).split('T')[0] : '—'}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-icon-action"
                        title="View & Print Salary Slip"
                        onClick={() => navigate(`/admin/payroll/slip/${p._id || p.payrollId}`)}
                      >
                        <FileText size={15} />
                      </button>
                      <button
                        className="btn-icon-action danger"
                        title="Delete Payroll Record"
                        onClick={() => setDeleteTarget(p)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11}>
                  <div className="table-empty-state">
                    <CreditCard size={36} className="table-empty-icon" />
                    <h4>No payroll records matched your criteria</h4>
                    <p>Adjust filters or click "Generate Monthly Payroll" to compute new payouts.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Generate Payroll Modal with Live Calculation Engine */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Automated Payroll Calculator & Generator"
        size="lg"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsGenerateOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="generate-payroll-form"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Computing & Generating...' : 'Generate & Confirm Payroll'}
            </button>
          </>
        }
      >
        {formError && (
          <div className="alert alert-danger">
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        <form id="generate-payroll-form" onSubmit={handleGenerateSubmit}>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">
                Select Employee <span className="required">*</span>
              </label>
              <select
                className="form-control"
                value={calcForm.employeeId}
                onChange={(e) => handleSelectEmployee(e.target.value)}
                required
              >
                {employees.map((e) => (
                  <option key={e._id} value={e.employeeId}>
                    {e.employeeId} - {e.name} ({e.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Payroll Month <span className="required">*</span>
              </label>
              <select
                className="form-control"
                value={calcForm.month}
                onChange={(e) => setCalcForm({ ...calcForm, month: e.target.value })}
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Year <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                value={calcForm.year}
                onChange={(e) => setCalcForm({ ...calcForm, year: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
            {/* Left: Earnings Components */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e40af', marginBottom: '12px' }}>
                EARNINGS COMPONENTS
              </h4>

              <div className="form-group">
                <label className="form-label">Basic Salary (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={calcForm.basicSalary}
                  onChange={(e) => handleCalcFieldChange('basicSalary', e.target.value)}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">HRA % (Default 20%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-control"
                    value={calcForm.hraPercent}
                    onChange={(e) => handleCalcFieldChange('hraPercent', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">HRA Computed</label>
                  <input type="text" className="form-control" value={formatINR(calcForm.hra)} disabled />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Transport Allowance (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={calcForm.transportAllowance}
                  onChange={(e) => handleCalcFieldChange('transportAllowance', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Other Allowance (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={calcForm.otherAllowance}
                  onChange={(e) => handleCalcFieldChange('otherAllowance', e.target.value)}
                />
              </div>
            </div>

            {/* Right: Deductions Components */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#991b1b', marginBottom: '12px' }}>
                DEDUCTION COMPONENTS
              </h4>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">PF % (Default 10%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-control"
                    value={calcForm.pfPercent}
                    onChange={(e) => handleCalcFieldChange('pfPercent', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">PF Computed</label>
                  <input type="text" className="form-control" value={formatINR(calcForm.pf)} disabled />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Income Tax % (Default 5%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-control"
                    value={calcForm.taxPercent}
                    onChange={(e) => handleCalcFieldChange('taxPercent', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tax Computed</label>
                  <input type="text" className="form-control" value={formatINR(calcForm.tax)} disabled />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Other Deductions (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={calcForm.otherDeduction}
                  onChange={(e) => handleCalcFieldChange('otherDeduction', e.target.value)}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Disbursement Status</label>
                  <select
                    className="form-control"
                    value={calcForm.paymentStatus}
                    onChange={(e) => setCalcForm({ ...calcForm, paymentStatus: e.target.value })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Disbursement Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={calcForm.paymentDate}
                    onChange={(e) => setCalcForm({ ...calcForm, paymentDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Automatic Calculation Summary Callout */}
          <div className="calc-summary-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Calculation Formula Preview:</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Gross = Basic + HRA + Transport + Other | Net = Gross - Deductions
              </span>
            </div>
            <div className="calc-breakdown-row">
              <span>Gross Earnings:</span>
              <strong style={{ color: '#16a34a' }}>{formatINR(calcForm.grossSalary)}</strong>
            </div>
            <div className="calc-breakdown-row">
              <span>Total Deductions:</span>
              <strong style={{ color: '#dc2626' }}>-{formatINR(calcForm.totalDeduction)}</strong>
            </div>
            <div className="calc-breakdown-row total">
              <span>ESTIMATED NET SALARY PAYOUT:</span>
              <span>{formatINR(calcForm.netSalary)}</span>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Payroll Deletion"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete Record
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to delete payroll record <strong>{deleteTarget?.payrollId}</strong> for{' '}
          {deleteTarget?.employeeName} ({deleteTarget?.month} {deleteTarget?.year})?
        </p>
      </Modal>
    </div>
  );
}
