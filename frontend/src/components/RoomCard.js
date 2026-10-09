import {
  FaBed,
  FaCheckCircle,
  FaBroom,
  FaTools,
  FaUser,
  FaArrowRight
} from 'react-icons/fa';

function RoomCard({ room, onClick }) {
  const styles = {
    Available:   { bg: '#e8f5e9', border: '#a5d6a7', color: '#1b5e20', dot: '#4caf50', Icon: FaCheckCircle },
    Occupied:    { bg: '#1e3a2f', border: '#1e3a2f', color: '#ffffff', dot: '#ffd54f', Icon: FaBed },
    Cleaning:    { bg: '#fff3e0', border: '#ffcc80', color: '#e65100', dot: '#ff9800', Icon: FaBroom },
    Maintenance: { bg: '#eceff1', border: '#b0bec5', color: '#455a64', dot: '#78909c', Icon: FaTools },
  };
  const s = styles[room.room_status] || styles.Available;
  const StatusIcon = s.Icon;
  const isOccupied = room.room_status === 'Occupied';

  return (
    <div
      onClick={() => isOccupied && onClick && onClick(room)}
      style={{
        background: s.bg,
        border: `2px solid ${s.border}`,
        borderRadius: '10px',
        padding: '12px',
        minHeight: '120px',
        cursor: isOccupied ? 'pointer' : 'default',   // ← Only occupied rooms are clickable
        transition: 'transform 0.15s',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative'                          // ← For absolute-positioned arrow
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Top row: room number + arrow icon (occupied only) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: s.color }}>
          {room.room_number}
        </div>
        {isOccupied && (
          <FaArrowRight size={12} color="#ffd54f" style={{ marginTop: '4px' }} />
        )}
      </div>

      {/* Status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        fontSize: '11px', color: s.color
      }}>
        <StatusIcon size={12} />
        {room.room_status}
      </div>

      {/* Guest info (occupied only) */}
     {isOccupied && room.guest_name && (
  <div style={{
    fontSize: '10px',
    opacity: 0.9,
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  }}>
    <FaUser size={9} /> {room.guest_name}
  </div>
)}
    </div>
  );
}

export default RoomCard;