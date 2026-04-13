import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts';
import { Info, Bot } from 'lucide-react';
import API_BASE from '../api.js';

export default function WhatIfSimulator({ userId }) {
  const [newRate, setNewRate]           = useState(20);
  const [projectionData, setProjectionData] = useState([]);
  const [currentRate, setCurrentRate]   = useState(0);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const t = setTimeout(() => fetchData(newRate), 500);
    return () => clearTimeout(t);
  }, [newRate, userId]);

  const fetchData = async (rate) => {
    try {
      setLoading(true);
      const res  = await fetch(`${API_BASE}/analytics/what-if/${userId}?new_rate=${rate}`);
      const data = await res.json();
      setProjectionData(data.projections);
      setCurrentRate(data.current_rate);
    } catch {}
    finally { setLoading(false); }
  };

  const fmt = v => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
  const end  = projectionData.length > 0 ? projectionData[projectionData.length - 1] : null;
  const diff = end ? end.new_plan - end.current_plan : 0;
  const rateGap = newRate - currentRate;

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700 }}>Portfolio Scenario Simulator</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>Project your 10-year wealth trajectory by adjusting your savings rate.</p>
      </div>

      {/* Slider */}
      <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '18px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Monthly Savings Rate</span>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Current: {currentRate}%</div>
          </div>
          <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent)' }}>{newRate}%</span>
        </div>

        <input
          type="range" min="5" max="55" step="1"
          value={newRate}
          onChange={e => setNewRate(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
        />

        {end && Math.abs(diff) > 0 && (
          <div style={{
            marginTop: '12px', padding: '9px 12px', borderRadius: '6px',
            background: diff > 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
            border: `1px solid ${diff > 0 ? 'var(--success-border)' : 'var(--danger-border)'}`,
            fontSize: '12px', fontWeight: 600,
            color: diff > 0 ? 'var(--success)' : 'var(--danger)'
          }}>
            {diff > 0
              ? `+${fmt(diff)} over 10 years by raising savings ${Math.abs(rateGap)}%`
              : `${fmt(diff)} less — increase savings rate to close the gap`
            }
          </div>
        )}
      </div>

      {/* Chart */}
      {loading ? (
        <div className="loading" style={{ height: 240 }}>Calculating trajectory...</div>
      ) : (
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <AreaChart data={projectionData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.18}/>
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} stroke="var(--text-muted)" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} stroke="var(--text-muted)" fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={v => [fmt(v)]}
                labelFormatter={l => `Year ${l}`}
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-primary)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px', color: 'var(--text-secondary)' }} />
              <Area    type="monotone" name={`Adjusted (${newRate}%)`}    dataKey="new_plan"     stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#newGrad)" />
              <Line    type="monotone" name={`Baseline (${currentRate}%)`} dataKey="current_plan" stroke="var(--border-strong)" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Note */}
      <div style={{ marginTop: '14px', padding: '10px 12px', background: 'var(--surface-raised)', borderRadius: '7px', border: '1px solid var(--border)', display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
        <Info size={13} color="var(--text-muted)" style={{ marginTop: '1px', flexShrink: 0 }} />
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Assumes 7% annual compounding return (Indian benchmark). A {Math.abs(rateGap)}% difference in savings rate compounds to {fmt(Math.abs(diff))} over 10 years.
        </p>
      </div>

      <button 
        onClick={() => window.dispatchEvent(new CustomEvent('open-chat', { detail: 'Can you give me more insights on how adjusting my savings rate impacts long-term wealth?' }))}
        style={{ 
          marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', 
          padding: '8px 12px', background: 'var(--surface-raised)', border: '1px solid var(--border)', 
          borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--accent)', cursor: 'pointer', transition: 'background 0.2s' 
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-soft)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'var(--surface-raised)'}
      >
        <Bot size={14} /> Ask AI for more insights
      </button>
    </div>
  );
}
