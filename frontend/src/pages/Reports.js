import { useState } from 'react';
import {
  FaMoneyBillWave,
  FaUserFriends,
  FaBed
} from 'react-icons/fa';
import TopBar from '../components/TopBar';
import RevenueReport from '../components/RevenueReport';
import GuestHistoryReport from '../components/GuestHistoryReport';
import RoomPerformanceReport from '../components/RoomPerformanceReport';

function Reports() {
  const [activeTab, setActiveTab] = useState('revenue');

  const tabs = [
    { id: 'revenue', label: 'Revenue & Occupancy', Icon: FaMoneyBillWave },
    { id: 'guests', label: 'Guest History', Icon: FaUserFriends },
    { id: 'rooms', label: 'Room Performance', Icon: FaBed },
  ];

  return (
    <>
      <TopBar />
      <div style={{
        padding: '20px',
        background: '#faf7f0',
        minHeight: 'calc(100vh - 70px)'
      }}>
        {/* Page Header */}
        <div style={{
          borderLeft: '4px solid #b85c38',
          paddingLeft: '14px',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#1e3a2f' }}>
            REPORTS
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#8b5a3c' }}>
            Business insights and analytics
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          borderBottom: '2px solid #e5d9c0',
          paddingBottom: '12px',
          flexWrap: 'wrap'
        }}>
          {tabs.map((tab) => {
            const Icon = tab.Icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 20px',
                  background: isActive ? '#1e3a2f' : 'transparent',
                  color: isActive ? 'white' : '#1e3a2f',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? 'bold' : 'normal',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Report Content */}
        {activeTab === 'revenue' && <RevenueReport />}
        {activeTab === 'guests' && <GuestHistoryReport />}
        {activeTab === 'rooms' && <RoomPerformanceReport />}
      </div>
    </>
  );
}

export default Reports;