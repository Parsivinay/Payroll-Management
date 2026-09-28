import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import { ShieldCheck, Database, Key, Server, Mail, CheckCircle, Info } from 'lucide-react';

export default function AdminProfile() {
  const { user } = useAuth();
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.get('/health');
        setHealth(res.data);
      } catch (err) {
        console.error('Health check failed', err);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-title-box">
          <h1>Administrator Profile & System Status</h1>
          <p>Global system credentials, role authorities, database connections and system metrics.</p>
        </div>
      </div>

      <div className="dashboard-grid-2">
        {/* Profile Card */}
        <div className="card-panel">
          <div className="card-panel-header">
            <span className="card-panel-title">Administrator Account</span>
            <span className="badge badge-paid">Super Admin</span>
          </div>
          <div className="card-panel-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  fontWeight: 700,
                }}
              >
                {user?.username ? user.username.charAt(0) : 'A'}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{user?.username || 'Administrator'}</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{user?.email || 'admin@company.com'}</div>
              </div>
            </div>

            <div className="slip-info-grid">
              <div className="slip-info-row">
                <span className="slip-info-label">Role:</span>
                <span className="slip-info-val">System Administrator (Full Privileges)</span>
              </div>
              <div className="slip-info-row">
                <span className="slip-info-label">Access Level:</span>
                <span className="slip-info-val">Read / Write / Delete / Disburse</span>
              </div>
              <div className="slip-info-row">
                <span className="slip-info-label">Auth Standard:</span>
                <span className="slip-info-val">JSON Web Token (JWT) + Bcrypt Hashing</span>
              </div>
              <div className="slip-info-row">
                <span className="slip-info-label">Token Expiry:</span>
                <span className="slip-info-val">7 Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database & Architecture Card */}
        <div className="card-panel">
          <div className="card-panel-header">
            <span className="card-panel-title">Database & System Health</span>
          </div>
          <div className="card-panel-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Database size={20} color="var(--primary)" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Database Engine</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {health?.database || 'MongoDB Mongoose & Persistent Seed Store'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Server size={20} color="#059669" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Server Status</div>
                  <div style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 600 }}>
                    Operational (Express REST API + React SPA)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Key size={20} color="#7c3aed" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Security Protocol</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Salt rounds: 10 • Passwords never transmitted in plain text
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Info size={20} color="#0284c7" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>College Project Standard</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Final-Year Engineering Project Specification Compliant
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
