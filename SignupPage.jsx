import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STEPS = ['Personal', 'Contact', 'Password', 'Verify'];

const StepDots = ({ current }) => (
  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
    {STEPS.map((s, i) => (
      <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{
          width: i < current ? 28 : i === current ? 32 : 28,
          height: 6, borderRadius: 3, transition: 'all 0.3s',
          background: i <= current ? 'var(--gradient-primary)' : 'var(--border-card)'
        }} />
        <span style={{
          fontSize: '0.5625rem', color: i <= current ? 'var(--purple-400)' : 'var(--text-muted)',
          fontWeight: i === current ? 600 : 400
        }}>{s}</span>
      </div>
    ))}
  </div>
);

export default function SignupPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', parentPhone: '', password: '', confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const { signup, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const updateForm = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { toast.error('Fill all fields'); return; }
    setStep(1);
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    if (!form.phone.trim()) { toast.error('Enter phone number'); return; }
    setStep(2);
  };

  const handleStep3 = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be 6+ characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }

    setLoading(true);
    const result = await signup({
      name: form.name, email: form.email, phone: form.phone,
      parentPhone: form.parentPhone, password: form.password
    });
    setLoading(false);

    if (result.success) {
      setGeneratedOTP(result.otp || '');
      setStep(3);
    }
  };

  const handleOTPVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await verifyOTP(otp);
    setLoading(false);
    if (result.success) navigate('/');
  };

  const InputField = ({ label, type = 'text', field, placeholder, required = true, icon }) => (
    <div className="form-group">
      <label className="form-label">{label}{required && ' *'}</label>
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          className={`form-input ${icon ? 'input-with-icon' : ''}`}
          type={type}
          placeholder={placeholder}
          value={form[field]}
          onChange={e => updateForm(field, e.target.value)}
          required={required}
        />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px 32px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="btn btn-ghost btn-icon">
            ←
          </button>
        )}
        <div>
          <h1 style={{ fontSize: '1.25rem' }}>Create Account</h1>
          <p className="text-muted text-sm">Step {step + 1} of {STEPS.length}</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem'
          }}>💸</div>
        </div>
      </div>

      <StepDots current={step} />

      <div className="animate-fadeIn" key={step}>
        {/* Step 1: Personal Info */}
        {step === 0 && (
          <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <h2 style={{ marginBottom: 6 }}>👤 Personal Info</h2>
              <p className="text-muted text-sm">Let's start with your name and email</p>
            </div>
            <InputField label="Full Name" field="name" placeholder="John Doe" icon="👤" />
            <InputField label="Email Address" type="email" field="email" placeholder="you@example.com" icon="📧" />
            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 12 }}>
              Continue →
            </button>
          </form>
        )}

        {/* Step 2: Contact */}
        {step === 1 && (
          <form onSubmit={handleStep2} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <h2 style={{ marginBottom: 6 }}>📱 Contact Details</h2>
              <p className="text-muted text-sm">Your phone number for verification</p>
            </div>
            <InputField label="Phone Number" type="tel" field="phone" placeholder="9876543210" icon="📱" />
            <InputField label="Parent/Guardian Phone (optional)" type="tel" field="parentPhone" placeholder="9876543211" icon="👨‍👩‍👧" required={false} />
            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 12 }}>
              Continue →
            </button>
          </form>
        )}

        {/* Step 3: Password */}
        {step === 2 && (
          <form onSubmit={handleStep3} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <h2 style={{ marginBottom: 6 }}>🔐 Set Password</h2>
              <p className="text-muted text-sm">Create a strong password for your account</p>
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  className="form-input input-with-icon"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={e => updateForm('password', e.target.value)}
                  required minLength={6}
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  className="form-input input-with-icon"
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={e => updateForm('confirmPassword', e.target.value)}
                  required
                />
              </div>
            </div>
            {/* Password strength */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span className="text-xs text-muted">Strength</span>
                <span className="text-xs" style={{ color: form.password.length >= 8 ? 'var(--green)' : form.password.length >= 6 ? 'var(--yellow)' : 'var(--red)' }}>
                  {form.password.length >= 8 ? 'Strong' : form.password.length >= 6 ? 'Medium' : 'Weak'}
                </span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${form.password.length >= 8 ? 'success' : form.password.length >= 6 ? 'warning' : 'danger'}`}
                  style={{ width: `${Math.min((form.password.length / 12) * 100, 100)}%` }} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 12 }}>
              {loading ? '⏳ Creating Account...' : '🎉 Create Account'}
            </button>
          </form>
        )}

        {/* Step 4: OTP Verification */}
        {step === 3 && (
          <form onSubmit={handleOTPVerify} style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
              <h2 style={{ marginBottom: 6 }}>Verify Account</h2>
              <p className="text-muted text-sm">Enter the 6-digit OTP sent to {form.email}</p>
              {generatedOTP && (
                <div className="alert alert-success" style={{ marginTop: 12, justifyContent: 'center' }}>
                  Demo OTP: <strong style={{ marginLeft: 6 }}>{generatedOTP}</strong>
                </div>
              )}
            </div>
            <div className="form-group" style={{ width: '100%' }}>
              <label className="form-label" style={{ textAlign: 'center' }}>Enter OTP</label>
              <input
                className="form-input"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em', fontFamily: 'var(--font-display)' }}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading || otp.length < 6}>
              {loading ? '⏳ Verifying...' : '✅ Verify & Continue'}
            </button>
            <button type="button" onClick={() => navigate('/')} className="btn btn-ghost">
              Skip for now →
            </button>
          </form>
        )}
      </div>

      {step === 0 && (
        <p className="text-muted text-sm" style={{ textAlign: 'center', marginTop: 'auto', paddingTop: 24 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--purple-400)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In →
          </Link>
        </p>
      )}
    </div>
  );
}
