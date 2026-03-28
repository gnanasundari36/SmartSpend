import React, { useState } from 'react';
import { CATEGORIES } from '../utils/helpers';

const CATEGORY_LIST = Object.keys(CATEGORIES);

export default function AddTransactionModal({ onClose, onSave, editData }) {
  const [form, setForm] = useState(editData || {
    amount: '', type: 'expense', category: 'Food',
    merchant: '', note: '', date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || +form.amount <= 0) { setError('Enter a valid amount'); return; }
    setLoading(true);
    await onSave({ ...form, amount: parseFloat(form.amount) });
    setLoading(false);
  };

  return (
    <div className="modal-overlay animate-fadeIn" onClick={onClose}>
      <div className="modal-content animate-slideUp" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <h3 className="modal-title">{editData ? '✏️ Edit Transaction' : '➕ Add Transaction'}</h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Type Toggle */}
          <div className="tab-switcher">
            {['expense', 'income'].map(t => (
              <button key={t} type="button" className={`tab-btn ${form.type === t ? 'active' : ''}`}
                onClick={() => setForm(f => ({ ...f, type: t }))}>
                {t === 'expense' ? '💸 Expense' : '💰 Income'}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label">Amount (₹)*</label>
            <div className="input-wrapper">
              <span className="input-icon" style={{ left: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>₹</span>
              <input className="form-input input-with-icon" type="number" placeholder="0.00" min="0" step="0.01"
                value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {CATEGORY_LIST.filter(c => c !== 'Transfer').map(cat => {
                const info = CATEGORIES[cat];
                return (
                  <button key={cat} type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat }))}
                    style={{
                      padding: '8px 4px', borderRadius: 10, border: `1.5px solid`,
                      borderColor: form.category === cat ? info.color : 'var(--border-card)',
                      background: form.category === cat ? info.bg : 'var(--bg-secondary)',
                      cursor: 'pointer', transition: 'all 0.2s', display: 'flex',
                      flexDirection: 'column', alignItems: 'center', gap: 2
                    }}>
                    <span style={{ fontSize: '1.25rem' }}>{info.icon}</span>
                    <span style={{ fontSize: '0.5625rem', color: form.category === cat ? info.color : 'var(--text-muted)', fontWeight: 500 }}>
                      {cat}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Merchant */}
          <div className="form-group">
            <label className="form-label">Merchant / Source</label>
            <input className="form-input" type="text" placeholder="e.g. Swiggy, Amazon, Salary"
              value={form.merchant} onChange={e => setForm(f => ({ ...f, merchant: e.target.value }))} />
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>

          {/* Note */}
          <div className="form-group">
            <label className="form-label">Note (optional)</label>
            <textarea className="form-input" placeholder="Add a note..." rows={2}
              value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
              {loading ? '⏳ Saving...' : editData ? '✏️ Update' : '➕ Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
