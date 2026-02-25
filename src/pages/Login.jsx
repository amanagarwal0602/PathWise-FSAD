import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useData();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'counsellor') {
        navigate('/counsellor', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Simulate brief loading
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const user = login(email, password);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'counsellor') {
        navigate('/counsellor', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    } else {
      setError('Invalid credentials. Please check your email and password.');
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
                <span>Expert Counsellor Support</span>
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
            </div>
            
            {error && (
              <div className="login-error">
                <span className="error-icon">!</span>
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
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
