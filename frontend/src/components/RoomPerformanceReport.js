import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBed, FaTrophy } from 'react-icons/fa';

function RoomPerformanceReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:4000/api/reports/room-performance')
      .then(res => {
        setData(res.data.data ?? []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={msgStyle}>Loading...</p>;
  if (error) return <p style={{ ...msgStyle, color: '#c0392b' }}>Error: {error}</p>;
  if (data.length === 0) return <p style={msgStyle}>No data available.</p>;

  const topRevenue = Math.max(...data.map((d) => Number(d.total_revenue)), 1);
  const bestPerformer = data[0];

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #1e3a2f 0%, #2d5a47 100%)',
        color: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <FaTrophy size={40} color="#ffd54f" />
        <div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            BEST PERFORMING ROOM TYPE
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            textTransform: 'capitalize'
          }}>
            {bestPerformer.room_type}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '4px' }}>
            ฿{Number(bestPerformer.total_revenue).toLocaleString()} total revenue from{' '}
            {bestPerformer.total_bookings} bookings
          </div>
        </div>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#1e3a2f' }}>
          Room Type Performance
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5d9c0' }}>
              <th style={thStyle}>Room Type</th>
              <th style={thStyle}>Rooms</th>
              <th style={thStyle}>Bookings</th>
              <th style={thStyle}>Total Revenue</th>
              <th style={thStyle}>Avg Booking</th>
              <th style={thStyle}>Avg Nights</th>
              <th style={thStyle}>Bar</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const barWidth = (Number(row.total_revenue) / topRevenue) * 100;
              return (
                <tr key={i} style={{ borderBottom: '1px solid #f0eadd' }}>
                  <td style={{ ...tdStyle, fontWeight: 'bold', textTransform: 'capitalize' }}>
                    <FaBed size={12} color="#b85c38" style={{ marginRight: '6px' }} />
                    {row.room_type}
                  </td>
                  <td style={tdStyle}>{row.total_rooms}</td>
                  <td style={tdStyle}>{row.total_bookings}</td>
                  <td style={{ ...tdStyle, fontWeight: 'bold', color: '#2d5a47' }}>
                    ฿{Number(row.total_revenue).toLocaleString()}
                  </td>
                  <td style={tdStyle}>
                    ฿{Number(row.avg_booking_value).toLocaleString(undefined, {
                      maximumFractionDigits: 0
                    })}
                  </td>
                  <td style={tdStyle}>
                    {Number(row.avg_nights).toFixed(1)}
                  </td>
                  <td style={{ ...tdStyle, width: '120px' }}>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: '#f0eadd',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${barWidth}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #b85c38, #8b5a3c)',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const msgStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#666'
};

const thStyle = {
  textAlign: 'left',
  padding: '10px 8px',
  fontSize: '11px',
  color: '#8b5a3c',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontWeight: 600
};

const tdStyle = {
  padding: '12px 8px',
  fontSize: '13px',
  color: '#2c2c2c'
};

export default RoomPerformanceReport;