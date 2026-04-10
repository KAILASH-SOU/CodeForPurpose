import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const SpendingChart = ({ smaData }) => {
  if (!smaData || smaData.length === 0) {
    return (
      <div className="card chart-card loading">
        Not enough transaction history to calculate spending trend.
      </div>
    );
  }

  const formattedData = smaData.map(item => ({ date: item.date, sma: item.value }));
  const slice = Math.min(7, Math.floor(formattedData.length / 2));
  const avgEarly  = formattedData.slice(0, slice).reduce((s, d) => s + d.sma, 0) / slice;
  const avgLate   = formattedData.slice(-slice).reduce((s, d) => s + d.sma, 0) / slice;
  const changePct = ((avgLate - avgEarly) / avgEarly) * 100;

  let TrendIcon, trendClass, trendText;
  if (changePct > 10)       { TrendIcon = TrendingUp;   trendClass = 'badge-danger';  trendText = `Up ${changePct.toFixed(1)}%`; }
  else if (changePct < -10) { TrendIcon = TrendingDown; trendClass = 'badge-success'; trendText = `Down ${Math.abs(changePct).toFixed(1)}%`; }
  else                      { TrendIcon = Minus;        trendClass = 'badge-neutral'; trendText = 'Stable'; }

  return (
    <div className="card chart-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: 700 }}>Daily Spending Trend</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>7-day simple moving average</p>
        </div>
        <span className={`badge ${trendClass}`}>
          <TrendIcon size={11} />
          {trendText}
        </span>
      </div>

      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <AreaChart data={formattedData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="smaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="date" hide />
            <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `₹${v}`} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-primary)' }}
              formatter={v => [`₹${Math.round(v)}`, '7-Day Avg']}
            />
            <Area type="monotone" dataKey="sma" stroke="var(--accent)" strokeWidth={2} fill="url(#smaGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="chart-info">
        {changePct > 10
          ? 'Spending has increased recently. Review dining and discretionary categories.'
          : changePct < -10
          ? 'Spending is trending down — a positive signal for your savings targets.'
          : 'Spending is consistent, which makes your forecasts more reliable.'
        }
      </p>
    </div>
  );
};

export default SpendingChart;
