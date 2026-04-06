import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, total, updateQty, removeItem, clearCart, count } = useCart();
  const shipping = total >= 999 ? 0 : 99;
  const tax = Math.round(total * 0.18);
  const grandTotal = total + shipping + tax;

  if (items.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', background: '#060612', fontFamily: "'DM Sans',sans-serif", textAlign: 'center' }}>
      <div style={{ fontSize: 80, marginBottom: 20 }}>🛒</div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, color: '#f0ede8', marginBottom: 12 }}>Your cart is empty</h2>
      <p style={{ color: '#7a7a9a', marginBottom: 32 }}>Add some products and come back!</p>
      <Link to="/products" style={{ background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', color: '#060612', padding: '14px 32px', borderRadius: 25, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>Shop Now →</Link>
    </div>
  );

  return (
    <div style={{ background: '#060612', minHeight: '100vh', paddingTop: 80, fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ padding: '48px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 40, fontWeight: 700, color: '#f0ede8' }}>Shopping Cart <span style={{ color: '#7a7a9a', fontSize: 20, fontFamily: "'DM Sans',sans-serif", fontWeight: 400 }}>({count} items)</span></h1>
          <button onClick={clearCart} style={{ background: 'transparent', border: '1px solid rgba(231,76,60,0.3)', color: '#e74c3c', padding: '8px 18px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>Clear Cart</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
          <div>
            {items.map(item => (
              <div key={item._id} style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.1)', borderRadius: 20, padding: 24, marginBottom: 16, display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ width: 80, height: 80, background: '#0e0e22', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0 }}>{item.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#f0ede8', fontSize: 18, fontFamily: "'Playfair Display',serif", fontWeight: 700, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ color: '#7a7a9a', fontSize: 13, marginBottom: 12 }}>{item.brand}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => updateQty(item._id, item.quantity - 1)} style={{ width: 32, height: 32, background: '#0e0e22', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '50%', color: '#f0ede8', cursor: 'pointer', fontSize: 18 }}>−</button>
                    <span style={{ color: '#f0ede8', fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item._id, item.quantity + 1)} style={{ width: 32, height: 32, background: '#0e0e22', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '50%', color: '#f0ede8', cursor: 'pointer', fontSize: 18 }}>+</button>
                    <button onClick={() => removeItem(item._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: 14, marginLeft: 8, opacity: 0.7 }}>Remove</button>
                  </div>
                </div>
                <div style={{ color: '#c9a96e', fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, flexShrink: 0 }}>₹{(item.price * item.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 20, padding: 28, position: 'sticky', top: 100 }}>
            <h3 style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 22, marginBottom: 24 }}>Order Summary</h3>
            {[['Subtotal', `₹${total.toLocaleString()}`], ['Shipping', shipping === 0 ? 'FREE 🎉' : `₹${shipping}`], ['GST (18%)', `₹${tax.toLocaleString()}`]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: 15 }}><span style={{ color: '#7a7a9a' }}>{k}</span><span style={{ color: '#f0ede8' }}>{v}</span></div>
            ))}
            <div style={{ borderTop: '1px solid rgba(201,169,110,0.15)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{ color: '#f0ede8', fontWeight: 700, fontSize: 16 }}>Total</span>
              <span style={{ color: '#c9a96e', fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700 }}>₹{grandTotal.toLocaleString()}</span>
            </div>
            {total < 999 && <p style={{ color: '#f39c12', fontSize: 12, textAlign: 'center', marginBottom: 16 }}>Add ₹{(999 - total).toLocaleString()} more for free shipping!</p>}
            <Link to="/checkout" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', color: '#060612', padding: '16px', borderRadius: 14, textDecoration: 'none', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Proceed to Checkout →</Link>
            <Link to="/products" style={{ display: 'block', textAlign: 'center', color: '#7a7a9a', fontSize: 13, textDecoration: 'none' }}>← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
