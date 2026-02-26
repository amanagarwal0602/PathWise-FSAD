import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { 
  hashPassword, 
  sanitizeInput, 
  validateEmail, 
  validatePhone, 
  checkPasswordStrength, 
  getPasswordStrengthLabel 
} from '../utils/security';

function Register() {
  const navigate = useNavigate();
  const { addUser, data } = useData();
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    specialization: '',
    // Student fields
    college: '',
    branch: '',
    year: '',
    careerGoals: '',
    achievements: '',
    phone: '',
    studentId: '',
    idProofType: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [], isStrong: false });
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Check username availability
  useEffect(() => {
    if (formData.username.length >= 3) {
      setCheckingUsername(true);
      const timer = setTimeout(() => {
        const exists = data.users.some(
          u => u.username?.toLowerCase() === formData.username.toLowerCase()
        );
        setUsernameAvailable(!exists);
        setCheckingUsername(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setUsernameAvailable(null);
    }
  }, [formData.username, data.users]);

  // Check email availability
  useEffect(() => {
    if (formData.email.length >= 5 && formData.email.includes('@')) {
      setCheckingEmail(true);
      const timer = setTimeout(() => {
        const exists = data.users.some(
          u => u.email?.toLowerCase() === formData.email.toLowerCase()
        );
        setEmailAvailable(!exists);
        setCheckingEmail(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setEmailAvailable(null);
    }
  }, [formData.email, data.users]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
    
    if (name === 'password') {
      const strength = checkPasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  // Validate current step before proceeding
  const validateStep = () => {
    setError('');
    
    switch (currentStep) {
      case 1: // Role, Username, Email
        if (!formData.username || formData.username.length < 3) {
          setError('Username must be at least 3 characters');
          return false;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
          setError('Username can only contain letters, numbers, and underscores');
          return false;
        }
        if (!usernameAvailable) {
          setError('This username is already taken');
          return false;
        }
        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.isValid) {
          setError(emailValidation.error);
          return false;
        }
        if (!emailAvailable) {
          setError('This email is already registered');
          return false;
        }
        return true;
        
      case 2: // Personal Details
        if (formData.name.trim().length < 2) {
          setError('Please enter a valid name (at least 2 characters)');
          return false;
        }
        if (formData.role === 'student') {
          if (!formData.college.trim()) {
            setError('Please enter your college/university name');
            return false;
          }
          if (!formData.branch.trim()) {
            setError('Please enter your branch/major');
            return false;
          }
          if (!formData.year) {
            setError('Please select your year of study');
            return false;
          }
          if (!formData.phone) {
            setError('Please enter your phone number');
            return false;
          }
          const phoneValidation = validatePhone(formData.phone);
          if (!phoneValidation.isValid) {
            setError(phoneValidation.error);
            return false;
          }
        }
        if (formData.role === 'counsellor' && !formData.specialization) {
          setError('Please select your specialization');
          return false;
        }
        return true;
        
      case 3: // Verification (Students) or skip for counsellors
        if (formData.role === 'student') {
          if (!formData.studentId.trim()) {
            setError('Please enter your College/University ID');
            return false;
          }
          if (!formData.idProofType) {
            setError('Please select your ID proof type');
            return false;
          }
        }
        return true;
        
      case 4: // Password
        if (!formData.password) {
          setError('Please enter a password');
          return false;
        }
        if (!passwordStrength.isStrong) {
          setError('Please create a stronger password. ' + passwordStrength.feedback[0]);
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      // Skip step 3 for counsellors (no verification needed in that step)
      if (currentStep === 2 && formData.role === 'counsellor') {
        setCurrentStep(4);
      } else {
        setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      }
    }
  };

  const prevStep = () => {
    // Skip step 3 for counsellors
    if (currentStep === 4 && formData.role === 'counsellor') {
      setCurrentStep(2);
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 1));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) return;
    
    setIsLoading(true);

    try {
      const { hash, salt } = await hashPassword(formData.password);

      const userData = {
        name: sanitizeInput(formData.name),
        username: formData.username.toLowerCase(),
        email: formData.email.toLowerCase().trim(),
        passwordHash: hash,
        passwordSalt: salt,
        role: formData.role,
        status: 'active'
      };

      if (formData.role === 'student') {
        userData.college = sanitizeInput(formData.college);
        userData.branch = sanitizeInput(formData.branch);
        userData.year = formData.year;
        userData.careerGoals = sanitizeInput(formData.careerGoals);
        userData.achievements = sanitizeInput(formData.achievements);
        userData.phoneNumber = formData.phone.replace(/[^\d+\-\s()]/g, '');
        userData.studentId = sanitizeInput(formData.studentId);
        userData.idProofType = formData.idProofType;
        userData.guidanceStage = 'initial';
        userData.assignedCounsellor = null;
        userData.assessmentCompleted = false;
      }

      if (formData.role === 'counsellor') {
        userData.specialization = formData.specialization;
        userData.assignedStudents = [];
        userData.rating = 0;
        userData.reviewCount = 0;
        userData.status = 'pending_verification';
        userData.verifiedBy = null;
        userData.verifiedAt = null;
      }

      addUser(userData);
      setRegistrationSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get step title
  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Account Setup';
      case 2: return 'Personal Details';
      case 3: return 'Verification';
      case 4: return 'Create Password';
      default: return 'Register';
    }
  };

  // Get step description
  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return 'Choose your role and create your login credentials';
      case 2: return formData.role === 'student' ? 'Tell us about yourself and your education' : 'Tell us about your expertise';
      case 3: return 'Provide verification details for account approval';
      case 4: return 'Create a secure password to protect your account';
      default: return '';
    }
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
                <span>Expert Career Mentors</span>
              </div>
              <div className="feature-item">
                <span>✓</span>
                <span>Personalized Guidance</span>
              </div>
              <div className="feature-item">
                <span>✓</span>
                <span>Track Your Progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Multi-Step Form */}
        <div className="register-form-panel">
          <div className="register-form-container">
            {/* Progress Indicator */}
            <div className="step-progress">
              <div className="step-progress-bar">
                <div 
                  className="step-progress-fill" 
                  style={{ width: `${(currentStep / (formData.role === 'counsellor' ? 3 : totalSteps)) * 100}%` }}
                />
              </div>
              <div className="step-indicators">
                {[1, 2, 3, 4].map(step => {
                  // Hide step 3 indicator for counsellors
                  if (step === 3 && formData.role === 'counsellor') return null;
                  return (
                    <div 
                      key={step}
                      className={`step-indicator ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
                    >
                      {currentStep > step ? '✓' : step === 3 && formData.role === 'counsellor' ? '' : 
                        (formData.role === 'counsellor' && step === 4 ? 3 : step)}
                    </div>
                  );
                })}
              </div>
              <span className="step-counter">
                Step {formData.role === 'counsellor' && currentStep === 4 ? 3 : currentStep} of {formData.role === 'counsellor' ? 3 : totalSteps}
              </span>
            </div>

            <div className="form-header">
              <h2>{getStepTitle()}</h2>
              <p>{getStepDescription()}</p>
            </div>
            
            {error && (
              <div className="login-error">
                <span className="error-icon">!</span>
                <span>{error}</span>
              </div>
            )}

            {registrationSuccess && (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h3>Registration Successful!</h3>
                <p>Your account has been created. Redirecting to login...</p>
                <div className="success-progress">
                  <div className="success-progress-bar"></div>
                </div>
              </div>
            )}
            
            {!registrationSuccess && (
            <form onSubmit={handleSubmit} className="register-form step-form">
              
              {/* STEP 1: Role, Username, Email */}
              {currentStep === 1 && (
                <div className="step-content step-animate">
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
                        <span>Career Mentor</span>
                      </button>
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="username">Username <span className="required">*</span></label>
                    <div className="input-with-status">
                      <input
                        id="username"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Choose a unique username"
                        className={usernameAvailable === false ? 'input-error' : usernameAvailable === true ? 'input-success' : ''}
                        required
                      />
                      {checkingUsername && <span className="input-status checking">⏳</span>}
                      {!checkingUsername && usernameAvailable === true && <span className="input-status available">✓</span>}
                      {!checkingUsername && usernameAvailable === false && <span className="input-status taken">✗</span>}
                    </div>
                    {usernameAvailable === false && (
                      <span className="field-error">This username is already taken</span>
                    )}
                    {usernameAvailable === true && (
                      <span className="field-success">Username is available!</span>
                    )}
                    <small className="field-hint">Letters, numbers, and underscores only</small>
                  </div>

                  <div className="form-field">
                    <label htmlFor="email">Email <span className="required">*</span></label>
                    <div className="input-with-status">
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        className={emailAvailable === false ? 'input-error' : emailAvailable === true ? 'input-success' : ''}
                        required
                      />
                      {checkingEmail && <span className="input-status checking">⏳</span>}
                      {!checkingEmail && emailAvailable === true && <span className="input-status available">✓</span>}
                      {!checkingEmail && emailAvailable === false && <span className="input-status taken">✗</span>}
                    </div>
                    {emailAvailable === false && (
                      <span className="field-error">This email is already registered</span>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: Personal Details */}
              {currentStep === 2 && (
                <div className="step-content step-animate">
                  <div className="form-field">
                    <label htmlFor="name">Full Name <span className="required">*</span></label>
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

                  {formData.role === 'counsellor' && (
                    <div className="form-field">
                      <label htmlFor="specialization">Specialization <span className="required">*</span></label>
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

                  {formData.role === 'student' && (
                    <>
                      <div className="form-row-2">
                        <div className="form-field">
                          <label htmlFor="college">College/University <span className="required">*</span></label>
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
                          <label htmlFor="branch">Branch/Major <span className="required">*</span></label>
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
                          <label htmlFor="year">Year of Study <span className="required">*</span></label>
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
                          <label htmlFor="phone">Phone Number <span className="required">*</span></label>
                          <input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STEP 3: Verification (Students only) */}
              {currentStep === 3 && formData.role === 'student' && (
                <div className="step-content step-animate">
                  <div className="verification-info-box">
                    <span className="info-icon">🔒</span>
                    <div>
                      <strong>Why verification?</strong>
                      <p>We verify all students to ensure genuine users receive quality career guidance and to maintain a safe learning environment.</p>
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="studentId">College/University ID <span className="required">*</span></label>
                    <input
                      id="studentId"
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="e.g., 2024CS001"
                      required
                    />
                    <small className="field-hint">Your enrollment/registration number</small>
                  </div>

                  <div className="form-field">
                    <label htmlFor="idProofType">ID Proof Type <span className="required">*</span></label>
                    <select
                      id="idProofType"
                      name="idProofType"
                      value={formData.idProofType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select ID Proof Type</option>
                      <option value="College ID Card">College ID Card</option>
                      <option value="University Enrollment Letter">University Enrollment Letter</option>
                      <option value="Bonafide Certificate">Bonafide Certificate</option>
                      <option value="Fee Receipt">Fee Receipt</option>
                      <option value="Other">Other</option>
                    </select>
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
                </div>
              )}

              {/* STEP 4: Password */}
              {currentStep === 4 && (
                <div className="step-content step-animate">
                  <div className="password-tips-box">
                    <span className="tips-icon">💡</span>
                    <div>
                      <strong>Password Tips</strong>
                      <ul>
                        <li>At least 8 characters long</li>
                        <li>Mix of uppercase & lowercase</li>
                        <li>Include numbers & symbols</li>
                      </ul>
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="password">Password <span className="required">*</span></label>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      required
                    />
                    {formData.password && (
                      <div className="password-strength">
                        <div className="strength-bar">
                          <div 
                            className="strength-fill" 
                            style={{ 
                              width: `${passwordStrength.score}%`,
                              backgroundColor: getPasswordStrengthLabel(passwordStrength.score).color
                            }}
                          />
                        </div>
                        <span 
                          className="strength-label"
                          style={{ color: getPasswordStrengthLabel(passwordStrength.score).color }}
                        >
                          {getPasswordStrengthLabel(passwordStrength.score).label}
                        </span>
                      </div>
                    )}
                    {formData.password && passwordStrength.feedback.length > 0 && (
                      <ul className="password-requirements">
                        {passwordStrength.feedback.slice(0, 3).map((item, index) => (
                          <li key={index} className="requirement-item">⚠ {item}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="confirmPassword">Confirm Password <span className="required">*</span></label>
                    <input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                    />
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <span className="field-success">✓ Passwords match</span>
                    )}
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <span className="field-error">Passwords do not match</span>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="step-navigation">
                {currentStep > 1 && (
                  <button type="button" className="btn-secondary" onClick={prevStep}>
                    ← Back
                  </button>
                )}
                
                {currentStep < totalSteps && !(currentStep === 2 && formData.role === 'counsellor') ? (
                  <button type="button" className="btn-primary" onClick={nextStep}>
                    Continue →
                  </button>
                ) : (currentStep === 2 && formData.role === 'counsellor') ? (
                  <button type="button" className="btn-primary" onClick={nextStep}>
                    Continue →
                  </button>
                ) : (
                  <button type="submit" className="btn-primary btn-submit" disabled={isLoading}>
                    {isLoading ? (
                      <span className="btn-loading">
                        <span className="spinner"></span>
                        Creating...
                      </span>
                    ) : (
                      '✓ Create Account'
                    )}
                  </button>
                )}
              </div>
            </form>
            )}

            {!registrationSuccess && (
            <div className="form-footer">
              <p>Already have an account? <Link to="/login">Sign In</Link></p>
            </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        /* Step Progress Styles */
        .step-progress {
          margin-bottom: 24px;
        }

        .step-progress-bar {
          height: 4px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .step-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4318FF, #7B61FF);
          border-radius: 4px;
          transition: width 0.4s ease;
        }

        .step-indicators {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .step-indicator {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .step-indicator.active {
          background: #4318FF;
          color: white;
        }

        .step-indicator.current {
          box-shadow: 0 0 0 4px rgba(67, 24, 255, 0.2);
        }

        .step-counter {
          font-size: 13px;
          color: #64748b;
          text-align: center;
          display: block;
        }

        /* Step Animation */
        .step-animate {
          animation: fadeSlideIn 0.4s ease;
        }

        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Input with status */
        .input-with-status {
          position: relative;
        }

        .input-with-status input {
          padding-right: 40px;
        }

        .input-status {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
        }

        .input-status.checking {
          animation: spin 1s linear infinite;
        }

        .input-status.available {
          color: #10b981;
        }

        .input-status.taken {
          color: #ef4444;
        }

        @keyframes spin {
          from { transform: translateY(-50%) rotate(0deg); }
          to { transform: translateY(-50%) rotate(360deg); }
        }

        .input-error {
          border-color: #ef4444 !important;
        }

        .input-success {
          border-color: #10b981 !important;
        }

        .field-error {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }

        .field-success {
          color: #10b981;
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }

        .field-hint {
          color: #94a3b8;
          font-size: 12px;
          margin-top: 4px;
        }

        /* Info Boxes */
        .verification-info-box,
        .password-tips-box {
          display: flex;
          gap: 12px;
          background: linear-gradient(135deg, #e0f2fe 0%, #e0e7ff 100%);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          border-left: 4px solid #4318FF;
        }

        .verification-info-box .info-icon,
        .password-tips-box .tips-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .verification-info-box strong,
        .password-tips-box strong {
          display: block;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .verification-info-box p,
        .password-tips-box p {
          margin: 0;
          font-size: 13px;
          color: #475569;
          line-height: 1.4;
        }

        .password-tips-box ul {
          margin: 6px 0 0 0;
          padding-left: 16px;
          font-size: 12px;
          color: #475569;
        }

        .password-tips-box li {
          margin: 2px 0;
        }

        /* Step Navigation */
        .step-navigation {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .step-navigation .btn-secondary {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .step-navigation .btn-secondary:hover {
          background: #e2e8f0;
        }

        .step-navigation .btn-primary {
          background: linear-gradient(135deg, #4318FF 0%, #7B61FF 100%);
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-left: auto;
        }

        .step-navigation .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(67, 24, 255, 0.3);
        }

        .step-navigation .btn-submit {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .step-navigation .btn-submit:hover {
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .step-form .form-field {
          margin-bottom: 16px;
        }

        .required {
          color: #ef4444;
        }

        /* Two column row */
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 500px) {
          .form-row-2 {
            grid-template-columns: 1fr;
          }
        }

        /* Select dropdown styling */
        .step-form select {
          width: 100%;
          padding: 12px 40px 12px 14px;
          font-size: 15px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          background-color: #fff;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234318FF' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 12px;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #1e293b;
        }

        .step-form select:focus {
          outline: none;
          border-color: #4318FF;
          box-shadow: 0 0 0 3px rgba(67, 24, 255, 0.1);
        }

        .step-form select:hover {
          border-color: #cbd5e1;
        }

        .step-form select option {
          padding: 12px;
          background: #fff;
          color: #1e293b;
        }

        .step-form select option:first-child {
          color: #94a3b8;
        }

        /* Success Message Styles */
        .success-message {
          text-align: center;
          padding: 40px 20px;
          animation: successFadeIn 0.5s ease;
        }

        @keyframes successFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 40px;
          color: white;
          animation: successBounce 0.6s ease;
        }

        @keyframes successBounce {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        .success-message h3 {
          font-size: 24px;
          color: #10b981;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .success-message p {
          color: #64748b;
          font-size: 15px;
          margin-bottom: 24px;
        }

        .success-progress {
          width: 200px;
          height: 4px;
          background: #e2e8f0;
          border-radius: 4px;
          margin: 0 auto;
          overflow: hidden;
        }

        .success-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #059669);
          border-radius: 4px;
          animation: progressFill 2.5s linear;
        }

        @keyframes progressFill {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default Register;
