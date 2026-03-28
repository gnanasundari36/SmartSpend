import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExpense } from '../context/ExpenseContext';
import api from '../utils/api';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weekly');
  const { user } = useAuth();
  
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/user/leaderboard');
      setLeaderboard(res.data.leaderboard || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
    setLoading(false);
  };

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

  return (
    <div className="page" style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0f0f1a 100%)' }}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <h1 className="page-title">🏅 Leaderboard</h1>
        <div style={{
          width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--yellow)', color: '#000', fontSize: '1.5rem'
        }}>🏆</div>
      </div>

      <div className="page-content">
        <div className="tab-switcher mb-lg">
          {['weekly', 'all-time'].map(t => (
            <button 
              key={t}
              className={`tab-btn ${activeTab === t ? 'active' : ''} text-xs`}
              onClick={() => setActiveTab(t)}
            >
              {t === 'weekly' ? '📅 Weekly' : '🌎 All Time'}
            </button>
          ))}
        </div>

        {/* Current User Rank */}
        <div className="card animate-slideDown mb-lg" style={{ 
          background: 'var(--gradient-primary)', border: 'none', color: 'white',
          display: 'flex', alignItems: 'center', gap: 16, padding: 20 
        }}>
          <div className="avatar avatar-lg" style={{ background: 'rgba(255,255,255,0.2)', fontSize: '2rem' }}>
            🧑
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1rem', color: 'white' }}>{user?.name}</h3>
            <p className="text-sm" style={{ opacity: 0.8 }}>Ranked <strong style={{ color: 'var(--yellow)' }}>#4</strong> globally this week</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="amount-display" style={{ fontSize: '1.5rem', color: 'white' }}>{user?.points || 0}</p>
            <p className="text-xs" style={{ opacity: 0.8 }}>Points</p>
          </div>
        </div>

        <div className="section-header">
          <span className="section-title">🏆 Top Trackers</span>
        </div>

        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {leaderboard.map((u, i) => {
            const isMe = u.name === 'Demo User';
            const isTop3 = i < 3;
            const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
            
            return (
              <div key={i} className="card animate-fadeIn" style={{ 
                padding: 14, display: 'flex', alignItems: 'center', gap: 16,
                border: isMe ? '2px solid var(--purple-500)' : '1px solid var(--border-card)',
                background: isMe ? 'rgba(139,92,246,0.1)' : 'var(--bg-card)'
              }}>
                <div style={{ 
                  width: 32, fontSize: '1rem', fontWeight: 800, textAlign: 'center',
                  color: i === 0 ? 'var(--yellow)' : i === 1 ? '#e2e2e2' : i === 2 ? '#cd7f32' : 'var(--text-muted)'
                }}>
                  {rankEmoji || `#${i + 1}`}
                </div>
                
                <div className="avatar avatar-md" style={{ 
                  background: isMe ? 'var(--purple-500)' : isTop3 ? 'rgba(255,255,255,0.1)' : 'var(--bg-secondary)', 
                  border: isTop3 ? `2px solid ${i === 0 ? 'var(--yellow)' : i === 1 ? '#e2e2e2' : '#cd7f32'}` : 'none'
                }}>
                  {u.avatar || '👤'}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 className="text-sm truncate">
                    {u.name} {isMe && <span className="badge badge-purple" style={{ fontSize: '0.5rem', marginLeft:6 }}>YOU</span>}
                  </h4>
                  <div className="flex gap-sm items-center mt-xs">
                    <span className="text-xs text-muted">🏆 {u.badges}</span>
                    <span className="text-xs text-muted">🔥 {u.streak}</span>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <p className="font-bold text-sm" style={{ color: isTop3 ? 'var(--yellow)' : 'var(--text-primary)' }}>{u.points}</p>
                  <p className="text-xs text-muted">pts</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Stats */}
        <div className="mt-xl animate-fadeIn mb-lg">
          <h4 className="text-sm mb-md">🌍 Global Stats</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="card text-center" style={{ padding: 16 }}>
              <p className="text-muted text-xs">Total Trackers</p>
              <p className="font-bold text-lg mt-xs" style={{ color: 'var(--purple-400)' }}>1,240+</p>
            </div>
            <div className="card text-center" style={{ padding: 16 }}>
              <p className="text-muted text-xs">Total Savings</p>
              <p className="font-bold text-lg mt-xs" style={{ color: 'var(--green)' }}>₹4.2M</p>
            </div>
          </div>
        </div>

        <p className="text-center text-muted text-xs pb-lg">
          Keep tracking to climb the leaderboard! 🚀
        </p>
      </div>
    </div>
  );
}
