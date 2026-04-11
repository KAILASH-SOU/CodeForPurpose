import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function Landing({ navigate, theme, toggleTheme }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Inter, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top bar ── */}
      <div style={{ height: '56px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 32px', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <div className="logo-mark">N</div>
          <span className="logo-text">NatWest <span>AI</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '99px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'inherit' }}>
            {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button onClick={() => navigate('login')} style={{ padding: '7px 16px', background: 'none', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Sign In</button>
          <button onClick={() => navigate('signup')} style={{ padding: '7px 16px', background: 'var(--accent)', border: 'none', borderRadius: '7px', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Get Started</button>
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px 48px', maxWidth: '760px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: '99px', fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '28px' }}>
          NatWest Hackathon 2025
        </div>

        <h1 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: '20px' }}>
          Financial intelligence<br />for students.
        </h1>

        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: '520px', marginBottom: '36px' }}>
          Real-time overdraft predictions, peer-benchmarked insights, and AI-generated financial advice — all based on your actual spending.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '64px' }}>
          <button onClick={() => navigate('signup')} style={{ padding: '12px 28px', background: 'var(--accent)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Create free account
          </button>
          <button onClick={() => navigate('login')} style={{ padding: '12px 28px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Sign in
          </button>
        </div>

        {/* Feature grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '100%', maxWidth: '600px', textAlign: 'left' }}>
          {[
            { title: 'Safe to Spend',        desc: 'Know exactly how much you can spend before your next income.' },
            { title: 'Overdraft Prediction', desc: 'Monte Carlo simulation across 1,000 scenarios in real-time.' },
            { title: 'Peer Benchmarking',    desc: 'See how you compare against top-performing students in your cohort.' },
            { title: 'Portfolio Simulator',  desc: 'Model your 10-year wealth trajectory with one interactive slider.' },
          ].map((f, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '5px' }}>{f.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>NatWest AI Analytics Platform</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Demo: <strong style={{ color: 'var(--accent)' }}>student_dev_01</strong> / <strong style={{ color: 'var(--accent)' }}>password123</strong>
        </span>
      </div>
    </div>
  );
}
