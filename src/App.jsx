import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import './styles/global.css';

// Import all pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import CounsellorDashboard from './pages/CounsellorDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Main App Component with Routing
function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          {/* Default route - redirect to login */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard Routes */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/counsellor" element={<CounsellorDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;