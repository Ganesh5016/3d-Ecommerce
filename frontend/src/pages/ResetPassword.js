import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await authAPI.resetPassword(token, { password: form.password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally { setLoading(false); }
  };

  const strength = form.password.length;
  const strengthColor = strength === 0 ? '#333' : strength < 4 ? '#e74c3c' : strength < 8 ? '#f39c12' : '#2ecc71';
  const strengthLabel = strength === 0 ? '' : strength < 4 ? 'Weak' : strength < 8 ? 'Medium' : 'Strong';

  return (
    <div style={page}>
      <div style={card}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🔐</div>
        <h2 style={title}>Reset Password</h2>
        <p style={sub}>Enter your new password below.</p>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} placeholder="New password (min 6 chars)"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ ...input, width: '100%', paddingRight: 48, boxSizing: 'border-box' }} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
            {form.password && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <div style={{ flex: 1, height: 3, borderRadius: 2, background: '#1a1a3e' }}>
                  <div style={{ width: `${Math.min(100, (strength / 12) * 100)}%`, height: '100%', background: strengthColor, borderRadius: 2, transition: '0.3s' }} />
                </div>
                <span style={{ fontSize: 11, color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
          </div>
          <input type="password" placeholder="Confirm new password"
            value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            style={{ ...input, display: 'block', width: '100%', marginBottom: 24, boxSizing: 'border-box' }} />
          <button type="submit" disabled={loading}
            style={{ display: 'block', width: '100%', background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', border: 'none', borderRadius: 12, padding: '16px', color: '#060612', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Resetting...' : 'Reset Password ✓'}
          </button>
        </form>
      </div>
    </div>
  );
}

const page = { display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#060612', fontFamily: "'DM Sans',sans-serif", padding: 24 };
const card = { background: '#0e0e22', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 24, padding: '52px 44px', width: '100%', maxWidth: 440, textAlign: 'center' };
const title = { fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, color: '#f0ede8', marginBottom: 12 };
const sub = { fontSize: 15, color: '#7a7a9a', marginBottom: 28, lineHeight: 1.7 };
const input = { background: '#12122a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 12, padding: '14px 16px', color: '#f0ede8', fontSize: 15, fontFamily: "'DM Sans',sans-serif", outline: 'none' };
