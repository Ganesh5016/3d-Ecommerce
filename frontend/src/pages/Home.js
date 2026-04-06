import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, aiAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: 'bot', text: 'Hi! 👋 I\'m your LUXE AI Stylist. Ask me anything about products, orders, or styling!' }]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const heroCanvasRef = useRef(null);
  const { addItem } = useCart();

  useEffect(() => {
    productAPI.getFeatured().then(({ data }) => setFeatured(data.products || [])).catch(() => {});
  }, []);

  // Three.js hero animation
  useEffect(() => {
    if (!heroCanvasRef.current || !window.THREE) return;
    const THREE = window.THREE;
    const canvas = heroCanvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    camera.position.z = 6;
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pl1 = new THREE.PointLight(0xc9a96e, 2, 20);
    pl1.position.set(3, 3, 3);
    scene.add(pl1);
    const pl2 = new THREE.PointLight(0x6655ff, 1.5, 15);
    pl2.position.set(-3, -2, 2);
    scene.add(pl2);
    const geos = [new THREE.IcosahedronGeometry(0.6, 1), new THREE.OctahedronGeometry(0.5), new THREE.TorusGeometry(0.4, 0.15, 12, 40), new THREE.BoxGeometry(0.7, 0.7, 0.7)];
    const objs = Array.from({ length: 28 }, () => {
      const mesh = new THREE.Mesh(geos[Math.floor(Math.random() * geos.length)], new THREE.MeshPhongMaterial({ color: new THREE.Color().setHSL(0.08 + Math.random() * 0.1, 0.6, 0.3 + Math.random() * 0.3), wireframe: Math.random() > 0.5, transparent: true, opacity: 0.15 + Math.random() * 0.3 }));
      mesh.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6 - 3);
      mesh.userData = { rx: (Math.random() - 0.5) * 0.008, ry: (Math.random() - 0.5) * 0.012, fo: Math.random() * Math.PI * 2 };
      scene.add(mesh);
      return mesh;
    });
    const hero = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 2), new THREE.MeshPhongMaterial({ color: 0xc9a96e, wireframe: true, transparent: true, opacity: 0.22 }));
    scene.add(hero);
    let t = 0, raf;
    const animate = () => { raf = requestAnimationFrame(animate); t += 0.01; hero.rotation.x += 0.003; hero.rotation.y += 0.005; objs.forEach(o => { o.rotation.x += o.userData.rx; o.rotation.y += o.userData.ry; o.position.y += Math.sin(t + o.userData.fo) * 0.004; }); renderer.render(scene, camera); };
    animate();
    const onMouse = (e) => { const x = (e.clientX / window.innerWidth - 0.5) * 0.3, y = -(e.clientY / window.innerHeight - 0.5) * 0.2; camera.position.x += (x - camera.position.x) * 0.05; camera.position.y += (y - camera.position.y) * 0.05; camera.lookAt(scene.position); };
    document.addEventListener('mousemove', onMouse);
    return () => { cancelAnimationFrame(raf); document.removeEventListener('mousemove', onMouse); renderer.dispose(); };
  }, []);

  const sendChat = async () => {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatMessages(m => [...m, { role: 'user', text: msg }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const { data } = await aiAPI.chat({ message: msg });
      setChatMessages(m => [...m, { role: 'bot', text: data.reply }]);
    } catch {
      setChatMessages(m => [...m, { role: 'bot', text: 'Sorry, I\'m having trouble connecting. Please try again!' }]);
    }
    setChatLoading(false);
  };

  const categories = [
    { name: 'Electronics', icon: '💻', count: '48+', to: '/products?category=electronics', gradient: 'linear-gradient(135deg,#1a1a3e,#2d1b69)' },
    { name: 'Fashion', icon: '👗', count: '96+', to: '/products?category=fashion', gradient: 'linear-gradient(135deg,#1e2a1a,#2d4a1e)' },
    { name: 'Beauty', icon: '💄', count: '72+', to: '/products?category=beauty', gradient: 'linear-gradient(135deg,#2a1a1a,#4a1e1e)' },
    { name: 'Home', icon: '🏠', count: '55+', to: '/products?category=home', gradient: 'linear-gradient(135deg,#1a2a2a,#1e4a4a)' },
  ];

  return (
    <div style={{ background: '#060612', fontFamily: "'DM Sans',sans-serif" }}>
      {/* HERO */}
      <section style={{ position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <canvas ref={heroCanvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 800, padding: '0 40px' }}>
          <span style={{ fontSize: 11, letterSpacing: 6, textTransform: 'uppercase', color: '#c9a96e', display: 'block', marginBottom: 24 }}>✦ New Season 2026 Collection</span>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(52px,8vw,96px)', fontWeight: 900, lineHeight: 1.0, marginBottom: 28, color: '#f0ede8' }}>
            Redefine<br /><span style={{ background: 'linear-gradient(135deg,#c9a96e,#e8c99a,#fff8ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Your Style</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(240,237,232,0.6)', lineHeight: 1.8, marginBottom: 48, fontWeight: 300 }}>AI-powered luxury shopping — curated for those who dare to be different.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" style={{ background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', color: '#060612', padding: '16px 40px', borderRadius: 50, textDecoration: 'none', fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', transition: '0.3s' }}>Explore Collection</Link>
            <Link to="/products?badge=SALE" style={{ background: 'transparent', color: '#f0ede8', padding: '16px 40px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 50, textDecoration: 'none', fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' }}>Shop Sale →</Link>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ padding: '16px 0', borderTop: '1px solid rgba(201,169,110,0.1)', borderBottom: '1px solid rgba(201,169,110,0.1)', overflow: 'hidden', background: 'rgba(201,169,110,0.02)' }}>
        <div style={{ display: 'flex', gap: 60, whiteSpace: 'nowrap', animation: 'marquee 18s linear infinite' }}>
          {['✦ Free shipping above ₹999', '✦ AI-powered recommendations', '✦ 30-day easy returns', '✦ Exclusive member deals', '✦ Verified luxury brands', '✦ Free shipping above ₹999', '✦ AI-powered recommendations', '✦ 30-day easy returns', '✦ Exclusive member deals'].map((t, i) => (
            <span key={i} style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: '#7a7a9a' }}>{t}</span>
          ))}
        </div>
      </div>
      <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}@keyframes float{0%,100%{transform:translateY(0) rotateY(0deg)}50%{transform:translateY(-12px) rotateY(15deg)}}`}</style>

      {/* CATEGORIES */}
      <section style={{ padding: '100px 60px' }}>
        <span style={{ fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: '#c9a96e', display: 'block', marginBottom: 16 }}>✦ Collections</span>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(36px,5vw,56px)', fontWeight: 700, color: '#f0ede8', marginBottom: 48, lineHeight: 1.15 }}>Shop by<br />Category</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {categories.map(cat => (
            <Link key={cat.name} to={cat.to} style={{ background: cat.gradient, borderRadius: 24, padding: '40px 32px', textDecoration: 'none', display: 'block', transition: '0.4s', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: 64, display: 'block', marginBottom: 20, filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.4))' }}>{cat.icon}</span>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#f0ede8', marginBottom: 6 }}>{cat.name}</div>
              <div style={{ fontSize: 13, color: 'rgba(240,237,232,0.55)' }}>{cat.count} products</div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section style={{ padding: '0 60px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <span style={{ fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: '#c9a96e', display: 'block', marginBottom: 12 }}>✦ Handpicked</span>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 48, fontWeight: 700, color: '#f0ede8' }}>Featured Products</h2>
          </div>
          <Link to="/products" style={{ color: '#c9a96e', textDecoration: 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>View All →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 24 }}>
          {featured.slice(0, 8).map(p => (
            <Link key={p._id} to={`/products/${p._id}`} style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 20, overflow: 'hidden', textDecoration: 'none', display: 'block', transition: '0.3s' }}>
              <div style={{ height: 220, background: '#0e0e22', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', fontSize: 90, animation: 'float 3s ease-in-out infinite' }}>
                {p.emoji}
                {p.badge && <span style={{ position: 'absolute', top: 12, left: 12, background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', color: '#060612', padding: '3px 10px', borderRadius: 15, fontSize: 10, fontWeight: 700 }}>{p.badge}</span>}
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#c9a96e', marginBottom: 6 }}>{p.brand}</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#f0ede8', marginBottom: 10, lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#c9a96e' }}>₹{p.price?.toLocaleString()}</span>
                  <button onClick={(e) => { e.preventDefault(); addItem(p); }} style={{ background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', border: 'none', borderRadius: 20, padding: '8px 16px', color: '#060612', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Add +</button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* AI SECTION */}
      <section style={{ padding: '80px 60px', background: 'linear-gradient(135deg,#0a0a20,#12122a)', textAlign: 'center' }}>
        <span style={{ fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: '#c9a96e', display: 'block', marginBottom: 16 }}>✦ AI-Powered</span>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 48, fontWeight: 700, color: '#f0ede8', marginBottom: 16, lineHeight: 1.2 }}>Your Personal AI Stylist</h2>
        <p style={{ color: '#7a7a9a', fontSize: 16, marginBottom: 40, lineHeight: 1.7 }}>Smart recommendations, visual search, and a chatbot that knows your style inside out.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, maxWidth: 900, margin: '0 auto' }}>
          {[{ icon: '🧠', title: 'Smart Recommendations', desc: 'AI that learns your taste and surfaces exactly what you need.' }, { icon: '🔍', title: 'Semantic Search', desc: 'Search naturally — typos and all. Our AI understands context.' }, { icon: '💬', title: 'AI Chat Assistant', desc: 'Ask anything. Product help, styling tips, order tracking — 24/7.' }].map(f => (
            <div key={f.title} style={{ background: 'rgba(201,169,110,0.04)', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 20, padding: '28px 24px', textAlign: 'left' }}>
              <span style={{ fontSize: 40, display: 'block', marginBottom: 16 }}>{f.icon}</span>
              <h3 style={{ fontFamily: "'Playfair Display',serif", color: '#f0ede8', fontSize: 20, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: '#7a7a9a', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: '80px 60px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 40, textAlign: 'center' }}>
        {[['250+', 'Luxury Brands'], ['1.2M+', 'Happy Customers'], ['98%', 'Satisfaction Rate'], ['48', 'Countries Delivered']].map(([n, l]) => (
          <div key={l}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 52, fontWeight: 900, background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>{n}</div>
            <div style={{ fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', color: '#7a7a9a' }}>{l}</div>
          </div>
        ))}
      </section>

      {/* CHATBOT FAB */}
      <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 999 }}>
        <button onClick={() => setChatOpen(!chatOpen)} style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', border: 'none', fontSize: 28, cursor: 'pointer', boxShadow: '0 8px 30px rgba(201,169,110,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💬</button>
        {chatOpen && (
          <div style={{ position: 'absolute', bottom: 76, right: 0, width: 340, background: '#0e0e22', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(201,169,110,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✨</div>
              <div><div style={{ color: '#f0ede8', fontWeight: 600, fontSize: 15 }}>LUXE AI Stylist</div><div style={{ color: '#2ecc71', fontSize: 12 }}>● Online</div></div>
              <button onClick={() => setChatOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#7a7a9a', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '16px', maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {chatMessages.map((m, i) => (
                <div key={i} style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: 14, fontSize: 13, lineHeight: 1.6, background: m.role === 'bot' ? '#12122a' : 'linear-gradient(135deg,#c9a96e,#e8c99a)', color: m.role === 'bot' ? '#f0ede8' : '#060612', alignSelf: m.role === 'bot' ? 'flex-start' : 'flex-end', borderBottomLeftRadius: m.role === 'bot' ? 4 : 14, borderBottomRightRadius: m.role === 'user' ? 4 : 14 }}>{m.text}</div>
              ))}
              {chatLoading && <div style={{ color: '#7a7a9a', fontSize: 12, padding: '4px 14px' }}>Thinking...</div>}
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(201,169,110,0.1)', display: 'flex', gap: 8 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Ask me anything..." style={{ flex: 1, background: '#12122a', border: '1px solid rgba(201,169,110,0.15)', borderRadius: 20, padding: '9px 14px', color: '#f0ede8', fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: 'none' }} />
              <button onClick={sendChat} style={{ background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>➤</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
