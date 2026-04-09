import React, { useState, useEffect } from 'react';
import SafeToSpendCard from './components/SafeToSpendCard';
import SpendingChart from './components/SpendingChart';
import './index.css';

function App() {
  const [safeToSpend, setSafeToSpend] = useState(null);
  const [smaData, setSmaData] = useState([]);
  const [dbStatus, setDbStatus] = useState('Checking...');
  const userId = 1; // Default hackathon user

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Safe to Spend
        const stsRes = await fetch(`http://localhost:8000/analytics/safe-to-spend/${userId}`);
        const stsData = await stsRes.json();
        setSafeToSpend(stsData);

        // Fetch SMA Data
        const smaRes = await fetch(`http://localhost:8000/analytics/sma/${userId}?k=7`);
        const smaData = await smaRes.json();
        setSmaData(smaData.sma_data || []);
        
        setDbStatus('Connected');
      } catch (error) {
        console.error('Error fetching data:', error);
        setDbStatus('Offline');
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <div className="sidebar glass-panel">
        <div className="logo">
          NatWest <span>AI</span>
        </div>
        
        <div className="nav-items" style={{ marginTop: '20px' }}>
          <p style={{ fontWeight: 600, color: 'var(--natwest-purple)' }}>Dashboard</p>
          <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>Account Analysis</p>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div className="status-item">
            <small style={{ color: 'var(--text-secondary)' }}>System Status</small>
            <div style={{ marginTop: '4px' }}>
              <span className="badge">{dbStatus}</span>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '15px' }}>
            NatWest AI Agent v1.0
          </p>
        </div>
      </div>

      <div className="main-content">
        <header style={{ marginBottom: '10px' }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Overview for {safeToSpend?.username || 'User'}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Insights powered by LangGraph Analytics</p>
        </header>

        <SafeToSpendCard data={safeToSpend} />
        <SpendingChart smaData={smaData} />
      </div>
    </div>
  );
}

export default App;
