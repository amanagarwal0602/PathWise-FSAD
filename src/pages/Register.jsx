import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

function Register() {
  const navigate = useNavigate();
  const { addUser, STUDENT_STATUS } = useData();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    specialization: '',
    // New student fields
    college: '',
    branch: '',
    year: '',
    careerGoals: '',
    achievements: '',
    phone: ''
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

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      status: formData.role === 'student' ? STUDENT_STATUS.REGISTERED : 'pending_approval'
    };

    // Add student-specific fields
    if (formData.role === 'student') {
      userData.college = formData.college;
      userData.branch = formData.branch;
      userData.year = formData.year;
      userData.careerGoals = formData.careerGoals;
      userData.achievements = formData.achievements;
      userData.phone = formData.phone;
      userData.guidanceStage = 'initial';
      userData.assignedCounsellor = null;
      userData.assessmentCompleted = false;
    }

    // Add counsellor-specific fields
    if (formData.role === 'counsellor') {
      userData.specialization = formData.specialization;
      userData.assignedStudents = [];
      userData.rating = 0;
      userData.reviewCount = 0;
    }

    addUser(userData);

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

              {/* Student-specific fields */}
              {formData.role === 'student' && (
                <>
                  <div className="form-row-2">
                    <div className="form-field">
                      <label htmlFor="college">College/University</label>
                      <input
                        id="college"
                        type="text"
                        name="college"
                        value={formData.college}
                        onChange={handleChange}
                        placeholder="Enter your college name"
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="branch">Branch/Major</label>
                      <input
                        id="branch"
                        type="text"
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        placeholder="e.g., Computer Science"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-field">
                      <label htmlFor="year">Year of Study</label>
                      <select
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                        <option value="5">5th Year</option>
                        <option value="graduate">Graduate</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="careerGoals">Career Goals (Optional)</label>
                    <textarea
                      id="careerGoals"
                      name="careerGoals"
                      value={formData.careerGoals}
                      onChange={handleChange}
                      placeholder="Briefly describe your career aspirations..."
                      rows="2"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="achievements">Achievements/Skills (Optional)</label>
                    <textarea
                      id="achievements"
                      name="achievements"
                      value={formData.achievements}
                      onChange={handleChange}
                      placeholder="Any notable achievements, certifications, or skills..."
                      rows="2"
                    />
                  </div>
                </>
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
