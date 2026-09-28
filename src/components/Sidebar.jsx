import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CreditCard,
  FileBarChart,
  UserCheck,
  User,
  LogOut,
  BriefcaseBusiness,
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobile = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-box">
          <div className="brand-icon">
            <BriefcaseBusiness size={20} />
          </div>
          <div>
            <div className="brand-title">PayMatrix</div>
            <div className="brand-sub">Payroll & HR System</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {isAdmin ? (
          <>
            <span className="nav-section-label">Administration</span>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/admin/employees"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <Users size={18} />
              <span>Employees</span>
            </NavLink>
            <NavLink
              to="/admin/departments"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <Building2 size={18} />
              <span>Departments</span>
            </NavLink>
            <NavLink
              to="/admin/attendance"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <CalendarCheck size={18} />
              <span>Attendance</span>
            </NavLink>
            <NavLink
              to="/admin/payroll"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <CreditCard size={18} />
              <span>Payroll</span>
            </NavLink>
            <NavLink
              to="/admin/reports"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <FileBarChart size={18} />
              <span>Reports</span>
            </NavLink>
            <span className="nav-section-label">Account</span>
            <NavLink
              to="/admin/profile"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <UserCheck size={18} />
              <span>Admin Profile</span>
            </NavLink>
          </>
        ) : (
          <>
            <span className="nav-section-label">Self Service</span>
            <NavLink
              to="/employee/dashboard"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <LayoutDashboard size={18} />
              <span>My Dashboard</span>
            </NavLink>
            <NavLink
              to="/employee/profile"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <User size={18} />
              <span>My Profile</span>
            </NavLink>
            <NavLink
              to="/employee/attendance"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <CalendarCheck size={18} />
              <span>My Attendance</span>
            </NavLink>
            <NavLink
              to="/employee/payroll"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <CreditCard size={18} />
              <span>My Payroll</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-badge-card">
          <div className="user-avatar-small">
            {user?.employee?.profileImage ? (
              <img
                src={user.employee.profileImage}
                alt={user.username}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              (user?.username || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <div className="user-details">
            <div className="user-name-text">{user?.username || 'User'}</div>
            <div className="user-role-text">
              {user?.role === 'admin' ? 'Administrator' : user?.employeeId || 'Employee'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
