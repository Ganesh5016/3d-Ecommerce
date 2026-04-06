// Wishlist.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    wishlistAPI.get().then(({ data }) => { setWishlist(data.wishlist); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const remove = async (productId) => {
    await wishlistAPI.toggle(productId);
    setWishlist(w => w.filter(p => p._id !== productId));
    toast.success('Removed from wishlist');
  };

  return (
    <div style={{ background: '#060612', minHeight: '100vh', paddingTop: 80, fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ padding: '60px 60px 32px', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
        <span style={{ fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: '#c9a96e', display: 'block', marginBottom: 12 }}>✦ Saved</span>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 48, fontWeight: 700, color: '#f0ede8' }}>My Wishlist</h1>
      </div>
      <div style={{ padding: '40px 60px' }}>
        {loading ? <div style={{ color: '#7a7a9a', textAlign: 'center', padding: 60 }}>Loading...</div>
          : wishlist.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🤍</div>
              <h3 style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 24, marginBottom: 8 }}>Wishlist is empty</h3>
              <p style={{ color: '#7a7a9a', marginBottom: 24 }}>Save items you love for later</p>
              <Link to="/products" style={{ background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', color: '#060612', padding: '12px 28px', borderRadius: 25, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>Explore Products →</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 24 }}>
              {wishlist.map(p => (
                <div key={p._id} style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 20, overflow: 'hidden' }}>
                  <Link to={`/products/${p._id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, background: '#0e0e22', textDecoration: 'none', fontSize: 80 }}>{p.emoji}</Link>
                  <div style={{ padding: 20 }}>
                    <div style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
                    <div style={{ color: '#c9a96e', fontSize: 20, fontFamily: "'Playfair Display',serif", fontWeight: 700, marginBottom: 12 }}>₹{p.price?.toLocaleString()}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => addItem(p)} style={{ flex: 1, background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', border: 'none', borderRadius: 10, padding: '10px', color: '#060612', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Add to Cart</button>
                      <button onClick={() => remove(p._id)} style={{ width: 40, background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: 10, color: '#e74c3c', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

// NotFound.js
export function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', background: '#060612', fontFamily: "'DM Sans',sans-serif", textAlign: 'center', padding: 40 }}>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 120, fontWeight: 900, background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>404</div>
      <h2 style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Page Not Found</h2>
      <p style={{ color: '#7a7a9a', fontSize: 16, marginBottom: 32, lineHeight: 1.7 }}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" style={{ background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', color: '#060612', padding: '14px 32px', borderRadius: 30, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>← Back to Home</Link>
    </div>
  );
}

export default Wishlist;
