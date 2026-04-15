// Bespoke Metal Prints - Design Constants
// Centralized constants for consistency across the entire website

export const BRAND_COLORS = {
  primary: '#ff6b35',
  primaryHover: '#ff8c42',
  primaryLight: '#ff8c5e',
  
  // Dark Mode
  bgDark: '#0a0a0a',
  cardDark: '#1a1a1a',
  borderDark: '#2a2a2a',
  textDark: '#ffffff',
  textMutedDark: '#999999',
  
  // Light Mode
  bgLight: '#ffffff',
  cardLight: '#f5f5f5',
  borderLight: '#e5e5e5',
  textLight: '#0a0a0a',
  textMutedLight: '#666666',
  
  // Status
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
} as const;

export const BORDER_RADIUS = {
  sm: '0.5rem',    // 8px - rounded-lg in Tailwind
  md: '0.75rem',   // 12px - rounded-xl in Tailwind
  lg: '1rem',      // 16px - rounded-2xl in Tailwind
  full: '9999px',  // rounded-full
} as const;

export const SPACING = {
  xs: '0.5rem',    // 8px - 2
  sm: '1rem',      // 16px - 4
  md: '1.5rem',    // 24px - 6
  lg: '2rem',      // 32px - 8
  xl: '3rem',      // 48px - 12
  '2xl': '4rem',   // 64px - 16
} as const;

export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  primary: '0 10px 15px -3px rgb(255 107 53 / 0.3)',
} as const;

export const TRANSITIONS = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// CSS Class Names for Consistency
export const BUTTON_CLASSES = {
  primary: 'px-8 py-4 bg-[#ff6b35] text-white rounded-full hover:bg-[#ff8c42] transition-all shadow-lg shadow-[#ff6b35]/30 hover:scale-105 active:scale-95 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 [data-theme="light"]_&:text-black',
  
  secondary: 'px-8 py-4 bg-white text-[#ff6b35] border-2 border-[#ff6b35] rounded-full hover:bg-[#ff6b35] hover:text-white transition-all hover:scale-105 active:scale-95 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
  
  primarySm: 'px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8c42] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed [data-theme="light"]_&:text-black',
  
  secondarySm: 'px-4 py-2 bg-[#0a0a0a] text-white border border-[#2a2a2a] rounded-lg hover:bg-[#ff6b35] hover:text-black hover:border-[#ff6b35] transition-all disabled:opacity-50 disabled:cursor-not-allowed [data-theme="light"]_&:bg-white [data-theme="light"]_&:text-gray-900 [data-theme="light"]_&:border-gray-200',
  
  ghost: 'px-4 py-2 bg-transparent text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed [data-theme="light"]_&:text-gray-600 [data-theme="light"]_&:hover:text-gray-900 [data-theme="light"]_&:hover:bg-gray-50',
  
  danger: 'px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
  
  success: 'px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
} as const;

export const INPUT_CLASSES = {
  base: 'w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed [data-theme="light"]_&:bg-white [data-theme="light"]_&:border-gray-200 [data-theme="light"]_&:text-gray-900',
  
  textarea: 'w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed [data-theme="light"]_&:bg-white [data-theme="light"]_&:border-gray-200 [data-theme="light"]_&:text-gray-900',
  
  select: 'w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed [data-theme="light"]_&:bg-white [data-theme="light"]_&:border-gray-200 [data-theme="light"]_&:text-gray-900',
} as const;

export const CARD_CLASSES = {
  base: 'bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 [data-theme="light"]_&:bg-white [data-theme="light"]_&:border-gray-200',
  
  hover: 'bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 transition-all hover:border-[#ff6b35] hover:shadow-lg hover:shadow-[#ff6b35]/10 [data-theme="light"]_&:bg-white [data-theme="light"]_&:border-gray-200',
  
  feature: 'bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 [data-theme="light"]_&:bg-white [data-theme="light"]_&:border-gray-200',
} as const;

export const BADGE_CLASSES = {
  primary: 'px-3 py-1 bg-[#ff6b35]/10 text-[#ff6b35] rounded-full text-sm font-medium',
  success: 'px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium',
  warning: 'px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-sm font-medium',
  danger: 'px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-sm font-medium',
  info: 'px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm font-medium',
} as const;

export const ALERT_CLASSES = {
  info: 'p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg',
  success: 'p-4 bg-green-500/10 border border-green-500/20 rounded-lg',
  warning: 'p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg',
  error: 'p-4 bg-red-500/10 border border-red-500/20 rounded-lg',
  primary: 'p-4 bg-[#ff6b35]/10 border border-[#ff6b35]/20 rounded-lg',
} as const;
