import TopBar from '../components/TopBar';
import RoomGrid from '../components/RoomGrid';
import OperationsSummary from '../components/OperationsSummary';

function Dashboard() {
  return (
    <>
      <TopBar />
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '20px',
        padding: '20px',
        background: '#faf7f0',
        minHeight: 'calc(100vh - 70px)'
      }}>
        {/* LEFT: Room Grid Container */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
        }}>
          {/* ⬇️ HEADER AREA (this is what I meant) ⬇️ */}
          <div style={{
            borderLeft: '4px solid #b85c38',       // ← terracotta accent
            paddingLeft: '14px',
            marginBottom: '20px'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '18px',
              color: '#1e3a2f',
              letterSpacing: '0.5px'
            }}>
              ROOM MANAGEMENT BOARD
            </h2>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '12px',
              color: '#8b5a3c'
            }}>
              Live room status overview
            </p>
          </div>
          {/* ⬆️ END HEADER AREA ⬆️ */}

          <RoomGrid />
        </div>

        {/* RIGHT: Operations Summary */}
        <div>
          <OperationsSummary />
        </div>
      </div>
    </>
  );
}

export default Dashboard;