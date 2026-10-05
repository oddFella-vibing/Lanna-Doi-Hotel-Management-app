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
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>
            ROOM MANAGEMENT BOARD
          </h2>
          <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#888' }}>
            Live room status overview
          </p>
          <RoomGrid />
        </div>

        <div>
          <OperationsSummary />
        </div>
      </div>
    </>
  );
}

export default Dashboard;