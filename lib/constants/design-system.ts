/**
 * Khedme Design System
 *
 * Modern, professional design system for the Middle East market.
 * Inspired by leading task management and collaboration platforms.
 *
 * Usage:
 * - Import design tokens from this file
 * - Use Tailwind classes for rapid development
 * - Reference colors, gradients, and spacing for consistency
 */

// ============================================
// COLOR PALETTE
// ============================================

export const colors = {
  // Primary Brand Colors (Lebanese Cedar Green)
  primary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#009639', // Main brand color
    600: '#00832D',
    700: '#00701F',
    800: '#005E14',
    900: '#004D12',
  },

  // Secondary Brand Colors (Lebanese Cedar Red)
  secondary: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#EE161F', // Main brand color
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },

  // Gradient Colors (Modern UI)
  gradients: {
    // Pink/Red gradient (for freelancer features)
    sunset: {
      from: '#FF6B9D',
      via: '#FF5E7E',
      to: '#FF4757',
    },
    // Purple/Blue gradient (for client features)
    ocean: {
      from: '#A78BFA',
      via: '#8B7CE8',
      to: '#7C3AED',
    },
    // Green gradient (for success/money)
    mint: {
      from: '#10B981',
      via: '#059669',
      to: '#047857',
    },
    // Orange gradient (for warnings/alerts)
    sunrise: {
      from: '#FBBF24',
      via: '#F59E0B',
      to: '#F97316',
    },
  },

  // Neutral Colors
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
}

// ============================================
// TYPOGRAPHY
// ============================================

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    display: ['Poppins', 'Inter', 'sans-serif'],
  },

  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
}

// ============================================
// SPACING & LAYOUT
// ============================================

export const spacing = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
}

export const borderRadius = {
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
}

// ============================================
// SHADOWS
// ============================================

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  card: '0 2px 8px rgba(0, 0, 0, 0.08)',
  hover: '0 8px 16px rgba(0, 0, 0, 0.12)',
}

// ============================================
// GRADIENTS (CSS Classes)
// ============================================

export const gradientClasses = {
  sunset: 'bg-gradient-to-br from-pink-400 via-rose-400 to-red-500',
  ocean: 'bg-gradient-to-br from-purple-400 via-indigo-400 to-purple-600',
  mint: 'bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600',
  sunrise: 'bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500',
  neutral: 'bg-gradient-to-br from-gray-50 to-gray-100',
}

// ============================================
// COMPONENT STYLES
// ============================================

export const components = {
  // Card styles
  card: {
    base: 'bg-white rounded-xl shadow-card border border-gray-100',
    hover: 'transition-all duration-200 hover:shadow-hover',
    gradient: 'text-white backdrop-blur-sm',
  },

  // Button styles
  button: {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg px-4 py-2 transition-colors',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg px-4 py-2 transition-colors',
    ghost: 'hover:bg-gray-100 text-gray-700 font-medium rounded-lg px-4 py-2 transition-colors',
  },

  // Input styles
  input: {
    base: 'w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    error: 'border-red-500 focus:ring-red-500',
  },

  // Avatar styles
  avatar: {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  },

  // Badge styles
  badge: {
    success: 'bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium',
    warning: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs font-medium',
    error: 'bg-red-100 text-red-800 px-2 py-1 rounded-md text-xs font-medium',
    info: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium',
    neutral: 'bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-medium',
  },
}

// ============================================
// ANIMATION
// ============================================

export const animations = {
  transition: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-200',
    slow: 'transition-all duration-300',
  },

  hover: {
    lift: 'hover:-translate-y-1',
    scale: 'hover:scale-105',
  },

  fadeIn: 'animate-fadeIn',
  slideIn: 'animate-slideIn',
}

// ============================================
// BREAKPOINTS (for reference)
// ============================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// ============================================
// Z-INDEX LAYERS
// ============================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
}

// ============================================
// USAGE EXAMPLES
// ============================================

/*
Example 1: Gradient Card

<div className={`${components.card.base} ${gradientClasses.sunset} p-6`}>
  <h3 className="text-white font-bold">R&D for New App</h3>
</div>

Example 2: Avatar Group

<div className="flex -space-x-2">
  <img className={`${components.avatar.sm} rounded-full border-2 border-white`} src="..." />
  <img className={`${components.avatar.sm} rounded-full border-2 border-white`} src="..." />
</div>

Example 3: Status Badge

<span className={components.badge.success}>In Progress</span>

Example 4: Professional Button

<button className={components.button.primary}>
  Create New
</button>
*/
