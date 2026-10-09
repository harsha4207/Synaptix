// SYNAPTIX COMMAND — Enterprise Design System Tokens
// 8px Spacing System • Unified Color Palette • Precise Typography Scale

export const TOKENS = {
  colors: {
    // Primary Brand & Background Tokens
    primaryNavy: '#0B1F3A',
    primaryNavyHover: '#142F54',
    bgLight: '#F7F9FC',
    bgDark: '#070D18',
    
    // Surface Tokens
    surfaceWhite: '#FFFFFF',
    surfaceElevatedLight: '#FFFFFF',
    surfaceElevatedDark: '#0F172A',
    surfaceSecondaryLight: '#F1F5F9',
    surfaceSecondaryDark: '#1E293B',
    
    // Borders
    borderLight: '#E2E8F0',
    borderHoverLight: '#CBD5E1',
    borderDark: '#1E293B',
    borderHoverDark: '#334155',
    
    // Brand Accent Blue (from Login page)
    accentBlue: '#1769E0',
    accentBlueHover: '#1254B7',
    accentBlueLight: '#2496FF',
    accentBlueBg: 'rgba(23, 105, 224, 0.08)',
    accentBlueRing: 'rgba(23, 105, 224, 0.14)',
    
    // Text Hierarchy
    textPrimaryLight: '#0F172A',
    textSecondaryLight: '#64748B',
    textMutedLight: '#94A3B8',
    textPrimaryDark: '#F8FAFC',
    textSecondaryDark: '#94A3B8',
    textMutedDark: '#64748B',
    
    // Status & Governance Indicators
    success: '#10B981',
    successBg: '#ECFDF5',
    warning: '#F59E0B',
    warningBg: '#FEF3C7',
    error: '#EF4444',
    errorBg: '#FEF2F2',
    info: '#3B82F6',
    infoBg: '#EFF6FF',
    
    // Domain Accents
    domainFinance: '#1769E0',
    domainResearch: '#2496FF',
    domainHealthcare: '#0D9488',
    domainEducation: '#8B5CF6',
    domainBusiness: '#F59E0B',
    domainCustom: '#6366F1'
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
    gridUnit: 8
  },
  
  typography: {
    fontHeading: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontBody: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontMono: "'JetBrains Mono', 'Fira Code', monospace",
    
    sizes: {
      display: '2.5rem',      // 40px
      pageTitle: '1.75rem',    // 28px
      sectionTitle: '1.25rem', // 20px
      cardTitle: '1.05rem',    // 17px
      body: '0.92rem',        // 14.7px
      metadata: '0.82rem',    // 13px
      caption: '0.75rem'      // 12px
    }
  },
  
  radii: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px'
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(11, 31, 58, 0.05)',
    card: '0 16px 36px -12px rgba(11, 31, 58, 0.08), 0 0 1px rgba(11, 31, 58, 0.12)',
    cardHover: '0 20px 40px -12px rgba(11, 31, 58, 0.12), 0 0 1px rgba(11, 31, 58, 0.16)',
    dropdown: '0 20px 40px -15px rgba(11, 31, 58, 0.18)',
    focusRing: '0 0 0 4px rgba(23, 105, 224, 0.14)'
  },
  
  transitions: {
    fast: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
    normal: '250ms cubic-bezier(0.16, 1, 0.3, 1)',
    slow: '350ms cubic-bezier(0.16, 1, 0.3, 1)'
  }
};
