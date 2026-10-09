export type ThemeOption = 'light' | 'dark' | 'system';
export type DisplayDensity = 'comfortable' | 'compact';
export type DefaultLandingPage = 'hub' | 'last_workspace';

export interface UserPreferences {
  // Appearance
  theme: ThemeOption;
  displayDensity: DisplayDensity;
  reducedMotion: boolean;

  // Dashboard
  defaultLandingPage: DefaultLandingPage;
  showRecentActivity: boolean;
  showQuickActions: boolean;
  showWorkspaceMetadata: boolean;

  // Notifications
  inAppNotifications: boolean;
  soundAlerts: boolean;
  emailNotifications: boolean;
  actionRequiredAlerts: boolean;
  securityAlerts: boolean;

  // Accessibility & Interaction
  enhancedContrast: boolean;
  showKeyboardHints: boolean;
  language: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  displayDensity: 'comfortable',
  reducedMotion: false,

  defaultLandingPage: 'hub',
  showRecentActivity: true,
  showQuickActions: true,
  showWorkspaceMetadata: true,

  inAppNotifications: true,
  soundAlerts: false,
  emailNotifications: false,
  actionRequiredAlerts: true,
  securityAlerts: true,

  enhancedContrast: false,
  showKeyboardHints: true,
  language: 'en-US',
};

export const PREFERENCES_STORAGE_KEY = 'synaptix_user_preferences_v1';

export function loadUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch (e) {
    console.warn('Failed to parse user preferences from localStorage, using defaults.', e);
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: UserPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save user preferences to localStorage', e);
  }
}

export function applyThemeToDOM(theme: ThemeOption): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  let effectiveTheme = theme;
  if (theme === 'system') {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    effectiveTheme = systemDark ? 'dark' : 'light';
  }

  if (effectiveTheme === 'dark') {
    root.setAttribute('data-theme', 'dark');
    root.classList.add('theme-dark');
  } else {
    root.setAttribute('data-theme', 'light');
    root.classList.remove('theme-dark');
  }
}

export function applyDensityToDOM(density: DisplayDensity): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-density', density);
  if (density === 'compact') {
    root.classList.add('density-compact');
  } else {
    root.classList.remove('density-compact');
  }
}

export function applyReducedMotionToDOM(reduced: boolean): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (reduced) {
    root.setAttribute('data-reduced-motion', 'true');
    root.classList.add('reduced-motion-active');
  } else {
    root.removeAttribute('data-reduced-motion');
    root.classList.remove('reduced-motion-active');
  }
}
