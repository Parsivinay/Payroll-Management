import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import Modal from '../../components/Modal.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import {
  CalendarCheck,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function AttendanceManagement() {
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchEmp, setSearchEmp] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('September');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    month: 'September',
    year: 2026,
    workingDays: 24,
    presentDays: 22,
    absentDays: 1,
    leaveDays: 1,
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [notification, setNotification] = useState({ text: '', type: '' });

  const fetchData = async () => {
    try {
      const [attRes, empRes] = await Promise.all([
        api.get(`/attendance?month=${selectedMonth}&year=${selectedYear}`),
        api.get('/employees'),
      ]);
      if (attRes.data.success) setAttendances(attRes.data.data);
      if (empRes.data.success) setEmployees(empRes.data.data);
    } catch (err) {
      console.error('Error fetching attendance', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const showNotify = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification({ text: '', type: '' }), 4000);
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      employeeId: employees[0]?.employeeId || 'EMP001',
      month: selectedMonth,
      year: Number(selectedYear),
      workingDays: 24,
      presentDays: 24,
      absentDays: 0,
      leaveDays: 0,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      employeeId: record.employeeId,
      month: record.month,
      year: record.year,
      workingDays: record.workingDays,
      presentDays: record.presentDays,
      absentDays: record.absentDays,
      leaveDays: record.leaveDays,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const w = Number(formData.workingDays);
    const p = Number(formData.presentDays);
    const a = Number(formData.absentDays || 0);
    const l = Number(formData.leaveDays || 0);

    if (w < 0 || p < 0 || a < 0 || l < 0) {
      setFormError('Attendance values cannot be negative numbers.');
      return;
    }

    if (p > w) {
      setFormError(`Present days (${p}) cannot exceed total working days (${w}).`);
      return;
    }

    if (p + a + l > w) {
      setFormError(`Total days (${p} present + ${a} absent + ${l} leave = ${p + a + l}) exceeds working days (${w}).`);
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingRecord) {
        const res = await api.put(`/attendance/${editingRecord._id}`, formData);
        if (res.data.success) {
          showNotify('Attendance record updated.');
          setIsModalOpen(false);
          await fetchData();
        }
      } else {
        const res = await api.post('/attendance', formData);
        if (res.data.success) {
          showNotify(`Attendance recorded for ${formData.employeeId}.`);
          setIsModalOpen(false);
          await fetchData();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit attendance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.delete(`/attendance/${deleteTarget._id}`);
      if (res.data.success) {
        showNotify('Attendance record deleted.');
        setDeleteTarget(null);
        await fetchData();
      }
    } catch (err) {
      showNotify(err.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  // Filtered attendance list
  const filtered = attendances.filter((a) => {
    const s = searchEmp.toLowerCase();
    return (
      !searchEmp ||
      a.employeeId.toLowerCase().includes(s) ||
      (a.employeeName && a.employeeName.toLowerCase().includes(s)) ||
      (a.department && a.department.toLowerCase().includes(s))
    );
  });

  if (loading) return <LoadingSpinner message="Loading attendance records..." />;

  return (
    <div>
      <div className="page-header">
        <div className="page-title-box">
          <h1>Attendance Management</h1>
          <p>Track monthly working schedules, attendance compliance, leaves, and absences.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            Record Attendance
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
            placeholder="Search by Employee ID or Name..."
            value={searchEmp}
            onChange={(e) => setSearchEmp(e.target.value)}
          />
        </div>

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
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      {/* Table */}
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
              <th>Leave Days</th>
              <th>Attendance Rate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((r) => {
                const percentage =
                  r.workingDays > 0 ? Math.round((r.presentDays / r.workingDays) * 100) : 0;
                return (
                  <tr key={r._id}>
                    <td>
                      <div className="emp-name-strong">{r.employeeName}</div>
                      <div className="emp-id-sub">{r.employeeId}</div>
                    </td>
                    <td>
                      <StatusBadge status={r.department} type="department" />
                    </td>
                    <td>
                      {r.month} {r.year}
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.workingDays}</td>
                    <td style={{ color: '#059669', fontWeight: 700 }}>{r.presentDays}</td>
                    <td style={{ color: '#dc2626', fontWeight: 600 }}>{r.absentDays}</td>
                    <td style={{ color: '#d97706', fontWeight: 600 }}>{r.leaveDays}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-track" style={{ width: '80px', height: '6px' }}>
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor:
                                percentage >= 90 ? '#10b981' : percentage >= 75 ? '#3b82f6' : '#ef4444',
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{percentage}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-icon-action"
                          title="Edit Attendance"
                          onClick={() => handleOpenEdit(r)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-icon-action danger"
                          title="Delete Attendance"
                          onClick={() => setDeleteTarget(r)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9}>
                  <div className="table-empty-state">
                    <CalendarCheck size={36} className="table-empty-icon" />
                    <h4>No attendance records for {selectedMonth} {selectedYear}</h4>
                    <p>Click "Record Attendance" above to log working days for staff.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record Attendance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? `Update Attendance - ${formData.employeeId}` : 'Log Monthly Attendance'}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="att-form"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editingRecord ? 'Update Record' : 'Save Attendance'}
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

        <form id="att-form" onSubmit={handleSubmit}>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">
                Select Employee <span className="required">*</span>
              </label>
              <select
                className="form-control"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                disabled={Boolean(editingRecord)}
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
                Month <span className="required">*</span>
              </label>
              <select
                className="form-control"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                disabled={Boolean(editingRecord)}
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
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                disabled={Boolean(editingRecord)}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                Total Working Days in Month <span className="required">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="31"
                className="form-control"
                value={formData.workingDays}
                onChange={(e) => setFormData({ ...formData, workingDays: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Present Days <span className="required">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="31"
                className="form-control"
                value={formData.presentDays}
                onChange={(e) => setFormData({ ...formData, presentDays: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Absent Days</label>
              <input
                type="number"
                min="0"
                max="31"
                className="form-control"
                value={formData.absentDays}
                onChange={(e) => setFormData({ ...formData, absentDays: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Approved Leave Days</label>
              <input
                type="number"
                min="0"
                max="31"
                className="form-control"
                value={formData.leaveDays}
                onChange={(e) => setFormData({ ...formData, leaveDays: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Attendance Record"
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
          Are you sure you want to delete attendance record for{' '}
          <strong>{deleteTarget?.employeeName || deleteTarget?.employeeId}</strong> for{' '}
          {deleteTarget?.month} {deleteTarget?.year}?
        </p>
      </Modal>
    </div>
  );
}
