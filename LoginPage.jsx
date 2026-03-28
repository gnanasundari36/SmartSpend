import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) navigate('/');
  };

  const handleDemo = async () => {
    setLoading(true);
    const result = await login('demo@smartexpense.com', 'demo123');
    setLoading(false);
    if (result.success) navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
      {/* Hero Section */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', paddingTop: 60
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }} className="animate-bounceIn">
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: '0 auto 16px',
            background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '2rem', boxShadow: 'var(--shadow-purple)',
            animation: 'float 3s ease-in-out infinite'
          }}>💸</div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 6 }}>
            Smart<span style={{ color: 'var(--purple-400)' }}>Expense</span>
          </h1>
          <p className="text-muted text-sm">Your AI-powered expense tracker</p>
        </div>

        {/* Form Card */}
        <div className="card animate-slideUp" style={{ width: '100%', maxWidth: 380, padding: 28 }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 24, textAlign: 'center' }}>Welcome Back 👋</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  id="login-email"
                  className="form-input input-with-icon"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="login-password"
                  className="form-input input-with-icon"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: 4
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? '⏳ Signing in...' : '🚀 Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div className="divider" style={{ flex: 1, margin: 0 }} />
            <span className="text-muted text-xs">or</span>
            <div className="divider" style={{ flex: 1, margin: 0 }} />
          </div>

          {/* Demo Login */}
          <button
            id="demo-login-btn"
            onClick={handleDemo}
            disabled={loading}
            className="btn btn-secondary btn-full"
            style={{ marginBottom: 12 }}
          >
            🎮 Try Demo Account
          </button>

          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            demo@smartexpense.com / demo123
          </p>
        </div>

        {/* Sign Up Link */}
        <p className="text-muted text-sm" style={{ marginTop: 24, textAlign: 'center' }}>
          New here?{' '}
          <Link to="/signup" style={{ color: 'var(--purple-400)', fontWeight: 600, textDecoration: 'none' }}>
            Create Account →
          </Link>
        </p>
      </div>

      {/* Bottom decoration */}
      <div style={{
        height: 120, background: 'radial-gradient(ellipse at center bottom, rgba(139,92,246,0.15) 0%, transparent 70%)',
        marginTop: 'auto'
      }} />
    </div>
  );
}
