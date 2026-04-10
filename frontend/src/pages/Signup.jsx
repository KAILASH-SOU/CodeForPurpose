import React, { useState } from 'react';

export default function Signup({ navigate }) {
  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res  = await fetch('http://localhost:8000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username, password: form.password,
          target_savings_rate: 0.20, peer_cohort: 'general',
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.detail || 'Could not create account.');
      else { setSuccess(true); setTimeout(() => navigate('login'), 1800); }
    } catch { setError('Cannot connect to server.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '380px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '36px', boxShadow: 'var(--shadow-md)' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
          <div style={{ width: '26px', height: '26px', background: 'var(--logo-bg)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '12px' }}>N</div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>NatWest <span style={{ color: 'var(--accent)' }}>AI</span></span>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: '44px', height: '44px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--success)" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Account created</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Redirecting to sign in...</p>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.4px', marginBottom: '5px', color: 'var(--text-primary)' }}>Create account</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '28px' }}>Set up your NatWest AI analytics profile.</p>

            <form onSubmit={handleSubmit}>
              {/* Username */}
              <div className="float-field">
                <input
                  type="text"
                  id="signup-username"
                  placeholder="Username"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  required
                />
                <label htmlFor="signup-username">Username</label>
              </div>

              {/* Password */}
              <div className="float-field">
                <input
                  type="password"
                  id="signup-password"
                  placeholder="Password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <label htmlFor="signup-password">Password</label>
              </div>

              {error && (
                <div style={{ marginBottom: '14px', padding: '10px 14px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '7px', color: 'var(--danger)', fontSize: '13px' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '12px', background: 'var(--accent)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit', marginTop: '4px' }}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p style={{ marginTop: '22px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <span onClick={() => navigate('login')} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Sign in</span>
            </p>
            <p style={{ textAlign: 'center', marginTop: '10px' }}>
              <span onClick={() => navigate('landing')} style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>Back to home</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
