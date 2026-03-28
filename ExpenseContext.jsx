import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext(null);

export const ExpenseProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(null);
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({ totalExpense: 0, totalIncome: 0, balance: 0, byCategory: {} });
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAll();
    }
  }, [isAuthenticated]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.allSettled([
      fetchTransactions(),
      fetchBudget(),
      fetchGoals(),
      fetchStats(),
      fetchBudgetStatus()
    ]);
    setLoading(false);
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/transactions/stats/summary');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchBudget = async () => {
    try {
      const res = await api.get('/budget');
      setBudget(res.data.budget);
    } catch (err) {
      console.error('Error fetching budget:', err);
    }
  };

  const fetchBudgetStatus = async () => {
    try {
      const res = await api.get('/budget/status');
      setBudgetStatus(res.data);
    } catch (err) {
      console.error('Error fetching budget status:', err);
    }
  };

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data.goals || []);
    } catch (err) {
      console.error('Error fetching goals:', err);
    }
  };

  const addTransaction = async (data) => {
    try {
      const res = await api.post('/transactions', data);
      setTransactions(prev => [res.data.transaction, ...prev]);
      await fetchStats();
      await fetchBudgetStatus();
      return { success: true, transaction: res.data.transaction };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error adding transaction' };
    }
  };

  const updateTransaction = async (id, data) => {
    try {
      const res = await api.put(`/transactions/${id}`, data);
      setTransactions(prev => prev.map(t => t._id === id ? res.data.transaction : t));
      await fetchStats();
      await fetchBudgetStatus();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error updating transaction' };
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(prev => prev.filter(t => t._id !== id));
      await fetchStats();
      await fetchBudgetStatus();
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  const saveBudget = async (data) => {
    try {
      const res = await api.post('/budget', data);
      setBudget(res.data.budget);
      await fetchBudgetStatus();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error saving budget' };
    }
  };

  const addGoal = async (data) => {
    try {
      const res = await api.post('/goals', data);
      setGoals(prev => [res.data.goal, ...prev]);
      return { success: true, goal: res.data.goal };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error adding goal' };
    }
  };

  const updateGoal = async (id, data) => {
    try {
      const res = await api.put(`/goals/${id}`, data);
      setGoals(prev => prev.map(g => g._id === id ? res.data.goal : g));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error updating goal' };
    }
  };

  const deleteGoal = async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      setGoals(prev => prev.filter(g => g._id !== id));
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  return (
    <ExpenseContext.Provider value={{
      transactions, budget, goals, stats, budgetStatus, loading,
      fetchAll, fetchTransactions, fetchStats, fetchBudget, fetchGoals,
      addTransaction, updateTransaction, deleteTransaction,
      saveBudget, addGoal, updateGoal, deleteGoal
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpense must be used within ExpenseProvider');
  return ctx;
};
