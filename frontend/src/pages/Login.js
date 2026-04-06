import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back! ✨');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.brandWrap}>
          <div style={styles.logo}>LUXE</div>
          <p style={styles.tagline}>Your premium shopping destination</p>
          <div style={styles.features}>
            {['🚀 AI-powered recommendations', '🛡️ Secure checkout', '↩️ 30-day returns', '🚚 Free shipping above ₹999'].map(f => (
              <div key={f} style={styles.featureItem}>{f}</div>
            ))}
          </div>
        </div>
        <div style={styles.orbs}>
          <div style={{ ...styles.orb, width: 300, height: 300, top: -100, left: -100, background: 'rgba(201,169,110,0.12)' }} />
          <div style={{ ...styles.orb, width: 200, height: 200, bottom: 100, right: -50, background: 'rgba(102,77,255,0.1)' }} />
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h1 style={styles.title}>Welcome back</h1>
            <p style={styles.subtitle}>Sign in to your LUXE account</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={styles.input}
                autoComplete="email"
              />
            </div>

            <div style={styles.field}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={styles.label}>Password</label>
                <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ ...styles.input, paddingRight: 48 }}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}>
              {loading ? (
                <span style={styles.loadingInner}><span style={styles.spinner} />Signing in...</span>
              ) : 'Sign In →'}
            </button>
          </form>

          <div style={styles.divider}><span style={styles.dividerText}>or continue with</span></div>

          <div style={styles.socialRow}>
            {[{ icon: 'G', label: 'Google', color: '#ea4335' }, { icon: '𝕏', label: 'X', color: '#fff' }].map(s => (
              <button key={s.label} style={styles.socialBtn} onClick={() => toast('OAuth coming soon!')}>
                <span style={{ color: s.color, fontWeight: 700, marginRight: 8 }}>{s.icon}</span>{s.label}
              </button>
            ))}
          </div>

          <p style={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.switchLink}>Create one →</Link>
          </p>

          {/* Demo credentials */}
          <div style={styles.demo}>
            <div style={styles.demoTitle}>🧪 Demo Credentials</div>
            <div style={styles.demoGrid}>
              {[
                { role: 'Admin', email: 'admin@luxe.com', pass: 'admin123' },
                { role: 'Buyer', email: 'aryan@example.com', pass: 'test1234' },
              ].map(d => (
                <button key={d.role} style={styles.demoBtn} onClick={() => { setForm({ email: d.email, password: d.pass }); }}>
                  <strong>{d.role}</strong><br /><span style={{ fontSize: 11, opacity: 0.7 }}>{d.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh', background: '#060612', fontFamily: "'DM Sans', sans-serif" },
  left: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #060612 0%, #0e0e22 100%)', '@media(max-width:768px)': { display: 'none' } },
  brandWrap: { position: 'relative', zIndex: 2 },
  logo: { fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 900, letterSpacing: 10, background: 'linear-gradient(135deg, #c9a96e, #e8c99a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 12 },
  tagline: { fontSize: 18, color: 'rgba(240,237,232,0.6)', marginBottom: 48, fontWeight: 300 },
  features: { display: 'flex', flexDirection: 'column', gap: 16 },
  featureItem: { fontSize: 15, color: 'rgba(240,237,232,0.8)', display: 'flex', alignItems: 'center', gap: 12 },
  orbs: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  orb: { position: 'absolute', borderRadius: '50%', filter: 'blur(60px)' },
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' },
  card: { width: '100%', maxWidth: 440 },
  cardHeader: { marginBottom: 36 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: '#f0ede8', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#7a7a9a' },
  form: { display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 28 },
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 13, color: 'rgba(240,237,232,0.7)', marginBottom: 8, letterSpacing: 0.5 },
  input: { background: '#12122a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 12, padding: '14px 16px', color: '#f0ede8', fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: 'none', transition: 'border-color 0.3s', width: '100%', boxSizing: 'border-box' },
  eyeBtn: { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1 },
  forgotLink: { fontSize: 13, color: '#c9a96e', textDecoration: 'none' },
  submitBtn: { background: 'linear-gradient(135deg, #c9a96e, #e8c99a)', border: 'none', borderRadius: 12, padding: '16px', color: '#060612', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.5, transition: '0.3s' },
  loadingInner: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  spinner: { width: 18, height: 18, border: '2px solid rgba(6,6,18,0.3)', borderTopColor: '#060612', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' },
  divider: { textAlign: 'center', position: 'relative', margin: '24px 0', borderTop: '1px solid rgba(201,169,110,0.15)' },
  dividerText: { position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#060612', padding: '0 12px', fontSize: 12, color: '#7a7a9a', whiteSpace: 'nowrap' },
  socialRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 },
  socialBtn: { background: '#12122a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 12, padding: '12px', color: '#f0ede8', fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' },
  switchText: { textAlign: 'center', fontSize: 14, color: '#7a7a9a', marginBottom: 24 },
  switchLink: { color: '#c9a96e', textDecoration: 'none', fontWeight: 600 },
  demo: { background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 12, padding: '16px' },
  demoTitle: { fontSize: 12, color: '#c9a96e', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  demoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  demoBtn: { background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 8, padding: '10px 12px', color: '#f0ede8', cursor: 'pointer', fontSize: 12, textAlign: 'left', fontFamily: "'DM Sans', sans-serif", transition: '0.2s', lineHeight: 1.6 },
};
