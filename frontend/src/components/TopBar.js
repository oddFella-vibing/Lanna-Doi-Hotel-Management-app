import { Link } from 'react-router-dom';
import {
  FaHome,
  FaCalendarAlt,
  FaUsers,
  FaBed,
  FaChartBar,
  FaBell,
  FaCalendarDay,
  FaConciergeBell
} from 'react-icons/fa';
import logo from '../assets/lanna-doi-logo.png';   // Your logo

function TopBar() {
  return (
    <header style={{
      background: '#f2e9d8',              // ← Cream background (matches logo)
      color: '#1e3a2f',                   // ← Dark green text
      borderBottom: '3px solid #b85c38',  // ← Terracotta accent line
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={logo}
            alt="Lanna Doi Hotel Management"
            style={{ height: '52px', width: 'auto' }}
          />
        </Link>

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: '8px', marginLeft: '20px' }}>
          <NavLink to="/" icon={<FaHome />} label="Dashboard" />
          <NavLink to="/bookings" icon={<FaCalendarAlt />} label="Reservations" />
          <NavLink to="/guests" icon={<FaUsers />} label="Guests" />
          <NavLink to="/rooms" icon={<FaBed />} label="Rooms" />
          <NavLink to="/reports" icon={<FaChartBar />} label="Reports" />
          <NavLink to="/employee-housekeeping" icon={<FaConciergeBell />} label="Staff & Housekeeping" />
        </nav>
      </div>

      {/* Right Side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#4a4a4a'
        }}>
          <FaCalendarDay /> {new Date().toDateString()}
        </span>
        <FaBell
          size={18}
          style={{ cursor: 'pointer', color: '#b85c38' }}
        />
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: '#b85c38',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>A</div>
      </div>
    </header>
  );
}

function NavLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      style={{
        color: '#1e3a2f',
        textDecoration: 'none',
        fontSize: '13px',
        padding: '6px 12px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'background 0.15s'
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#e5d9c0'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {icon} {label}
    </Link>
  );
}

export default TopBar;