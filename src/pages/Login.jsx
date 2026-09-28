import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { BriefcaseBusiness, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, User } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await login(email, password);
      if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand-icon">
            <BriefcaseBusiness size={28} />
          </div>
          <h1 className="login-title">PayMatrix Portal</h1>
          <p className="login-subtitle">Employee Payroll Management System</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Official Email <span className="required">*</span>
            </label>
            <div className="search-input-box" style={{ background: '#fff' }}>
              <Mail size={16} color="var(--text-muted)" />
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password <span className="required">*</span>
            </label>
            <div className="search-input-box" style={{ background: '#fff' }}>
              <Lock size={16} color="var(--text-muted)" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ marginTop: '8px', padding: '12px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="quick-demo-accounts-box">
          <div className="quick-demo-title">Test Demo Credentials (Click to Fill)</div>
          <div className="demo-account-buttons">
            <button
              type="button"
              className="demo-fill-btn"
              onClick={() => handleFillDemo('admin@company.com', 'admin123')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <ShieldCheck size={14} color="var(--primary)" />
                <span>Admin</span>
              </div>
              <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>admin@company.com</small>
            </button>

            <button
              type="button"
              className="demo-fill-btn"
              onClick={() => handleFillDemo('rahul@company.com', 'password123')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <User size={14} color="#059669" />
                <span>Rahul (EMP001)</span>
              </div>
              <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>Software Developer</small>
            </button>

            <button
              type="button"
              className="demo-fill-btn"
              onClick={() => handleFillDemo('priya@company.com', 'password123')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <User size={14} color="#d97706" />
                <span>Priya (EMP002)</span>
              </div>
              <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>HR Executive</small>
            </button>

            <button
              type="button"
              className="demo-fill-btn"
              onClick={() => handleFillDemo('arjun@company.com', 'password123')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <User size={14} color="#7c3aed" />
                <span>Arjun (EMP003)</span>
              </div>
              <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>Accountant</small>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
