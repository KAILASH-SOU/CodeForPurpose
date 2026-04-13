import React, { useState, useEffect } from 'react';
import {
  BarChart3, Users, Settings, LogOut,
  LayoutDashboard, Trophy, Activity, X, Receipt, Bot
} from 'lucide-react';
import API_BASE from './api.js';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import SafeToSpendCard from './components/SafeToSpendCard';
import SpendingChart from './components/SpendingChart';
import WhatIfSimulator from './components/WhatIfSimulator';
import OverdraftGauge from './components/OverdraftGauge';
import PeerBenchmark from './components/PeerBenchmark';
import TransactionHistory from './components/TransactionHistory';
import ChatWidget from './components/ChatWidget';
import './index.css';

// ── Root App ───────────────────────────────────────────────────────────────
function App() {
  const [page, setPage] = useState('landing');
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    document.documentElement.removeAttribute('data-theme');
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('natwest_auth');
    if (stored) { setAuth(JSON.parse(stored)); setPage('dashboard'); }
  }, []);

  const handleLogin  = (user_id, username) => { setAuth({ user_id, username }); setPage('dashboard'); };
  const handleLogout = () => { localStorage.removeItem('natwest_auth'); setAuth(null); setPage('landing'); };

  if (page === 'landing')           return <Landing navigate={setPage} />;
  if (page === 'login')             return <Login   navigate={setPage} onLogin={handleLogin} />;
  if (page === 'signup')            return <Signup  navigate={setPage} />;
  if (page === 'dashboard' && auth) return <Dashboard auth={auth} onLogout={handleLogout} />;
  return <Landing navigate={setPage} />;
}

// ── Settings Modal ─────────────────────────────────────────────────────────
function SettingsModal({ username, dbStatus, onLogout, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>Settings</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Account & preferences</div>
          </div>
          <button onClick={onClose} className="icon-btn"><X size={16} /></button>
        </div>

        {/* Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: 'var(--surface-raised)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '18px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px', color: '#fff', flexShrink: 0 }}>
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>{username}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>Premium Analytics · Tier 1 Cohort</div>
          </div>
        </div>

        {/* Rows */}
        {[
          { label: 'Account Type', value: 'Premium Analytics' },
          { label: 'Peer Group',   value: 'Tier 1 — Engineering' },
          { label: 'API Status',   value: dbStatus },
        ].map((row, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
            <span style={{ fontWeight: 600 }}>{row.value}</span>
          </div>
        ))}



        <button
          onClick={() => { onLogout(); onClose(); }}
          style={{ width: '100%', padding: '10px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '8px', color: 'var(--danger)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', fontFamily: 'inherit' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────
function Dashboard({ auth, onLogout }) {
  const { user_id: userId, username } = auth;
  const [safeToSpend,     setSafeToSpend]     = useState(null);
  const [smaData,         setSmaData]         = useState([]);
  const [insights,        setInsights]        = useState(null);
  const [dbStatus,        setDbStatus]        = useState('Checking...');
  const [hasTransactions, setHasTransactions] = useState(null);
  const [activeSection,   setActiveSection]   = useState('dashboard');
  const [showSettings,    setShowSettings]    = useState(false);

  const scrollTo = (id, section) => {
    if (section === 'settings') { setShowSettings(true); setActiveSection('settings'); return; }
    setActiveSection(section);
    
    if (section === 'transactions') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  useEffect(() => {
    setSafeToSpend(null); setSmaData([]); setInsights(null);
    setHasTransactions(null); setDbStatus('Checking...');

    const go = async () => {
      try {
        const r = await fetch(`${API_BASE}/analytics/safe-to-spend/${userId}`);
        const d = await r.json();
        if (!r.ok || !d || d.message === 'No transaction history') {
          setHasTransactions(false); setDbStatus('Connected'); return;
        }
        setSafeToSpend(d); setHasTransactions(true);

        const sm  = await (await fetch(`${API_BASE}/analytics/sma/${userId}?k=7`)).json();
        setSmaData(sm.sma_data || []);

        const ins = await (await fetch(`${API_BASE}/agent/insights/${userId}`)).json();
        setInsights(ins.insights_summary);
        setDbStatus('Connected');
      } catch {
        setDbStatus('Offline');
      }
    };
    go();
  }, [userId]);

  const navItems = [
    { id: 'section-dashboard', key: 'dashboard', Icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'section-analytics', key: 'analytics', Icon: BarChart3,       label: 'Analytics' },
    { id: 'section-transactions', key: 'transactions', Icon: Receipt, label: 'Transactions' },
    { id: 'section-goals',     key: 'goals',     Icon: Trophy,           label: 'Goals' },
    { id: 'section-peers',     key: 'peers',     Icon: Users,            label: 'Peers' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Smart formatter for AI insights
  const renderInsights = (text) => {
    if (!text) return null;
    
    // Split into sections/lines
    const lines = text.split('\n').filter(l => l.trim());
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {lines.map((line, i) => {
          // Detect header
          if (line.startsWith('###')) {
            return <div key={i} style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', borderLeft: '4px solid var(--accent)', paddingLeft: '12px' }}>
              {line.replace('###', '').trim()}
            </div>;
          }
          
          // Detect bullet point
          if (line.trim().startsWith('-')) {
            let content = line.trim().substring(1).trim();
            // Basic bolding parse
            const parts = content.split('**');
            return (
              <div key={i} className="insight-item" style={{ 
                padding: '16px', 
                background: 'var(--surface-raised)', 
                borderRadius: '10px', 
                border: '1px solid var(--border)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', marginTop: '6px', flexShrink: 0 }} />
                <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                  {parts.map((p, idx) => idx % 2 === 1 ? <b key={idx} style={{ color: 'var(--text-primary)' }}>{p}</b> : p)}
                </div>
              </div>
            );
          }
          
          return <div key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{line}</div>;
        })}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Top Navbar ── */}
      <nav className="topnav">
        {/* Logo */}
        <div className="topnav-logo" onClick={() => navigate('landing')}>
          <img src="/Logo_Wh_NatWestGroupColleague-Hor.svg" alt="NatWest" className="logo-image" />
          <span className="logo-text">NatWest <span>SafeSpend</span></span>
        </div>

        {/* Divider */}
        <div className="topnav-divider" />

        {/* Nav items */}
        {navItems.map(({ id, key, Icon, label }) => (
          <button
            key={key}
            className={`topnav-item ${activeSection === key ? 'active' : ''}`}
            onClick={() => scrollTo(id, key)}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}

        {/* Right controls */}
        <div className="topnav-right">
          {/* DB status dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dbStatus === 'Connected' ? 'var(--success)' : 'var(--danger)', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'none' }}>{dbStatus}</span>
          </div>



          {/* User chip */}
          <div className="user-chip">
            <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
            <span className="user-chip-name">{username}</span>
          </div>

          {/* Settings / logout */}
          <button className="icon-btn" onClick={() => { setShowSettings(true); setActiveSection('settings'); }} title="Settings">
            <Settings size={15} />
          </button>
          <button className="icon-btn" onClick={onLogout} title="Sign out" style={{ color: 'var(--danger)' }}>
            <LogOut size={15} />
          </button>
        </div>
      </nav>

      {/* ── Page content ── */}
      <div className="page-content">
        <div className="container">
          {/* Page header */}
          <div className="page-header">
            <div>
              <div className="page-title">{greeting}, {username}</div>
              <div className="page-subtitle">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <span className="badge badge-pink">
              <Activity size={11} />
              SafeSpend Active
            </span>
          </div>

          {/* Loading */}
          {hasTransactions === null && (
            <div className="card loading fade-in" style={{ padding: '80px' }}>
              Loading your financial data...
            </div>
          )}

          {/* Empty */}
          {hasTransactions === false && (
            <div className="card fade-in" style={{ padding: '60px 40px', textAlign: 'center' }}>
              <div style={{ width: '44px', height: '44px', background: 'var(--accent-soft)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <LayoutDashboard size={22} color="var(--accent)" />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>No transaction data yet</div>
              <div style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto', lineHeight: 1.7, fontSize: '14px' }}>
                Connect your bank account or seed sample data to unlock overdraft risk predictions, peer benchmarks and AI-generated insights.
              </div>
            </div>
          )}

          {/* Dashboard sections */}
          {hasTransactions && activeSection === 'transactions' ? (
            <div className="fade-in stagger-1">
              <TransactionHistory userId={userId} limit={100} title="All Transactions" />
            </div>
          ) : hasTransactions && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div id="section-dashboard" className="fade-in stagger-1">
                <SafeToSpendCard data={safeToSpend} />
              </div>

              <div className="fade-in stagger-1-5">
                <TransactionHistory userId={userId} limit={5} onViewAll={() => scrollTo('section-transactions', 'transactions')} />
              </div>

              <div id="section-analytics" className="fade-in stagger-2" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <SpendingChart smaData={smaData} />
                <OverdraftGauge userId={userId} />
              </div>

              <div id="section-peers" className="fade-in stagger-3">
                <PeerBenchmark userId={userId} />
              </div>

              <div id="section-goals" className="fade-in stagger-4">
                <WhatIfSimulator userId={userId} />
              </div>

              {/* AI Insights */}
              <div className="card fade-in" style={{ padding: '24px', marginBottom: '8px', border: '1px solid var(--accent-soft)', background: 'linear-gradient(to bottom, var(--surface), var(--surface-raised))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                  <Activity size={15} color="var(--accent)" />
                  <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.2px' }}>SafeSpend Insights</span>
                  <div style={{ marginLeft: 'auto', fontSize: '10px', background: 'var(--accent-soft)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '10px', fontWeight: 700, textTransform: 'uppercase' }}>AI Enhanced</div>
                </div>
                {insights
                  ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {renderInsights(insights)}
                      <button 
                        onClick={() => window.dispatchEvent(new CustomEvent('open-chat', { detail: 'Can you give me more insights on my spending anomalies and hidden inflation?' }))}
                        style={{ 
                          alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', 
                          padding: '8px 12px', background: 'var(--surface-raised)', border: '1px solid var(--border)', 
                          borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--accent)', cursor: 'pointer', transition: 'background 0.2s' 
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-soft)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'var(--surface-raised)'}
                      >
                        <Bot size={14} /> Ask AI for more insights
                      </button>
                    </div>
                  )
                  : <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '13px', padding: '12px', textAlign: 'center' }}>
                      {dbStatus === 'Offline' ? 'Agent is offline.' : 'Generating insights from your transaction history...'}
                    </div>
                }
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Settings modal */}
      {showSettings && (
        <SettingsModal
          username={username}
          dbStatus={dbStatus}
          onLogout={onLogout}
          onClose={() => { setShowSettings(false); setActiveSection('dashboard'); }}
        />
      )}

      {/* Floating Chat Widget */}
      <ChatWidget userId={userId} />
    </div>
  );
}

export default App;
