import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

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
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 400));

    addUser({
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
    <div className="register-page">
      <div className="register-container">
        {/* Left Panel - Branding */}
        <div className="register-branding">
          <div className="branding-content">
            <div className="brand-logo">
              <img src="/logo.png" alt="PathWise" className="brand-logo-img" />
              <span className="brand-name">PathWise</span>
            </div>
            <h1>Join Our Community</h1>
            <p>Create your account and start your journey towards a successful career with expert guidance.</p>
            <div className="branding-features">
              <div className="feature-item">
                <span>✓</span>
                <span>Free Career Assessment</span>
              </div>
              <div className="feature-item">
                <span>✓</span>
                <span>Connect with Expert Counsellors</span>
              </div>
              <div className="feature-item">
                <span>✓</span>
                <span>Personalized Recommendations</span>
              </div>
              <div className="feature-item">
                <span>✓</span>
                <span>Track Your Progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Register Form */}
        <div className="register-form-panel">
          <div className="register-form-container">
            <div className="form-header">
              <h2>Create Account</h2>
              <p>Fill in your details to get started</p>
            </div>
            
            {error && (
              <div className="login-error">
                <span className="error-icon">!</span>
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="register-form">
              {/* Role Selection */}
              <div className="role-select-group">
                <label>I am a:</label>
                <div className="role-buttons">
                  <button
                    type="button"
                    className={`role-btn-new ${formData.role === 'student' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, role: 'student' })}
                  >
                    <span>🎓</span>
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    className={`role-btn-new ${formData.role === 'counsellor' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, role: 'counsellor' })}
                  >
                    <span>👨‍🏫</span>
                    <span>Counsellor</span>
                  </button>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              {formData.role === 'counsellor' && (
                <div className="form-field">
                  <label htmlFor="specialization">Specialization</label>
                  <select
                    id="specialization"
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

              <div className="form-row-2">
                <div className="form-field">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create password"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? (
                  <span className="btn-loading">
                    <span className="spinner"></span>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="form-footer">
              <p>Already have an account? <Link to="/login">Sign In</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
