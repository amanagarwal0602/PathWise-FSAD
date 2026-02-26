import { useSiteSettings } from '../context/SiteSettingsContext';

function MaintenanceMode() {
  const { settings } = useSiteSettings();
  const { maintenanceMode } = settings;

  return (
    <div className="maintenance-page">
      <div className="maintenance-container">
        <div className="maintenance-icon">🔧</div>
        <h1>{settings.siteName}</h1>
        <h2>Under Maintenance</h2>
        <p className="maintenance-message">{maintenanceMode.message}</p>
        
        {maintenanceMode.estimatedTime && (
          <div className="maintenance-info">
            <span className="info-label">Estimated Time:</span>
            <span className="info-value">{maintenanceMode.estimatedTime}</span>
          </div>
        )}
        
        <div className="maintenance-contact">
          <p>For urgent inquiries, please contact:</p>
          <a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a>
        </div>
        
        <button className="refresh-btn" onClick={() => window.location.reload()}>
          🔄 Check Again
        </button>
      </div>
    </div>
  );
}

export default MaintenanceMode;
