import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await orderAPI.getMyOrders({ status: filter });
        setOrders(data.orders);
      } catch { toast.error('Failed to load orders'); }
      setLoading(false);
    };
    fetch();
  }, [filter]);

  const statusColor = { pending: '#f39c12', confirmed: '#3498db', processing: '#9b59b6', shipped: '#1abc9c', out_for_delivery: '#e67e22', delivered: '#2ecc71', cancelled: '#e74c3c' };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={s.label}>✦ Account</span>
        <h1 style={s.title}>My Orders</h1>
      </div>
      <div style={s.container}>
        <div style={s.filterRow}>
          {['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(st => (
            <button key={st} onClick={() => setFilter(st)} style={{ ...s.filterBtn, ...(filter === st ? s.filterBtnActive : {}) }}>
              {st || 'All Orders'}
            </button>
          ))}
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#7a7a9a' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={s.empty}><div style={{ fontSize: 64, marginBottom: 16 }}>📦</div><h3 style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 24, marginBottom: 8 }}>No orders yet</h3><p style={{ color: '#7a7a9a', marginBottom: 24 }}>Start shopping to see your orders here</p><Link to="/products" style={s.shopBtn}>Shop Now →</Link></div>
        ) : (
          <div style={s.ordersList}>
            {orders.map(order => (
              <Link key={order._id} to={`/orders/${order._id}`} style={s.orderCard}>
                <div style={s.orderTop}>
                  <div><div style={{ color: '#c9a96e', fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>#{order.orderNumber}</div><div style={{ color: '#7a7a9a', fontSize: 12, marginTop: 2 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div></div>
                  <span style={{ ...s.status, background: `${statusColor[order.status] || '#888'}22`, color: statusColor[order.status] || '#888', border: `1px solid ${statusColor[order.status] || '#888'}44` }}>{order.status?.replace(/_/g, ' ')}</span>
                </div>
                <div style={s.orderItems}>{order.items?.slice(0, 3).map((item, i) => <span key={i} style={{ fontSize: 28 }}>{item.emoji}</span>)}{order.items?.length > 3 && <span style={{ fontSize: 13, color: '#7a7a9a' }}>+{order.items.length - 3}</span>}</div>
                <div style={s.orderBottom}><span style={{ color: '#7a7a9a', fontSize: 13 }}>{order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}</span><span style={{ color: '#c9a96e', fontSize: 18, fontFamily: "'Playfair Display',serif", fontWeight: 700 }}>₹{order.totalAmount?.toLocaleString()}</span></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { background: '#060612', minHeight: '100vh', paddingTop: 80, fontFamily: "'DM Sans',sans-serif" },
  header: { padding: '60px 60px 32px', borderBottom: '1px solid rgba(201,169,110,0.1)' },
  label: { fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: '#c9a96e', display: 'block', marginBottom: 12 },
  title: { fontFamily: "'Playfair Display',serif", fontSize: 48, fontWeight: 700, color: '#f0ede8' },
  container: { padding: '40px 60px' },
  filterRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 },
  filterBtn: { background: 'transparent', border: '1px solid rgba(201,169,110,0.15)', borderRadius: 25, padding: '8px 18px', color: '#7a7a9a', cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans',sans-serif", transition: '0.2s', textTransform: 'capitalize' },
  filterBtnActive: { background: 'rgba(201,169,110,0.1)', borderColor: '#c9a96e', color: '#c9a96e' },
  empty: { textAlign: 'center', padding: '80px 40px' },
  shopBtn: { background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', color: '#060612', padding: '12px 28px', borderRadius: 25, textDecoration: 'none', fontWeight: 700, fontSize: 14 },
  ordersList: { display: 'flex', flexDirection: 'column', gap: 16 },
  orderCard: { background: '#12122a', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 16, padding: '20px 24px', textDecoration: 'none', display: 'block', transition: '0.3s' },
  orderTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  status: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' },
  orderItems: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 },
  orderBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
};
