import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaMoneyBillWave,
  FaBed,
  FaCalendarCheck,
  FaPercentage,
  FaSync
} from 'react-icons/fa';

function RevenueReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const now = new Date();
  const [year, setYear] = useState(2026);
const [month, setMonth] = useState(9);   // September

  const fetchData = () => {
    setLoading(true);
    setError(null);
    axios.get('http://localhost:4000/api/reports/revenue', {
      params: { year, month }
    })
      .then(res => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [year, month]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) return <p style={msgStyle}>Loading report...</p>;
  if (error) return <p style={{ ...msgStyle, color: '#c0392b' }}>Error: {error}</p>;
  if (!data) return <p style={msgStyle}>No data available.</p>;

  const kpis = [
    {
      label: 'Total Revenue',
      value: `฿${Number(data.total_revenue).toLocaleString()}`,
      Icon: FaMoneyBillWave,
      color: '#2d5a47'
    },
    {
      label: 'Occupancy Rate',
      value: `${data.occupancy_rate}%`,
      Icon: FaPercentage,
      color: '#b85c38'
    },
    {
      label: 'Total Bookings',
      value: data.total_bookings,
      Icon: FaCalendarCheck,
      color: '#1e3a2f'
    },
    {
      label: 'Occupied Rooms',
      value: `${data.occupied_rooms} / ${data.total_rooms}`,
      Icon: FaBed,
      color: '#8b5a3c'
    },
  ];

  const maxRevenue = Math.max(
    ...data.daily_revenue.map((d) => Number(d.revenue)),
    1
  );

  return (
    <div>
      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          style={selectStyle}
        >
          {months.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          style={{ ...selectStyle, width: '100px' }}
        />
        <button onClick={fetchData} style={refreshBtnStyle}>
          <FaSync /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {kpis.map((kpi) => {
          const Icon = kpi.Icon;
          return (
            <div key={kpi.label} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              borderLeft: `4px solid ${kpi.color}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '8px'
              }}>
                <Icon size={20} color={kpi.color} />
                <span style={{ fontSize: '12px', color: '#666' }}>{kpi.label}</span>
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: kpi.color
              }}>
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Revenue Chart */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#1e3a2f' }}>
          Daily Revenue — {months[month - 1]} {year}
        </h3>

        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '6px',
          height: '180px',
          paddingTop: '10px'
        }}>
          {data.daily_revenue.map((day, i) => {
            const value = Number(day.revenue);
            const heightPercent = value > 0 ? Math.max((value / maxRevenue) * 100, 5) : 0;

            return (
              <div key={i} style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '4px',
                height: '100%'
              }}>
                <div
                  title={`฿${value.toLocaleString()}`}
                  style={{
                    width: '100%',
                    background: value > 0
                      ? 'linear-gradient(180deg, #2d5a47, #1e3a2f)'
                      : '#e5d9c0',
                    height: `${heightPercent}%`,
                    minHeight: value > 0 ? '8px' : '2px',
                    borderRadius: '4px 4px 0 0',
                    cursor: value > 0 ? 'pointer' : 'default',
                    transition: 'opacity 0.15s'
                  }}
                  onMouseEnter={(e) => value > 0 && (e.currentTarget.style.opacity = '0.7')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                />
                <span style={{ fontSize: '9px', color: '#999' }}>
                  {new Date(day.date).getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const msgStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#666'
};

const selectStyle = {
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '13px',
  background: 'white'
};

const refreshBtnStyle = {
  padding: '8px 16px',
  background: '#1e3a2f',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '13px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
};

export default RevenueReport;