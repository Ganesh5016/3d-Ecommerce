import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', background: '#060612', fontFamily: "'DM Sans',sans-serif", textAlign: 'center', padding: 40 }}>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 120, fontWeight: 900, background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>404</div>
      <h2 style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, margin: '16px 0' }}>Page Not Found</h2>
      <p style={{ color: '#7a7a9a', fontSize: 16, marginBottom: 32, lineHeight: 1.7 }}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" style={{ background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', color: '#060612', padding: '14px 32px', borderRadius: 30, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>← Back to Home</Link>
    </div>
  );
}
