import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then(({ data }) => { setStats(data); setLoading(false); })
      .catch(() => { toast.error('Failed to load stats'); setLoading(false); });
  }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#060612', color: '#c9a96e', fontFamily: "'Playfair Display',serif", fontSize: 24 }}>Loading dashboard...</div>;

  const statCards = [
    { label: 'Total Revenue', value: `₹${(stats?.stats?.revenue?.total || 0).toLocaleString()}`, growth: `${stats?.stats?.revenue?.growth || 0}%`, icon: '💰', color: '#c9a96e' },
    { label: 'Total Orders', value: (stats?.stats?.orders?.total || 0).toLocaleString(), sub: `${stats?.stats?.orders?.pending || 0} pending`, icon: '📦', color: '#3498db' },
    { label: 'Total Users', value: (stats?.stats?.users?.total || 0).toLocaleString(), sub: `+${stats?.stats?.users?.newThisMonth || 0} this month`, icon: '👥', color: '#9b59b6' },
    { label: 'Products', value: (stats?.stats?.products?.active || 0).toLocaleString(), sub: 'active listings', icon: '🏷️', color: '#2ecc71' },
  ];

  const navItems = [
    { to: '/admin', label: '📊 Dashboard', active: true },
    { to: '/admin/orders', label: '📦 Orders' },
    { to: '/admin/products', label: '🏷️ Products' },
    { to: '/admin/users', label: '👥 Users' },
    { to: '/', label: '← Back to Store' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060612', fontFamily: "'DM Sans',sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: '#0e0e22', borderRight: '1px solid rgba(201,169,110,0.12)', padding: '32px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 24px 32px', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, letterSpacing: 4, background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LUXE</div>
          <div style={{ color: '#7a7a9a', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>Admin Panel</div>
        </div>
        <nav style={{ padding: '20px 12px' }}>
          {navItems.map(item => (
            <Link key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, color: item.active ? '#c9a96e' : 'rgba(240,237,232,0.6)', textDecoration: 'none', fontSize: 14, marginBottom: 4, background: item.active ? 'rgba(201,169,110,0.1)' : 'transparent', border: item.active ? '1px solid rgba(201,169,110,0.2)' : '1px solid transparent', transition: '0.2s' }}>{item.label}</Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '48px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 40 }}>
          <span style={{ fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: '#c9a96e', display: 'block', marginBottom: 8 }}>✦ Overview</span>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 40, fontWeight: 700, color: '#f0ede8' }}>Dashboard</h1>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 40 }}>
          {statCards.map(card => (
            <div key={card.label} style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 20, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ fontSize: 32 }}>{card.icon}</span>
                {card.growth && <span style={{ background: 'rgba(46,204,113,0.1)', color: '#2ecc71', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>+{card.growth}</span>}
              </div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: card.color, marginBottom: 4 }}>{card.value}</div>
              <div style={{ color: '#7a7a9a', fontSize: 13 }}>{card.label}</div>
              {card.sub && <div style={{ color: '#c9a96e', fontSize: 12, marginTop: 4 }}>{card.sub}</div>}
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
          {/* Monthly Revenue Bar Chart (CSS) */}
          <div style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 20, padding: 28 }}>
            <h3 style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 20, marginBottom: 24 }}>Monthly Revenue</h3>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 160 }}>
              {(stats?.monthlyRevenue || []).slice(-6).map((m, i) => {
                const maxRev = Math.max(...(stats?.monthlyRevenue || []).map(x => x.revenue), 1);
                const h = Math.max(8, (m.revenue / maxRev) * 140);
                const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 10, color: '#c9a96e' }}>₹{(m.revenue / 1000).toFixed(0)}k</div>
                    <div style={{ width: '100%', height: h, background: `linear-gradient(to top,#c9a96e,#e8c99a)`, borderRadius: '6px 6px 0 0', transition: '0.5s' }} />
                    <div style={{ fontSize: 11, color: '#7a7a9a' }}>{months[(m._id?.month || 1) - 1]}</div>
                  </div>
                );
              })}
              {(stats?.monthlyRevenue || []).length === 0 && <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a7a9a', fontSize: 14 }}>No revenue data yet</div>}
            </div>
          </div>

          {/* Category Breakdown */}
          <div style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 20, padding: 28 }}>
            <h3 style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 20, marginBottom: 24 }}>By Category</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(stats?.categoryStats || []).slice(0, 5).map((cat, i) => {
                const max = Math.max(...(stats?.categoryStats || []).map(c => c.revenue), 1);
                const pct = Math.round((cat.revenue / max) * 100);
                const colors = ['#c9a96e','#3498db','#9b59b6','#2ecc71','#e74c3c'];
                return (
                  <div key={cat._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#f0ede8', fontSize: 13, textTransform: 'capitalize' }}>{cat._id}</span>
                      <span style={{ color: colors[i], fontSize: 12, fontWeight: 600 }}>₹{cat.revenue?.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: colors[i], borderRadius: 3, transition: '0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 20, padding: 28 }}>
          <h3 style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 20, marginBottom: 20 }}>Top Selling Products</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Product', 'Price', 'Sold', 'Rating'].map(h => <th key={h} style={{ color: '#7a7a9a', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'left', padding: '0 0 16px', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {(stats?.topProducts || []).map(p => (
                <tr key={p._id}>
                  <td style={{ padding: '14px 0', borderBottom: '1px solid rgba(201,169,110,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 28 }}>{p.emoji}</span>
                      <span style={{ color: '#f0ede8', fontSize: 14 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ color: '#c9a96e', fontSize: 14, padding: '14px 0', borderBottom: '1px solid rgba(201,169,110,0.06)' }}>₹{p.price?.toLocaleString()}</td>
                  <td style={{ color: '#f0ede8', fontSize: 14, padding: '14px 0', borderBottom: '1px solid rgba(201,169,110,0.06)' }}>{p.soldCount || 0}</td>
                  <td style={{ color: '#c9a96e', fontSize: 14, padding: '14px 0', borderBottom: '1px solid rgba(201,169,110,0.06)' }}>{'★'.repeat(Math.round(p.rating?.average || 0))} {p.rating?.average?.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
