import React, { useState, useEffect } from 'react';
import { createService, deleteService, getServices } from '../services/api';
import { FaPlus, FaTrash, FaConciergeBell } from 'react-icons/fa';

export default function GuestServices({ guestBookings }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [chargedAmount, setChargedAmount] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState('');

  // Extract booking IDs available for this guest
  const bookingIds = guestBookings.map(b => b.booking_id);

  useEffect(() => {
    if (guestBookings.length > 0) {
      if (!selectedBookingId) {
        setSelectedBookingId(guestBookings[0].booking_id);
      }
      fetchServices();
    }
  }, [guestBookings]);

  const fetchServices = () => {
    setLoading(true);
    // Fetch all services and filter for bookings belonging to this guest
    getServices()
      .then(res => {
        const allServices = res.data.data ?? res.data;
        const guestServices = Array.isArray(allServices)
          ? allServices.filter(s => bookingIds.includes(s.booking_id))
          : [];
        setServices(guestServices);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch services:", err);
        setLoading(false);
      });
  };

  const handleAddService = (e) => {
    e.preventDefault();
    if (!selectedBookingId || !description || !chargedAmount) return;

    createService({
      description,
      charged_amount: parseFloat(chargedAmount),
      booking_id: parseInt(selectedBookingId, 10)
    })
      .then(() => {
        setDescription('');
        setChargedAmount('');
        fetchServices();
      })
      .catch(err => console.error("Failed to add service charge:", err));
  };

  const handleDeleteService = (serviceId) => {
    deleteService(serviceId)
      .then(() => fetchServices())
      .catch(err => console.error("Failed to delete service:", err));
  };

  if (guestBookings.length === 0) {
    return (
      <div style={{ fontSize: '12px', color: 'var(--lanna-text-muted)', textAlign: 'center', padding: '20px' }}>
        No bookings found. Register a booking before adding service charges.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--lanna-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <FaConciergeBell size={13} color="var(--lanna-terracotta)" /> Incidental & Service Charges
      </div>

      {/* Add Service Form */}
      <form onSubmit={handleAddService} style={{ background: 'var(--lanna-bg-subtle)', padding: '10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div>
          <label style={labelStyle}>Select Booking</label>
          <select 
            value={selectedBookingId} 
            onChange={(e) => setSelectedBookingId(e.target.value)}
            style={inputStyle}
          >
            {guestBookings.map(b => (
              <option key={b.booking_id} value={b.booking_id}>
                Booking #{b.booking_id} ({b.check_in_date?.substring(0, 10)})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
          <div>
            <label style={labelStyle}>Service Description</label>
            <input 
              type="text" 
              placeholder="e.g. Lanna Spa / Airport Transfer" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              style={inputStyle} 
              required 
            />
          </div>
          <div>
            <label style={labelStyle}>Amount (฿)</label>
            <input 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              value={chargedAmount} 
              onChange={(e) => setChargedAmount(e.target.value)} 
              style={inputStyle} 
              required 
            />
          </div>
        </div>

        <button type="submit" style={submitBtnStyle}>
          <FaPlus size={10} /> Add Charge
        </button>
      </form>

      {/* Service List Table/Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
        {loading ? (
          <p style={{ fontSize: '11px', color: 'var(--lanna-text-muted)', textAlign: 'center' }}>Loading services...</p>
        ) : services.length > 0 ? (
          services.map(s => (
            <div key={s.service_id} style={serviceCardStyle}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--lanna-text-main)' }}>{s.description}</div>
                <div style={{ fontSize: '10px', color: 'var(--lanna-text-muted)' }}>Booking #{s.booking_id}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--lanna-terracotta)' }}>฿{s.charged_amount}</span>
                <button onClick={() => handleDeleteService(s.service_id)} style={deleteBtnStyle} title="Remove Charge">
                  <FaTrash size={11} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ fontSize: '11px', color: 'var(--lanna-text-muted)', textAlign: 'center', padding: '10px 0' }}>No service charges recorded.</p>
        )}
      </div>
    </div>
  );
}

// Styling Constants
const labelStyle = { fontSize: '10px', color: 'var(--lanna-text-muted)', display: 'block', marginBottom: '2px', fontWeight: '600' };
const inputStyle = { width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--lanna-border-dark)', fontSize: '11px', outline: 'none', background: 'white', boxSizing: 'border-box' };
const submitBtnStyle = { background: '#398c6b', color: 'white', border: 'none', borderRadius: '4px', padding: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' };
const serviceCardStyle = { background: 'white', border: '1px solid var(--lanna-border)', borderRadius: '6px', padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const deleteBtnStyle = { background: 'none', border: 'none', color: '#c5221f', cursor: 'pointer', padding: '4px' };