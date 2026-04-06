import React from 'react';

export default function LoadingSpinner({ fullScreen = true, size = 48 }) {
  const containerStyle = fullScreen
    ? { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#060612', flexDirection: 'column', gap: 20 }
    : { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 };

  return (
    <div style={containerStyle}>
      <div style={{
        width: size, height: size,
        border: `3px solid rgba(201,169,110,0.15)`,
        borderTop: `3px solid #c9a96e`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {fullScreen && <span style={{ color: 'rgba(201,169,110,0.6)', fontSize: 14, letterSpacing: 3, textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif" }}>LUXE</span>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
