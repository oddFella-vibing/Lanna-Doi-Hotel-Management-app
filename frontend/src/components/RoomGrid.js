import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaThLarge, FaList } from 'react-icons/fa';
import RoomCard from './RoomCard';

function RoomGrid() {
  const [rooms, setRooms] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState('All Floors');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:4000/api/rooms')
      .then(res => {
        const data = res.data.data ?? res.data;
        setRooms(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const floors = ['All Floors', ...new Set(rooms.map(r => r.floor).filter(Boolean))];

  const filtered = rooms.filter(r => {
    if (selectedFloor !== 'All Floors' && String(r.floor) !== String(selectedFloor)) return false;
    if (selectedStatus !== 'All Status' && r.status !== selectedStatus) return false;
    if (search && !r.room_number.toString().includes(search)) return false;
    return true;
  });

  return (
    <div>
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '16px',
        flexWrap: 'wrap', alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <FaSearch style={{
            position: 'absolute', left: '12px', top: '50%',
            transform: 'translateY(-50%)', color: '#999'
          }} />
          <input
            placeholder="Search room number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '34px', width: '100%' }}
          />
        </div>
        <select value={selectedFloor} onChange={e => setSelectedFloor(e.target.value)} style={inputStyle}>
          {floors.map(f => <option key={f}>{f}</option>)}
        </select>
        <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} style={inputStyle}>
          {['All Status', 'Available', 'Occupied', 'Cleaning', 'Maintenance'].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? <p>Loading rooms...</p> : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '12px'
        }}>
          {filtered.map(room => <RoomCard key={room.room_id} room={room} />)}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '13px',
  background: 'white'
};

export default RoomGrid;