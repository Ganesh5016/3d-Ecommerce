import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getOne(id).then(({ data }) => { setOrder(data.order); setLoading(false); }).catch(() => { toast.error('Order not found'); setLoading(false); });
  }, [id]);

  const statusColor = { pending: '#f39c12', confirmed: '#3498db', processing: '#9b59b6', shipped: '#1abc9c', out_for_delivery: '#e67e22', delivered: '#2ecc71', cancelled: '#e74c3c' };
  const steps = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
  const currentStep = order ? steps.indexOf(order.status) : 0;

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#060612', color: '#c9a96e', fontSize: 24, fontFamily: "'Playfair Display',serif" }}>Loading order...</div>;
  if (!order) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#060612', color: '#f0ede8', fontFamily: "'DM Sans',sans-serif" }}>Order not found. <Link to="/orders" style={{ color: '#c9a96e', marginLeft: 8 }}>Back to orders</Link></div>;

  return (
    <div style={{ background: '#060612', minHeight: '100vh', paddingTop: 80, fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ padding: '48px 60px' }}>
        <Link to="/orders" style={{ color: '#7a7a9a', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← Back to Orders</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div><h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: '#f0ede8', marginBottom: 6 }}>Order #{order.orderNumber}</h1><p style={{ color: '#7a7a9a', fontSize: 14 }}>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
          <span style={{ padding: '6px 18px', borderRadius: 25, fontSize: 13, fontWeight: 600, background: `${statusColor[order.status] || '#888'}22`, color: statusColor[order.status] || '#888', border: `1px solid ${statusColor[order.status] || '#888'}44`, textTransform: 'capitalize' }}>{order.status?.replace(/_/g, ' ')}</span>
        </div>

        {/* Tracking */}
        {order.status !== 'cancelled' && (
          <div style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 20, padding: '28px', marginBottom: 32 }}>
            <h3 style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 20, marginBottom: 28 }}>Order Tracking</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 20, left: '10%', right: '10%', height: 2, background: 'rgba(201,169,110,0.15)', zIndex: 0 }} />
              <div style={{ position: 'absolute', top: 20, left: '10%', width: `${(currentStep / (steps.length - 1)) * 80}%`, height: 2, background: 'linear-gradient(90deg,#c9a96e,#e8c99a)', zIndex: 1, transition: '0.5s' }} />
              {steps.map((step, i) => (
                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: i <= currentStep ? 'linear-gradient(135deg,#c9a96e,#e8c99a)' : '#12122a', border: `2px solid ${i <= currentStep ? '#c9a96e' : 'rgba(201,169,110,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: i <= currentStep ? '#060612' : '#7a7a9a', fontSize: 16, marginBottom: 10, transition: '0.3s' }}>
                    {i < currentStep ? '✓' : ['🕐', '✅', '⚙️', '🚚', '🏃', '🎉'][i]}
                  </div>
                  <span style={{ fontSize: 11, color: i <= currentStep ? '#c9a96e' : '#7a7a9a', textAlign: 'center', textTransform: 'capitalize', maxWidth: 70 }}>{step.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
          {/* Items */}
          <div style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 20, padding: 28 }}>
            <h3 style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 20, marginBottom: 20 }}>Items Ordered</h3>
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
                <div style={{ width: 60, height: 60, background: '#0e0e22', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{item.emoji}</div>
                <div style={{ flex: 1 }}><div style={{ color: '#f0ede8', fontWeight: 600, marginBottom: 4 }}>{item.name}</div><div style={{ color: '#7a7a9a', fontSize: 13 }}>Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</div></div>
                <div style={{ color: '#c9a96e', fontFamily: "'Playfair Display',serif", fontWeight: 700 }}>₹{(item.quantity * item.price).toLocaleString()}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 20, padding: 24 }}>
              <h3 style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 18, marginBottom: 16 }}>Payment Summary</h3>
              {[['Subtotal', `₹${order.subtotal?.toLocaleString()}`], ['Shipping', order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost}`], ['Tax (18% GST)', `₹${order.tax?.toLocaleString()}`], ...(order.discount > 0 ? [['Discount', `-₹${order.discount?.toLocaleString()}`]] : [])].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}><span style={{ color: '#7a7a9a' }}>{k}</span><span style={{ color: k === 'Discount' ? '#2ecc71' : '#f0ede8' }}>{v}</span></div>
              ))}
              <div style={{ borderTop: '1px solid rgba(201,169,110,0.15)', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#f0ede8', fontWeight: 600 }}>Total</span>
                <span style={{ color: '#c9a96e', fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700 }}>₹{order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 20, padding: 24 }}>
              <h3 style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 18, marginBottom: 16 }}>Delivery Address</h3>
              <div style={{ color: 'rgba(240,237,232,0.7)', fontSize: 14, lineHeight: 1.8 }}>
                <strong style={{ color: '#f0ede8', display: 'block' }}>{order.shippingAddress?.fullName}</strong>
                {order.shippingAddress?.street}<br />{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}<br />{order.shippingAddress?.country}<br /><span style={{ color: '#c9a96e' }}>{order.shippingAddress?.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
