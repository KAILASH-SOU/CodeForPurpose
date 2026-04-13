import React, { useState, useEffect } from 'react';
import { ArrowDownRight, ArrowUpRight, Clock, MapPin, Receipt, ShoppingBag, Coffee, Home, Zap } from 'lucide-react';
import API_BASE from '../api.js';

export default function TransactionHistory({ userId, limit = 8, title = "Recent Transactions", onViewAll }) {
  const [transactions, setTransactions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch(`${API_BASE}/transactions/${userId}?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setTransactions(data.transactions);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.error(err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) {
      fetchTransactions();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="card fade-in" style={{ padding: '24px', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading transactions...</div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="card fade-in" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>{title}</h3>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>No recent activity.</div>
      </div>
    );
  }

  // Pre-defined category icons
  const getCategoryIcon = (category) => {
    const cat = category.toLowerCase();
    if (cat.includes('coffee') || cat.includes('dining')) return Coffee;
    if (cat.includes('shopping')) return ShoppingBag;
    if (cat.includes('rent') || cat.includes('home')) return Home;
    if (cat.includes('utility') || cat.includes('bill')) return Zap;
    if (cat.includes('grocery')) return ShoppingBag;
    return Receipt;
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    const today = new Date();
    
    // Check if it's today
    if (d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
      return 'Today ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="card fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.2px' }}>{title}</h3>
        {onViewAll && (
          <span 
            onClick={onViewAll} 
            style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}
          >
            View All
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {transactions.map((tx) => {
          const isCredit = tx.amount >= 0;
          const CatIcon = getCategoryIcon(tx.category);
          const DirectionIcon = isCredit ? ArrowDownRight : ArrowUpRight;
          
          return (
            <div key={tx.id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '14px', 
              borderRadius: '10px',
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              {/* Left Side: Icon & Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Category Icon with dynamic background */}
                <div style={{
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px', 
                  background: isCredit ? 'var(--success-bg)' : 'var(--accent-soft)',
                  color: isCredit ? 'var(--success)' : 'var(--accent)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <CatIcon size={18} />
                </div>
                
                {/* Text Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                    {tx.merchant_name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span style={{ background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                      {tx.category}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={10} />
                      {formatDate(tx.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Right Side: Amount & Trend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  fontWeight: 800, 
                  fontSize: '15px', 
                  color: isCredit ? 'var(--success)' : 'var(--text-primary)',
                  letterSpacing: '-0.3px'
                }}>
                  {isCredit ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
                </span>
                
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isCredit ? 'var(--success-bg)' : 'var(--danger-bg)',
                  color: isCredit ? 'var(--success)' : 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <DirectionIcon size={14} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
