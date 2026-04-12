import React from 'react';
import { TrendingUp, Shield, Users, BarChart2, ArrowRight, CheckCircle, FlaskConical, LogIn } from 'lucide-react';

const features = [
  { Icon: Shield,     title: 'Safe to Spend',        desc: 'Know your real spending ceiling before your next income lands.' },
  { Icon: TrendingUp, title: 'Overdraft Prediction',  desc: 'Monte Carlo simulation across 1,000+ scenarios in real-time.' },
  { Icon: Users,      title: 'Peer Benchmarking',     desc: 'See how your habits compare to top students in your cohort.' },
  { Icon: BarChart2,  title: 'Portfolio Simulator',   desc: 'Shape your 10-year wealth trajectory with one simple slider.' },
];

const stats = [
  { value: '98%',    label: 'Prediction accuracy' },
  { value: '1,000+', label: 'Scenarios modelled' },
  { value: '< 1s',   label: 'SafeSpend insight time' },
];

// Pre-seeded demo accounts for hackathon judges
const demoAccounts = [
  { username: 'student1', cohort: 'Tier 1 · Engineering', income: '₹25,000/mo', desc: 'High income, savings-focused hostel student' },
  { username: 'student2', cohort: 'Tier 2 · Arts',        income: '₹12,000/mo', desc: 'Mid income, high variable spending patterns' },
  { username: 'student3', cohort: 'Tier 1 · Science',     income: '₹18,000/mo', desc: 'Moderate income, balanced spending habits' },
];

export default function Landing({ navigate }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Inter, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top accent stripe ── */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #42145F 0%, #C9006B 100%)', flexShrink: 0 }} />

      {/* ── Hackathon notice banner ── */}
      <div style={{
        background: 'linear-gradient(90deg, #42145F 0%, #6B2D8B 100%)',
        padding: '9px 40px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexShrink: 0,
      }}>
        <FlaskConical size={14} color="#E8D5FF" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '12.5px', color: '#E8D5FF', fontWeight: 600, letterSpacing: '0.01em' }}>
          🏦 <strong style={{ color: '#fff' }}>NatWest Hackathon Prototype</strong> — This is a live demo built for the NatWest SafeSpend Hackathon judges.
          Pre-seeded hostel student transaction data is already loaded. Use the demo logins below — <strong style={{ color: '#F9A8D4' }}>password for all: qwerty</strong>
        </span>
      </div>

      {/* ── Navbar ── */}
      <header style={{ height: '56px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 64px', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, cursor: 'pointer' }} onClick={() => navigate('landing')}>
          <img src="/Logo_Wh_NatWestGroupColleague-Hor.svg" alt="NatWest" className="logo-image" />
          <span className="logo-text">NatWest <span>SafeSpend</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => navigate('login')}
            style={{ padding: '7px 18px', background: 'none', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('signup')}
            style={{ padding: '7px 20px', background: 'var(--pink)', border: 'none', borderRadius: '7px', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Get Started <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* ── Hero — split layout ── */}
      <section style={{ display: 'flex', flex: 1 }}>

        {/* Left: editorial panel */}
        <div style={{
          flex: '1 1 52%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 56px 60px 64px',
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
        }}>

          {/* Headline */}
          <h1 style={{ fontSize: '46px', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-2px', color: 'var(--text-primary)', marginBottom: '18px', maxWidth: '520px' }}>
            Your money,<br />
            <span style={{ color: 'var(--accent)' }}>intelligently</span>{' '}
            <span style={{ color: 'var(--pink)' }}>managed.</span>
          </h1>

          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '440px', marginBottom: '32px' }}>
            SafeSpend-powered bank balance predictions, peer-benchmarked insights, and real-time spending analysis with simulations — tailored for NatWest Customers.
          </p>

          {/* Trust bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
            {['No bank connection required', 'Real-time SafeSpend insights', 'Peer comparison with top 10% cohort'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <CheckCircle size={14} color="var(--success)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('signup')}
              style={{ padding: '12px 28px', background: 'var(--accent)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px', transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Create free account <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate('login')}
              style={{ padding: '12px 24px', background: 'none', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              Sign in
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '40px', marginTop: '44px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            {stats.map(({ value, label }, i) => (
              <div key={i}>
                <div style={{ fontSize: '21px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.5px' }}>{value}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: feature grid + demo credentials */}
        <div style={{
          flex: '1 1 48%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 48px',
          background: 'var(--bg)',
          gap: '18px',
          overflowY: 'auto',
        }}>

          {/* Feature grid */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              What's inside
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {features.map(({ Icon, title, desc }, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '18px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '9px',
                    transition: 'box-shadow 0.18s, transform 0.18s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={15} color="var(--accent)" />
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Demo credentials box */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--accent-border)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {/* Header */}
            <div style={{
              background: 'var(--accent-soft)',
              borderBottom: '1px solid var(--accent-border)',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
            }}>
              <LogIn size={13} color="var(--accent)" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)',letterSpacing: '0.08em' }}>
                Demo Accounts — password: <span style={{ color: 'var(--pink)' }}>qwerty</span>
              </span>
            </div>

            {/* Account rows */}
            <div style={{ padding: '8px 0' }}>
              {demoAccounts.map(({ username, cohort, income, desc }, i) => (
                <div
                  key={i}
                  onClick={() => navigate('login')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    borderBottom: i < demoAccounts.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-raised)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Avatar */}
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>
                    {username.slice(-1)}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'monospace' }}>{username}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--surface-raised)', padding: '1px 7px', borderRadius: '99px', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{cohort}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{desc} · {income}</div>
                  </div>
                  <ArrowRight size={13} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '12px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>© 2025 NatWest SafeSpend Analytics</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>NatWest SafeSpend Hackathon · Built with FastAPI + React</span>
      </footer>
    </div>
  );
}
