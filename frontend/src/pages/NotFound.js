import React from 'react';
import { FaCompass, FaHome } from 'react-icons/fa';
import TopBar from '../components/TopBar';

export default function NotFound() {
  return (
    <> <TopBar/>
    <div style={containerStyle}>
        
      <div style={cardStyle}>
        <div style={iconWrapperStyle}>
          <FaCompass size={36} color="var(--lanna-terracotta)" />
        </div>
        
        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--lanna-terracotta)', fontWeight: '700' }}>
          Error 404
        </span>
        
        <h2 style={{ color: 'var(--lanna-primary)', margin: '8px 0 6px 0', fontSize: '20px', fontWeight: '600' }}>
          Pathway Not Found
        </h2>
        
        <p style={{ color: 'var(--lanna-text-muted)', fontSize: '12px', marginBottom: '24px', lineHeight: '1.6' }}>
          The room, page, or dossier you are looking for has wandered off the Lanna grounds. Let’s guide you back to reception.
        </p>
        
        <button 
          onClick={() => window.location.href = '/'} 
          style={btnStyle}
        >
          <FaHome size={12} /> Return to Dashboard
        </button>
      </div>
    </div>
    </>
  );
}

// Styles
const containerStyle = { 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  height: '100vh', 
  background: 'var(--lanna-bg-main)', 
  padding: '20px',
  boxSizing: 'border-box' 
};

const cardStyle = { 
  background: 'var(--lanna-bg-surface)', 
  padding: '40px 30px', 
  borderRadius: '12px', 
  textAlign: 'center', 
  maxWidth: '380px', 
  width: '100%',
  border: '1px solid var(--lanna-border)', 
  boxShadow: '0 4px 20px rgba(0,0,0,0.04)' 
};

const iconWrapperStyle = { 
  background: 'var(--lanna-bg-subtle)', 
  width: '64px', 
  height: '64px', 
  borderRadius: '50%', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  margin: '0 auto 16px auto' 
};

const btnStyle = { 
  background: 'var(--lanna-primary)', 
  color: 'white', 
  border: 'none', 
  padding: '10px 18px', 
  borderRadius: '6px', 
  fontSize: '12px', 
  fontWeight: '600', 
  cursor: 'pointer', 
  display: 'inline-flex', 
  alignItems: 'center', 
  gap: '8px',
  transition: 'background 0.2s'
};