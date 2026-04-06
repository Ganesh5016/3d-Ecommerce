import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const { isOpen, closeCart, items, count, total, updateQty, removeItem } = useCart();

  return (
    <>
      {isOpen && <div onClick={closeCart} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1100, backdropFilter: 'blur(4px)' }} />}
      <div style={{ ...s.drawer, transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}>
        <div style={s.header}>
          <div>
            <h2 style={s.title}>Your Cart</h2>
            <p style={s.subtitle}>{count} {count === 1 ? 'item' : 'items'}</p>
          </div>
          <button onClick={closeCart} style={s.closeBtn}>✕</button>
        </div>

        <div style={s.items}>
          {items.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize: 72, marginBottom: 16 }}>🛒</div>
              <h3 style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 22, marginBottom: 8 }}>Cart is empty</h3>
              <p style={{ color: '#7a7a9a', marginBottom: 24 }}>Discover something you'll love</p>
              <Link to="/products" onClick={closeCart} style={s.shopBtn}>Shop Now →</Link>
            </div>
          ) : (
            items.map(item => (
              <div key={item._id} style={s.item}>
                <div style={s.itemImg}>{item.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={s.itemName}>{item.name}</div>
                  <div style={s.itemBrand}>{item.brand}</div>
                  <div style={s.itemPrice}>₹{item.price?.toLocaleString()}</div>
                  <div style={s.qtyRow}>
                    <button onClick={() => updateQty(item._id, item.quantity - 1)} style={s.qtyBtn}>−</button>
                    <span style={s.qty}>{item.quantity}</span>
                    <button onClick={() => updateQty(item._id, item.quantity + 1)} style={s.qtyBtn}>+</button>
                    <button onClick={() => removeItem(item._id)} style={s.removeBtn}>🗑️</button>
                  </div>
                </div>
                <div style={s.itemTotal}>₹{(item.price * item.quantity).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={s.footer}>
            <div style={s.promoRow}>
              <input placeholder="Promo code" style={s.promoInput} />
              <button style={s.promoBtn}>Apply</button>
            </div>
            <div style={s.summaryRow}><span style={{ color: '#7a7a9a' }}>Subtotal</span><span style={{ color: '#f0ede8' }}>₹{total.toLocaleString()}</span></div>
            <div style={s.summaryRow}><span style={{ color: '#7a7a9a' }}>Shipping</span><span style={{ color: total >= 999 ? '#2ecc71' : '#f0ede8' }}>{total >= 999 ? 'FREE' : '₹99'}</span></div>
            <div style={{ ...s.summaryRow, borderTop: '1px solid rgba(201,169,110,0.15)', paddingTop: 12, marginTop: 8 }}>
              <span style={{ color: '#f0ede8', fontWeight: 600 }}>Total</span>
              <span style={{ color: '#c9a96e', fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700 }}>₹{(total + (total >= 999 ? 0 : 99)).toLocaleString()}</span>
            </div>
            <Link to="/checkout" onClick={closeCart} style={s.checkoutBtn}>Proceed to Checkout →</Link>
            <Link to="/cart" onClick={closeCart} style={s.viewCartBtn}>View Full Cart</Link>
          </div>
        )}
      </div>
    </>
  );
}

const s = {
  drawer: { position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, background: '#0e0e22', zIndex: 1101, borderLeft: '1px solid rgba(201,169,110,0.15)', display: 'flex', flexDirection: 'column', transition: '0.4s cubic-bezier(0.4,0,0.2,1)', fontFamily: "'DM Sans',sans-serif" },
  header: { padding: '28px 24px', borderBottom: '1px solid rgba(201,169,110,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#f0ede8', margin: 0, marginBottom: 4 },
  subtitle: { color: '#7a7a9a', fontSize: 13, margin: 0 },
  closeBtn: { background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.15)', color: '#c9a96e', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  items: { flex: 1, overflowY: 'auto', padding: '16px 24px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: 40 },
  shopBtn: { background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', color: '#060612', padding: '12px 28px', borderRadius: 25, textDecoration: 'none', fontWeight: 700, fontSize: 14 },
  item: { display: 'flex', gap: 14, padding: '16px 0', borderBottom: '1px solid rgba(201,169,110,0.08)', alignItems: 'flex-start' },
  itemImg: { width: 64, height: 64, background: '#12122a', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0, border: '1px solid rgba(201,169,110,0.1)' },
  itemName: { color: '#f0ede8', fontSize: 14, fontWeight: 600, marginBottom: 2 },
  itemBrand: { color: '#7a7a9a', fontSize: 12, marginBottom: 4 },
  itemPrice: { color: '#c9a96e', fontSize: 14, fontWeight: 600, marginBottom: 8 },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 28, height: 28, background: '#12122a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '50%', color: '#f0ede8', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qty: { fontSize: 14, fontWeight: 600, color: '#f0ede8', minWidth: 20, textAlign: 'center' },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginLeft: 4, opacity: 0.6 },
  itemTotal: { color: '#f0ede8', fontSize: 14, fontWeight: 600, flexShrink: 0 },
  footer: { padding: '20px 24px', borderTop: '1px solid rgba(201,169,110,0.12)' },
  promoRow: { display: 'flex', gap: 8, marginBottom: 16 },
  promoInput: { flex: 1, background: '#12122a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 10, padding: '10px 14px', color: '#f0ede8', fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: 'none' },
  promoBtn: { background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.3)', color: '#c9a96e', padding: '10px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans',sans-serif" },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 },
  checkoutBtn: { display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', color: '#060612', padding: '14px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 15, marginTop: 16, marginBottom: 10 },
  viewCartBtn: { display: 'block', textAlign: 'center', background: 'transparent', color: '#7a7a9a', padding: '10px', borderRadius: 12, textDecoration: 'none', fontSize: 13 },
};
