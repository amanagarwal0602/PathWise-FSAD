import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

// Login Page Component
function Login() {
  const navigate = useNavigate();
  const { login } = useData();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    const user = login(email, password);
    
    if (user) {
      // Store logged in user
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Navigate based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'counsellor') {
        navigate('/counsellor');
      } else {
        navigate('/student');
      }
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">PathWise</span>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to continue your career journey</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn-submit">
            Sign In
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Create Account</Link></p>
        </div>

        <div className="admin-hint">
          <small>Admin? Use email: admin, password: admin</small>
        </div>
      </div>
    </div>
  );
}

export default Login;
