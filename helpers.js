// Category configuration
export const CATEGORIES = {
  Food: { icon: '🍕', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', class: 'cat-food' },
  Travel: { icon: '✈️', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', class: 'cat-travel' },
  Shopping: { icon: '🛍️', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', class: 'cat-shopping' },
  Entertainment: { icon: '🎬', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', class: 'cat-entertainment' },
  Health: { icon: '💊', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', class: 'cat-health' },
  Education: { icon: '📚', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', class: 'cat-education' },
  Bills: { icon: '⚡', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', class: 'cat-bills' },
  Salary: { icon: '💰', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', class: 'cat-salary' },
  Transfer: { icon: '🔄', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', class: 'cat-education' },
  Other: { icon: '📦', color: '#6060a0', bg: 'rgba(255, 255, 255, 0.08)', class: 'cat-other' },
};

export const GOAL_CATEGORIES = {
  Travel: { icon: '✈️', color: '#06b6d4' },
  Electronics: { icon: '💻', color: '#8b5cf6' },
  Education: { icon: '📚', color: '#a78bfa' },
  Emergency: { icon: '🏦', color: '#10b981' },
  Car: { icon: '🚗', color: '#f59e0b' },
  Home: { icon: '🏠', color: '#ec4899' },
  Other: { icon: '🎯', color: '#8b5cf6' },
};

export const BADGE_CONFIG = {
  'Saver': { icon: '💎', color: '#10b981', desc: 'Stayed under budget for a month' },
  'UPI Master': { icon: '⚡', color: '#8b5cf6', desc: 'Parsed 10+ UPI SMS messages' },
  'Budget Master': { icon: '🏆', color: '#f59e0b', desc: 'Tracked 10+ transactions' },
  'Streak King': { icon: '🔥', color: '#f97316', desc: 'Maintained a 7-day streak' },
  'Goal Achiever': { icon: '🎯', color: '#06b6d4', desc: 'Completed a savings goal' },
};

// Format currency in INR
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format compact currency
export const formatCompact = (amount) => {
  if (!amount) return '₹0';
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
};

// Format date
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Format relative date
export const formatRelativeDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return formatDate(d);
};

// Get category info
export const getCategoryInfo = (category) => {
  return CATEGORIES[category] || CATEGORIES.Other;
};

// Calculate percentage
export const calcPercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.min(Math.round((value / total) * 100), 100);
};

// Savings tips
export const SAVINGS_TIPS = [
  '💡 Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings',
  '🎯 Set a monthly savings goal and track progress weekly',
  '☕ Making coffee at home can save ₹3,000+ per month',
  '📱 Review and cancel unused subscriptions',
  '🛒 Plan your grocery list to avoid impulse purchases',
  '🚇 Use public transport to save on travel costs',
  '💳 Pay credit card bills in full to avoid interest',
  '🏦 Automate your savings on salary day',
];
