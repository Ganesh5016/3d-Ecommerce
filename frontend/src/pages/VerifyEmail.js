// VerifyEmail.js
import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

export function VerifyEmail() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return toast.error('Enter the 6-digit OTP');
    setLoading(true);
    try {
      await authAPI.verifyEmail({ email, otp: code });
      toast.success('Email verified! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const resend = async () => {
    try { await authAPI.resendOTP({ email }); toast.success('OTP resent!'); } catch { toast.error('Failed to resend'); }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>✉️</div>
        <h2 style={titleStyle}>Verify Your Email</h2>
        <p style={subStyle}>Enter the 6-digit code sent to<br /><strong style={{ color: '#c9a96e' }}>{email}</strong></p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', margin: '32px 0' }}>
          {otp.map((d, i) => (
            <input key={i} ref={el => inputs.current[i] = el} value={d} onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)}
              style={{ width: 52, height: 60, background: '#12122a', border: `2px solid ${d ? '#c9a96e' : 'rgba(201,169,110,0.2)'}`, borderRadius: 12, textAlign: 'center', fontSize: 24, fontWeight: 700, color: '#f0ede8', outline: 'none' }} maxLength={1} inputMode="numeric" />
          ))}
        </div>
        <button onClick={handleVerify} disabled={loading} style={btnStyle}>{loading ? 'Verifying...' : 'Verify Email ✓'}</button>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#7a7a9a' }}>
          Didn't receive the code?{' '}
          <button onClick={resend} style={{ background: 'none', border: 'none', color: '#c9a96e', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}>Resend OTP</button>
        </p>
      </div>
    </div>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
      toast.success('Reset link sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>🔑</div>
        <h2 style={titleStyle}>Forgot Password</h2>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 60, margin: '20px 0' }}>📬</div>
            <p style={subStyle}>Check your email for the reset link.<br />It expires in 30 minutes.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={subStyle}>Enter your email and we'll send a reset link.</p>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              style={{ ...inputStyle, display: 'block', width: '100%', marginBottom: 20, boxSizing: 'border-box' }} />
            <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Sending...' : 'Send Reset Link →'}</button>
          </form>
        )}
      </div>
    </div>
  );
}

export function ResetPassword() {
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = require('react-router-dom').useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await authAPI.resetPassword(token, { password: form.password });
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>🔐</div>
        <h2 style={titleStyle}>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <p style={subStyle}>Enter your new password below.</p>
          <input type="password" placeholder="New password (min 6 chars)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            style={{ ...inputStyle, display: 'block', width: '100%', marginBottom: 12, boxSizing: 'border-box' }} />
          <input type="password" placeholder="Confirm new password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            style={{ ...inputStyle, display: 'block', width: '100%', marginBottom: 20, boxSizing: 'border-box' }} />
          <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Resetting...' : 'Reset Password ✓'}</button>
        </form>
      </div>
    </div>
  );
}

const pageStyle = { display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#060612', fontFamily: "'DM Sans',sans-serif", padding: 24 };
const cardStyle = { background: '#0e0e22', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 24, padding: '48px 40px', width: '100%', maxWidth: 440, textAlign: 'center' };
const titleStyle = { fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, color: '#f0ede8', marginBottom: 12 };
const subStyle = { fontSize: 15, color: '#7a7a9a', marginBottom: 28, lineHeight: 1.7 };
const inputStyle = { background: '#12122a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 12, padding: '14px 16px', color: '#f0ede8', fontSize: 15, fontFamily: "'DM Sans',sans-serif", outline: 'none' };
const btnStyle = { width: '100%', background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', border: 'none', borderRadius: 12, padding: '16px', color: '#060612', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" };

export default VerifyEmail;
