import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'buyer', agreeTerms: false });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) return toast.error('Valid email required');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (!form.agreeTerms) return toast.error('Please accept the terms');
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      toast.success('Account created! Please verify your email.');
      navigate('/verify-email', { state: { email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.brand}>
          <div style={styles.logo}>LUXE</div>
          <p style={styles.tagline}>Join 1.2M+ style-forward shoppers</p>
        </div>
        <div style={styles.steps}>
          {[
            { n: 1, label: 'Personal Info', icon: '👤' },
            { n: 2, label: 'Set Password', icon: '🔒' },
            { n: 3, label: 'Verify Email', icon: '✉️' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: step >= s.n ? 1 : 0.4 }}>
              <div style={{ ...styles.stepCircle, background: step >= s.n ? 'linear-gradient(135deg,#c9a96e,#e8c99a)' : 'rgba(201,169,110,0.1)', color: step >= s.n ? '#060612' : '#c9a96e' }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 13, color: '#c9a96e', letterSpacing: 1, textTransform: 'uppercase', fontSize: 10 }}>Step {s.n}</div>
                <div style={{ color: '#f0ede8', fontSize: 15 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h1 style={styles.title}>{step === 1 ? 'Create Account' : 'Set Your Password'}</h1>
          <p style={styles.sub}>{step === 1 ? 'Start your luxury journey' : 'Choose a strong password'}</p>

          {step === 1 ? (
            <form onSubmit={handleStep1} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input style={styles.input} placeholder="Aryan Kapoor" value={form.name} onChange={e => update('name', e.target.value)} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Email Address</label>
                <input style={styles.input} type="email" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Account Type</label>
                <div style={styles.roleRow}>
                  {[{ v: 'buyer', icon: '🛍️', label: 'Shopper', desc: 'Browse & buy' }, { v: 'seller', icon: '🏪', label: 'Seller', desc: 'List & sell' }].map(r => (
                    <div key={r.v} onClick={() => update('role', r.v)} style={{ ...styles.roleCard, borderColor: form.role === r.v ? '#c9a96e' : 'rgba(201,169,110,0.15)', background: form.role === r.v ? 'rgba(201,169,110,0.1)' : 'transparent' }}>
                      <span style={{ fontSize: 28 }}>{r.icon}</span>
                      <div style={{ fontWeight: 600, color: '#f0ede8' }}>{r.label}</div>
                      <div style={{ fontSize: 12, color: '#7a7a9a' }}>{r.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button type="submit" style={styles.btn}>Continue →</button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...styles.input, paddingRight: 48 }} type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={e => update('password', e.target.value)} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={styles.eye}>{showPw ? '🙈' : '👁️'}</button>
                </div>
                <div style={styles.strength}>
                  {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: form.password.length >= i * 2 ? '#c9a96e' : 'rgba(201,169,110,0.15)' }} />)}
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Confirm Password</label>
                <input style={styles.input} type="password" placeholder="Repeat your password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
              </div>
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.agreeTerms} onChange={e => update('agreeTerms', e.target.checked)} style={{ marginTop: 3, accentColor: '#c9a96e' }} />
                <span style={{ fontSize: 13, color: '#7a7a9a', lineHeight: 1.6 }}>I agree to the <Link to="/terms" style={{ color: '#c9a96e', textDecoration: 'none' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: '#c9a96e', textDecoration: 'none' }}>Privacy Policy</Link></span>
              </label>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setStep(1)} style={{ ...styles.btn, background: 'rgba(201,169,110,0.1)', color: '#c9a96e', flex: 0.4 }}>← Back</button>
                <button type="submit" disabled={loading} style={{ ...styles.btn, flex: 1, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Creating...' : 'Create Account ✨'}
                </button>
              </div>
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: 14, color: '#7a7a9a', marginTop: 24 }}>
            Already have an account? <Link to="/login" style={{ color: '#c9a96e', textDecoration: 'none', fontWeight: 600 }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh', background: '#060612', fontFamily: "'DM Sans', sans-serif" },
  left: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 60, background: 'linear-gradient(135deg,#060612,#0e0e22)', position: 'relative', overflow: 'hidden' },
  brand: { marginBottom: 60 },
  logo: { fontFamily: "'Playfair Display',serif", fontSize: 48, fontWeight: 900, letterSpacing: 10, background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 },
  tagline: { fontSize: 16, color: 'rgba(240,237,232,0.5)', fontWeight: 300 },
  steps: { display: 'flex', flexDirection: 'column', gap: 28 },
  stepCircle: { width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, fontWeight: 700 },
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' },
  card: { width: '100%', maxWidth: 460 },
  title: { fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 700, color: '#f0ede8', marginBottom: 8 },
  sub: { fontSize: 15, color: '#7a7a9a', marginBottom: 36 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 13, color: 'rgba(240,237,232,0.7)', marginBottom: 8 },
  input: { background: '#12122a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 12, padding: '14px 16px', color: '#f0ede8', fontSize: 15, fontFamily: "'DM Sans',sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box' },
  eye: { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 },
  strength: { display: 'flex', gap: 4, marginTop: 8 },
  roleRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  roleCard: { border: '1px solid', borderRadius: 12, padding: 16, cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4, transition: '0.3s' },
  btn: { background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', border: 'none', borderRadius: 12, padding: '16px', color: '#060612', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: '0.3s' },
};
