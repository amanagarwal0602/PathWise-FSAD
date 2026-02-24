import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

// Registration Page Component
function Register() {
  const navigate = useNavigate();
  const { addUser } = useData();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    specialization: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    // Create user
    const newUser = addUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      specialization: formData.specialization,
      status: 'active'
    });

    alert('Registration successful! Please login.');
    navigate('/login');
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">PathWise</span>
          </div>
          <h1>Create Account</h1>
          <p>Start your career guidance journey</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Role Selection - First */}
          <div className="role-selector">
            <label>I am a:</label>
            <div className="role-options">
              <button
                type="button"
                className={`role-btn ${formData.role === 'student' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'student' })}
              >
                <span className="role-icon">🎓</span>
                <span>Student</span>
              </button>
              <button
                type="button"
                className={`role-btn ${formData.role === 'counsellor' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'counsellor' })}
              >
                <span className="role-icon">👨‍🏫</span>
                <span>Counsellor</span>
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          {formData.role === 'counsellor' && (
            <div className="input-group">
              <label>Specialization</label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
              >
                <option value="">Select Specialization</option>
                <option value="Engineering">Engineering & Technology</option>
                <option value="Medical">Medical & Healthcare</option>
                <option value="Business">Business & Management</option>
                <option value="Arts">Arts & Design</option>
                <option value="Science">Science & Research</option>
                <option value="Law">Law & Legal</option>
                <option value="General">General Guidance</option>
              </select>
            </div>
          )}

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button type="submit" className="btn-submit">
            Create Account
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
