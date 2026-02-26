import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
  checkRateLimit,
  recordFailedAttempt,
  clearLoginAttempts,
  sanitizeInput,
  createSecureSession
} from '../utils/security';

function Login() {
  const navigate = useNavigate();
  const { login, refreshData, syncStatus } = useData();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync with backend on mount
  useEffect(() => {
    refreshData();
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'general_counsellor') {
        navigate('/general-counsellor', { replace: true });
      } else if (user.role === 'evaluator') {
        navigate('/evaluator', { replace: true });
      } else if (user.role === 'counsellor') {
        navigate('/counsellor', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    }
  }, [navigate]);

  // Countdown timer for lockout (removed)

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Sanitize email input
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());

    // Rate limiting disabled

    setIsLoading(true);

    // Small delay for security (prevents timing attacks)
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

    const user = await login(sanitizedEmail, password);

    if (user) {
      // Clear failed attempts on successful login
      clearLoginAttempts(sanitizedEmail);

      // Create secure session
      const session = createSecureSession(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('pathwiseSession', JSON.stringify(session));

      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'general_counsellor') {
        navigate('/general-counsellor', { replace: true });
      } else if (user.role === 'evaluator') {
        navigate('/evaluator', { replace: true });
      } else if (user.role === 'counsellor') {
        navigate('/counsellor', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    } else {
      // Record failed attempt
      recordFailedAttempt(sanitizedEmail);

      // Rate limiting disabled
      setError('Invalid credentials. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Panel - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <div className="brand-logo">
              <img src="/logo.png" alt="PathWise" className="brand-logo-img" />
              <span className="brand-name">PathWise</span>
            </div>
            <h1>Career Guidance Platform</h1>
            <p>Empowering students to make informed career decisions through personalized guidance and expert counselling.</p>
            <div className="branding-features">
              <div className="feature-item">
                <span>✓</span>
                <span>Personalized Career Assessment</span>
              </div>
              <div className="feature-item">
                <span>✓</span>
                <span>Expert Career Mentor Support</span>
              </div>
              <div className="feature-item">
                <span>✓</span>
                <span>AI-Powered Recommendations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="login-form-panel">
          <div className="login-form-container">
            <div className="form-header">
              <h2>Sign In</h2>
              <p>Enter your credentials to access your account</p>

              {/* Sync Status */}
              <div style={{
                marginTop: '10px',
                padding: '8px 12px',
                background: syncStatus === 'synced' ? '#d4edda' : syncStatus === 'syncing' ? '#fff3cd' : syncStatus === 'error' ? '#f8d7da' : '#cce5ff',
                color: syncStatus === 'synced' ? '#155724' : syncStatus === 'syncing' ? '#856404' : syncStatus === 'error' ? '#721c24' : '#004085',
                borderRadius: '6px',
                fontSize: '13px',
                textAlign: 'center'
              }}>
                {syncStatus === 'syncing' ? '⏳ Syncing with server...' : syncStatus === 'synced' ? '✅ Data synced' : syncStatus === 'error' ? '⚠️ Offline mode (data from this device only)' : '🔄 Checking server...'}
              </div>
            </div>

            {error && (
              <div className="login-error">
                <span className="error-icon">!</span>
                <span>{error}</span>
              </div>
            )}



            <form onSubmit={handleLogin} className="login-form">
              <div className="form-field">
                <label htmlFor="email">Email or Username</label>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email or username"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? (
                  <span className="btn-loading">
                    <span className="spinner"></span>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="form-footer">
              <p>Don't have an account? <Link to="/register">Create Account</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
