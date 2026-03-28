import React, { useState, useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, getCategoryInfo } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function UPIParserPage() {
  const [mode, setMode] = useState('single');
  const [smsText, setSmsText] = useState('');
  const [bulkSms, setBulkSms] = useState('');
  const [parsed, setParsed] = useState(null);
  const [bulkResults, setBulkResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [samples, setSamples] = useState([]);
  const { addTransaction, fetchAll } = useExpense();

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      const res = await api.get('/upi/samples');
      setSamples(res.data.samples || []);
    } catch (err) {
      console.error('Error fetching samples:', err);
    }
  };

  const handleParse = async () => {
    if (mode === 'single') {
      if (!smsText.trim()) return;
      setLoading(true);
      try {
        const res = await api.post('/upi/parse', { sms: smsText });
        setParsed(res.data.parsed);
        toast.success('SMS Parsed!');
      } catch (err) {
        toast.error('Failed to parse SMS');
      }
      setLoading(false);
    } else {
      if (!bulkSms.trim()) return;
      const messages = bulkSms.split(/\n\n+|(?=\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})|(?=Dear SBI Account holder)/i)
        .map(m => m.trim())
        .filter(m => m.length > 20);
      
      setLoading(true);
      try {
        const res = await api.post('/upi/parse', { messages });
        setBulkResults(res.data.results || []);
        toast.success(`Parsed ${res.data.valid} valid transactions!`);
      } catch (err) {
        toast.error('Failed to parse bulk SMS');
      }
      setLoading(false);
    }
  };

  const handleSaveSingle = async () => {
    if (!parsed?.amount) return;
    setLoading(true);
    const result = await addTransaction({
      amount: parsed.amount,
      type: parsed.type,
      category: parsed.category,
      merchant: parsed.merchant || 'Unknown',
      note: 'Parsed from UPI SMS',
      date: parsed.date ? new Date(parsed.date) : new Date(),
      upiTransactionId: parsed.transactionId,
      parsedFromSMS: true
    });
    setLoading(false);
    if (result.success) {
      toast.success('Transaction saved!');
      setParsed(null);
      setSmsText('');
      fetchAll();
    }
  };

  const handleSaveBulk = async () => {
    const valid = bulkResults.filter(r => r.amount);
    if (valid.length === 0) return;
    
    setLoading(true);
    try {
      await api.post('/upi/parse', { messages: valid.map(r => r.rawSMS), autoSave: true });
      toast.success(`Saved ${valid.length} transactions!`);
      setBulkResults([]);
      setBulkSms('');
      fetchAll();
    } catch (err) {
      toast.error('Failed to save bulk data');
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <h1 className="page-title">UPI SMS Parser</h1>
        <div style={{
          width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--purple-500)', color: 'white', fontSize: '1.25rem'
        }}>⚡</div>
      </div>

      <div className="page-content">
        <p className="text-muted text-sm mb-lg" style={{ lineHeight: 1.5 }}>
          Paste your UPI transaction SMS alert to automatically extract details and categorize the expense.
        </p>

        {/* Mode Toggle */}
        <div className="tab-switcher" style={{ marginBottom: 24 }}>
          <button 
            className={`tab-btn ${mode === 'single' ? 'active' : ''}`}
            onClick={() => { setMode('single'); setParsed(null); setBulkResults([]); }}
          >
            📱 Single
          </button>
          <button 
            className={`tab-btn ${mode === 'bulk' ? 'active' : ''}`}
            onClick={() => { setMode('bulk'); setParsed(null); setBulkResults([]); }}
          >
            📦 Bulk
          </button>
        </div>

        {/* Input Area */}
        <div className="card" style={{ padding: 16 }}>
          <div className="flex justify-between items-center mb-sm">
            <span className="text-xs font-semibold text-muted">UPI BANK SMS</span>
            <button className="section-link text-xs" onClick={() => {
              const s = samples[Math.floor(Math.random() * samples.length)];
              if (mode === 'single') setSmsText(s);
              else setBulkSms(prev => prev ? prev + '\n\n' + s : s);
            }}>Load Sample 💡</button>
          </div>

          <textarea 
            className="form-input" 
            placeholder={mode === 'single' ? "Paste single UPI SMS here..." : "Paste multiple SMS messages, separated by newline..."}
            rows={mode === 'single' ? 4 : 8}
            value={mode === 'single' ? smsText : bulkSms}
            onChange={e => mode === 'single' ? setSmsText(e.target.value) : setBulkSms(e.target.value)}
            style={{ fontSize: '0.8125rem', fontFamily: 'monospace' }}
          />

          <button 
            className="btn btn-primary btn-full mt-md" 
            onClick={handleParse}
            disabled={loading || (mode === 'single' ? !smsText.trim() : !bulkSms.trim())}
          >
            {loading ? '⏳ Parsing...' : '✨ Parse Message →'}
          </button>
        </div>

        {/* Results Single */}
        {mode === 'single' && parsed && (
          <div className="animate-slideUp mt-lg">
            <div className="section-header">
              <span className="section-title">Parsed Result</span>
            </div>
            <div className="card" style={{ padding: 20, borderTop: '4px solid var(--purple-500)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  <p className="text-muted text-xs">AMOUNT</p>
                  <p className="amount-display amount-lg" style={{ color: parsed.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                    {parsed.type === 'income' ? '+' : '-'}{formatCurrency(parsed.amount)}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="flex justify-between items-center">
                  <span className="text-muted text-sm">Merchant</span>
                  <span className="font-semibold text-sm">{parsed.merchant || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted text-sm">Category</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '1rem' }}>{getCategoryInfo(parsed.category).icon}</span>
                    <span className="font-semibold text-sm">{parsed.category}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted text-sm">Date</span>
                  <span className="font-semibold text-sm">{parsed.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted text-sm">TXN ID</span>
                  <span className="text-xs truncate" style={{ maxWidth: 120 }}>{parsed.transactionId || 'N/A'}</span>
                </div>
              </div>

              <div className="divider" style={{ margin: '16px 0' }} />
              <button 
                className="btn btn-primary btn-full" 
                onClick={handleSaveSingle}
                disabled={loading}
              >
                {loading ? '⏳ Saving...' : '✅ Save to Expenses'}
              </button>
            </div>
          </div>
        )}

        {/* Results Bulk */}
        {mode === 'bulk' && bulkResults.length > 0 && (
          <div className="animate-slideUp mt-lg">
            <div className="section-header">
              <span className="section-title">Parsed {bulkResults.filter(r => r.amount).length} Transactions</span>
              <button className="section-link" onClick={handleSaveBulk}>Save All</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {bulkResults.map((r, i) => r.amount ? (
                <div key={i} className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar avatar-sm" style={{ background: getCategoryInfo(r.category).bg }}>
                    {getCategoryInfo(r.category).icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="text-sm font-semibold truncate">{r.merchant || 'Unknown'}</p>
                    <p className="text-xs text-muted">{r.category}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: r.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                      ₹{r.amount}
                    </p>
                    <p className="text-xs text-muted">{r.date || 'Today'}</p>
                  </div>
                </div>
              ) : null)}
            </div>
            
            <button 
              className="btn btn-primary btn-full mt-lg" 
              onClick={handleSaveBulk}
              disabled={loading}
            >
              🚀 Save All to Dashboard
            </button>
          </div>
        )}

        {/* Info */}
        {!parsed && bulkResults.length === 0 && (
          <div className="mt-xl animate-fadeIn">
            <h4 style={{ marginBottom: 12, fontSize: '0.875rem' }}>Supported Platforms</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {['GPay', 'PhonePe', 'Paytm', 'Amazon', 'SBI', 'HDFC', 'ICICI', 'Other'].map(p => (
                <div key={p} style={{ 
                  background: 'var(--bg-secondary)', padding: '10px 4px', borderRadius: 8,
                  textAlign: 'center', fontSize: '0.6875rem', color: 'var(--text-secondary)'
                }}>
                  {p}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
