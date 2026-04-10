import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function Landing({ navigate, theme, toggleTheme }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, -apple-system, sans-serif',
      padding: '40px 20px',
    }}>
      {/* Theme toggle — top right */}
      <div style={{ position: 'fixed', top: '16px', right: '20px' }}>
        <button
          onClick={toggleTheme}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '99px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'inherit' }}
        >
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
        <div style={{ width: '30px', height: '30px', background: 'var(--logo-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '13px' }}>N</div>
        <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          NatWest <span style={{ color: 'var(--accent)' }}>AI</span>
        </span>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: '540px', textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.15, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Financial intelligence,<br />built for students.
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          Real-time spending analysis, overdraft risk simulations, and peer-benchmarked insights — all in one platform.
        </p>
      </div>

      {/* Feature grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxWidth: '540px', width: '100%', marginBottom: '48px' }}>
        {[
          { title: 'Safe to Spend',        desc: 'Know exactly how much you can spend before your next income.' },
          { title: 'Overdraft Prediction', desc: 'Monte Carlo simulation across 1,000 scenarios.' },
          { title: 'Peer Benchmarking',    desc: 'Compare your habits against top-performing students.' },
          { title: 'Portfolio Simulator',  desc: 'Model your 10-year wealth trajectory with one slider.' },
        ].map((f, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 18px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '5px' }}>{f.title}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => navigate('login')}
          style={{ padding: '11px 30px', borderRadius: '8px', background: 'var(--accent)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}
          onMouseEnter={e => e.target.style.opacity = '0.9'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >
          Sign In
        </button>
        <button
          onClick={() => navigate('signup')}
          style={{ padding: '11px 30px', borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}
          onMouseEnter={e => e.target.style.borderColor = 'var(--border-strong)'}
          onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
        >
          Create Account
        </button>
      </div>

      <p style={{ marginTop: '40px', fontSize: '12px', color: 'var(--text-muted)' }}>
        Demo account: <strong style={{ color: 'var(--accent)' }}>student_dev_01</strong> / <strong style={{ color: 'var(--accent)' }}>password123</strong>
      </p>
    </div>
  );
}
