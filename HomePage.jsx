import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, formatCompact, CATEGORIES, SAVINGS_TIPS, BADGE_CONFIG } from '../utils/helpers';
import AddTransactionModal from '../components/AddTransactionModal';
import TransactionCard from '../components/TransactionCard';
import toast from 'react-hot-toast';

const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#f97316', '#a78bfa'];

export default function HomePage() {
  const { user } = useAuth();
  const { transactions, stats, budgetStatus, loading, addTransaction, deleteTransaction } = useExpense();
  const [showAddModal, setShowAddModal] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const navigate = useNavigate();

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(i => (i + 1) % SAVINGS_TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Prepare pie chart data
  const pieData = Object.entries(stats.byCategory || {})
    .filter(([, v]) => v > 0)
    .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }))
    .slice(0, 6);

  const recentTx = transactions.slice(0, 5);
  const budgetPercent = budgetStatus?.usagePercent || 0;
  const budgetColor = budgetPercent >= 90 ? 'var(--red)' : budgetPercent >= 70 ? 'var(--yellow)' : 'var(--green)';
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleAddTransaction = async (data) => {
    const result = await addTransaction(data);
    if (result.success) {
      toast.success(`Transaction added! ${data.type === 'expense' ? '💸' : '💰'}`);
      setShowAddModal(false);
    } else {
      toast.error(result.message || 'Failed to add transaction');
    }
  };

  return (
    <div className="page" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(139,92,246,0.1) 0%, transparent 100%)',
        padding: '48px 20px 24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div className="animate-slideDown">
            <p className="text-muted text-sm">{greeting()},</p>
            <h1 style={{ fontSize: '1.5rem', marginTop: 2 }}>
              {user?.name?.split(' ')[0]} 👋
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {user?.streak > 0 && (
              <div style={{
                background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)',
                borderRadius: 10, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4
              }}>
                <span>🔥</span>
                <span style={{ color: 'var(--orange)', fontSize: '0.8125rem', fontWeight: 600 }}>{user.streak}</span>
              </div>
            )}
            <div style={{
              background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
              borderRadius: 10, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4
            }}>
              <span>⭐</span>
              <span style={{ color: 'var(--purple-400)', fontSize: '0.8125rem', fontWeight: 600 }}>{user?.points || 0}</span>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="card card-gradient animate-slideUp" style={{
          background: 'var(--gradient-primary)', padding: '24px 20px', marginBottom: 0
        }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8125rem', marginBottom: 6 }}>
            Monthly Balance
          </p>
          <div className="amount-display amount-lg" style={{ color: 'white', marginBottom: 16 }}>
            {formatCurrency(stats.balance || 0)}
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.6875rem' }}>INCOME</p>
              <p style={{ color: '#86efac', fontWeight: 700, fontSize: '1rem' }}>
                +{formatCompact(stats.totalIncome)}
              </p>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
            <div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.6875rem' }}>EXPENSES</p>
              <p style={{ color: '#fca5a5', fontWeight: 700, fontSize: '1rem' }}>
                -{formatCompact(stats.totalExpense)}
              </p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={() => setShowAddModal(true)} style={{
                background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 10, padding: '8px 14px', color: 'white', cursor: 'pointer',
                fontSize: '0.8125rem', fontWeight: 600, backdropFilter: 'blur(4px)'
              }}>
                + Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Budget Progress */}
        {budgetStatus?.budget && (
          <div className="card animate-fadeIn">
            <div className="section-header" style={{ marginBottom: 12 }}>
              <span className="section-title">📊 Budget Usage</span>
              <button className="section-link" onClick={() => navigate('/budget')}>Manage</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="text-muted text-sm">
                {formatCurrency(budgetStatus.totalSpent)} spent
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: budgetColor }}>
                {budgetPercent}%
              </span>
            </div>
            <div className="progress-bar" style={{ height: 10 }}>
              <div
                className={`progress-fill ${budgetPercent >= 90 ? 'danger' : budgetPercent >= 70 ? 'warning' : ''}`}
                style={{ width: `${Math.min(budgetPercent, 100)}%` }}
              />
            </div>
            <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 6 }}>
              of {formatCurrency(budgetStatus.budget.monthlyLimit)} budget
              {budgetStatus.alerts && <span style={{ color: 'var(--red)', marginLeft: 8 }}>⚠️ Near limit!</span>}
            </p>
          </div>
        )}

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div className="card animate-fadeIn">
            <div className="section-header">
              <span className="section-title">🥧 Spending by Category</span>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                      paddingAngle={3} dataKey="value" stroke="none">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => formatCurrency(v)}
                      contentStyle={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 8, fontSize: '0.75rem', color: 'var(--text-primary)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pieData.map((d, i) => {
                  const info = CATEGORIES[d.name] || CATEGORIES.Other;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 600 }}>{formatCompact(d.value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Badges */}
        {user?.badges?.length > 0 && (
          <div className="card animate-fadeIn">
            <div className="section-header" style={{ marginBottom: 8 }}>
              <span className="section-title">🏆 Your Badges</span>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {user.badges.map(badge => {
                const config = BADGE_CONFIG[badge] || {};
                return (
                  <div key={badge} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    background: 'var(--bg-secondary)', borderRadius: 12, padding: '10px 14px',
                    border: `1px solid ${config.color}30`, minWidth: 72, flexShrink: 0
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>{config.icon}</span>
                    <span style={{ fontSize: '0.5625rem', color: config.color, fontWeight: 600, textAlign: 'center' }}>
                      {badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Savings Tip */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1))',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: 14, padding: 16
        }} className="animate-fadeIn">
          <p style={{ color: 'var(--purple-400)', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6 }}>
            💡 Savings Tip
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {SAVINGS_TIPS[tipIndex]}
          </p>
        </div>

        {/* Recent Transactions */}
        <div className="animate-fadeIn">
          <div className="section-header">
            <span className="section-title">🕐 Recent Transactions</span>
            <button className="section-link" onClick={() => navigate('/expenses')}>See All</button>
          </div>
          {loading ? (
            <div className="loader-container" style={{ minHeight: 80 }}>
              <div className="spinner" />
            </div>
          ) : recentTx.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 16px' }}>
              <span className="empty-icon">💳</span>
              <p className="empty-title">No transactions yet</p>
              <p className="empty-text">Add your first transaction to get started</p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>+ Add Transaction</button>
            </div>
          ) : (
            <div className="stagger-children">
              {recentTx.map(tx => (
                <TransactionCard
                  key={tx._id}
                  transaction={tx}
                  onClick={() => navigate('/expenses')}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingBottom: 8 }}>
          <button onClick={() => setShowAddModal(true)} className="card" style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(109,40,217,0.1))',
            border: '1px solid rgba(139,92,246,0.3)', cursor: 'pointer', textAlign: 'left', padding: 16
          }}>
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: 6 }}>➕</span>
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Add Expense</span>
            <p className="text-muted text-xs" style={{ marginTop: 2 }}>Log a transaction</p>
          </button>
          <button onClick={() => navigate('/upi')} className="card" style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(8,145,178,0.1))',
            border: '1px solid rgba(6,182,212,0.3)', cursor: 'pointer', textAlign: 'left', padding: 16
          }}>
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: 6 }}>⚡</span>
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>UPI Parser</span>
            <p className="text-muted text-xs" style={{ marginTop: 2 }}>Parse SMS messages</p>
          </button>
        </div>
      </div>

      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddTransaction}
        />
      )}
    </div>
  );
}
