import React, { useState } from 'react';

export default function Login({ navigate, onLogin }) {
  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res  = await fetch('http://localhost:8000/auth/login', {
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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '380px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '36px', boxShadow: 'var(--shadow-md)' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
          <div style={{ width: '26px', height: '26px', background: 'var(--logo-bg)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '12px' }}>N</div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>NatWest <span style={{ color: 'var(--accent)' }}>AI</span></span>
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
        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          <span onClick={() => navigate('landing')} style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>Back to home</span>
        </p>
      </div>
    </div>
  );
}
