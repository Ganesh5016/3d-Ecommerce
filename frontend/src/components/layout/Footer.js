import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.top}>
        <div style={s.brand}>
          <div style={s.logo}>LUXE</div>
          <p style={s.tagline}>Redefining luxury shopping with AI-powered personalization. Your style, elevated.</p>
          <div style={s.socials}>
            {['𝕏', 'f', 'in', '📸'].map(icon => (
              <button key={icon} style={s.social}>{icon}</button>
            ))}
          </div>
        </div>
        {[
          { title: 'Shop', links: [{ l: 'New Arrivals', to: '/products?badge=NEW' }, { l: 'Electronics', to: '/products?category=electronics' }, { l: 'Fashion', to: '/products?category=fashion' }, { l: 'Beauty', to: '/products?category=beauty' }, { l: 'Home & Living', to: '/products?category=home' }] },
          { title: 'Account', links: [{ l: 'My Profile', to: '/profile' }, { l: 'My Orders', to: '/orders' }, { l: 'Wishlist', to: '/wishlist' }, { l: 'Addresses', to: '/profile' }, { l: 'Sign In', to: '/login' }] },
          { title: 'Help', links: [{ l: 'Track Order', to: '/orders' }, { l: 'Returns', to: '#' }, { l: 'Shipping Info', to: '#' }, { l: 'FAQ', to: '#' }, { l: 'Contact Us', to: '#' }] },
        ].map(col => (
          <div key={col.title}>
            <h4 style={s.colTitle}>{col.title}</h4>
            <ul style={s.colList}>
              {col.links.map(l => <li key={l.l}><Link to={l.to} style={s.colLink}>{l.l}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={s.bottom}>
        <span>© 2026 LUXE. All rights reserved.</span>
        <div style={s.bottomLinks}>
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(t => (
            <Link key={t} to="#" style={{ color: 'rgba(240,237,232,0.4)', textDecoration: 'none', fontSize: 13 }}>{t}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {['💳', '🔒', '📦'].map(icon => <span key={icon} style={{ fontSize: 18 }}>{icon}</span>)}
        </div>
      </div>
    </footer>
  );
}

const s = {
  footer: { background: '#040410', borderTop: '1px solid rgba(201,169,110,0.12)', fontFamily: "'DM Sans',sans-serif", padding: '72px 60px 32px' },
  top: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 },
  brand: { maxWidth: 280 },
  logo: { fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 900, letterSpacing: 8, background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 16 },
  tagline: { color: 'rgba(240,237,232,0.45)', fontSize: 14, lineHeight: 1.8, marginBottom: 24 },
  socials: { display: 'flex', gap: 10 },
  social: { width: 36, height: 36, background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: 8, color: '#c9a96e', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  colTitle: { color: '#f0ede8', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 },
  colList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 },
  colLink: { color: 'rgba(240,237,232,0.5)', textDecoration: 'none', fontSize: 14, transition: '0.2s' },
  bottom: { borderTop: '1px solid rgba(201,169,110,0.1)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, color: 'rgba(240,237,232,0.4)', fontSize: 13 },
  bottomLinks: { display: 'flex', gap: 24 },
};
