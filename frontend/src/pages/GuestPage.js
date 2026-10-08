import TopBar from '../components/TopBar';
import GuestManagement from '../components/GuestManagement';


function GuestPage() {
  return (
    <>
      <TopBar />
      <div style={{
        display: 'grid',
      
        gap: '20px',
        padding: '20px',
        background: '#faf7f0',
        minHeight: 'calc(100vh - 70px)'
      }}>
        <GuestManagement />

      </div>
    </>
  );
}

export default GuestPage;