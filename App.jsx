import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OTPPage from './pages/OTPPage';
import HomePage from './pages/HomePage';
import ExpensesPage from './pages/ExpensesPage';
import UPIParserPage from './pages/UPIParserPage';
import GoalsPage from './pages/GoalsPage';
import ProfilePage from './pages/ProfilePage';
import BudgetPage from './pages/BudgetPage';
import LeaderboardPage from './pages/LeaderboardPage';

// Components
import BottomNav from './components/BottomNav';

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg-primary)'
      }}>
        <div>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', margin: '0 auto 16px', animation: 'pulse 1.5s infinite'
          }}>💸</div>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// App Layout with Bottom Nav
const AppLayout = ({ children }) => (
  <div className="app-container">
    {children}
    <BottomNav />
  </div>
);

// Auth Layout (no bottom nav)
const AuthLayout = ({ children }) => (
  <div className="app-container">
    {children}
  </div>
);

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> :
          <AuthLayout><LoginPage /></AuthLayout>
      } />
      <Route path="/signup" element={
        isAuthenticated ? <Navigate to="/" replace /> :
          <AuthLayout><SignupPage /></AuthLayout>
      } />
      <Route path="/verify-otp" element={
        <AuthLayout><OTPPage /></AuthLayout>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <ExpenseProvider>
            <AppLayout><HomePage /></AppLayout>
          </ExpenseProvider>
        </ProtectedRoute>
      } />
      <Route path="/expenses" element={
        <ProtectedRoute>
          <ExpenseProvider>
            <AppLayout><ExpensesPage /></AppLayout>
          </ExpenseProvider>
        </ProtectedRoute>
      } />
      <Route path="/upi" element={
        <ProtectedRoute>
          <ExpenseProvider>
            <AppLayout><UPIParserPage /></AppLayout>
          </ExpenseProvider>
        </ProtectedRoute>
      } />
      <Route path="/goals" element={
        <ProtectedRoute>
          <ExpenseProvider>
            <AppLayout><GoalsPage /></AppLayout>
          </ExpenseProvider>
        </ProtectedRoute>
      } />
      <Route path="/budget" element={
        <ProtectedRoute>
          <ExpenseProvider>
            <AppLayout><BudgetPage /></AppLayout>
          </ExpenseProvider>
        </ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <ExpenseProvider>
            <AppLayout><LeaderboardPage /></AppLayout>
          </ExpenseProvider>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ExpenseProvider>
            <AppLayout><ProfilePage /></AppLayout>
          </ExpenseProvider>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-primary)',
              backdropFilter: 'blur(12px)',
              maxWidth: '380px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: 'var(--bg-card)' }
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: 'var(--bg-card)' }
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
