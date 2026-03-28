import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, formatCompact, GOAL_CATEGORIES, calcPercentage } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function GoalsPage() {
  const { goals, loading, addGoal, updateGoal, deleteGoal } = useExpense();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [form, setForm] = useState({
    title: '', targetAmount: '', savedAmount: '', deadline: '', category: 'Other', icon: '🎯', color: '#8b5cf6'
  });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.targetAmount || !form.deadline) {
      toast.error('Please fill all required fields');
      return;
    }

    const data = {
      ...form,
      targetAmount: parseFloat(form.targetAmount),
      savedAmount: parseFloat(form.savedAmount || 0)
    };

    let result;
    if (editGoal) {
      result = await updateGoal(editGoal._id, data);
      if (result.success) toast.success('Goal updated! 🎯');
    } else {
      result = await addGoal(data);
      if (result.success) toast.success('Goal created! 🚀');
    }

    if (result.success) {
      setShowAddModal(false);
      setEditGoal(null);
      setForm({ title: '', targetAmount: '', savedAmount: '', deadline: '', category: 'Other', icon: '🎯', color: '#8b5cf6' });
    } else {
      toast.error(result.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this goal?')) {
      const result = await deleteGoal(id);
      if (result.success) toast.success('Goal deleted');
    }
  };

  const handleUpdateSaved = async (goal, amount) => {
    const result = await updateGoal(goal._id, { savedAmount: amount });
    if (result.success) toast.success(`Saved ${formatCurrency(amount)} for ${goal.title}!`);
  };

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <h1 className="page-title">Savings Goals</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          + New Goal
        </button>
      </div>

      <div className="page-content">
        <p className="text-muted text-sm mb-lg" style={{ lineHeight: 1.5 }}>
          Create goals to save for your next trip, gadget or emergency fund.
        </p>

        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
          </div>
        ) : goals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <p className="empty-title">No goals yet</p>
            <p className="empty-text">Create your first goal to start tracking your savings.</p>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Create Goal</button>
          </div>
        ) : (
          <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {goals.map(goal => {
              const progress = calcPercentage(goal.savedAmount, goal.targetAmount);
              const config = GOAL_CATEGORIES[goal.category] || GOAL_CATEGORIES.Other;
              
              return (
                <div key={goal._id} className="card animate-fadeIn" style={{ borderLeft: `4px solid ${goal.color || config.color}` }}>
                  <div className="flex justify-between items-start mb-md">
                    <div className="flex gap-md">
                      <div className="avatar avatar-lg" style={{ background: `${goal.color || config.color}20`, color: goal.color || config.color }}>
                        {goal.icon || config.icon}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{goal.title}</h3>
                        <p className="text-muted text-xs">Target: {formatCurrency(goal.targetAmount)}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p className="amount-display amount-primary" style={{ fontSize: '1rem' }}>
                        {formatCurrency(goal.savedAmount)}
                      </p>
                      <p className="text-muted text-xs">Saved so far</p>
                    </div>
                  </div>

                  <div className="progress-bar mb-sm">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress}%`, background: goal.color || 'var(--gradient-primary)' }} 
                    />
                  </div>

                  <div className="flex justify-between items-center mb-md">
                    <span className="text-xs font-semibold" style={{ color: goal.color || 'var(--purple-400)' }}>
                      {progress}% Complete
                    </span>
                    <span className="text-muted text-xs">
                      Deadline: {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-sm">
                    <button 
                      className="btn btn-secondary btn-sm" 
                      style={{ flex: 1 }}
                      onClick={() => {
                        const amount = parseFloat(prompt(`Add savings for "${goal.title}":`, '0'));
                        if (!isNaN(amount) && amount > 0) {
                          handleUpdateSaved(goal, goal.savedAmount + amount);
                        }
                      }}
                    >
                      💰 Save More
                    </button>
                    <button 
                      className="btn btn-ghost btn-sm btn-icon" 
                      onClick={() => { setEditGoal(goal); setForm(goal); setShowAddModal(true); }}
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn btn-ghost btn-sm btn-icon" 
                      onClick={() => handleDelete(goal._id)}
                      style={{ color: 'var(--red)' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay animate-fadeIn" onClick={() => setShowAddModal(false)}>
          <div className="modal-content animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 className="modal-title">{editGoal ? '✏️ Edit Goal' : '🎯 Create New Goal'}</h3>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Goal Title *</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. New Laptop, Dream Trip" 
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  required
                />
              </div>

              <div className="flex gap-md">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Target Amount (₹) *</label>
                  <input 
                    className="form-input" 
                    type="number" 
                    placeholder="0.00"
                    value={form.targetAmount}
                    onChange={e => setForm({...form, targetAmount: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Initial Savings (₹)</label>
                  <input 
                    className="form-input" 
                    type="number" 
                    placeholder="0.00"
                    value={form.savedAmount}
                    onChange={e => setForm({...form, savedAmount: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Target Deadline *</label>
                <input 
                  className="form-input" 
                  type="date"
                  value={form.deadline ? form.deadline.split('T')[0] : ''}
                  onChange={e => setForm({...form, deadline: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category & Icon</label>
                <div className="chip-container">
                  {Object.entries(GOAL_CATEGORIES).map(([cat, config]) => (
                    <button 
                      key={cat} 
                      type="button"
                      className={`chip ${form.category === cat ? 'active' : ''}`}
                      onClick={() => setForm({...form, category: cat, icon: config.icon, color: config.color})}
                    >
                      {config.icon} {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full mt-md" disabled={loading}>
                {loading ? '⏳ Saving...' : editGoal ? 'Update Goal' : '🎯 Create Goal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
