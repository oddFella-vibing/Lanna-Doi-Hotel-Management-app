import { useEffect, useState } from 'react';
import { getRooms } from '../services/api';
import { FaBed, FaCheckCircle, FaBroom, FaTools } from 'react-icons/fa';

function OperationsSummary() {
  const [stats, setStats] = useState({
    occupied: 0, available: 0, cleaning: 0, maintenance: 0, total: 0
  });

  useEffect(() => {
    getRooms()
      .then(res => {
        const rooms = res.data.data ?? res.data;
        const counts = { occupied: 0, available: 0, cleaning: 0, maintenance: 0 };
        console.log('Fetched rooms:', rooms); // Debugging line
        rooms.forEach(r => {
          const s = (r.room_status || '').toLowerCase();
          if (s === 'occupied') counts.occupied++;
          else if (s === 'available') counts.available++;
          else if (s === 'cleaning') counts.cleaning++;
          else if (s === 'maintenance') counts.maintenance++;
        });
        setStats({ ...counts, total: rooms.length });
      });
  }, []);

  const cards = [
    { label: 'Occupied',    value: stats.occupied,    color: '#1e3a2f', Icon: FaBed },
    { label: 'Available',   value: stats.available,   color: '#2d5a47', Icon: FaCheckCircle },
    { label: 'Cleaning',    value: stats.cleaning,    color: '#f59e0b', Icon: FaBroom },
    { label: 'Maintenance', value: stats.maintenance, color: '#78909c', Icon: FaTools },
  ];

  return (
    <div style={panelStyle}>
      <h3 style={panelTitle}>OPERATIONS SUMMARY</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {cards.map(c => {
          const Icon = c.Icon;
          return (
            <div key={c.label} style={{
              padding: '14px', borderRadius: '10px',
              background: '#f8f9fa',
              borderLeft: `4px solid ${c.color}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={18} color={c.color} />
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: c.color }}>
                  {c.value}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
                {c.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const panelStyle = {
  background: 'white', borderRadius: '12px', padding: '16px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '16px'
};
const panelTitle = {
  fontSize: '11px', letterSpacing: '1.5px',
  color: '#666', margin: '0 0 12px 0'
};

export default OperationsSummary;