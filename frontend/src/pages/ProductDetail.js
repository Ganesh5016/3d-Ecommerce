import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI, reviewAPI, wishlistAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [tab, setTab] = useState('description');
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await productAPI.getOne(id);
        setProduct(data.product);
        setReviews(data.reviews || []);
        if (isAuthenticated) {
          try {
            const wl = await wishlistAPI.get();
            setWishlisted(wl.data.wishlist?.some(p => p._id === id));
          } catch {}
        }
      } catch { toast.error('Product not found'); }
      setLoading(false);
    };
    load();
  }, [id, isAuthenticated]);

  const toggleWish = async () => {
    if (!isAuthenticated) return toast.error('Please login');
    const { data } = await wishlistAPI.toggle(id);
    setWishlisted(data.added);
    toast.success(data.message);
  };

  const submitReview = async () => {
    if (!isAuthenticated) return toast.error('Please login to review');
    if (!reviewForm.comment.trim()) return toast.error('Please write a review comment');
    setSubmittingReview(true);
    try {
      const { data } = await reviewAPI.create({ product: id, ...reviewForm });
      setReviews(r => [data.review, ...r]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted! ⭐');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit review'); }
    setSubmittingReview(false);
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#060612', color: '#c9a96e', fontFamily: "'Playfair Display',serif", fontSize: 24 }}>Loading product...</div>;
  if (!product) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#060612', color: '#f0ede8', fontFamily: "'DM Sans',sans-serif" }}>Product not found. <Link to="/products" style={{ color: '#c9a96e', marginLeft: 8 }}>Browse products</Link></div>;

  return (
    <div style={{ background: '#060612', minHeight: '100vh', paddingTop: 80, fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ padding: '48px 60px' }}>
        <Link to="/products" style={{ color: '#7a7a9a', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>← Back to Products</Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, marginBottom: 60 }}>
          {/* Product image */}
          <div style={{ background: '#0e0e22', borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 500, border: '1px solid rgba(201,169,110,0.12)', position: 'relative', overflow: 'hidden' }}>
            <span style={{ fontSize: 180, filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.6))', animation: 'float 3s ease-in-out infinite' }}>{product.emoji}</span>
            {product.badge && <span style={{ position: 'absolute', top: 20, left: 20, background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', color: '#060612', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{product.badge}</span>}
            {product.discountPercent > 0 && <span style={{ position: 'absolute', top: 20, right: 20, background: '#e74c3c', color: '#fff', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>-{product.discountPercent}%</span>}
            <style>{`@keyframes float{0%,100%{transform:translateY(0) rotateY(0deg)}50%{transform:translateY(-16px) rotateY(12deg)}}`}</style>
          </div>

          {/* Info */}
          <div>
            <div style={{ color: '#c9a96e', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>{product.brand}</div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 40, fontWeight: 700, color: '#f0ede8', marginBottom: 16, lineHeight: 1.2 }}>{product.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span style={{ color: '#c9a96e', fontSize: 18, letterSpacing: 2 }}>{'★'.repeat(Math.round(product.rating?.average || 0))}</span>
              <span style={{ color: '#f0ede8', fontWeight: 600 }}>{product.rating?.average?.toFixed(1)}</span>
              <span style={{ color: '#7a7a9a' }}>({product.rating?.count?.toLocaleString()} reviews)</span>
              {product.stock > 0 ? <span style={{ color: '#2ecc71', fontSize: 13 }}>✓ In Stock ({product.stock})</span> : <span style={{ color: '#e74c3c', fontSize: 13 }}>✗ Out of Stock</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 48, fontWeight: 700, color: '#c9a96e' }}>₹{product.price?.toLocaleString()}</span>
              {product.originalPrice > product.price && <span style={{ color: '#7a7a9a', fontSize: 22, textDecoration: 'line-through' }}>₹{product.originalPrice?.toLocaleString()}</span>}
            </div>
            <p style={{ color: 'rgba(240,237,232,0.7)', fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>{product.description}</p>

            {/* Quantity & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: '#12122a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 14, overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 44, height: 52, background: 'none', border: 'none', color: '#f0ede8', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ width: 40, textAlign: 'center', color: '#f0ede8', fontWeight: 700, fontSize: 16 }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ width: 44, height: 52, background: 'none', border: 'none', color: '#f0ede8', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              <button onClick={() => addItem({ ...product, quantity: qty })} disabled={product.stock === 0}
                style={{ flex: 1, background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', border: 'none', borderRadius: 14, padding: '16px 24px', color: '#060612', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", opacity: product.stock === 0 ? 0.5 : 1 }}>
                {product.stock === 0 ? 'Out of Stock' : '+ Add to Cart'}
              </button>
              <button onClick={toggleWish} style={{ width: 52, height: 52, background: '#12122a', border: `1px solid ${wishlisted ? '#e74c3c' : 'rgba(201,169,110,0.2)'}`, borderRadius: 14, cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>{wishlisted ? '❤️' : '🤍'}</button>
            </div>

            {/* Specs */}
            {product.specifications?.length > 0 && (
              <div style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.1)', borderRadius: 16, padding: 20 }}>
                <div style={{ color: '#c9a96e', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Specifications</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {product.specifications.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8 }}><span style={{ color: '#7a7a9a', fontSize: 13 }}>{s.key}:</span><span style={{ color: '#f0ede8', fontSize: 13 }}>{s.value}</span></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div style={{ borderTop: '1px solid rgba(201,169,110,0.1)', paddingTop: 48 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: '#f0ede8', marginBottom: 32 }}>Customer Reviews</h2>
          {isAuthenticated && (
            <div style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 20, padding: 28, marginBottom: 32 }}>
              <h3 style={{ color: '#f0ede8', fontSize: 18, marginBottom: 20 }}>Write a Review</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[1, 2, 3, 4, 5].map(r => (
                  <button key={r} onClick={() => setReviewForm(f => ({ ...f, rating: r }))} style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', opacity: r <= reviewForm.rating ? 1 : 0.3, transition: '0.2s' }}>⭐</button>
                ))}
              </div>
              <input value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} placeholder="Review title (optional)" style={{ display: 'block', width: '100%', marginBottom: 12, background: '#0e0e22', border: '1px solid rgba(201,169,110,0.15)', borderRadius: 10, padding: '12px 16px', color: '#f0ede8', fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: 'none', boxSizing: 'border-box' }} />
              <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} placeholder="Share your experience with this product..." rows={4} style={{ display: 'block', width: '100%', marginBottom: 16, background: '#0e0e22', border: '1px solid rgba(201,169,110,0.15)', borderRadius: 10, padding: '12px 16px', color: '#f0ede8', fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              <button onClick={submitReview} disabled={submittingReview} style={{ background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', border: 'none', borderRadius: 10, padding: '12px 28px', color: '#060612', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", opacity: submittingReview ? 0.7 : 1 }}>
                {submittingReview ? 'Submitting...' : 'Submit Review ⭐'}
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
            {reviews.map(r => (
              <div key={r._id} style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.1)', borderRadius: 16, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#060612', fontWeight: 700, fontSize: 16 }}>{r.user?.name?.[0]}</div>
                    <div><div style={{ color: '#f0ede8', fontWeight: 600 }}>{r.user?.name}</div><div style={{ color: '#7a7a9a', fontSize: 12 }}>{new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', day: 'numeric' })}</div></div>
                  </div>
                  <span style={{ color: '#c9a96e', letterSpacing: 2 }}>{'★'.repeat(r.rating)}</span>
                </div>
                {r.title && <div style={{ color: '#f0ede8', fontWeight: 600, marginBottom: 8 }}>{r.title}</div>}
                <p style={{ color: 'rgba(240,237,232,0.7)', fontSize: 14, lineHeight: 1.7 }}>{r.comment}</p>
              </div>
            ))}
            {reviews.length === 0 && <div style={{ color: '#7a7a9a', fontSize: 15, padding: '20px 0' }}>No reviews yet. Be the first to review!</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
