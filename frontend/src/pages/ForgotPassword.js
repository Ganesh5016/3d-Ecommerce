import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally { setLoading(false); }
  };

  return (
    <div style={page}>
      <div style={card}>
        {sent ? (
          <>
            <div style={{ fontSize: 64, marginBottom: 20 }}>📬</div>
            <h2 style={title}>Check Your Email</h2>
            <p style={sub}>A password reset link has been sent to <strong style={{ color: '#c9a96e' }}>{email}</strong>. It expires in 30 minutes.</p>
            <Link to="/login" style={btn}>Back to Login →</Link>
          </>
        ) : (
          <>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🔑</div>
            <h2 style={title}>Forgot Password?</h2>
            <p style={sub}>No worries! Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                style={{ ...input, display: 'block', width: '100%', marginBottom: 20, boxSizing: 'border-box' }} />
              <button type="submit" disabled={loading} style={btn}>{loading ? 'Sending...' : 'Send Reset Link →'}</button>
            </form>
            <Link to="/login" style={{ display: 'block', textAlign: 'center', marginTop: 20, color: '#7a7a9a', textDecoration: 'none', fontSize: 14 }}>← Back to Login</Link>
          </>
        )}
      </div>
    </div>
  );
}

const page = { display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#060612', fontFamily: "'DM Sans',sans-serif", padding: 24 };
const card = { background: '#0e0e22', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 24, padding: '52px 44px', width: '100%', maxWidth: 440, textAlign: 'center' };
const title = { fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, color: '#f0ede8', marginBottom: 12 };
const sub = { fontSize: 15, color: '#7a7a9a', marginBottom: 32, lineHeight: 1.7 };
const input = { background: '#12122a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 12, padding: '14px 16px', color: '#f0ede8', fontSize: 15, fontFamily: "'DM Sans',sans-serif", outline: 'none' };
const btn = { display: 'block', width: '100%', background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', border: 'none', borderRadius: 12, padding: '16px', color: '#060612', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' };
