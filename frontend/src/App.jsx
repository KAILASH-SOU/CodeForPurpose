import React, { useState, useEffect } from 'react';
import {
  BarChart3, Users, Settings, LogOut, LayoutDashboard,
  Trophy, Activity, Sun, Moon, X
} from 'lucide-react';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import SafeToSpendCard from './components/SafeToSpendCard';
import SpendingChart from './components/SpendingChart';
import WhatIfSimulator from './components/WhatIfSimulator';
import OverdraftGauge from './components/OverdraftGauge';
import PeerBenchmark from './components/PeerBenchmark';
import './index.css';

function App() {
  const [page, setPage]   = useState('landing');
  const [auth, setAuth]   = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('natwest_theme') || 'dark');

  // Apply theme to <html> so CSS variables take effect globally
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('natwest_theme', theme);
  }, [theme]);

  // Restore session
  useEffect(() => {
    const stored = localStorage.getItem('natwest_auth');
    if (stored) {
      setAuth(JSON.parse(stored));
      setPage('dashboard');
    }
  }, []);

  const handleLogin = (user_id, username) => {
    setAuth({ user_id, username });
    setPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('natwest_auth');
    setAuth(null);
    setPage('landing');
  };

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  if (page === 'landing') return <Landing navigate={setPage} theme={theme} toggleTheme={toggleTheme} />;
  if (page === 'login')   return <Login navigate={setPage} onLogin={handleLogin} />;
  if (page === 'signup')  return <Signup navigate={setPage} />;
  if (page === 'dashboard' && auth) return <Dashboard auth={auth} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />;
  return <Landing navigate={setPage} theme={theme} toggleTheme={toggleTheme} />;
}

// ── Settings Modal ─────────────────────────────────────────────────────────
function SettingsModal({ username, dbStatus, theme, toggleTheme, onLogout, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700 }}>Settings</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Account & preferences</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', lineHeight: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: 'var(--surface-raised)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '20px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', color: 'var(--accent)', flexShrink: 0 }}>
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>{username}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Premium Analytics · Tier 1 Cohort</div>
          </div>
        </div>

        {/* Rows */}
        {[
          { label: 'Account Type', value: 'Premium Analytics' },
          { label: 'Peer Group',   value: 'Tier 1 — Engineering' },
          { label: 'API',          value: dbStatus },
        ].map((row, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
            <span style={{ fontWeight: 600 }}>{row.value}</span>
          </div>
        ))}

        {/* Theme toggle */}
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Appearance</div>
          <button className="theme-toggle" onClick={toggleTheme} style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'} (click to switch)</span>
            </div>
            <div className={`theme-toggle-pill ${theme === 'dark' ? 'on' : ''}`} />
          </button>
        </div>

        <button
          onClick={() => { onLogout(); onClose(); }}
          style={{
            width: '100%', padding: '10px', background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)', borderRadius: '8px',
            color: 'var(--danger)', cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: 'inherit'
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────
function Dashboard({ auth, onLogout, theme, toggleTheme }) {
  const { user_id: userId, username } = auth;
  const [safeToSpend, setSafeToSpend]     = useState(null);
  const [smaData, setSmaData]             = useState([]);
  const [insights, setInsights]           = useState(null);
  const [dbStatus, setDbStatus]           = useState('Checking...');
  const [hasTransactions, setHasTransactions] = useState(null);
  const [activeSection, setActiveSection]     = useState('dashboard');
  const [showSettings, setShowSettings]       = useState(false);

  const scrollTo = (id, section) => {
    if (section === 'settings') { setShowSettings(true); setActiveSection('settings'); return; }
    setActiveSection(section);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    setSafeToSpend(null); setSmaData([]); setInsights(null);
    setHasTransactions(null); setDbStatus('Checking...');

    const go = async () => {
      try {
        const r = await fetch(`http://localhost:8000/analytics/safe-to-spend/${userId}`);
        const d = await r.json();
        if (!r.ok || !d || d.message === 'No transaction history') {
          setHasTransactions(false); setDbStatus('Connected'); return;
        }
        setSafeToSpend(d); setHasTransactions(true);

        const sm = await (await fetch(`http://localhost:8000/analytics/sma/${userId}?k=7`)).json();
        setSmaData(sm.sma_data || []);

        const ins = await (await fetch(`http://localhost:8000/agent/insights/${userId}`)).json();
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
    { id: 'section-goals',     key: 'goals',     Icon: Trophy,           label: 'Goals' },
    { id: 'section-peers',     key: 'peers',     Icon: Users,            label: 'Peers' },
    { id: null,                key: 'settings',  Icon: Settings,         label: 'Settings' },
  ];

  return (
    <div className="dashboard">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark">N</div>
          <span className="logo-text">NatWest <span>AI</span></span>
        </div>

        <div className="nav-section-label" style={{ marginBottom: '8px' }}>Navigation</div>
        {navItems.map(({ id, key, Icon, label }) => (
          <button
            key={key}
            className={`nav-item ${activeSection === key ? 'active' : ''}`}
            onClick={() => scrollTo(id, key)}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Theme toggle */}
          <button className="theme-toggle" onClick={toggleTheme}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              {theme === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
              <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </div>
            <div className={`theme-toggle-pill ${theme === 'dark' ? 'on' : ''}`} />
          </button>

          {/* User profile snippet */}
          <div style={{ padding: '8px 10px', borderRadius: '7px', background: 'var(--surface-raised)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Signed in as</div>
            <div style={{ fontWeight: 700, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</div>
          </div>

          <button
            onClick={onLogout}
            className="nav-item"
            style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: 0 }}
          >
            <LogOut size={15} />
            Sign Out
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 3px 0' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dbStatus === 'Connected' ? 'var(--success)' : 'var(--danger)', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{dbStatus === 'Connected' ? 'API connected' : 'API offline'}</span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '18px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.4px' }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {username}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '3px' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <span className="badge badge-accent">
            <Activity size={11} />
            AI Active
          </span>
        </div>

        {/* States */}
        {hasTransactions === null && (
          <div className="card loading fade-in" style={{ padding: '80px' }}>
            Loading your financial data...
          </div>
        )}

        {hasTransactions === false && (
          <div className="card fade-in" style={{ padding: '56px 40px', textAlign: 'center' }}>
            <div style={{ width: '44px', height: '44px', background: 'var(--accent-soft)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <LayoutDashboard size={22} color="var(--accent)" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>No transaction data yet</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.7, fontSize: '14px' }}>
              Connect your bank account or seed sample data to unlock Monte Carlo risk predictions, peer benchmarks and spending insights.
            </p>
          </div>
        )}

        {/* Dashboard content */}
        {hasTransactions && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div id="section-dashboard" className="fade-in stagger-1">
              <SafeToSpendCard data={safeToSpend} />
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
            <div className="card fade-in" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                <Activity size={15} color="var(--accent)" />
                <h2 style={{ fontSize: '14px', fontWeight: 700 }}>AI Agent Insights</h2>
              </div>
              {insights
                ? <div style={{ whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: '1.85', color: 'var(--text-secondary)' }}>{insights}</div>
                : <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '13px' }}>
                    {dbStatus === 'Offline' ? 'Agent offline.' : 'Generating insights from your transaction history...'}
                  </p>
              }
            </div>
          </div>
        )}
      </main>

      {/* ── Settings Modal ── */}
      {showSettings && (
        <SettingsModal
          username={username}
          dbStatus={dbStatus}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={onLogout}
          onClose={() => { setShowSettings(false); setActiveSection('dashboard'); }}
        />
      )}
    </div>
  );
}

export default App;
