import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [status, setStatus] = useState('Checking backend...');

  useEffect(() => {
    axios.get('http://localhost:4000/api/guests')
      .then(res => setStatus(`Backend connected! Found ${res.data.data.length} guests.`))
      .catch(err => setStatus(` Cannot reach backend: ${err.message}`));
  }, []);

  return (
    <div className="App">
      <header style={{ background: '#2c3e50', color: 'white', padding: '20px' }}>
        <h1>Lanna Doi Hotel Management</h1>
      </header>
      <main style={{ padding: '20px' }}>
        <h3>Connection Test</h3>
        <p>{status}</p>
      </main>
    </div>
  );
}

export default App;