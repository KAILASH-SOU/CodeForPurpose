import React from 'react';
import { ShieldCheck, Calendar, TrendingDown, TrendingUp } from 'lucide-react';

const SafeToSpendCard = ({ data }) => {
  if (!data) return (
    <div className="safe-to-spend-container">
      <div className="card stat-card loading">Loading budget data...</div>
      <div className="card stat-card loading">Loading upcoming bills...</div>
    </div>
  );

  const {
    safe_to_spend,
    current_balance,
    upcoming_recurring,
    predicted_variable_spend,
    upcoming_recurring_items = [],
    horizon_days
  } = data;

  const totalForecasted = (upcoming_recurring || 0) + (predicted_variable_spend || 0);

  let statusClass, statusText, StatusIcon;
  if (safe_to_spend > 5000) {
    statusClass = 'badge-success'; statusText = 'Healthy buffer'; StatusIcon = TrendingUp;
  } else if (safe_to_spend > 0) {
    statusClass = 'badge-warning'; statusText = 'Spend carefully'; StatusIcon = TrendingDown;
  } else {
    statusClass = 'badge-danger'; statusText = 'Potential overdraft'; StatusIcon = TrendingDown;
  }

  return (
    <div className="safe-to-spend-container">
      {/* Safe to Spend */}
      <div className="card stat-card">
        <div className="stat-header">
          <ShieldCheck size={15} color="var(--purple)" />
          Safe to Spend
        </div>

        <div className="stat-value">
          {safe_to_spend < 0 ? '-' : ''}₹{Math.abs(safe_to_spend).toLocaleString('en-IN')}
        </div>
        <div className="stat-subtitle">Available over the next {horizon_days} days</div>

        <span className={`badge ${statusClass}`} style={{ marginBottom: '20px', display: 'inline-flex' }}>
          <StatusIcon size={12} />
          {statusText}
        </span>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
          {safe_to_spend > 5000
            ? `Your finances look solid. After all projected bills and spending, you have a comfortable ₹${safe_to_spend.toLocaleString('en-IN')} remaining.`
            : safe_to_spend > 0
            ? `Tight margin ahead. Only ₹${safe_to_spend.toLocaleString('en-IN')} remains after upcoming obligations. Avoid discretionary spend this week.`
            : `Projected shortfall of ₹${Math.abs(safe_to_spend).toLocaleString('en-IN')}. Review your upcoming expenses and cut non-essentials.`
          }
        </p>

        <hr />
        <div className="stat-details">
          <div className="detail-item">
            <span className="label">Current Balance</span>
            <span className="value">₹{(current_balance || 0).toLocaleString('en-IN')}</span>
          </div>
          <div style={{ width: '1px', height: '32px', background: 'var(--border)' }} />
          <div className="detail-item">
            <span className="label">Projected Costs</span>
            <span className="value">₹{totalForecasted.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Upcoming Bills */}
      <div className="card stat-card">
        <div className="stat-header">
          <Calendar size={15} color="var(--purple)" />
          Upcoming Bills
        </div>

        {upcoming_recurring_items.length > 0 ? (
          <div className="bill-list">
            {upcoming_recurring_items.map((item, i) => (
              <div key={i} className="bill-item">
                <div>
                  <span className="bill-name">{item.merchant}</span>
                  <span className="bill-date">Expected {item.expected_date}</span>
                </div>
                <span className="bill-amount">-₹{item.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No recurring bills detected in this window.
          </div>
        )}

        <div style={{
          marginTop: '16px',
          padding: '12px 14px',
          background: 'var(--bg)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          lineHeight: 1.6
        }}>
          These fixed commitments are already deducted from your Safe to Spend figure above.
        </div>
      </div>
    </div>
  );
};

export default SafeToSpendCard;
