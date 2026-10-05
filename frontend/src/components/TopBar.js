import { Link } from 'react-router-dom';
import {
  FaHotel,
  FaHome,
  FaCalendarAlt,
  FaUsers,
  FaBed,
  FaChartBar,
  FaBell,
  FaCalendarDay
} from 'react-icons/fa';

function TopBar() {
  return (
    <header style={{
      background: 'linear-gradient(90deg, #1e3a2f 0%, #2d5a47 100%)',
      color: 'white',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaHotel size={28} color="#f59e0b" />
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', letterSpacing: '1px' }}>
              LANNA DOI
            </h2>
            <p style={{ margin: 0, fontSize: '9px', opacity: 0.7, letterSpacing: '2px' }}>
              HOTEL MANAGEMENT
            </p>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '20px', marginLeft: '30px' }}>
          <NavLink to="/" icon={<FaHome />} label="Dashboard" />
          <NavLink to="/bookings" icon={<FaCalendarAlt />} label="Reservations" />
          <NavLink to="/guests" icon={<FaUsers />} label="Guests" />
          <NavLink to="/rooms" icon={<FaBed />} label="Rooms" />
          <NavLink to="/reports" icon={<FaChartBar />} label="Reports" />
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FaCalendarDay /> {new Date().toDateString()}
        </span>
        <FaBell size={18} style={{ cursor: 'pointer' }} />
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: '#f59e0b', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold'
        }}>A</div>
      </div>
    </header>
  );
}

function NavLink({ to, icon, label }) {
  return (
    <Link to={to} style={{
      color: 'white',
      textDecoration: 'none',
      fontSize: '13px',
      opacity: 0.85,
      padding: '6px 10px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }}>
      {icon} {label}
    </Link>
  );
}

export default TopBar;