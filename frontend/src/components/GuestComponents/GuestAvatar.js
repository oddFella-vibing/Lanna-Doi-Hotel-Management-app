import React, { useState } from 'react';

export default function GuestAvatar({ guest, isSelected, size = '40px' }) {
  const fullName = `${guest.first_name || ''} ${guest.last_name || ''}`.trim() || 'Guest';
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Using DiceBear's 'lorelei' style for soft, artistic, human-like illustrated portraits
  // We feed the guest's email or ID as the seed so their face stays unique and consistent
  const seed = guest.email || guest.guest_id || fullName;
  const avatarUrl = `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(seed)}&backgroundColor=f5efe6,eae5d9,b85c38,2d5a47`;

  const [hasError, setHasError] = useState(false);

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: isSelected ? '#2d5a47' : '#e6dfd1',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', flexShrink: 0,
      border: isSelected ? '2px solid #fff' : '1px solid #dcd6c8'
    }}>
      {!hasError ? (
        <img 
          src={avatarUrl} 
          alt={fullName} 
          onError={() => setHasError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span style={{ color: isSelected ? '#fff' : '#1e3a2f', fontWeight: 'bold', fontSize: '13px' }}>
          {initials || 'GD'}
        </span>
      )}
    </div>
  );
}