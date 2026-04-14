import React, { useState } from 'react';
import { LogIn, ArrowRight } from 'lucide-react';

import API_BASE from '../api.js';

export default function Login({ navigate, onLogin }) {
  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) setError(data.detail || 'Invalid credentials.');
      else {
        localStorage.setItem('natwest_auth', JSON.stringify({ user_id: data.user_id, username: data.username }));
        onLogin(data.user_id, data.username);
      }
    } catch { setError('Cannot connect to server.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Top accent stripe ── */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #42145F 0%, #C9006B 100%)', flexShrink: 0 }} />

      {/* ── Navbar ── */}
      <header style={{ height: '56px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 64px', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
        <div
          onClick={() => navigate('landing')}
          style={{ display: 'flex', alignItems: 'center', flex: 1, cursor: 'pointer' }}
        >
          <img src="/Logo_Wh_NatWestGroupColleague-Hor.svg" alt="NatWest" className="logo-image" />
          <span className="logo-text">NatWest <span>SafeSpend</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => navigate('landing')}
            style={{ padding: '7px 18px', background: 'none', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            Home
          </button>
          <button
            onClick={() => navigate('signup')}
            style={{ padding: '7px 20px', background: 'var(--pink)', border: 'none', borderRadius: '7px', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* ── Centered card ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '380px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '36px', boxShadow: 'var(--shadow-md)' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
          <img src="/Logo_Wh_NatWestGroupColleague-Hor.svg" alt="NatWest" style={{ height: '24px', width: '26px', objectFit: 'cover', objectPosition: 'left' }} />
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>NatWest <span style={{ color: 'var(--accent)' }}>SafeSpend</span></span>
        </div>

        <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.4px', marginBottom: '5px', color: 'var(--text-primary)' }}>Sign in</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '28px' }}>Enter your credentials to continue.</p>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="float-field">
            <input
              type="text"
              id="login-username"
              placeholder="Username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
            />
            <label htmlFor="login-username">Username</label>
          </div>

          {/* Password */}
          <div className="float-field">
            <input
              type="password"
              id="login-password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
            <label htmlFor="login-password">Password</label>
          </div>

          {error && (
            <div style={{ marginBottom: '14px', padding: '10px 14px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '7px', color: 'var(--danger)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '12px', background: 'var(--accent)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit', marginTop: '4px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '22px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          No account?{' '}
          <span onClick={() => navigate('signup')} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Create one</span>
        </p>

        {/* Hosting Note */}
        <div style={{ marginTop: '24px', padding: '14px', background: 'var(--accent-soft)', borderRadius: '10px', border: '1px solid var(--accent-border)' }}>
          <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--accent)', lineHeight: '1.6', textAlign: 'center', fontWeight: 600 }}>
            Note: We use free-tier hosting on Vercel & Render. The initial login may take 30-60 seconds as the service wakes up. Thank you for your patience.
          </p>
        </div>
      </div>

        {/* ── Demo Accounts Card ── */}
        <div style={{ width: '100%', maxWidth: '420px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', marginTop: '24px' }}>
          <div style={{
            padding: '12px 20px',
            background: 'var(--bg-card-header)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
          }}>
            <LogIn size={13} color="var(--accent)" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em' }}>
              DEMO ACCOUNTS — password: <span style={{ color: 'var(--pink)' }}>qwerty</span>
            </span>
          </div>

          {[
            { id: 'student1', tier: 'Tier 1 · Engineering', desc: 'High income, savings-focused hostel student · ₹25,000/mo', icon: '1' },
            { id: 'student2', tier: 'Tier 2 · Arts',        desc: 'Mid income, high variable spending patterns · ₹12,000/mo', icon: '2' },
            { id: 'student3', tier: 'Tier 1 · Science',    desc: 'Moderate income, balanced spending habits · ₹18,000/mo', icon: '3' },
          ].map((acc, idx) => (
            <div
              key={acc.id}
              onClick={() => setForm({ username: acc.id, password: 'qwerty' })}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: idx < 2 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
                gap: '16px',
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: '32px', height: '32px',
                background: 'var(--logo-bg)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: '12px',
              }}>
                {acc.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{acc.id}</span>
                  <span style={{ fontSize: '10px', background: 'var(--bg-card-header)', padding: '2px 8px', borderRadius: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>{acc.tier}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{acc.desc}</div>
              </div>
              <ArrowRight size={14} color="var(--text-muted)" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
