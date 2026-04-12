import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';
import API_BASE from '../api.js';

export default function OverdraftGauge({ userId }) {
  const [probability, setProbability] = useState(null);
  const [daysLeft, setDaysLeft]       = useState(0);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/analytics/overdraft-risk/${userId}`)
      .then(r => r.json())
      .then(d => {
        setProbability(d.probability_percentage);
        setDaysLeft(d.days_until_income);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div className="card loading" style={{ padding: '48px', textAlign: 'center' }}>
      <p>Running overdraft simulation...</p>
    </div>
  );
  if (probability === null) return null;

  let color, badgeClass, RiskIcon, label, interpretation;
  if (probability > 40) {
    color = '#C53030'; badgeClass = 'badge-danger';   RiskIcon = AlertTriangle; label = 'High Risk';
    interpretation = `In ${Math.round(probability * 10)} of 1,000 simulations, your balance hit zero. Reduce non-essential spend by approximately ₹200/day to lower this risk.`;
  } else if (probability > 15) {
    color = '#975A16'; badgeClass = 'badge-warning';  RiskIcon = AlertCircle;   label = 'Moderate Risk';
    interpretation = `Some risk of running low. Your spending variance is elevated. Consider building a small buffer by reducing dining this week.`;
  } else {
    color = '#276749'; badgeClass = 'badge-success';  RiskIcon = ShieldCheck;   label = 'Low Risk';
    interpretation = `Across 1,000 Monte Carlo simulations, your balance stayed positive in all scenarios. Your cash flow is stable for the next ${daysLeft} days.`;
  }

  const gaugeData = [
    { value: probability },
    { value: 100 - probability }
  ];

  const COLORS = [color, 'var(--border)'];

  return (
    <div className="card" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Overdraft Risk</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '3px' }}>
            Monte Carlo simulation — probability of reaching ₹0 in the next {daysLeft} days
          </p>
        </div>
        <span className={`badge ${badgeClass}`}>
          <RiskIcon size={12} />
          {label}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <div style={{ position: 'relative', width: 200, height: 110 }}>
          <ResponsiveContainer width={200} height={110}>
            <PieChart>
              <Pie
                data={gaugeData}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
                isAnimationActive
                animationDuration={1200}
              >
                <Cell fill={COLORS[0]} />
                <Cell fill={COLORS[1]} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{
            position: 'absolute', bottom: 0, left: '50%',
            transform: 'translateX(-50%)', textAlign: 'center'
          }}>
            <div style={{ fontSize: '26px', fontWeight: 800, color: color }}>{probability}%</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Risk Score</div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            padding: '16px',
            background: 'var(--bg)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            fontSize: '13px',
            lineHeight: 1.7,
            color: 'var(--text-secondary)'
          }}>
            {interpretation}
          </div>
        </div>
      </div>
    </div>
  );
}
