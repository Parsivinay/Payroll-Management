import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import Modal from '../../components/Modal.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Briefcase,
  Users,
} from 'lucide-react';

export default function DepartmentList() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ departmentName: '', description: '', status: 'Active' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [notification, setNotification] = useState({ text: '', type: '' });

  const fetchData = async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        api.get('/departments'),
        api.get('/employees'),
      ]);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (empRes.data.success) setEmployees(empRes.data.data);
    } catch (err) {
      console.error('Error fetching departments', err);
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

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({ departmentName: '', description: '', status: 'Active' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      departmentName: dept.departmentName,
      description: dept.description || '',
      status: dept.status,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.departmentName.trim()) {
      setFormError('Department name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingDept) {
        const res = await api.put(`/departments/${editingDept._id}`, formData);
        if (res.data.success) {
          showNotify('Department updated successfully.');
          setIsModalOpen(false);
          await fetchData();
        }
      } else {
        const res = await api.post('/departments', formData);
        if (res.data.success) {
          showNotify(`Department ${formData.departmentName} created successfully.`);
          setIsModalOpen(false);
          await fetchData();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.delete(`/departments/${deleteTarget._id}`);
      if (res.data.success) {
        showNotify(`Department ${deleteTarget.departmentName} deleted.`);
        setDeleteTarget(null);
        await fetchData();
      }
    } catch (err) {
      showNotify(err.response?.data?.message || 'Error deleting department.', 'danger');
    }
  };

  if (loading) return <LoadingSpinner message="Loading departments..." />;

  return (
    <div>
      <div className="page-header">
        <div className="page-title-box">
          <h1>Department Management</h1>
          <p>Organize organizational divisions, teams, operational structures and assignments.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            Add Department
          </button>
        </div>
      </div>

      {notification.text && (
        <div className={`alert alert-${notification.type === 'danger' ? 'danger' : 'success'}`}>
          {notification.type === 'danger' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{notification.text}</span>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Description</th>
              <th>Assigned Staff</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.length > 0 ? (
              departments.map((d) => {
                const count = employees.filter(
                  (e) => e.department.toLowerCase() === d.departmentName.toLowerCase()
                ).length;
                return (
                  <tr key={d._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Building2 size={18} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{d.departmentName}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
                      {d.description || 'No description provided'}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} color="var(--text-muted)" />
                        {count} employees
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={d.status} />
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-icon-action"
                          title="Edit Department"
                          onClick={() => handleOpenEdit(d)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-icon-action danger"
                          title="Delete Department"
                          onClick={() => setDeleteTarget(d)}
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
                <td colSpan={5}>
                  <div className="table-empty-state">
                    <Building2 size={36} className="table-empty-icon" />
                    <h4>No departments registered</h4>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? `Edit Department - ${editingDept.departmentName}` : 'Add New Department'}
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
              form="dept-form"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editingDept ? 'Update Department' : 'Create Department'}
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

        <form id="dept-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Department Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Research & Development"
              value={formData.departmentName}
              onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Describe department responsibilities..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Department Deletion"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete Department
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to delete department <strong>{deleteTarget?.departmentName}</strong>?
        </p>
      </Modal>
    </div>
  );
}
