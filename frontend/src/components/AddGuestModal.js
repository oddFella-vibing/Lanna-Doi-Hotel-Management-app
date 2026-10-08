import React, { useState } from 'react';
import { createGuest } from '../services/api';
import { FaTimes, FaUserPlus } from 'react-icons/fa';

export default function AddGuestModal({ isOpen, onClose, onGuestAdded }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    preferred_room_type: 'Standard Deluxe',
    house_number: '',
    street: '',
    district: '',
    sub_district: '',
    province: 'Chiang Mai'
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    createGuest(formData)
      .then(res => {
        setLoading(false);
        onGuestAdded(res.data.data ?? res.data);
        onClose();
      })
      .catch(err => {
        console.error("Failed to add guest:", err);
        setLoading(false);
      });
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--lanna-border)', paddingBottom: '10px' }}>
          <h3 style={{ margin: 0, color: 'var(--lanna-primary)', fontSize: '16px' }}>Register New Guest</h3>
          <button onClick={onClose} style={closeBtnStyle}><FaTimes size={14} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>First Name *</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Last Name *</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} style={inputStyle} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Phone Number *</label>
              <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} style={inputStyle} required />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Preferred Room Type</label>
            <select name="preferred_room_type" value={formData.preferred_room_type} onChange={handleChange} style={inputStyle}>
              <option value="Standard Deluxe">Standard Deluxe</option>
              <option value="Lanna Suite">Lanna Suite</option>
              <option value="Garden Villa">Garden Villa</option>
              <option value="Teak Wood Superior">Teak Wood Superior</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>House Number</label>
              <input type="text" name="house_number" value={formData.house_number} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Street / Road</label>
              <input type="text" name="street" value={formData.street} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>District / Amphoe</label>
              <input type="text" name="district" value={formData.district} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Province</label>
              <input type="text" name="province" value={formData.province} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" style={submitBtnStyle} disabled={loading}>
              <FaUserPlus size={12} /> {loading ? 'Saving...' : 'Save Guest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Styles
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalStyle = { background: 'var(--lanna-bg-surface)', padding: '20px', borderRadius: '10px', width: '440px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: '1px solid var(--lanna-border)' };
const labelStyle = { fontSize: '11px', color: 'var(--lanna-text-muted)', display: 'block', marginBottom: '3px', fontWeight: '600' };
const inputStyle = { width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--lanna-border-dark)', fontSize: '12px', outline: 'none', background: 'var(--lanna-bg-main)', boxSizing: 'border-box' };
const closeBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lanna-text-muted)' };
const cancelBtnStyle = { background: 'var(--lanna-bg-subtle)', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', color: 'var(--lanna-text-main)' };
const submitBtnStyle = { background: 'var(--lanna-primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' };