import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../utils/api';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'card', icon: '💳', label: 'Credit / Debit Card' },
  { id: 'upi', icon: '📱', label: 'UPI Payment' },
  { id: 'cod', icon: '💵', label: 'Cash on Delivery' },
  { id: 'wallet', icon: '👜', label: 'LUXE Wallet' },
];

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '', country: 'India' });
  const [paymentMethod, setPaymentMethod] = useState('card');

  const shipping = total >= 999 ? 0 : 99;
  const tax = Math.round(total * 0.18);
  const grandTotal = total + shipping + tax;

  const updateAddress = (k, v) => setAddress(a => ({ ...a, [k]: v }));

  const validateAddress = () => {
    const required = ['fullName', 'phone', 'street', 'city', 'state', 'pincode'];
    return required.every(k => address[k].trim());
  };

  const placeOrder = async () => {
    if (!validateAddress()) return toast.error('Please fill all address fields');
    setLoading(true);
    try {
      const orderItems = items.map(i => ({ product: i._id, quantity: i.quantity }));
      const { data } = await orderAPI.create({ items: orderItems, shippingAddress: address, paymentMethod });
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', background: '#0e0e22', border: '1px solid rgba(201,169,110,0.15)', borderRadius: 12, padding: '12px 16px', color: '#f0ede8', fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ background: '#060612', minHeight: '100vh', paddingTop: 80, fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ padding: '40px 60px' }}>
        {/* Steps */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 48, background: '#12122a', borderRadius: 16, padding: '4px', maxWidth: 500 }}>
          {[['1', 'Address'], ['2', 'Payment'], ['3', 'Review']].map(([n, l]) => (
            <div key={n} onClick={() => n < step && setStep(Number(n))} style={{ flex: 1, padding: '12px', textAlign: 'center', borderRadius: 12, background: step >= Number(n) ? 'linear-gradient(135deg,#c9a96e,#e8c99a)' : 'transparent', color: step >= Number(n) ? '#060612' : '#7a7a9a', cursor: n < step ? 'pointer' : 'default', fontWeight: step >= Number(n) ? 700 : 400, fontSize: 13, transition: '0.3s' }}>
              {n}. {l}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40, alignItems: 'start' }}>
          <div style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 20, padding: 32 }}>
            {step === 1 && (
              <>
                <h2 style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 24, marginBottom: 28 }}>Delivery Address</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  {[['fullName', 'Full Name', '1/-1'], ['phone', 'Phone Number', '1/-1'], ['street', 'Street Address', '1/-1'], ['city', 'City', ''], ['state', 'State', ''], ['pincode', 'Pincode', '']].map(([k, l, span]) => (
                    <div key={k} style={{ gridColumn: span || 'auto' }}>
                      <label style={{ display: 'block', color: 'rgba(240,237,232,0.6)', fontSize: 12, marginBottom: 8 }}>{l}</label>
                      <input value={address[k]} onChange={e => updateAddress(k, e.target.value)} style={inputStyle} placeholder={l} />
                    </div>
                  ))}
                </div>
                <button onClick={() => { if (!validateAddress()) return toast.error('Fill all fields'); setStep(2); }}
                  style={{ background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', border: 'none', borderRadius: 12, padding: '14px 32px', color: '#060612', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                  Continue to Payment →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 24, marginBottom: 28 }}>Payment Method</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                  {PAYMENT_METHODS.map(pm => (
                    <div key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderRadius: 14, border: `1px solid ${paymentMethod === pm.id ? '#c9a96e' : 'rgba(201,169,110,0.12)'}`, background: paymentMethod === pm.id ? 'rgba(201,169,110,0.08)' : 'transparent', cursor: 'pointer', transition: '0.2s' }}>
                      <span style={{ fontSize: 28 }}>{pm.icon}</span>
                      <span style={{ color: '#f0ede8', fontSize: 15 }}>{pm.label}</span>
                      {paymentMethod === pm.id && <span style={{ marginLeft: 'auto', color: '#c9a96e', fontSize: 20 }}>✓</span>}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setStep(1)} style={{ background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 12, padding: '14px 24px', color: '#c9a96e', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>← Back</button>
                  <button onClick={() => setStep(3)} style={{ flex: 1, background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', border: 'none', borderRadius: 12, padding: '14px', color: '#060612', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Review Order →</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 24, marginBottom: 28 }}>Review & Place Order</h2>
                <div style={{ background: '#0e0e22', borderRadius: 14, padding: 20, marginBottom: 20 }}>
                  <div style={{ color: '#c9a96e', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Delivering to</div>
                  <div style={{ color: 'rgba(240,237,232,0.8)', fontSize: 14, lineHeight: 1.8 }}>{address.fullName} · {address.phone}<br />{address.street}, {address.city} {address.pincode}, {address.state}</div>
                </div>
                <div style={{ background: '#0e0e22', borderRadius: 14, padding: 20, marginBottom: 24 }}>
                  <div style={{ color: '#c9a96e', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Payment</div>
                  <div style={{ color: 'rgba(240,237,232,0.8)', fontSize: 14 }}>{PAYMENT_METHODS.find(p => p.id === paymentMethod)?.icon} {PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}</div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setStep(2)} style={{ background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 12, padding: '14px 24px', color: '#c9a96e', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>← Back</button>
                  <button onClick={placeOrder} disabled={loading} style={{ flex: 1, background: 'linear-gradient(135deg,#c9a96e,#e8c99a)', border: 'none', borderRadius: 12, padding: '14px', color: '#060612', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Placing Order...' : `Place Order · ₹${grandTotal.toLocaleString()}`}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Order Summary */}
          <div style={{ background: '#12122a', border: '1px solid rgba(201,169,110,0.12)', borderRadius: 20, padding: 24, position: 'sticky', top: 100 }}>
            <h3 style={{ color: '#f0ede8', fontFamily: "'Playfair Display',serif", fontSize: 20, marginBottom: 20 }}>Order ({items.length} items)</h3>
            {items.map(i => (
              <div key={i._id} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'center' }}>
                <span style={{ fontSize: 32 }}>{i.emoji}</span>
                <div style={{ flex: 1 }}><div style={{ color: '#f0ede8', fontSize: 13, fontWeight: 600 }}>{i.name}</div><div style={{ color: '#7a7a9a', fontSize: 12 }}>Qty: {i.quantity}</div></div>
                <div style={{ color: '#c9a96e', fontSize: 14, fontWeight: 600 }}>₹{(i.price * i.quantity).toLocaleString()}</div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(201,169,110,0.12)', paddingTop: 16, marginTop: 8 }}>
              {[['Subtotal', `₹${total.toLocaleString()}`], ['Shipping', shipping === 0 ? 'FREE' : `₹${shipping}`], ['Tax (18%)', `₹${tax.toLocaleString()}`]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}><span style={{ color: '#7a7a9a' }}>{k}</span><span style={{ color: '#f0ede8' }}>{v}</span></div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(201,169,110,0.12)' }}>
                <span style={{ color: '#f0ede8', fontWeight: 700 }}>Total</span>
                <span style={{ color: '#c9a96e', fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700 }}>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
