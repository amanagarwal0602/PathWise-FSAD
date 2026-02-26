import { createContext, useContext, useState, useEffect } from 'react';

const SiteSettingsContext = createContext();

// Default site settings
const defaultSettings = {
  // Branding
  siteName: 'PathWise',
  tagline: 'Career Guidance Platform',
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.ico',
  
  // Theme Colors
  theme: {
    primaryColor: '#4f46e5',
    secondaryColor: '#7c3aed',
    accentColor: '#06b6d4',
    successColor: '#10b981',
    warningColor: '#f59e0b',
    dangerColor: '#ef4444',
    backgroundColor: '#f8fafc',
    sidebarColor: '#1f2937',
    cardBackground: '#ffffff',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    borderColor: '#e5e7eb'
  },
  
  // Maintenance Mode
  maintenanceMode: {
    enabled: false,
    message: 'We are currently performing scheduled maintenance. Please check back soon.',
    allowedRoles: ['admin'], // Roles that can still access during maintenance
    estimatedTime: '',
    showCountdown: false
  },
  
  // Features Toggle
  features: {
    registrationEnabled: true,
    studentRegistration: true,
    mentorRegistration: true,
    chatEnabled: true,
    meetingsEnabled: true,
    assessmentEnabled: true,
    groupsEnabled: true,
    notificationsEnabled: true,
    helpCenterEnabled: true
  },
  
  // Email & Notifications Settings
  notifications: {
    welcomeEmailEnabled: true,
    verificationEmailEnabled: true,
    meetingRemindersEnabled: true,
    chatNotificationsEnabled: true
  },
  
  // Security Settings
  security: {
    sessionTimeout: 24, // hours
    maxLoginAttempts: 5,
    lockoutDuration: 5, // minutes
    requireStrongPassword: true,
    require2FA: false
  },
  
  // Assessment Settings
  assessment: {
    totalQuestions: 15,
    passingScore: 60,
    allowRetake: true,
    retakeDelay: 24 // hours
  },
  
  // Contact Information
  contact: {
    email: 'support@pathwise.com',
    phone: '+1 (555) 123-4567',
    address: '123 Career Street, Education City, EC 12345',
    socialLinks: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: ''
    }
  },
  
  // Footer Settings
  footer: {
    copyrightText: '© 2024 PathWise. All rights reserved.',
    showSocialLinks: true,
    customLinks: []
  },
  
  // Homepage Settings
  homepage: {
    heroTitle: 'Find Your Perfect Career Path',
    heroSubtitle: 'Get personalized career guidance from expert mentors',
    showStats: true,
    showTestimonials: true,
    showFeatures: true,
    ctaButtonText: 'Get Started',
    ctaButtonLink: '/register'
  },
  
  // Dashboard Settings
  dashboard: {
    showWelcomeMessage: true,
    welcomeMessage: 'Welcome back! Here\'s your dashboard overview.',
    itemsPerPage: 10,
    showQuickActions: true,
    enableDarkMode: false
  },
  
  // Announcement Banner
  announcement: {
    enabled: false,
    message: '',
    type: 'info', // info, warning, success, error
    dismissible: true,
    expiresAt: null
  },
  
  // Custom CSS
  customCSS: '',
  
  // API & Integration Settings
  integrations: {
    googleAnalyticsId: '',
    googleMeetEnabled: false,
    zoomEnabled: false
  },
  
  // Last Updated
  lastUpdated: new Date().toISOString(),
  updatedBy: 'admin'
};

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('pathwiseSiteSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure new settings are included
        return { ...defaultSettings, ...parsed, theme: { ...defaultSettings.theme, ...parsed.theme } };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pathwiseSiteSettings', JSON.stringify(settings));
    
    // Apply theme colors to CSS variables
    applyTheme(settings.theme);
    
    // Apply custom CSS
    applyCustomCSS(settings.customCSS);
    
    // Update document title
    document.title = settings.siteName;
  }, [settings]);

  // Apply theme colors to CSS custom properties
  const applyTheme = (theme) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primaryColor);
    root.style.setProperty('--primary-dark', adjustColor(theme.primaryColor, -20));
    root.style.setProperty('--secondary', theme.secondaryColor);
    root.style.setProperty('--accent', theme.accentColor);
    root.style.setProperty('--success', theme.successColor);
    root.style.setProperty('--warning', theme.warningColor);
    root.style.setProperty('--danger', theme.dangerColor);
    root.style.setProperty('--bg-color', theme.backgroundColor);
    root.style.setProperty('--sidebar-bg', theme.sidebarColor);
    root.style.setProperty('--card-bg', theme.cardBackground);
    root.style.setProperty('--text-primary', theme.textPrimary);
    root.style.setProperty('--text-secondary', theme.textSecondary);
    root.style.setProperty('--border-color', theme.borderColor);
  };

  // Adjust color brightness
  const adjustColor = (color, amount) => {
    const clamp = (num) => Math.min(255, Math.max(0, num));
    const hex = color.replace('#', '');
    const r = clamp(parseInt(hex.substr(0, 2), 16) + amount);
    const g = clamp(parseInt(hex.substr(2, 2), 16) + amount);
    const b = clamp(parseInt(hex.substr(4, 2), 16) + amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Apply custom CSS
  const applyCustomCSS = (css) => {
    let styleElement = document.getElementById('pathwise-custom-css');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'pathwise-custom-css';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = css;
  };

  // Update settings
  const updateSettings = (newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
      lastUpdated: new Date().toISOString()
    }));
  };

  // Update specific setting category
  const updateCategory = (category, values) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], ...values },
      lastUpdated: new Date().toISOString()
    }));
  };

  // Update theme
  const updateTheme = (themeUpdates) => {
    setSettings(prev => ({
      ...prev,
      theme: { ...prev.theme, ...themeUpdates },
      lastUpdated: new Date().toISOString()
    }));
  };

  // Toggle maintenance mode
  const toggleMaintenanceMode = (enabled, options = {}) => {
    setSettings(prev => ({
      ...prev,
      maintenanceMode: {
        ...prev.maintenanceMode,
        enabled,
        ...options
      },
      lastUpdated: new Date().toISOString()
    }));
  };

  // Toggle feature
  const toggleFeature = (feature, enabled) => {
    setSettings(prev => ({
      ...prev,
      features: { ...prev.features, [feature]: enabled },
      lastUpdated: new Date().toISOString()
    }));
  };

  // Reset to defaults
  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      setSettings(defaultSettings);
    }
  };

  // Export settings
  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pathwise-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import settings
  const importSettings = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setSettings({ ...defaultSettings, ...imported });
          resolve(true);
        } catch (err) {
          reject('Invalid settings file');
        }
      };
      reader.onerror = () => reject('Error reading file');
      reader.readAsText(file);
    });
  };

  // Check if in maintenance mode
  const isInMaintenanceMode = (userRole) => {
    if (!settings.maintenanceMode.enabled) return false;
    if (settings.maintenanceMode.allowedRoles.includes(userRole)) return false;
    return true;
  };

  // Check if feature is enabled
  const isFeatureEnabled = (feature) => {
    return settings.features[feature] ?? true;
  };

  const value = {
    settings,
    updateSettings,
    updateCategory,
    updateTheme,
    toggleMaintenanceMode,
    toggleFeature,
    resetToDefaults,
    exportSettings,
    importSettings,
    isInMaintenanceMode,
    isFeatureEnabled,
    defaultSettings
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}

export default SiteSettingsContext;
