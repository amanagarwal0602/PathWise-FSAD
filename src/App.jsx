import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import { SiteSettingsProvider, useSiteSettings } from './context/SiteSettingsContext';
import { ToastProvider } from './context/ToastContext';
import './styles/global.css';

// Import all pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import CounsellorDashboard from './pages/CounsellorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import GeneralCounsellorDashboard from './pages/GeneralCounsellorDashboard';
import EvaluatorDashboard from './pages/EvaluatorDashboard';
import Workflow from './pages/Workflow';
import Database from './pages/Database';
import HelpCenter from './components/HelpCenter';
import MaintenanceMode from './components/MaintenanceMode';
import CustomerChat from './components/CustomerChat';

// Announcement Banner Component
function AnnouncementBanner() {
  const { settings, updateCategory } = useSiteSettings();
  const { announcement } = settings;
  
  if (!announcement.enabled || !announcement.message) return null;
  
  // Check if expired
  if (announcement.expiresAt && new Date(announcement.expiresAt) < new Date()) {
    return null;
  }
  
  const handleDismiss = () => {
    updateCategory('announcement', { enabled: false });
  };
  
  return (
    <div className={`announcement-banner ${announcement.type}`}>
      <span className="announcement-message">{announcement.message}</span>
      {announcement.dismissible && (
        <button className="announcement-dismiss" onClick={handleDismiss}>✕</button>
      )}
    </div>
  );
}

// Maintenance Mode Wrapper
function MaintenanceWrapper({ children }) {
  const { isInMaintenanceMode } = useSiteSettings();
  const { currentUser } = useData();
  const location = useLocation();
  
  // Allow login page even in maintenance
  if (location.pathname === '/login') {
    return children;
  }
  
  if (isInMaintenanceMode(currentUser?.role)) {
    return <MaintenanceMode />;
  }
  
  return children;
}

// App Content with Maintenance Check
function AppContent() {
  const { settings } = useSiteSettings();
  
  return (
    <>
      <AnnouncementBanner />
      <MaintenanceWrapper>
        <Routes>
          {/* Default route - redirect to login */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={
            settings.features.registrationEnabled ? <Register /> : <Navigate to="/login" />
          } />
          <Route path="/workflow" element={<Workflow />} />
          <Route path="/database" element={<Database />} />
          
          {/* Dashboard Routes */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/counsellor" element={<CounsellorDashboard />} />
          <Route path="/general-counsellor" element={<GeneralCounsellorDashboard />} />
          <Route path="/evaluator" element={<EvaluatorDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </MaintenanceWrapper>
      {/* Global Help Center Button */}
      {settings.features.helpCenterEnabled && <HelpCenter />}
      {/* Global Customer Chat Widget */}
      <CustomerChat />
    </>
  );
}

// Main App Component with Routing
function App() {
  return (
    <SiteSettingsProvider>
      <DataProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ToastProvider>
      </DataProvider>
    </SiteSettingsProvider>
  );
}

export default App;