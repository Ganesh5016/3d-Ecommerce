import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { aiAPI } from '../../utils/api';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { count, openCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
    setSearchOpen(false);
  }, [location]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setSearching(true);
        try {
          const { data } = await aiAPI.search(searchQuery);
          setSearchResults(data.products || []);
        } catch { setSearchResults([]); }
        setSearching(false);
      } else { setSearchResults([]); }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) { setSearchOpen(false); setSearchResults([]); }
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => { await logout(); navigate('/'); };

  const navLinks = [
    { to: '/products', label: 'Shop' },
    { to: '/products?category=electronics', label: 'Electronics' },
    { to: '/products?category=fashion', label: 'Fashion' },
    { to: '/products?category=beauty', label: 'Beauty' },
  ];

  return (
    <nav style={{ ...s.nav, background: scrolled ? 'rgba(6,6,18,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(201,169,110,0.15)' : '1px solid transparent' }}>
      {/* Logo */}
      <Link to="/" style={s.logo}>LUXE</Link>

      {/* Desktop links */}
      <ul style={s.links}>
        {navLinks.map(l => (
          <li key={l.to}><Link to={l.to} style={{ ...s.link, color: location.pathname === l.to ? '#c9a96e' : 'rgba(240,237,232,0.65)' }}>{l.label}</Link></li>
        ))}
      </ul>

      {/* Actions */}
      <div style={s.actions}>
        {/* Search */}
        <div ref={searchRef} style={{ position: 'relative' }}>
          <button onClick={() => setSearchOpen(!searchOpen)} style={s.iconBtn}>🔍</button>
          {searchOpen && (
            <div style={s.searchDropdown}>
              <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products, brands..." style={s.searchInput}
                onKeyDown={e => e.key === 'Enter' && searchQuery && navigate(`/products?keyword=${searchQuery}`)} />
              {searching && <div style={s.searchLoading}>Searching...</div>}
              {searchResults.length > 0 && (
                <div style={s.searchResults}>
                  {searchResults.slice(0, 6).map(p => (
                    <Link key={p._id} to={`/products/${p._id}`} style={s.searchItem} onClick={() => setSearchOpen(false)}>
                      <span style={{ fontSize: 24 }}>{p.emoji}</span>
                      <div><div style={{ color: '#f0ede8', fontSize: 14 }}>{p.name}</div><div style={{ color: '#7a7a9a', fontSize: 12 }}>₹{p.price?.toLocaleString()}</div></div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wishlist */}
        {isAuthenticated && <Link to="/wishlist" style={s.iconBtn}>🤍</Link>}

        {/* Cart */}
        <button onClick={openCart} style={{ ...s.iconBtn, position: 'relative' }}>
          🛒
          {count > 0 && <span style={s.badge}>{count}</span>}
        </button>

        {/* Auth */}
        {isAuthenticated ? (
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button onClick={() => setProfileOpen(!profileOpen)} style={s.avatarBtn}>
              {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : user?.name?.[0]?.toUpperCase()}
            </button>
            {profileOpen && (
              <div style={s.dropdown}>
                <div style={s.dropdownHeader}><div style={{ fontWeight: 600, color: '#f0ede8' }}>{user?.name}</div><div style={{ fontSize: 12, color: '#7a7a9a' }}>{user?.role}</div></div>
                <div style={s.dropdownDivider} />
                {[
                  { to: '/profile', icon: '👤', label: 'My Profile' },
                  { to: '/orders', icon: '📦', label: 'My Orders' },
                  { to: '/wishlist', icon: '🤍', label: 'Wishlist' },
                  ...(user?.role === 'admin' ? [{ to: '/admin', icon: '⚙️', label: 'Admin Panel' }] : []),
                ].map(item => (
                  <Link key={item.to} to={item.to} style={s.dropdownItem}>
                    <span>{item.icon}</span>{item.label}
                  </Link>
                ))}
                <div style={s.dropdownDivider} />
                <button onClick={handleLogout} style={s.logoutBtn}>🚪 Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <div style={s.authBtns}>
            <Link to="/login" style={s.loginBtn}>Sign In</Link>
            <Link to="/register" style={s.registerBtn}>Join Free</Link>
          </div>
        )}

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={s.hamburger}>{menuOpen ? '✕' : '☰'}</button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={s.mobileMenu}>
          {navLinks.map(l => <Link key={l.to} to={l.to} style={s.mobileLink}>{l.label}</Link>)}
          {!isAuthenticated && <><Link to="/login" style={s.mobileLink}>Sign In</Link><Link to="/register" style={s.mobileLink}>Create Account</Link></>}
          {isAuthenticated && <button onClick={handleLogout} style={{ ...s.mobileLink, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>Sign Out</button>}
        </div>
      )}
    </nav>
  );
}

const s = {
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900, padding: '18px 60px', display: 'flex', alignItems: 'center', gap: 40, transition: '0.3s', fontFamily: "'DM Sans',sans-serif" },
  logo: { fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, letterSpacing: 6, background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none', flexShrink: 0 },
  links: { display: 'flex', gap: 36, listStyle: 'none', margin: 0, padding: 0, flex: 1 },
  link: { textDecoration: 'none', fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', transition: '0.3s' },
  actions: { display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' },
  iconBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 20, padding: 8, lineHeight: 1, position: 'relative', color: '#f0ede8', transition: '0.2s' },
  badge: { position: 'absolute', top: 2, right: 2, background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', color: '#060612', width: 18, height: 18, borderRadius: '50%', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
  avatarBtn: { width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', border: 'none', cursor: 'pointer', color: '#060612', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  authBtns: { display: 'flex', gap: 10, alignItems: 'center' },
  loginBtn: { color: 'rgba(240,237,232,0.7)', textDecoration: 'none', fontSize: 13, letterSpacing: 1, padding: '8px 16px' },
  registerBtn: { background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', color: '#060612', textDecoration: 'none', fontSize: 13, fontWeight: 700, padding: '10px 20px', borderRadius: 25, letterSpacing: 0.5 },
  hamburger: { display: 'none', background: 'none', border: 'none', color: '#f0ede8', fontSize: 22, cursor: 'pointer', padding: 8 },
  searchDropdown: { position: 'absolute', top: '100%', right: 0, width: 380, background: '#0e0e22', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 16, padding: 12, zIndex: 1000, marginTop: 8 },
  searchInput: { width: '100%', background: '#12122a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 10, padding: '12px 16px', color: '#f0ede8', fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: 'none', boxSizing: 'border-box' },
  searchLoading: { textAlign: 'center', padding: '12px', color: '#7a7a9a', fontSize: 13 },
  searchResults: { marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 },
  searchItem: { display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px', borderRadius: 10, textDecoration: 'none', transition: '0.2s', background: 'transparent' },
  dropdown: { position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: '#0e0e22', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 16, width: 220, overflow: 'hidden', zIndex: 1000 },
  dropdownHeader: { padding: '16px 18px' },
  dropdownDivider: { height: 1, background: 'rgba(201,169,110,0.12)' },
  dropdownItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', color: 'rgba(240,237,232,0.8)', textDecoration: 'none', fontSize: 14, transition: '0.2s' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, width: '100%', fontFamily: "'DM Sans',sans-serif" },
  mobileMenu: { position: 'absolute', top: '100%', left: 0, right: 0, background: '#0e0e22', borderBottom: '1px solid rgba(201,169,110,0.15)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 4 },
  mobileLink: { padding: '14px 20px', color: 'rgba(240,237,232,0.8)', textDecoration: 'none', fontSize: 15, borderRadius: 10, display: 'block' },
};
