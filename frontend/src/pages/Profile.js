import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', gender: user?.gender || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [tab, setTab] = useState('profile');

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile(form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    setSaving(false);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    setPwSaving(true);
    try {
      await userAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setPwSaving(false);
  };

  return (
    <div style={s.page}>
      <div style={s.header}><span style={s.label}>✦ Account</span><h1 style={s.title}>My Profile</h1></div>
      <div style={s.container}>
        <div style={s.tabs}>
          {[['profile', '👤 Profile'], ['security', '🔒 Security'], ['addresses', '📍 Addresses']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}>{l}</button>
          ))}
        </div>

        <div style={s.content}>
          {tab === 'profile' && (
            <form onSubmit={saveProfile} style={s.form}>
              <div style={s.avatarSection}>
                <div style={s.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
                <div><div style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700 }}>{user?.name}</div><div style={{ color: '#7a7a9a', fontSize: 14 }}>{user?.email} · <span style={{ color: '#c9a96e', textTransform: 'capitalize' }}>{user?.role}</span></div></div>
              </div>
              <div style={s.grid}>
                <div style={s.field}><label style={s.fieldLabel}>Full Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={s.input} /></div>
                <div style={s.field}><label style={s.fieldLabel}>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={s.input} placeholder="+91 xxxxx xxxxx" /></div>
                <div style={s.field}><label style={s.fieldLabel}>Gender</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} style={s.input}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div style={s.field}><label style={s.fieldLabel}>Email</label><input value={user?.email} disabled style={{ ...s.input, opacity: 0.5, cursor: 'not-allowed' }} /></div>
              </div>
              <button type="submit" disabled={saving} style={s.btn}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </form>
          )}

          {tab === 'security' && (
            <form onSubmit={changePassword} style={s.form}>
              <h3 style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 22, marginBottom: 24 }}>Change Password</h3>
              {[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirmPassword', 'Confirm New Password']].map(([k, l]) => (
                <div key={k} style={{ ...s.field, marginBottom: 20 }}><label style={s.fieldLabel}>{l}</label><input type="password" value={pwForm[k]} onChange={e => setPwForm({ ...pwForm, [k]: e.target.value })} style={s.input} /></div>
              ))}
              <button type="submit" disabled={pwSaving} style={s.btn}>{pwSaving ? 'Updating...' : 'Update Password'}</button>
            </form>
          )}

          {tab === 'addresses' && (
            <div style={s.form}>
              <h3 style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 22, marginBottom: 16 }}>Saved Addresses</h3>
              {(user?.addresses || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#7a7a9a' }}>No addresses saved yet. Add one during checkout.</div>
              ) : (
                user.addresses.map((addr, i) => (
                  <div key={i} style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 16, padding: 20, marginBottom: 12 }}>
                    <div style={{ color: '#c9a96e', fontSize: 12, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>{addr.label} {addr.isDefault && '(Default)'}</div>
                    <div style={{ color: 'rgba(240,237,232,0.8)', fontSize: 14, lineHeight: 1.7 }}>{addr.fullName} · {addr.phone}<br />{addr.street}, {addr.city}, {addr.state} {addr.pincode}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { background: '#060612', minHeight: '100vh', paddingTop: 80, fontFamily: "'DM Sans',sans-serif" },
  header: { padding: '60px 60px 32px', borderBottom: '1px solid rgba(201,169,110,0.1)' },
  label: { fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: '#c9a96e', display: 'block', marginBottom: 12 },
  title: { fontFamily: "'Playfair Display',serif", fontSize: 48, fontWeight: 700, color: '#f0ede8' },
  container: { padding: '40px 60px', display: 'flex', gap: 40 },
  tabs: { display: 'flex', flexDirection: 'column', gap: 4, width: 200, flexShrink: 0 },
  tab: { background: 'transparent', border: '1px solid transparent', borderRadius: 12, padding: '12px 16px', color: '#7a7a9a', cursor: 'pointer', fontSize: 14, fontFamily: "'DM Sans',sans-serif", textAlign: 'left', transition: '0.2s' },
  tabActive: { background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', color: '#c9a96e' },
  content: { flex: 1 },
  form: { background: '#12122a', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 20, padding: 32 },
  avatarSection: { display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 },
  avatar: { width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#060612', fontSize: 28, fontWeight: 700, fontFamily: "'Playfair Display',serif", flexShrink: 0 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 },
  field: { display: 'flex', flexDirection: 'column' },
  fieldLabel: { color: 'rgba(240,237,232,0.6)', fontSize: 12, marginBottom: 8, letterSpacing: 0.5 },
  input: { background: '#0e0e22', border: '1px solid rgba(201,169,110,0.15)', borderRadius: 12, padding: '12px 16px', color: '#f0ede8', fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: 'none' },
  btn: { background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', border: 'none', borderRadius: 12, padding: '14px 32px', color: '#060612', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" },
};
