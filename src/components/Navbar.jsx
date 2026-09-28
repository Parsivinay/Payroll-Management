import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Menu, LogOut, ArrowRightLeft, ShieldCheck, User } from 'lucide-react';

export default function Navbar({ setMobileOpen }) {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickSwitch = async (email, password, redirectPath) => {
    try {
      await login(email, password);
      navigate(redirectPath);
    } catch (err) {
      console.error('Quick switch error', err);
    }
  };

  // Generate breadcrumb label from route
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentSection = pathParts[0] ? pathParts[0].toUpperCase() : 'APP';
  const currentPage = pathParts[1]
    ? pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1)
    : 'Dashboard';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="menu-toggle-btn"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>

        <div className="breadcrumbs">
          <span>{currentSection}</span>
          <span>/</span>
          <span className="current">{currentPage}</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Quick Demo Role Switcher for Viva/Grading */}
        <div className="demo-role-selector">
          <span style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowRightLeft size={13} /> Demo Role:
          </span>
          <button
            className={`demo-pill-btn ${user?.role === 'admin' ? 'active' : ''}`}
            onClick={() => handleQuickSwitch('admin@company.com', 'admin123', '/admin/dashboard')}
            title="Switch to Admin account"
          >
            <ShieldCheck size={12} style={{ display: 'inline', marginRight: '3px' }} />
            Admin
          </button>
          <button
            className={`demo-pill-btn ${user?.role === 'employee' ? 'active' : ''}`}
            onClick={() => handleQuickSwitch('rahul@company.com', 'password123', '/employee/dashboard')}
            title="Switch to Employee account (EMP001)"
          >
            <User size={12} style={{ display: 'inline', marginRight: '3px' }} />
            Rahul (EMP001)
          </button>
        </div>

        <button className="logout-nav-btn" onClick={handleLogout} title="Sign out of system">
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
