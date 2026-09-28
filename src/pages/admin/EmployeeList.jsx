import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import Modal from '../../components/Modal.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Building2,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  Briefcase,
  MapPin,
} from 'lucide-react';

const INITIAL_FORM = {
  employeeId: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  gender: 'Male',
  dateOfBirth: '',
  dateOfJoining: '',
  department: 'IT',
  designation: '',
  employmentType: 'Full-time',
  basicSalary: '',
  bankAccountNumber: '',
  profileImage: '',
  status: 'Active',
};

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View Details Modal
  const [viewEmployee, setViewEmployee] = useState(null);

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Notification message
  const [notification, setNotification] = useState({ text: '', type: '' });

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching employees', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching departments', err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchEmployees(), fetchDepartments()]);
      setLoading(false);
    };
    load();
  }, []);

  const showNotify = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification({ text: '', type: '' }), 4000);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      ...INITIAL_FORM,
      employeeId: `EMP${String(employees.length + 1).padStart(3, '0')}`,
      dateOfJoining: new Date().toISOString().split('T')[0],
      department: departments[0]?.departmentName || 'IT',
    });
    setFormError('');
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (emp) => {
    setEditingId(emp._id || emp.employeeId);
    setFormData({
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      address: emp.address,
      gender: emp.gender,
      dateOfBirth: emp.dateOfBirth ? String(emp.dateOfBirth).split('T')[0] : '',
      dateOfJoining: emp.dateOfJoining ? String(emp.dateOfJoining).split('T')[0] : '',
      department: emp.department,
      designation: emp.designation,
      employmentType: emp.employmentType,
      basicSalary: emp.basicSalary,
      bankAccountNumber: emp.bankAccountNumber,
      profileImage: emp.profileImage || '',
      status: emp.status,
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.designation.trim() || formData.basicSalary === '') {
      setFormError('Please fill all mandatory fields (Name, Email, Designation, Basic Salary).');
      return;
    }

    if (Number(formData.basicSalary) < 0) {
      setFormError('Basic salary cannot be a negative amount.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        const res = await api.put(`/employees/${editingId}`, formData);
        if (res.data.success) {
          showNotify('Employee information successfully updated.');
          setIsFormOpen(false);
          await fetchEmployees();
        }
      } else {
        const res = await api.post('/employees', formData);
        if (res.data.success) {
          showNotify(`New employee ${formData.name} (${formData.employeeId}) created successfully.`);
          setIsFormOpen(false);
          await fetchEmployees();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed. Check data inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.delete(`/employees/${deleteTarget._id || deleteTarget.employeeId}`);
      if (res.data.success) {
        showNotify(`Employee ${deleteTarget.name} has been deleted.`);
        setDeleteTarget(null);
        await fetchEmployees();
      }
    } catch (err) {
      showNotify(err.response?.data?.message || 'Failed to delete employee.', 'danger');
    }
  };

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      emp.employeeId.toLowerCase().includes(s) ||
      emp.name.toLowerCase().includes(s) ||
      emp.email.toLowerCase().includes(s) ||
      emp.designation.toLowerCase().includes(s) ||
      emp.department.toLowerCase().includes(s);

    const matchesDept = !deptFilter || emp.department.toLowerCase() === deptFilter.toLowerCase();
    const matchesStatus = !statusFilter || emp.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesDept && matchesStatus;
  });

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) return <LoadingSpinner message="Loading employee roster..." />;

  return (
    <div>
      <div className="page-header">
        <div className="page-title-box">
          <h1>Employee Management</h1>
          <p>Maintain staff records, designations, compensation grades, and access statuses.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            Add New Employee
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
            placeholder="Search by Employee ID, Name, Email, Designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-selects-group">
          <select
            className="filter-select"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d.departmentName}>
                {d.departmentName}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Employee Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee Details</th>
              <th>Contact Info</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Employment Type</th>
              <th>Basic Salary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <tr key={emp._id}>
                  <td>
                    <div className="emp-table-cell">
                      {emp.profileImage ? (
                        <img src={emp.profileImage} alt={emp.name} className="emp-table-avatar" />
                      ) : (
                        <div className="emp-table-avatar">{emp.name.charAt(0)}</div>
                      )}
                      <div className="emp-table-info">
                        <span className="emp-name-strong">{emp.name}</span>
                        <span className="emp-id-sub">{emp.employeeId}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem' }}>{emp.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.phone}</div>
                  </td>
                  <td>
                    <StatusBadge status={emp.department} type="department" />
                  </td>
                  <td style={{ fontWeight: 500 }}>{emp.designation}</td>
                  <td>{emp.employmentType}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatINR(emp.basicSalary)}</td>
                  <td>
                    <StatusBadge status={emp.status} />
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-icon-action"
                        title="View Full Profile"
                        onClick={() => setViewEmployee(emp)}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        className="btn-icon-action"
                        title="Edit Employee"
                        onClick={() => handleOpenEdit(emp)}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn-icon-action danger"
                        title="Delete Employee"
                        onClick={() => setDeleteTarget(emp)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>
                  <div className="table-empty-state">
                    <Users size={36} className="table-empty-icon" />
                    <h4>No employees found</h4>
                    <p>Try modifying your search or department filter criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? `Edit Employee - ${formData.employeeId}` : 'Add New Employee'}
        size="lg"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsFormOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="employee-form"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editingId ? 'Update Employee' : 'Add Employee'}
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

        <form id="employee-form" onSubmit={handleFormSubmit}>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">
                Employee ID <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                disabled={Boolean(editingId)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Rahul Kumar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-control"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-control"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">
                Department <span className="required">*</span>
              </label>
              <select
                className="form-control"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {departments.map((d) => (
                  <option key={d._id} value={d.departmentName}>
                    {d.departmentName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Designation <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Senior Software Engineer"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Employment Type</label>
              <select
                className="form-control"
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">
                Basic Monthly Salary (₹) <span className="required">*</span>
              </label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="e.g. 50000"
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bank Account Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 918237461928"
                value={formData.bankAccountNumber}
                onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Joining</label>
              <input
                type="date"
                className="form-control"
                value={formData.dateOfJoining}
                onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Profile Image URL</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://images.unsplash.com/..."
                value={formData.profileImage}
                onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Full residential address..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* View Employee Details Modal */}
      <Modal
        isOpen={Boolean(viewEmployee)}
        onClose={() => setViewEmployee(null)}
        title="Employee Master Record"
        size="lg"
        footer={
          <button className="btn btn-secondary" onClick={() => setViewEmployee(null)}>
            Close
          </button>
        }
      >
        {viewEmployee && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid var(--border-color)' }}>
              {viewEmployee.profileImage ? (
                <img
                  src={viewEmployee.profileImage}
                  alt={viewEmployee.name}
                  style={{ width: '72px', height: '72px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                  }}
                >
                  {viewEmployee.name.charAt(0)}
                </div>
              )}
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{viewEmployee.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)' }}>
                    {viewEmployee.employeeId}
                  </span>
                  <span>•</span>
                  <span>{viewEmployee.designation}</span>
                  <span>•</span>
                  <StatusBadge status={viewEmployee.status} />
                </div>
              </div>
            </div>

            <div className="slip-info-grid">
              <div className="slip-info-row">
                <span className="slip-info-label">Department:</span>
                <span className="slip-info-val">{viewEmployee.department}</span>
              </div>
              <div className="slip-info-row">
                <span className="slip-info-label">Employment Type:</span>
                <span className="slip-info-val">{viewEmployee.employmentType}</span>
              </div>
              <div className="slip-info-row">
                <span className="slip-info-label">Email:</span>
                <span className="slip-info-val">{viewEmployee.email}</span>
              </div>
              <div className="slip-info-row">
                <span className="slip-info-label">Phone:</span>
                <span className="slip-info-val">{viewEmployee.phone}</span>
              </div>
              <div className="slip-info-row">
                <span className="slip-info-label">Date of Joining:</span>
                <span className="slip-info-val">
                  {viewEmployee.dateOfJoining ? String(viewEmployee.dateOfJoining).split('T')[0] : 'N/A'}
                </span>
              </div>
              <div className="slip-info-row">
                <span className="slip-info-label">Date of Birth:</span>
                <span className="slip-info-val">
                  {viewEmployee.dateOfBirth ? String(viewEmployee.dateOfBirth).split('T')[0] : 'N/A'}
                </span>
              </div>
              <div className="slip-info-row">
                <span className="slip-info-label">Gender:</span>
                <span className="slip-info-val">{viewEmployee.gender}</span>
              </div>
              <div className="slip-info-row">
                <span className="slip-info-label">Bank Account:</span>
                <span className="slip-info-val" style={{ fontFamily: 'var(--font-mono)' }}>
                  {viewEmployee.bankAccountNumber}
                </span>
              </div>
              <div className="slip-info-row" style={{ gridColumn: 'span 2' }}>
                <span className="slip-info-label">Base Salary:</span>
                <span className="slip-info-val" style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 800 }}>
                  {formatINR(viewEmployee.basicSalary)} / month
                </span>
              </div>
              <div className="slip-info-row" style={{ gridColumn: 'span 2' }}>
                <span className="slip-info-label">Address:</span>
                <span className="slip-info-val">{viewEmployee.address}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Employee Deletion"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm}>
              Permanently Delete
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
          Are you sure you want to delete employee <strong>{deleteTarget?.name}</strong> (
          {deleteTarget?.employeeId})?
        </p>
        <p style={{ color: 'var(--danger)', fontSize: '0.82rem', marginTop: '8px' }}>
          ⚠️ This action will also purge associated attendance and payroll records for this employee.
        </p>
      </Modal>
    </div>
  );
}
