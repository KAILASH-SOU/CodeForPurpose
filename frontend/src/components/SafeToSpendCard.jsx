import React from 'react';
import { ShieldCheck, Calendar, Wallet, TrendingDown } from 'lucide-react';

const SafeToSpendCard = ({ data }) => {
  if (!data) return <div className="stat-card glass-panel loading">Loading Safe to Spend...</div>;

  const {
    safe_to_spend,
    current_balance,
    upcoming_recurring,
    predicted_variable_spend,
    uncertainty_95,
    upcoming_recurring_items,
    horizon_days
  } = data;

  return (
    <div className="safe-to-spend-container">
      <div className="stat-card main-stat glass-panel">
        <div className="stat-header">
          <ShieldCheck size={20} color="var(--natwest-pink)" />
          <span>Safe to Spend</span>
        </div>
        <div className="stat-value">£{safe_to_spend.toLocaleString()}</div>
        <div className="stat-subtitle">Next {horizon_days} days projection</div>
        
        <div className="stat-details">
          <div className="detail-item">
            <span className="label">Current Balance</span>
            <span className="value">£{current_balance.toLocaleString()}</span>
          </div>
          <div className="detail-separator"></div>
          <div className="detail-item">
            <span className="label">Forecasted Spend</span>
            <span className="value">£{(upcoming_recurring + predicted_variable_spend).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="stat-card secondary-stat glass-panel">
        <div className="stat-header">
          <Calendar size={20} color="var(--natwest-purple)" />
          <span>Upcoming Obligations</span>
        </div>
        <div className="bill-list">
          {upcoming_recurring_items.length > 0 ? (
            upcoming_recurring_items.map((item, idx) => (
              <div key={idx} className="bill-item">
                <div className="bill-info">
                  <span className="bill-name">{item.merchant}</span>
                  <span className="bill-date">{item.expected_date}</span>
                </div>
                <div className="bill-amount">£{item.amount.toLocaleString()}</div>
              </div>
            ))
          ) : (
            <p className="no-bills">No recurring bills in this window.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafeToSpendCard;
