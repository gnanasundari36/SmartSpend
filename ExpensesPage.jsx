import React, { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, formatDate, CATEGORIES, getCategoryInfo } from '../utils/helpers';
import TransactionCard from '../components/TransactionCard';
import AddTransactionModal from '../components/AddTransactionModal';
import toast from 'react-hot-toast';

const FILTERS = ['All', 'Food', 'Travel', 'Shopping', 'Entertainment', 'Health', 'Education', 'Bills', 'Other'];

export default function ExpensesPage() {
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } = useExpense();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTx, setEditTx] = useState(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchFilter = filter === 'All' || tx.category === filter;
      const matchSearch = (tx.merchant || tx.category || '').toLowerCase().includes(search.toLowerCase()) || 
                          (tx.note || '').toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [transactions, filter, search]);

  const handleSave = async (data) => {
    let result;
    if (editTx) {
      result = await updateTransaction(editTx._id, data);
      if (result.success) toast.success('Transaction updated');
    } else {
      result = await addTransaction(data);
      if (result.success) toast.success('Transaction added');
    }
    
    if (result.success) {
      setShowAddModal(false);
      setEditTx(null);
    } else {
      toast.error(result.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      const result = await deleteTransaction(id);
      if (result.success) toast.success('Deleted');
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <h1 className="page-title">Expenses</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          + Add New
        </button>
      </div>

      <div className="page-content">
        {/* Search */}
        <div className="form-group" style={{ marginBottom: 16 }}>
          <div className="input-wrapper">
            <span className="input-icon">🔍</span>
            <input 
              className="form-input input-with-icon" 
              placeholder="Search transactions..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="chip-container" style={{ marginBottom: 20 }}>
          {FILTERS.map(f => (
            <button 
              key={f} 
              className={`chip ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'All' ? '📂 All' : `${getCategoryInfo(f).icon} ${f}`}
            </button>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="flex gap-md" style={{ marginBottom: 20 }}>
          <div className="card" style={{ flex: 1, padding: 12, borderLeft: '4px solid var(--red)' }}>
            <p className="text-muted text-xs">Total Spent</p>
            <p className="amount-display amount-expense" style={{ fontSize: '1.25rem' }}>
              {formatCurrency(filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))}
            </p>
          </div>
          <div className="card" style={{ flex: 1, padding: 12, borderLeft: '4px solid var(--green)' }}>
            <p className="text-muted text-xs">Total Income</p>
            <p className="amount-display amount-income" style={{ fontSize: '1.25rem' }}>
              {formatCurrency(filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))}
            </p>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p className="text-muted text-sm">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <p className="empty-title">No transactions found</p>
            <p className="empty-text">Try changing your filters or add a new transaction.</p>
          </div>
        ) : (
          <div className="stagger-children">
            {filteredTransactions.map((tx, idx) => {
              // Date group header
              const showDateHeader = idx === 0 || 
                new Date(tx.date).toLocaleDateString() !== new Date(filteredTransactions[idx-1].date).toLocaleDateString();
              
              return (
                <React.Fragment key={tx._id}>
                  {showDateHeader && (
                    <p className="text-muted text-xs font-semibold" style={{ margin: '16px 0 8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {formatDate(tx.date)}
                    </p>
                  )}
                  <TransactionCard 
                    transaction={tx} 
                    onClick={() => {
                      setEditTx(tx);
                      setShowAddModal(true);
                    }}
                    showDelete 
                    onDelete={() => handleDelete(tx._id)}
                  />
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddTransactionModal 
          editData={editTx}
          onClose={() => {
            setShowAddModal(false);
            setEditTx(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
