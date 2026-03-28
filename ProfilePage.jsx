import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, formatCompact, formatDate, BADGE_CONFIG } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { stats, transactions, goals } = useExpense();
  const [profileStats, setProfileStats] = useState({ totalTransactions: 0, totalSpend: 0, totalIncome: 0, goalsCompleted: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileStats();
  }, []);

  const fetchProfileStats = async () => {
    try {
      const res = await api.get('/user/profile');
      setProfileStats(res.data.stats || {});
    } catch (err) {
      console.error('Error fetching profile stats:', err);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const statsList = [
    { label: 'Total Spends', value: formatCurrency(profileStats.totalSpend || stats.totalExpense), color: 'var(--red)', icon: '💸' },
    { label: 'Total Income', value: formatCurrency(profileStats.totalIncome || stats.totalIncome), color: 'var(--green)', icon: '💰' },
    { label: 'Active Streak', value: `${user?.streak || 0} Days`, color: 'var(--orange)', icon: '🔥' },
    { label: 'Goals Met', value: `${profileStats.goalsCompleted || goals.filter(g => g.completed).length}`, color: 'var(--purple-400)', icon: '🎯' },
  ];

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <h1 className="page-title">Profile</h1>
        <button className="btn btn-ghost btn-icon" onClick={() => navigate('/settings')}>⚙️</button>
      </div>

      <div className="page-content">
        {/* User Info */}
        <div className="card animate-slideDown mb-lg" style={{ 
          padding: 24, textAlign: 'center', background: 'var(--gradient-glow), var(--bg-card)' 
        }}>
          <div className="avatar avatar-lg animate-float" style={{ 
            width: 80, height: 80, margin: '0 auto 16px', fontSize: '2.5rem',
            background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-purple)'
          }}>
            🧑
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>{user?.name || 'User Name'}</h2>
          <p className="text-muted text-sm mb-md">{user?.email || 'user@example.com'}</p>
          
          <div className="flex justify-center gap-md">
            <span className="badge badge-purple">⭐ {user?.points || 0} Points</span>
            <span className="badge badge-income">✅ Verified</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="section-header">
          <span className="section-title">📊 Spending Stats</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {statsList.map((s, i) => (
            <div key={i} className="card animate-fadeIn" style={{ padding: 16 }}>
              <span style={{ fontSize: '1.25rem', display: 'block', marginBottom: 8 }}>{s.icon}</span>
              <p className="text-muted text-xs font-semibold">{s.label}</p>
              <p className="font-bold text-sm mt-xs" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Badges Section */}
        <div className="section-header">
          <span className="section-title">🏆 Achievement Gallery</span>
        </div>
        <div className="card mb-lg" style={{ padding: 20 }}>
          {user?.badges?.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {user.badges.map(badge => {
                const config = BADGE_CONFIG[badge] || {};
                return (
                  <div key={badge} className="text-center animate-scaleIn">
                    <div className="avatar avatar-lg" style={{ 
                      width: 64, height: 64, margin: '0 auto 8px', background: `${config.color}15`, 
                      border: `1px solid ${config.color}30`, fontSize: '1.75rem'
                    }}>
                      {config.icon}
                    </div>
                    <p className="text-xs font-bold" style={{ color: config.color }}>{badge}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-md">
              <p className="text-muted text-sm">No badges earned yet. Keep tracking!</p>
            </div>
          )}
        </div>

        {/* Account Options */}
        <div className="section-header">
          <span className="section-title">🔒 Account Options</span>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
          {['Edit Profile', 'Security Settings', 'Notification Prefs', 'Privacy Policy'].map((item, i) => (
            <button key={i} className="w-full text-left" style={{ 
              padding: '16px 20px', background: 'transparent', color: 'var(--text-secondary)',
              borderBottom: i === 3 ? 'none' : '1px solid var(--border-card)', fontSize: '0.9rem',
              fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', justifyContent: 'space-between'
            }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
               onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              {item} <span>›</span>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button 
          className="btn btn-danger btn-full animate-fadeIn" 
          onClick={handleLogout}
          style={{ 
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.2))',
            color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.3)',
            marginBottom: 40
          }}
        >
          🚪 Logout Account
        </button>

        <p className="text-center text-muted text-xs" style={{ paddingBottom: 24 }}>
          SmartExpense v1.0.0 • Made with 💜
        </p>
      </div>
    </div>
  );
}
