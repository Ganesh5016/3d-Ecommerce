import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, productAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const AdminNav = ({ active }) => {
  const navItems = [
    { to: '/admin', label: '📊 Dashboard' },
    { to: '/admin/orders', label: '📦 Orders' },
    { to: '/admin/products', label: '🏷️ Products' },
    { to: '/admin/users', label: '👥 Users' },
    { to: '/', label: '← Store' },
  ];
  return (
    <aside style={{ width: 220, background: '#0e0e22', borderRight: '1px solid rgba(201,169,110,0.12)', padding: '32px 12px', flexShrink: 0 }}>
      <div style={{ padding: '0 12px 24px', marginBottom: 8 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, letterSpacing: 4, background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LUXE</div>
        <div style={{ color: '#7a7a9a', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>Admin Panel</div>
      </div>
      {navItems.map(item => (
        <Link key={item.to} to={item.to} style={{ display: 'block', padding: '11px 16px', borderRadius: 10, color: active === item.to ? '#c9a96e' : 'rgba(240,237,232,0.55)', textDecoration: 'none', fontSize: 14, marginBottom: 3, background: active === item.to ? 'rgba(201,169,110,0.08)' : 'transparent', border: active === item.to ? '1px solid rgba(201,169,110,0.15)' : '1px solid transparent' }}>{item.label}</Link>
      ))}
    </aside>
  );
};

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', brand: '', category: 'electronics', price: '', originalPrice: '', description: '', stock: '', emoji: '📦', badge: '', isFeatured: false });

  useEffect(() => {
    productAPI.getAll({ limit: 50 }).then(({ data }) => { setProducts(data.products); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const createProduct = async (e) => {
    e.preventDefault();
    try {
      const { data } = await productAPI.create(form);
      setProducts(p => [data.product, ...p]);
      setShowForm(false);
      setForm({ name: '', brand: '', category: 'electronics', price: '', originalPrice: '', description: '', stock: '', emoji: '📦', badge: '', isFeatured: false });
      toast.success('Product created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productAPI.delete(id);
      setProducts(p => p.filter(x => x._id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Delete failed'); }
  };

  const inputStyle = { width: '100%', background: '#0e0e22', border: '1px solid rgba(201,169,110,0.15)', borderRadius: 10, padding: '10px 14px', color: '#f0ede8', fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060612', fontFamily: "'DM Sans',sans-serif" }}>
      <AdminNav active="/admin/products" />
      <main style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: '#f0ede8' }}>Products</h1>
          <button onClick={() => setShowForm(!showForm)} style={{ background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', border: 'none', borderRadius: 12, padding: '12px 24px', color: '#060612', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>+ Add Product</button>
        </div>

        {showForm && (
          <div style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 20, padding: 28, marginBottom: 28 }}>
            <h3 style={{ color: '#f0ede8', marginBottom: 20, fontFamily: "'Playfair Display',serif", fontSize: 20 }}>New Product</h3>
            <form onSubmit={createProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                {[['name', 'Product Name'], ['brand', 'Brand'], ['emoji', 'Emoji']].map(([k, l]) => (
                  <div key={k}><label style={{ color: '#7a7a9a', fontSize: 12, display: 'block', marginBottom: 6 }}>{l}</label><input value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} style={inputStyle} /></div>
                ))}
                <div><label style={{ color: '#7a7a9a', fontSize: 12, display: 'block', marginBottom: 6 }}>Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>{['electronics', 'fashion', 'beauty', 'home'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                {[['price', 'Price (₹)'], ['originalPrice', 'Original Price'], ['stock', 'Stock']].map(([k, l]) => (
                  <div key={k}><label style={{ color: '#7a7a9a', fontSize: 12, display: 'block', marginBottom: 6 }}>{l}</label><input type="number" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} style={inputStyle} /></div>
                ))}
                <div><label style={{ color: '#7a7a9a', fontSize: 12, display: 'block', marginBottom: 6 }}>Badge</label><select value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} style={inputStyle}><option value="">None</option>{['NEW', 'SALE', 'BESTSELLER', 'HOT', 'TRENDING', 'LOVED'].map(b => <option key={b} value={b}>{b}</option>)}</select></div>
              </div>
              <div style={{ marginBottom: 14 }}><label style={{ color: '#7a7a9a', fontSize: 12, display: 'block', marginBottom: 6 }}>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" style={{ background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', border: 'none', borderRadius: 10, padding: '12px 24px', color: '#060612', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Create Product</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 10, padding: '12px 24px', color: '#7a7a9a', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? <div style={{ color: '#7a7a9a', textAlign: 'center', padding: 60 }}>Loading...</div> : (
          <div style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.1)', borderRadius: 20, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
                  {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Actions'].map(h => <th key={h} style={{ color: '#7a7a9a', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'left', padding: '14px 20px' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id} style={{ borderBottom: '1px solid rgba(201,169,110,0.06)' }}>
                    <td style={{ padding: '14px 20px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 28 }}>{p.emoji}</span><div><div style={{ color: '#f0ede8', fontSize: 14, fontWeight: 600 }}>{p.name}</div><div style={{ color: '#7a7a9a', fontSize: 12 }}>{p.brand}</div></div></div></td>
                    <td style={{ padding: '14px 20px', color: '#7a7a9a', fontSize: 13, textTransform: 'capitalize' }}>{p.category}</td>
                    <td style={{ padding: '14px 20px', color: '#c9a96e', fontSize: 14, fontWeight: 600 }}>₹{p.price?.toLocaleString()}</td>
                    <td style={{ padding: '14px 20px' }}><span style={{ color: p.stock > 10 ? '#2ecc71' : p.stock > 0 ? '#f39c12' : '#e74c3c', fontSize: 14 }}>{p.stock}</span></td>
                    <td style={{ padding: '14px 20px', color: '#c9a96e', fontSize: 13 }}>{'★'.repeat(Math.round(p.rating?.average || 0))} {p.rating?.average?.toFixed(1)}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <button onClick={() => deleteProduct(p._id)} style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.2)', color: '#e74c3c', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    adminAPI.getOrders({ status: filter }).then(({ data }) => { setOrders(data.orders); setLoading(false); }).catch(() => setLoading(false));
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await adminAPI.updateOrderStatus(id, { status });
      setOrders(o => o.map(order => order._id === id ? { ...order, status } : order));
      toast.success('Status updated');
    } catch { toast.error('Failed'); }
  };

  const statusColor = { pending: '#f39c12', confirmed: '#3498db', processing: '#9b59b6', shipped: '#1abc9c', out_for_delivery: '#e67e22', delivered: '#2ecc71', cancelled: '#e74c3c' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060612', fontFamily: "'DM Sans',sans-serif" }}>
      <AdminNav active="/admin/orders" />
      <main style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: '#f0ede8', marginBottom: 24 }}>All Orders</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ background: filter === s ? 'rgba(201,169,110,0.1)' : 'transparent', border: `1px solid ${filter === s ? '#c9a96e' : 'rgba(201,169,110,0.15)'}`, borderRadius: 20, padding: '7px 16px', color: filter === s ? '#c9a96e' : '#7a7a9a', cursor: 'pointer', fontSize: 12, fontFamily: "'DM Sans',sans-serif", textTransform: 'capitalize' }}>{s || 'All'}</button>
          ))}
        </div>
        {loading ? <div style={{ color: '#7a7a9a', textAlign: 'center', padding: 60 }}>Loading...</div> : (
          <div style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.1)', borderRadius: 20, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid rgba(201,169,110,0.1)' }}>{['Order', 'Customer', 'Items', 'Total', 'Status', 'Update'].map(h => <th key={h} style={{ color: '#7a7a9a', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'left', padding: '14px 20px' }}>{h}</th>)}</tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id} style={{ borderBottom: '1px solid rgba(201,169,110,0.06)' }}>
                    <td style={{ padding: '14px 20px' }}><div style={{ color: '#c9a96e', fontSize: 13, fontWeight: 600 }}>#{o.orderNumber}</div><div style={{ color: '#7a7a9a', fontSize: 11 }}>{new Date(o.createdAt).toLocaleDateString()}</div></td>
                    <td style={{ padding: '14px 20px', color: '#f0ede8', fontSize: 13 }}>{o.user?.name}<div style={{ color: '#7a7a9a', fontSize: 11 }}>{o.user?.email}</div></td>
                    <td style={{ padding: '14px 20px' }}><div style={{ display: 'flex', gap: 4 }}>{o.items?.slice(0,3).map((i, idx) => <span key={idx} style={{ fontSize: 18 }}>{i.emoji}</span>)}</div></td>
                    <td style={{ padding: '14px 20px', color: '#c9a96e', fontWeight: 600, fontSize: 14 }}>₹{o.totalAmount?.toLocaleString()}</td>
                    <td style={{ padding: '14px 20px' }}><span style={{ padding: '4px 10px', borderRadius: 16, fontSize: 11, fontWeight: 600, background: `${statusColor[o.status]}22`, color: statusColor[o.status], textTransform: 'capitalize' }}>{o.status?.replace(/_/g,' ')}</span></td>
                    <td style={{ padding: '14px 20px' }}>
                      <select value={o.status} onChange={e => updateStatus(o._id, e.target.value)} style={{ background: '#0e0e22', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 8, padding: '6px 10px', color: '#f0ede8', fontSize: 12, fontFamily: "'DM Sans',sans-serif", outline: 'none' }}>
                        {['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAllUsers().then(({ data }) => { setUsers(data.users); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const toggle = async (id) => {
    try {
      const { data } = await adminAPI.toggleUser(id);
      setUsers(u => u.map(user => user._id === id ? { ...user, isActive: data.user.isActive } : user));
      toast.success(data.message);
    } catch { toast.error('Failed'); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060612', fontFamily: "'DM Sans',sans-serif" }}>
      <AdminNav active="/admin/users" />
      <main style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: '#f0ede8', marginBottom: 28 }}>Users ({users.length})</h1>
        {loading ? <div style={{ color: '#7a7a9a', textAlign: 'center', padding: 60 }}>Loading...</div> : (
          <div style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.1)', borderRadius: 20, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid rgba(201,169,110,0.1)' }}>{['User', 'Role', 'Joined', 'Status', 'Action'].map(h => <th key={h} style={{ color: '#7a7a9a', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'left', padding: '14px 20px' }}>{h}</th>)}</tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(201,169,110,0.06)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#060612', fontWeight: 700, flexShrink: 0 }}>{u.name?.[0]}</div>
                        <div><div style={{ color: '#f0ede8', fontSize: 14 }}>{u.name}</div><div style={{ color: '#7a7a9a', fontSize: 12 }}>{u.email}</div></div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}><span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: u.role === 'admin' ? 'rgba(231,76,60,0.1)' : u.role === 'seller' ? 'rgba(52,152,219,0.1)' : 'rgba(46,204,113,0.1)', color: u.role === 'admin' ? '#e74c3c' : u.role === 'seller' ? '#3498db' : '#2ecc71' }}>{u.role}</span></td>
                    <td style={{ padding: '14px 20px', color: '#7a7a9a', fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ padding: '14px 20px' }}><span style={{ color: u.isActive ? '#2ecc71' : '#e74c3c', fontSize: 13 }}>{u.isActive ? '✓ Active' : '✗ Suspended'}</span></td>
                    <td style={{ padding: '14px 20px' }}>
                      {u.role !== 'admin' && <button onClick={() => toggle(u._id)} style={{ background: u.isActive ? 'rgba(231,76,60,0.1)' : 'rgba(46,204,113,0.1)', border: `1px solid ${u.isActive ? 'rgba(231,76,60,0.2)' : 'rgba(46,204,113,0.2)'}`, color: u.isActive ? '#e74c3c' : '#2ecc71', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>{u.isActive ? 'Suspend' : 'Activate'}</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
