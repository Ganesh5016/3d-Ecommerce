import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { wishlistAPI } from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['electronics', 'fashion', 'beauty', 'home'];
const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-rating.average', label: 'Top Rated' },
  { value: '-soldCount', label: 'Best Selling' },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [wishlist, setWishlist] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    keyword: searchParams.get('keyword') || '',
    sort: '-createdAt',
    minPrice: '',
    maxPrice: '',
    rating: '',
    badge: searchParams.get('badge') || '',
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 12 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await productAPI.getAll(params);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to load products'); }
    setLoading(false);
  }, [filters, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (isAuthenticated) {
      wishlistAPI.get().then(({ data }) => setWishlist(data.wishlist?.map(p => p._id) || [])).catch(() => {});
    }
  }, [isAuthenticated]);

  const toggleWishlist = async (e, productId) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please login to save wishlist');
    try {
      const { data } = await wishlistAPI.toggle(productId);
      setWishlist(prev => data.added ? [...prev, productId] : prev.filter(id => id !== productId));
    } catch { toast.error('Failed to update wishlist'); }
  };

  const updateFilter = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setPage(1); };

  const skeletons = Array(12).fill(0);

  return (
    <div style={s.page}>
      {/* Page Header */}
      <div style={s.hero}>
        <span style={s.label}>✦ Discover</span>
        <h1 style={s.title}>All Products</h1>
        <p style={s.sub}>{total > 0 ? `${total} products found` : 'Explore our collection'}</p>
      </div>

      <div style={s.layout}>
        {/* Sidebar */}
        <aside style={s.sidebar}>
          <div style={s.filterSection}>
            <h3 style={s.filterTitle}>Categories</h3>
            <div style={s.filterList}>
              <button onClick={() => updateFilter('category', '')} style={{ ...s.filterBtn, ...(filters.category === '' ? s.filterBtnActive : {}) }}>All Products</button>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => updateFilter('category', cat)}
                  style={{ ...s.filterBtn, ...(filters.category === cat ? s.filterBtnActive : {}) }}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={s.filterSection}>
            <h3 style={s.filterTitle}>Price Range</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} style={s.priceInput} />
              <span style={{ color: '#7a7a9a' }}>—</span>
              <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} style={s.priceInput} />
            </div>
          </div>

          <div style={s.filterSection}>
            <h3 style={s.filterTitle}>Min Rating</h3>
            {[4, 3, 2].map(r => (
              <button key={r} onClick={() => updateFilter('rating', filters.rating == r ? '' : r)}
                style={{ ...s.filterBtn, ...(filters.rating == r ? s.filterBtnActive : {}) }}>
                {'★'.repeat(r)}{'☆'.repeat(5 - r)} & Up
              </button>
            ))}
          </div>

          <div style={s.filterSection}>
            <h3 style={s.filterTitle}>Badges</h3>
            {['NEW', 'SALE', 'BESTSELLER', 'HOT', 'TRENDING'].map(b => (
              <button key={b} onClick={() => updateFilter('badge', filters.badge === b ? '' : b)}
                style={{ ...s.filterBtn, ...(filters.badge === b ? s.filterBtnActive : {}) }}>{b}</button>
            ))}
          </div>

          <button onClick={() => { setFilters({ category: '', keyword: '', sort: '-createdAt', minPrice: '', maxPrice: '', rating: '', badge: '' }); setPage(1); }} style={s.clearBtn}>
            Clear All Filters
          </button>
        </aside>

        {/* Main content */}
        <div style={{ flex: 1 }}>
          {/* Toolbar */}
          <div style={s.toolbar}>
            <input placeholder="🔍 Search products..." value={filters.keyword}
              onChange={e => updateFilter('keyword', e.target.value)} style={s.searchInput} />
            <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)} style={s.sortSelect}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Grid */}
          <div style={s.grid}>
            {loading ? skeletons.map((_, i) => (
              <div key={i} style={s.skeleton}>
                <div style={s.skeletonImg} />
                <div style={s.skeletonContent}>
                  <div style={s.skeletonLine} />
                  <div style={{ ...s.skeletonLine, width: '60%' }} />
                  <div style={{ ...s.skeletonLine, width: '40%' }} />
                </div>
              </div>
            )) : products.map(product => (
              <ProductCard key={product._id} product={product} onAddCart={() => addItem(product)}
                wishlisted={wishlist.includes(product._id)} onWishlist={(e) => toggleWishlist(e, product._id)} />
            ))}
          </div>

          {!loading && products.length === 0 && (
            <div style={s.noResults}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🔍</div>
              <h3 style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 24, marginBottom: 8 }}>No products found</h3>
              <p style={{ color: '#7a7a9a' }}>Try adjusting your filters or search terms</p>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div style={s.pagination}>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{ ...s.pageBtn, ...(p === page ? s.pageBtnActive : {}) }}>{p}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onAddCart, wishlisted, onWishlist }) {
  const [added, setAdded] = useState(false);
  const handleAdd = (e) => {
    e.preventDefault();
    onAddCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link to={`/products/${product._id}`} style={s.card}>
      <div style={s.cardImg}>
        <span style={s.emoji}>{product.emoji}</span>
        {product.badge && <span style={s.badge}>{product.badge}</span>}
        <button onClick={onWishlist} style={s.wishBtn}>{wishlisted ? '❤️' : '🤍'}</button>
        {product.discountPercent > 0 && <span style={s.discount}>-{product.discountPercent}%</span>}
      </div>
      <div style={s.cardBody}>
        <div style={s.brand}>{product.brand}</div>
        <div style={s.name}>{product.name}</div>
        <div style={s.rating}>
          <span style={{ color: '#c9a96e' }}>{'★'.repeat(Math.round(product.rating?.average || 0))}</span>
          <span style={{ color: '#7a7a9a', fontSize: 12 }}>({(product.rating?.count || 0).toLocaleString()})</span>
        </div>
        <div style={s.priceRow}>
          <span style={s.price}>₹{product.price?.toLocaleString()}</span>
          {product.originalPrice > product.price && <span style={s.oldPrice}>₹{product.originalPrice?.toLocaleString()}</span>}
        </div>
        <button onClick={handleAdd} style={{ ...s.addBtn, ...(added ? { background: 'linear-gradient(135deg,#2ecc71,#27ae60)' } : {}) }}>
          {added ? '✓ Added' : '+ Add to Cart'}
        </button>
      </div>
    </Link>
  );
}

const s = {
  page: { background: '#060612', minHeight: '100vh', paddingTop: 80, fontFamily: "'DM Sans',sans-serif" },
  hero: { padding: '60px 60px 40px', borderBottom: '1px solid rgba(201,169,110,0.1)' },
  label: { fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: '#c9a96e', display: 'block', marginBottom: 12 },
  title: { fontFamily: "'Playfair Display',serif", fontSize: 48, fontWeight: 700, color: '#f0ede8', marginBottom: 8 },
  sub: { color: '#7a7a9a', fontSize: 16 },
  layout: { display: 'flex', gap: 40, padding: '40px 60px' },
  sidebar: { width: 240, flexShrink: 0 },
  filterSection: { marginBottom: 32 },
  filterTitle: { color: '#f0ede8', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 },
  filterList: { display: 'flex', flexDirection: 'column', gap: 6 },
  filterBtn: { background: 'transparent', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 10, padding: '10px 14px', color: 'rgba(240,237,232,0.6)', cursor: 'pointer', fontSize: 13, textAlign: 'left', fontFamily: "'DM Sans',sans-serif", transition: '0.2s' },
  filterBtnActive: { background: 'rgba(201,169,110,0.1)', borderColor: '#c9a96e', color: '#c9a96e' },
  priceInput: { width: '50%', background: '#12122a', border: '1px solid rgba(201,169,110,0.15)', borderRadius: 8, padding: '8px 12px', color: '#f0ede8', fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: 'none' },
  clearBtn: { width: '100%', background: 'transparent', border: '1px solid rgba(231,76,60,0.3)', color: '#e74c3c', borderRadius: 10, padding: '10px', cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans',sans-serif', marginTop: 8" },
  toolbar: { display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' },
  searchInput: { flex: 1, minWidth: 200, background: '#12122a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 12, padding: '12px 16px', color: '#f0ede8', fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: 'none' },
  sortSelect: { background: '#12122a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 12, padding: '12px 16px', color: '#f0ede8', fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: 'none', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 24 },
  card: { background: '#12122a', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(201,169,110,0.12)', textDecoration: 'none', display: 'block', transition: '0.3s' },
  cardImg: { height: 220, background: '#0e0e22', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  emoji: { fontSize: 90, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))', animation: 'float 3s ease-in-out infinite' },
  badge: { position: 'absolute', top: 12, left: 12, background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', color: '#060612', padding: '3px 10px', borderRadius: 15, fontSize: 10, fontWeight: 700 },
  discount: { position: 'absolute', top: 12, right: 48, background: '#e74c3c', color: '#fff', padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700 },
  wishBtn: { position: 'absolute', top: 10, right: 12, background: 'rgba(14,14,34,0.7)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 },
  cardBody: { padding: 20 },
  brand: { fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#c9a96e', marginBottom: 6 },
  name: { color: '#f0ede8', fontSize: 17, fontFamily: "'Playfair Display',serif", fontWeight: 700, marginBottom: 8, lineHeight: 1.3 },
  rating: { display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 },
  priceRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
  price: { color: '#c9a96e', fontSize: 22, fontFamily: "'Playfair Display',serif", fontWeight: 700 },
  oldPrice: { color: '#7a7a9a', fontSize: 14, textDecoration: 'line-through' },
  addBtn: { width: '100%', background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', border: 'none', borderRadius: 10, padding: '11px', color: '#060612', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: '0.3s' },
  skeleton: { background: '#12122a', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(201,169,110,0.06)' },
  skeletonImg: { height: 220, background: 'linear-gradient(90deg,#12122a 25%,#1a1a3e 50%,#12122a 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' },
  skeletonContent: { padding: 20, display: 'flex', flexDirection: 'column', gap: 10 },
  skeletonLine: { height: 14, background: 'linear-gradient(90deg,#12122a 25%,#1a1a3e 50%,#12122a 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 7, width: '80%' },
  noResults: { textAlign: 'center', padding: '80px 40px' },
  pagination: { display: 'flex', gap: 8, justifyContent: 'center', padding: '40px 0' },
  pageBtn: { width: 40, height: 40, background: '#12122a', border: '1px solid rgba(201,169,110,0.15)', borderRadius: 10, color: '#7a7a9a', cursor: 'pointer', fontSize: 14, fontFamily: "'DM Sans',sans-serif", transition: '0.2s' },
  pageBtnActive: { background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', color: '#060612', borderColor: '#c9a96e', fontWeight: 700 },
};
