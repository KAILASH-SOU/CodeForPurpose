import React from 'react';
import { Sun, Moon, TrendingUp, Shield, Users, BarChart2 } from 'lucide-react';

export default function Landing({ navigate, theme, toggleTheme }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Inter, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* ── top accent stripe ── */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #42145F 0%, #C9006B 100%)' }} />

      {/* ── Navbar ── */}
      <div style={{ height: '56px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 32px', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flex: 1 }}>
          <div className="logo-mark">N</div>
          <span className="logo-text">NatWest <span>AI</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '99px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'inherit' }}>
            {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button onClick={() => navigate('login')} style={{ padding: '7px 16px', background: 'none', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s' }}>
            Sign In
          </button>
          <button onClick={() => navigate('signup')} style={{ padding: '7px 18px', background: 'var(--pink)', border: 'none', borderRadius: '7px', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Get Started
          </button>
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '72px 24px 56px', textAlign: 'center' }}>

        {/* NatWest AI badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: '99px', fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '32px' }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--pink)' }} />
          NatWest AI
        </div>

        <h1 style={{ fontSize: '52px', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.08, color: 'var(--text-primary)', marginBottom: '22px', maxWidth: '720px' }}>
          Financial intelligence<br />
          <span style={{ color: 'var(--accent)' }}>built for students.</span>
        </h1>

        <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: '500px', marginBottom: '40px' }}>
          AI-powered overdraft predictions, peer-benchmarked insights, and real-time spending analysis — all in one place.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '72px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('signup')} style={{ padding: '13px 32px', background: 'var(--pink)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Create free account
          </button>
          <button onClick={() => navigate('login')} style={{ padding: '13px 32px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Sign in
          </button>
        </div>

        {/* Feature grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', width: '100%', maxWidth: '620px', textAlign: 'left' }}>
          {[
            { Icon: Shield,    title: 'Safe to Spend',        desc: 'Know exactly what you can spend before your next income arrives.' },
            { Icon: TrendingUp, title: 'Overdraft Prediction', desc: 'Monte Carlo simulation across 1,000 scenarios in real-time.' },
            { Icon: Users,     title: 'Peer Benchmarking',    desc: 'Compare your habits against top-performing students in your cohort.' },
            { Icon: BarChart2, title: 'Portfolio Simulator',  desc: 'Model your 10-year wealth trajectory with one interactive slider.' },
          ].map(({ Icon, title, desc }, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px 20px', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                <Icon size={15} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>© 2025 NatWest AI Analytics</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Demo login: <strong style={{ color: 'var(--accent)' }}>student_dev_01</strong> / <strong style={{ color: 'var(--accent)' }}>password123</strong>
        </span>
      </div>
    </div>
  );
}
