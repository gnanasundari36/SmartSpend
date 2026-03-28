import React, { useState, useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, formatCompact, calcPercentage, CATEGORIES } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function BudgetPage() {
  const { budget, budgetStatus, loading, saveBudget } = useExpense();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    monthlyLimit: 0,
    categoryLimits: {
      Food: 0, Travel: 0, Shopping: 0, Entertainment: 0, Health: 0, Education: 0, Bills: 0, Other: 0
    },
    alertThreshold: 80
  });

  useEffect(() => {
    if (budget) {
      setForm({
        monthlyLimit: budget.monthlyLimit || 0,
        categoryLimits: { ...budget.categoryLimits } || {},
        alertThreshold: budget.alertThreshold || 80
      });
    }
  }, [budget]);

  const handleSave = async (e) => {
    e.preventDefault();
    const result = await saveBudget(form);
    if (result.success) {
      toast.success('Budget updated! 📊');
      setEditing(false);
    } else {
      toast.error(result.message || 'Failed to update budget');
    }
  };

  const updateCategoryLimit = (cat, val) => {
    setForm(prev => ({
      ...prev,
      categoryLimits: {
        ...prev.categoryLimits,
        [cat]: parseFloat(val) || 0
      }
    }));
  };

  if (loading && !budget) return <div className="loader-container"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <h1 className="page-title">Budget Manager</h1>
        <button 
          className={`btn ${editing ? 'btn-secondary' : 'btn-primary'} btn-sm`}
          onClick={() => setEditing(!editing)}
        >
          {editing ? '✖️ Cancel' : '✏️ Edit Budget'}
        </button>
      </div>

      <div className="page-content">
        <p className="text-muted text-sm mb-lg" style={{ lineHeight: 1.5 }}>
          Set monthly and category-wise spending limits to stay on top of your finances.
        </p>

        {budgetStatus && (
          <div className="card animate-fadeIn mb-lg" style={{ borderTop: `6px solid ${budgetStatus.alerts ? 'var(--red)' : budgetStatus.usagePercent > 70 ? 'var(--yellow)' : 'var(--green)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <p className="text-muted text-xs">Total Budget Usage</p>
                <p className="amount-display amount-lg" style={{ color: budgetStatus.alerts ? 'var(--red)' : 'var(--text-primary)' }}>
                  {budgetStatus.usagePercent}%
                </p>
                <div className="progress-bar mt-sm" style={{ height: 12, width: 240, margin: '12px auto' }}>
                  <div 
                    className={`progress-fill ${budgetStatus.alerts ? 'danger' : budgetStatus.usagePercent > 70 ? 'warning' : 'success'}`} 
                    style={{ width: `${Math.min(budgetStatus.usagePercent, 100)}%` }} 
                  />
                </div>
                <p className="text-sm font-semibold">
                  {formatCurrency(budgetStatus.totalSpent)} <span className="text-muted">of</span> {formatCurrency(budgetStatus.budget?.monthlyLimit || 0)}
                </p>
              </div>
            </div>

            {budgetStatus.alerts && (
              <div className="alert alert-danger animate-fadeIn">
                ⚠️ Careful! You've used {budgetStatus.usagePercent}% of your monthly budget.
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="section-header">
            <span className="section-title">📊 Total Monthly Budget</span>
          </div>

          <div className="card mb-lg" style={{ padding: 20 }}>
            {editing ? (
              <div className="form-group">
                <div className="input-wrapper">
                  <span className="input-icon">₹</span>
                  <input 
                    className="form-input input-with-icon" 
                    type="number" 
                    value={form.monthlyLimit}
                    onChange={e => setForm({...form, monthlyLimit: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <p className="text-xs text-muted mt-sm">Recommended Alert Threshold</p>
                <input 
                  type="range" className="w-full mt-xs" min="50" max="100" step="5"
                  value={form.alertThreshold}
                  onChange={e => setForm({...form, alertThreshold: parseInt(e.target.value)})}
                />
                <div className="flex justify-between text-xs font-semibold mt-xs">
                  <span>50%</span> <span>{form.alertThreshold}%</span> <span>100%</span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="amount-display" style={{ fontSize: '1.5rem' }}>{formatCurrency(budget?.monthlyLimit || 0)}</h3>
                <span className="badge badge-purple">Alert at {budget?.alertThreshold}%</span>
              </div>
            )}
          </div>

          <div className="section-header">
            <span className="section-title">📦 Category Limits</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 24 }}>
            {Object.entries(CATEGORIES).filter(([cat]) => !['Salary', 'Transfer'].includes(cat)).map(([cat, config]) => {
              const limit = editing ? form.categoryLimits[cat] : (budget?.categoryLimits[cat] || 0);
              const spent = budgetStatus?.categorySpent[cat] || 0;
              const percent = calcPercentage(spent, limit);
              
              return (
                <div key={cat} className="card" style={{ padding: 12 }}>
                  <div className="flex justify-between items-center mb-sm">
                    <div className="flex gap-sm items-center">
                      <div className="avatar avatar-sm" style={{ background: config.bg, fontSize: '1rem' }}>{config.icon}</div>
                      <span className="text-sm font-semibold">{cat}</span>
                    </div>
                    {editing ? (
                      <div className="input-wrapper" style={{ width: 100 }}>
                        <span className="input-icon" style={{ left: 8 }}>₹</span>
                        <input 
                          className="form-input" 
                          style={{ padding: '6px 6px 6px 22px', fontSize: '0.8125rem' }} 
                          type="number"
                          value={limit}
                          onChange={e => updateCategoryLimit(cat, e.target.value)}
                        />
                      </div>
                    ) : (
                      <div style={{ textAlign: 'right' }}>
                        <span className="text-xs font-semibold">{formatCompact(spent)}</span>
                        <span className="text-muted text-xs"> / {formatCompact(limit)}</span>
                      </div>
                    )}
                  </div>
                  
                  {!editing && (
                    <div className="progress-bar mb-xs" style={{ height: 6 }}>
                      <div 
                        className={`progress-fill ${percent >= 90 ? 'danger' : percent >= 70 ? 'warning' : 'success'}`} 
                        style={{ width: `${Math.min(percent, 100)}%` }} 
                      />
                    </div>
                  )}
                  {!editing && spent > limit && limit > 0 && (
                    <p className="text-red text-xs font-semibold">⚠️ Exceeded by {formatCurrency(spent - limit)}</p>
                  )}
                </div>
              );
            })}
          </div>

          {editing && (
            <button type="submit" className="btn btn-primary btn-full animate-slideUp" style={{ position: 'sticky', bottom: 90 }}>
              💾 Save Budget Changes
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
