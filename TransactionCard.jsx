import React from 'react';
import { getCategoryInfo, formatCurrency, formatRelativeDate } from '../utils/helpers';

const typeSymbol = { income: '+', expense: '-' };
const typeColor = { income: 'var(--green)', expense: 'var(--red)' };

export default function TransactionCard({ transaction, onClick, showDelete, onDelete }) {
  const { amount, type, category, merchant, note, date } = transaction;
  const catInfo = getCategoryInfo(category);

  return (
    <div
      className="card animate-fadeIn"
      style={{ padding: '12px 14px', cursor: onClick ? 'pointer' : 'default', marginBottom: 8 }}
      onClick={onClick}
    >
      <div className="flex items-center" style={{ gap: 12 }}>
        {/* Category Icon */}
        <div className="avatar" style={{ background: catInfo.bg, fontSize: '1.25rem' }}>
          {catInfo.icon}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }} className="truncate">
                {merchant || category}
              </p>
              <p className="text-muted text-xs truncate">{note || formatRelativeDate(date)}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
              <p style={{
                fontWeight: 700, fontSize: '0.9375rem',
                color: typeColor[type] || 'var(--text-primary)',
                fontFamily: 'var(--font-display)'
              }}>
                {typeSymbol[type]}{formatCurrency(amount)}
              </p>
              <p className="text-muted text-xs">{formatRelativeDate(date)}</p>
            </div>
          </div>
        </div>

        {/* Delete button */}
        {showDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            style={{
              background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8,
              color: 'var(--red)', padding: '6px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', flexShrink: 0
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        )}
      </div>

      {/* UPI badge */}
      {transaction.parsedFromSMS && (
        <div style={{ marginTop: 6 }}>
          <span className="badge badge-purple" style={{ fontSize: '0.625rem' }}>⚡ UPI</span>
        </div>
      )}
    </div>
  );
}
