import React, { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';

export default function PeerBenchmark({ userId }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/analytics/reality-check/${userId}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Benchmark data unavailable.'); setLoading(false); });
  }, [userId]);

  if (loading) return <div className="card loading" style={{ padding: '48px', textAlign: 'center' }}>Loading peer comparison...</div>;
  if (error)   return <div className="card" style={{ padding: '24px', color: 'var(--danger)', fontSize: '13px' }}>{error}</div>;
  if (!data)   return null;

  const { user_profile, cohort_profile, cohort_name, reality_check } = data;

  const rows = [
    { label: 'Savings Rate',        user: `${user_profile.savings_rate_pct}%`,         cohort: `${cohort_profile.savings_rate_pct}%`,         better: user_profile.savings_rate_pct >= cohort_profile.savings_rate_pct },
    { label: 'Daily Variable Spend', user: `₹${user_profile.avg_daily_variable_spend}`, cohort: `₹${cohort_profile.avg_daily_variable_spend}`, better: user_profile.avg_daily_variable_spend <= cohort_profile.avg_daily_variable_spend },
    { label: 'Dining Share',        user: `${user_profile.dining_share_pct}%`,         cohort: `${cohort_profile.dining_share_pct}%`,         better: user_profile.dining_share_pct <= cohort_profile.dining_share_pct },
  ];

  const radarData = [
    { metric: 'Savings', You: Math.min(100, (user_profile.savings_rate_pct / cohort_profile.savings_rate_pct) * 100),                                    Cohort: 100 },
    { metric: 'Spending', You: Math.min(100, (cohort_profile.avg_daily_variable_spend / Math.max(user_profile.avg_daily_variable_spend, 1)) * 100),       Cohort: 100 },
    { metric: 'Dining',   You: Math.min(100, (cohort_profile.dining_share_pct       / Math.max(user_profile.dining_share_pct, 0.1)) * 100),              Cohort: 100 },
  ];

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: 700 }}>Peer Benchmarking</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
            Compared against <strong style={{ color: 'var(--text-primary)' }}>{cohort_name}</strong>
          </p>
        </div>
        <span className="badge badge-neutral"><Users size={11} />Top 10% Cohort</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '28px', alignItems: 'start' }}>
        <div>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 96px 96px', gap: '8px', padding: '7px 12px', background: 'var(--surface-raised)', borderRadius: '6px', marginBottom: '4px' }}>
            {['Metric', 'You', 'Peers'].map(h => (
              <span key={h} style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: h !== 'Metric' ? 'right' : 'left' }}>{h}</span>
            ))}
          </div>

          {rows.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 96px 96px', gap: '8px', padding: '11px 12px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{row.label}</span>
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
                {row.better ? <TrendingUp size={11} color="var(--success)" /> : <TrendingDown size={11} color="var(--danger)" />}
                <span style={{ fontSize: '13px', fontWeight: 700, color: row.better ? 'var(--success)' : 'var(--danger)' }}>{row.user}</span>
              </div>
              <span style={{ textAlign: 'right', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{row.cohort}</span>
            </div>
          ))}

          {/* Habits */}
          <div style={{ marginTop: '18px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>Top 10% Habits</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {cohort_profile.top_habits.map((h, i) => <span key={i} className="badge badge-neutral">{h}</span>)}
            </div>
          </div>

          {/* AI Reality Check */}
          <div style={{ marginTop: '18px', padding: '14px 16px', background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>AI Reality Check</div>
            <div style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{reality_check}</div>
          </div>
        </div>

        {/* Radar */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px', textAlign: 'center' }}>Health Radar</div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Radar name="Top 10%" dataKey="Cohort" stroke="var(--border-strong)" fill="var(--border-strong)" fillOpacity={0.3} />
                <Radar name="You"     dataKey="You"    stroke="var(--accent)"        fill="var(--accent)"        fillOpacity={0.25} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-primary)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Purple = You &nbsp;·&nbsp; Gray = Top 10%</p>
        </div>
      </div>
    </div>
  );
}
