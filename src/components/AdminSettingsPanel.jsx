import { useState } from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

function AdminSettingsPanel({ onClose }) {
  const { 
    settings, 
    updateSettings, 
    updateCategory, 
    updateTheme, 
    toggleMaintenanceMode, 
    toggleFeature,
    resetToDefaults,
    exportSettings,
    importSettings,
    defaultSettings
  } = useSiteSettings();
  
  const { data, deleteUser } = useData();
  const { showToast } = useToast();
  
  const [activeSection, setActiveSection] = useState('branding');
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [importError, setImportError] = useState('');

  const sections = [
    { id: 'branding', label: 'Branding', icon: '🎨' },
    { id: 'theme', label: 'Theme Colors', icon: '🌈' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { id: 'features', label: 'Features', icon: '⚡' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'homepage', label: 'Homepage', icon: '🏠' },
    { id: 'announcement', label: 'Announcement', icon: '📢' },
    { id: 'contact', label: 'Contact Info', icon: '📞' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'customcss', label: 'Custom CSS', icon: '💻' },
    { id: 'datamanage', label: 'Data Management', icon: '🗄️' },
    { id: 'backup', label: 'Backup', icon: '💾' }
  ];

  const handleChange = (category, field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: typeof prev[category] === 'object' 
        ? { ...prev[category], [field]: value }
        : value
    }));
    setHasChanges(true);
  };

  const handleDirectChange = (field, value) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleThemeChange = (field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      theme: { ...prev.theme, [field]: value }
    }));
    setHasChanges(true);
  };

  const saveChanges = () => {
    updateSettings(localSettings);
    setHasChanges(false);
    showToast('Settings saved successfully!', 'success');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await importSettings(file);
        setLocalSettings(settings);
        setImportError('');
        showToast('Settings imported successfully!', 'success');
      } catch (err) {
        setImportError(err);
      }
    }
  };

  const presetThemes = [
    { name: 'Default Purple', primary: '#4f46e5', secondary: '#7c3aed', accent: '#06b6d4' },
    { name: 'Ocean Blue', primary: '#0ea5e9', secondary: '#0284c7', accent: '#14b8a6' },
    { name: 'Forest Green', primary: '#059669', secondary: '#047857', accent: '#22c55e' },
    { name: 'Sunset Orange', primary: '#ea580c', secondary: '#dc2626', accent: '#fbbf24' },
    { name: 'Rose Pink', primary: '#e11d48', secondary: '#be185d', accent: '#f472b6' },
    { name: 'Slate Gray', primary: '#475569', secondary: '#334155', accent: '#64748b' },
    { name: 'Dark Mode', primary: '#6366f1', secondary: '#8b5cf6', accent: '#22d3ee', bg: '#0f172a', sidebar: '#1e293b', card: '#1e293b', text: '#f1f5f9' }
  ];

  const applyPresetTheme = (preset) => {
    const newTheme = {
      ...localSettings.theme,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent
    };
    if (preset.bg) newTheme.backgroundColor = preset.bg;
    if (preset.sidebar) newTheme.sidebarColor = preset.sidebar;
    if (preset.card) newTheme.cardBackground = preset.card;
    if (preset.text) newTheme.textPrimary = preset.text;
    
    setLocalSettings(prev => ({ ...prev, theme: newTheme }));
    setHasChanges(true);
  };

  return (
    <div className="admin-settings-overlay">
      <div className="admin-settings-panel">
        {/* Header */}
        <div className="settings-header">
          <div className="settings-header-left">
            <h2>⚙️ Site Settings</h2>
            <p>Complete control over your platform</p>
          </div>
          <div className="settings-header-right">
            {hasChanges && (
              <span className="unsaved-badge">Unsaved Changes</span>
            )}
            <button className="btn-save" onClick={saveChanges} disabled={!hasChanges}>
              💾 Save All
            </button>
            <button className="btn-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="settings-body">
          {/* Sidebar Navigation */}
          <div className="settings-nav">
            {sections.map(section => (
              <button
                key={section.id}
                className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="nav-icon">{section.icon}</span>
                <span className="nav-label">{section.label}</span>
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="settings-content">
            
            {/* Branding Section */}
            {activeSection === 'branding' && (
              <div className="settings-section">
                <h3>🎨 Branding Settings</h3>
                <p className="section-desc">Customize your platform's identity</p>
                
                <div className="settings-group">
                  <label>Site Name</label>
                  <input
                    type="text"
                    value={localSettings.siteName}
                    onChange={(e) => handleDirectChange('siteName', e.target.value)}
                    placeholder="Your Site Name"
                  />
                  <small>Displayed in browser tab and navigation</small>
                </div>
                
                <div className="settings-group">
                  <label>Tagline</label>
                  <input
                    type="text"
                    value={localSettings.tagline}
                    onChange={(e) => handleDirectChange('tagline', e.target.value)}
                    placeholder="Your tagline"
                  />
                  <small>Short description of your platform</small>
                </div>
                
                <div className="settings-group">
                  <label>Logo URL</label>
                  <input
                    type="text"
                    value={localSettings.logoUrl}
                    onChange={(e) => handleDirectChange('logoUrl', e.target.value)}
                    placeholder="/logo.png"
                  />
                  <small>Path to your logo image</small>
                  <div className="logo-preview">
                    <img src={localSettings.logoUrl} alt="Logo Preview" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                </div>
              </div>
            )}

            {/* Theme Section */}
            {activeSection === 'theme' && (
              <div className="settings-section">
                <h3>🌈 Theme Colors</h3>
                <p className="section-desc">Customize the look and feel</p>
                
                {/* Preset Themes */}
                <div className="preset-themes">
                  <label>Quick Presets</label>
                  <div className="theme-presets-grid">
                    {presetThemes.map((preset, idx) => (
                      <button
                        key={idx}
                        className="theme-preset-btn"
                        style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }}
                        onClick={() => applyPresetTheme(preset)}
                        title={preset.name}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="color-grid">
                  <div className="color-picker-group">
                    <label>Primary Color</label>
                    <div className="color-input-row">
                      <input
                        type="color"
                        value={localSettings.theme.primaryColor}
                        onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={localSettings.theme.primaryColor}
                        onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="color-picker-group">
                    <label>Secondary Color</label>
                    <div className="color-input-row">
                      <input
                        type="color"
                        value={localSettings.theme.secondaryColor}
                        onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={localSettings.theme.secondaryColor}
                        onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="color-picker-group">
                    <label>Accent Color</label>
                    <div className="color-input-row">
                      <input
                        type="color"
                        value={localSettings.theme.accentColor}
                        onChange={(e) => handleThemeChange('accentColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={localSettings.theme.accentColor}
                        onChange={(e) => handleThemeChange('accentColor', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="color-picker-group">
                    <label>Success Color</label>
                    <div className="color-input-row">
                      <input
                        type="color"
                        value={localSettings.theme.successColor}
                        onChange={(e) => handleThemeChange('successColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={localSettings.theme.successColor}
                        onChange={(e) => handleThemeChange('successColor', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="color-picker-group">
                    <label>Warning Color</label>
                    <div className="color-input-row">
                      <input
                        type="color"
                        value={localSettings.theme.warningColor}
                        onChange={(e) => handleThemeChange('warningColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={localSettings.theme.warningColor}
                        onChange={(e) => handleThemeChange('warningColor', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="color-picker-group">
                    <label>Danger Color</label>
                    <div className="color-input-row">
                      <input
                        type="color"
                        value={localSettings.theme.dangerColor}
                        onChange={(e) => handleThemeChange('dangerColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={localSettings.theme.dangerColor}
                        onChange={(e) => handleThemeChange('dangerColor', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="color-picker-group">
                    <label>Background Color</label>
                    <div className="color-input-row">
                      <input
                        type="color"
                        value={localSettings.theme.backgroundColor}
                        onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={localSettings.theme.backgroundColor}
                        onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="color-picker-group">
                    <label>Sidebar Color</label>
                    <div className="color-input-row">
                      <input
                        type="color"
                        value={localSettings.theme.sidebarColor}
                        onChange={(e) => handleThemeChange('sidebarColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={localSettings.theme.sidebarColor}
                        onChange={(e) => handleThemeChange('sidebarColor', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Theme Preview */}
                <div className="theme-preview">
                  <h4>Preview</h4>
                  <div className="preview-container" style={{ background: localSettings.theme.backgroundColor }}>
                    <div className="preview-sidebar" style={{ background: localSettings.theme.sidebarColor }}>
                      <div className="preview-menu-item" style={{ background: localSettings.theme.primaryColor }}>Active</div>
                      <div className="preview-menu-item">Item</div>
                    </div>
                    <div className="preview-content">
                      <button style={{ background: localSettings.theme.primaryColor, color: '#fff' }}>Primary</button>
                      <button style={{ background: localSettings.theme.secondaryColor, color: '#fff' }}>Secondary</button>
                      <button style={{ background: localSettings.theme.successColor, color: '#fff' }}>Success</button>
                      <button style={{ background: localSettings.theme.dangerColor, color: '#fff' }}>Danger</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Maintenance Section */}
            {activeSection === 'maintenance' && (
              <div className="settings-section">
                <h3>🔧 Maintenance Mode</h3>
                <p className="section-desc">Take your site offline for maintenance</p>
                
                <div className="settings-group toggle-group">
                  <label className="toggle-label">
                    <span>Enable Maintenance Mode</span>
                    <div className={`toggle-switch ${localSettings.maintenanceMode.enabled ? 'active' : ''}`}
                         onClick={() => handleChange('maintenanceMode', 'enabled', !localSettings.maintenanceMode.enabled)}>
                      <div className="toggle-slider"></div>
                    </div>
                  </label>
                  {localSettings.maintenanceMode.enabled && (
                    <div className="maintenance-warning">
                      ⚠️ Site is currently in maintenance mode. Only admins can access.
                    </div>
                  )}
                </div>
                
                <div className="settings-group">
                  <label>Maintenance Message</label>
                  <textarea
                    value={localSettings.maintenanceMode.message}
                    onChange={(e) => handleChange('maintenanceMode', 'message', e.target.value)}
                    rows={3}
                    placeholder="Message to show visitors during maintenance..."
                  />
                </div>
                
                <div className="settings-group">
                  <label>Estimated Completion Time</label>
                  <input
                    type="text"
                    value={localSettings.maintenanceMode.estimatedTime}
                    onChange={(e) => handleChange('maintenanceMode', 'estimatedTime', e.target.value)}
                    placeholder="e.g., 2 hours, Tomorrow 9 AM"
                  />
                </div>
              </div>
            )}

            {/* Features Section */}
            {activeSection === 'features' && (
              <div className="settings-section">
                <h3>⚡ Feature Toggles</h3>
                <p className="section-desc">Enable or disable platform features</p>
                
                <div className="feature-toggles">
                  {Object.entries(localSettings.features).map(([feature, enabled]) => (
                    <div key={feature} className="settings-group toggle-group">
                      <label className="toggle-label">
                        <span>{feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                        <div className={`toggle-switch ${enabled ? 'active' : ''}`}
                             onClick={() => handleChange('features', feature, !enabled)}>
                          <div className="toggle-slider"></div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="settings-section">
                <h3>🔒 Security Settings</h3>
                <p className="section-desc">Configure platform security</p>
                
                <div className="settings-group">
                  <label>Session Timeout (hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={localSettings.security.sessionTimeout}
                    onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="settings-group">
                  <label>Max Login Attempts</label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={localSettings.security.maxLoginAttempts}
                    onChange={(e) => handleChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="settings-group">
                  <label>Lockout Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={localSettings.security.lockoutDuration}
                    onChange={(e) => handleChange('security', 'lockoutDuration', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="settings-group toggle-group">
                  <label className="toggle-label">
                    <span>Require Strong Password</span>
                    <div className={`toggle-switch ${localSettings.security.requireStrongPassword ? 'active' : ''}`}
                         onClick={() => handleChange('security', 'requireStrongPassword', !localSettings.security.requireStrongPassword)}>
                      <div className="toggle-slider"></div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Homepage Section */}
            {activeSection === 'homepage' && (
              <div className="settings-section">
                <h3>🏠 Homepage Settings</h3>
                <p className="section-desc">Customize your landing page</p>
                
                <div className="settings-group">
                  <label>Hero Title</label>
                  <input
                    type="text"
                    value={localSettings.homepage.heroTitle}
                    onChange={(e) => handleChange('homepage', 'heroTitle', e.target.value)}
                  />
                </div>
                
                <div className="settings-group">
                  <label>Hero Subtitle</label>
                  <input
                    type="text"
                    value={localSettings.homepage.heroSubtitle}
                    onChange={(e) => handleChange('homepage', 'heroSubtitle', e.target.value)}
                  />
                </div>
                
                <div className="settings-group">
                  <label>CTA Button Text</label>
                  <input
                    type="text"
                    value={localSettings.homepage.ctaButtonText}
                    onChange={(e) => handleChange('homepage', 'ctaButtonText', e.target.value)}
                  />
                </div>
                
                <div className="feature-toggles">
                  <div className="settings-group toggle-group">
                    <label className="toggle-label">
                      <span>Show Stats Section</span>
                      <div className={`toggle-switch ${localSettings.homepage.showStats ? 'active' : ''}`}
                           onClick={() => handleChange('homepage', 'showStats', !localSettings.homepage.showStats)}>
                        <div className="toggle-slider"></div>
                      </div>
                    </label>
                  </div>
                  <div className="settings-group toggle-group">
                    <label className="toggle-label">
                      <span>Show Testimonials</span>
                      <div className={`toggle-switch ${localSettings.homepage.showTestimonials ? 'active' : ''}`}
                           onClick={() => handleChange('homepage', 'showTestimonials', !localSettings.homepage.showTestimonials)}>
                        <div className="toggle-slider"></div>
                      </div>
                    </label>
                  </div>
                  <div className="settings-group toggle-group">
                    <label className="toggle-label">
                      <span>Show Features</span>
                      <div className={`toggle-switch ${localSettings.homepage.showFeatures ? 'active' : ''}`}
                           onClick={() => handleChange('homepage', 'showFeatures', !localSettings.homepage.showFeatures)}>
                        <div className="toggle-slider"></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Announcement Section */}
            {activeSection === 'announcement' && (
              <div className="settings-section">
                <h3>📢 Announcement Banner</h3>
                <p className="section-desc">Show important messages to all users</p>
                
                <div className="settings-group toggle-group">
                  <label className="toggle-label">
                    <span>Enable Announcement</span>
                    <div className={`toggle-switch ${localSettings.announcement.enabled ? 'active' : ''}`}
                         onClick={() => handleChange('announcement', 'enabled', !localSettings.announcement.enabled)}>
                      <div className="toggle-slider"></div>
                    </div>
                  </label>
                </div>
                
                <div className="settings-group">
                  <label>Announcement Message</label>
                  <textarea
                    value={localSettings.announcement.message}
                    onChange={(e) => handleChange('announcement', 'message', e.target.value)}
                    rows={2}
                    placeholder="Your announcement message..."
                  />
                </div>
                
                <div className="settings-group">
                  <label>Type</label>
                  <select
                    value={localSettings.announcement.type}
                    onChange={(e) => handleChange('announcement', 'type', e.target.value)}
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="success">Success (Green)</option>
                    <option value="warning">Warning (Yellow)</option>
                    <option value="error">Error (Red)</option>
                  </select>
                </div>
                
                <div className="settings-group toggle-group">
                  <label className="toggle-label">
                    <span>Allow Users to Dismiss</span>
                    <div className={`toggle-switch ${localSettings.announcement.dismissible ? 'active' : ''}`}
                         onClick={() => handleChange('announcement', 'dismissible', !localSettings.announcement.dismissible)}>
                      <div className="toggle-slider"></div>
                    </div>
                  </label>
                </div>
                
                {/* Announcement Preview */}
                {localSettings.announcement.enabled && localSettings.announcement.message && (
                  <div className="announcement-preview">
                    <label>Preview:</label>
                    <div className={`announcement-banner ${localSettings.announcement.type}`}>
                      {localSettings.announcement.message}
                      {localSettings.announcement.dismissible && <span className="dismiss-x">✕</span>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contact Section */}
            {activeSection === 'contact' && (
              <div className="settings-section">
                <h3>📞 Contact Information</h3>
                <p className="section-desc">Update your contact details</p>
                
                <div className="settings-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={localSettings.contact.email}
                    onChange={(e) => handleChange('contact', 'email', e.target.value)}
                  />
                </div>
                
                <div className="settings-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={localSettings.contact.phone}
                    onChange={(e) => handleChange('contact', 'phone', e.target.value)}
                  />
                </div>
                
                <div className="settings-group">
                  <label>Address</label>
                  <textarea
                    value={localSettings.contact.address}
                    onChange={(e) => handleChange('contact', 'address', e.target.value)}
                    rows={2}
                  />
                </div>
                
                <h4>Social Links</h4>
                <div className="social-links-grid">
                  <div className="settings-group">
                    <label>Facebook</label>
                    <input
                      type="url"
                      value={localSettings.contact.socialLinks?.facebook || ''}
                      onChange={(e) => handleChange('contact', 'socialLinks', { ...localSettings.contact.socialLinks, facebook: e.target.value })}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div className="settings-group">
                    <label>Twitter</label>
                    <input
                      type="url"
                      value={localSettings.contact.socialLinks?.twitter || ''}
                      onChange={(e) => handleChange('contact', 'socialLinks', { ...localSettings.contact.socialLinks, twitter: e.target.value })}
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div className="settings-group">
                    <label>LinkedIn</label>
                    <input
                      type="url"
                      value={localSettings.contact.socialLinks?.linkedin || ''}
                      onChange={(e) => handleChange('contact', 'socialLinks', { ...localSettings.contact.socialLinks, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/..."
                    />
                  </div>
                  <div className="settings-group">
                    <label>Instagram</label>
                    <input
                      type="url"
                      value={localSettings.contact.socialLinks?.instagram || ''}
                      onChange={(e) => handleChange('contact', 'socialLinks', { ...localSettings.contact.socialLinks, instagram: e.target.value })}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
                
                <div className="settings-group">
                  <label>Footer Copyright Text</label>
                  <input
                    type="text"
                    value={localSettings.footer.copyrightText}
                    onChange={(e) => handleChange('footer', 'copyrightText', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <div className="settings-section">
                <h3>📊 Dashboard Settings</h3>
                <p className="section-desc">Configure dashboard behavior</p>
                
                <div className="settings-group toggle-group">
                  <label className="toggle-label">
                    <span>Show Welcome Message</span>
                    <div className={`toggle-switch ${localSettings.dashboard.showWelcomeMessage ? 'active' : ''}`}
                         onClick={() => handleChange('dashboard', 'showWelcomeMessage', !localSettings.dashboard.showWelcomeMessage)}>
                      <div className="toggle-slider"></div>
                    </div>
                  </label>
                </div>
                
                <div className="settings-group">
                  <label>Welcome Message</label>
                  <input
                    type="text"
                    value={localSettings.dashboard.welcomeMessage}
                    onChange={(e) => handleChange('dashboard', 'welcomeMessage', e.target.value)}
                  />
                </div>
                
                <div className="settings-group">
                  <label>Items Per Page</label>
                  <select
                    value={localSettings.dashboard.itemsPerPage}
                    onChange={(e) => handleChange('dashboard', 'itemsPerPage', parseInt(e.target.value))}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                
                <div className="settings-group toggle-group">
                  <label className="toggle-label">
                    <span>Show Quick Actions</span>
                    <div className={`toggle-switch ${localSettings.dashboard.showQuickActions ? 'active' : ''}`}
                         onClick={() => handleChange('dashboard', 'showQuickActions', !localSettings.dashboard.showQuickActions)}>
                      <div className="toggle-slider"></div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Custom CSS Section */}
            {activeSection === 'customcss' && (
              <div className="settings-section">
                <h3>💻 Custom CSS</h3>
                <p className="section-desc">Add custom styles to your platform</p>
                
                <div className="settings-group">
                  <label>Custom CSS Code</label>
                  <textarea
                    className="code-editor"
                    value={localSettings.customCSS}
                    onChange={(e) => handleDirectChange('customCSS', e.target.value)}
                    rows={15}
                    placeholder={`/* Add your custom CSS here */
.my-class {
  color: red;
}`}
                    spellCheck={false}
                  />
                  <small>CSS will be applied immediately after saving</small>
                </div>
              </div>
            )}

            {/* Data Management Section */}
            {activeSection === 'datamanage' && (
              <div className="settings-section">
                <h3>🗄️ Data Management</h3>
                <p className="section-desc">Manage users and platform data</p>
                
                {/* Data Statistics */}
                <div className="data-stats-grid">
                  <div className="data-stat-card">
                    <span className="data-stat-icon">👥</span>
                    <div className="data-stat-info">
                      <h4>{data.users.filter(u => u.role === 'student').length}</h4>
                      <p>Students</p>
                    </div>
                  </div>
                  <div className="data-stat-card">
                    <span className="data-stat-icon">👨‍🏫</span>
                    <div className="data-stat-info">
                      <h4>{data.users.filter(u => u.role === 'counsellor').length}</h4>
                      <p>Career Mentors</p>
                    </div>
                  </div>
                  <div className="data-stat-card">
                    <span className="data-stat-icon">🔍</span>
                    <div className="data-stat-info">
                      <h4>{data.users.filter(u => u.role === 'evaluator').length}</h4>
                      <p>Evaluators</p>
                    </div>
                  </div>
                  <div className="data-stat-card">
                    <span className="data-stat-icon">⏳</span>
                    <div className="data-stat-info">
                      <h4>{data.users.filter(u => u.status === 'pending_verification' || u.studentStatus === 'pending_verification').length}</h4>
                      <p>Pending Verification</p>
                    </div>
                  </div>
                </div>

                {/* System Info */}
                <div className="demo-data-info">
                  <h4>ℹ️ System Users</h4>
                  <p>
                    The following system accounts are always available:
                  </p>
                  <ul>
                    <li>1 Admin (admin/admin)</li>
                    <li>1 Career Coordinator (general@pathwise.com)</li>
                    <li>2 Student Evaluators (evaluator1-2@pathwise.com)</li>
                    <li>2 Mentor Evaluators (evaluator3-4@pathwise.com)</li>
                  </ul>
                </div>

                {/* All Career Mentors */}
                <div className="demo-users-section">
                  <h4>👨‍🏫 Career Mentors</h4>
                  <div className="demo-users-list">
                    {data.users.filter(u => u.role === 'counsellor').map(mentor => (
                      <div key={mentor.id} className="demo-user-item">
                        <div className="demo-user-info">
                          <span className="demo-user-name">{mentor.name}</span>
                          <span className="demo-user-email">{mentor.email}</span>
                          <span className={`demo-user-status ${mentor.status}`}>{mentor.status}</span>
                        </div>
                        <button 
                          className="btn-small btn-danger"
                          onClick={() => {
                            if (window.confirm(`Delete mentor "${mentor.name}"?`)) {
                              deleteUser(mentor.id);
                            }
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    ))}
                    {data.users.filter(u => u.role === 'counsellor').length === 0 && (
                      <p className="no-data">No career mentors registered yet</p>
                    )}
                  </div>
                </div>

                {/* All Students */}
                <div className="demo-users-section">
                  <h4>👥 Students</h4>
                  <div className="demo-users-list">
                    {data.users.filter(u => u.role === 'student').map(student => (
                      <div key={student.id} className="demo-user-item">
                        <div className="demo-user-info">
                          <span className="demo-user-name">{student.name}</span>
                          <span className="demo-user-email">{student.email}</span>
                          <span className={`demo-user-status ${student.studentStatus || student.status}`}>{student.studentStatus || student.status}</span>
                        </div>
                        <button 
                          className="btn-small btn-danger"
                          onClick={() => {
                            if (window.confirm(`Delete student "${student.name}"?`)) {
                              deleteUser(student.id);
                            }
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    ))}
                    {data.users.filter(u => u.role === 'student').length === 0 && (
                      <p className="no-data">No students registered yet</p>
                    )}
                  </div>
                </div>

                {/* Bulk Actions */}
                <div className="bulk-actions">
                  <h4>⚡ Danger Zone</h4>
                  <div className="bulk-action-buttons">
                    <button 
                      className="btn-warning"
                      onClick={() => {
                        const mentors = data.users.filter(u => u.role === 'counsellor');
                        if (mentors.length === 0) {
                          showToast('No career mentors to delete!', 'warning');
                          return;
                        }
                        if (window.confirm(`Delete ALL ${mentors.length} career mentor(s)? This cannot be undone.`)) {
                          mentors.forEach(m => deleteUser(m.id));
                          showToast('All mentors deleted!', 'success');
                        }
                      }}
                    >
                      🗑️ Delete All Mentors
                    </button>
                    <button 
                      className="btn-warning"
                      onClick={() => {
                        const students = data.users.filter(u => u.role === 'student');
                        if (students.length === 0) {
                          showToast('No students to delete!', 'warning');
                          return;
                        }
                        if (window.confirm(`Delete ALL ${students.length} student(s)? This cannot be undone.`)) {
                          students.forEach(s => deleteUser(s.id));
                          showToast('All students deleted!', 'success');
                        }
                      }}
                    >
                      🗑️ Delete All Students
                    </button>
                    <button 
                      className="btn-danger"
                      onClick={() => {
                        if (window.confirm('⚠️ DANGER: Reset ALL data? This deletes ALL users, chats, meetings, etc.!')) {
                          if (window.confirm('Are you ABSOLUTELY sure? This cannot be undone!')) {
                            localStorage.removeItem('pathwiseData');
                            window.location.reload();
                          }
                        }
                      }}
                    >
                      💥 Reset ALL Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Section */}
            {activeSection === 'backup' && (
              <div className="settings-section">
                <h3>💾 Backup & Restore</h3>
                <p className="section-desc">Export or import your settings</p>
                
                <div className="backup-actions">
                  <div className="backup-card">
                    <h4>📤 Export Settings</h4>
                    <p>Download all settings as a JSON file</p>
                    <button className="btn-primary" onClick={exportSettings}>
                      Export Settings
                    </button>
                  </div>
                  
                  <div className="backup-card">
                    <h4>📥 Import Settings</h4>
                    <p>Restore settings from a JSON file</p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      id="import-settings"
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="import-settings" className="btn-secondary">
                      Import Settings
                    </label>
                    {importError && <p className="error-text">{importError}</p>}
                  </div>
                  
                  <div className="backup-card danger">
                    <h4>🔄 Reset to Defaults</h4>
                    <p>Restore all settings to factory defaults</p>
                    <button className="btn-danger" onClick={resetToDefaults}>
                      Reset All Settings
                    </button>
                  </div>
                </div>
                
                <div className="last-updated">
                  <p>Last Updated: {new Date(localSettings.lastUpdated).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettingsPanel;
