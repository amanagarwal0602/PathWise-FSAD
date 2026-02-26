import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Workflow() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('credentials');
  const [copiedText, setCopiedText] = useState('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const credentials = [
    {
      role: 'Admin',
      icon: '👑',
      color: '#ef4444',
      accounts: [
        { email: 'admin', username: 'admin', password: 'admin' }
      ],
      description: 'Full system control, manage users, settings'
    },
    {
      role: 'Career Coordinator',
      icon: '🎯',
      color: '#8b5cf6',
      accounts: [
        { email: 'general@pathwise.com', username: 'generalcounsellor', password: 'general123' }
      ],
      description: 'Reviews students, assigns specialized mentors'
    },
    {
      role: 'Student Verification Specialists',
      icon: '✅',
      color: '#10b981',
      accounts: [
        { email: 'evaluator1@pathwise.com', username: 'evaluator1', password: 'eval123' },
        { email: 'evaluator2@pathwise.com', username: 'evaluator2', password: 'eval123' }
      ],
      description: 'Verify student registrations'
    },
    {
      role: 'Mentor Verification Specialists',
      icon: '🔍',
      color: '#06b6d4',
      accounts: [
        { email: 'evaluator3@pathwise.com', username: 'evaluator3', password: 'eval123' },
        { email: 'evaluator4@pathwise.com', username: 'evaluator4', password: 'eval123' }
      ],
      description: 'Verify career mentor applications'
    },
    {
      role: 'Career Mentors (Verified)',
      icon: '👨‍🏫',
      color: '#f59e0b',
      accounts: [
        { email: 'health.mentor@pathwise.com', password: 'mentor123', specialization: 'Healthcare' },
        { email: 'arts.mentor@pathwise.com', password: 'mentor123', specialization: 'Arts & Design' }
      ],
      description: 'Already verified, can mentor students'
    },
    {
      role: 'Career Mentors (Pending)',
      icon: '⏳',
      color: '#f97316',
      accounts: [
        { email: 'tech.mentor@pathwise.com', password: 'mentor123', specialization: 'Technology' },
        { email: 'business.mentor@pathwise.com', password: 'mentor123', specialization: 'Business' }
      ],
      description: 'Need verification by evaluator3/4'
    },
    {
      role: 'Demo Student',
      icon: '🎓',
      color: '#3b82f6',
      accounts: [
        { email: 'sample@gmail.com', username: 'demostudent', password: 'sample123' }
      ],
      description: 'Resets on every login - demo full journey'
    }
  ];

  const studentWorkflow = [
    { step: 1, title: 'Registration', icon: '📝', description: 'Student fills registration form with details' },
    { step: 2, title: 'Pending Verification', icon: '⏳', description: 'Waiting for verification specialist approval' },
    { step: 3, title: 'Verified', icon: '✅', description: 'Specialist approves, student can take assessment' },
    { step: 4, title: 'Assessment', icon: '📋', description: 'Student completes interest assessment' },
    { step: 5, title: 'Career Coordinator Review', icon: '🎯', description: 'Coordinator evaluates and chats' },
    { step: 6, title: 'Mentor Assigned', icon: '👨‍🏫', description: 'Specialized career mentor assigned' },
    { step: 7, title: 'Active Guidance', icon: '🚀', description: 'Ongoing career guidance begins' }
  ];

  const mentorWorkflow = [
    { step: 1, title: 'Registration', icon: '📝', description: 'Mentor registers with specialization' },
    { step: 2, title: 'Pending Verification', icon: '⏳', description: 'Waiting for evaluator3/4 approval' },
    { step: 3, title: 'Verified', icon: '✅', description: 'Can access mentor dashboard' },
    { step: 4, title: 'Active Mentoring', icon: '🎓', description: 'Students assigned by coordinator' }
  ];

  const securityFeatures = [
    { icon: '🔐', title: 'SHA-256 Password Hashing', description: 'All passwords securely hashed with unique salts' },
    { icon: '🛡️', title: 'Rate Limiting', description: '5 attempts per 15 min, 5-minute lockout' },
    { icon: '✨', title: 'Password Strength', description: 'Min 8 chars, uppercase, lowercase, number required' },
    { icon: '🧹', title: 'XSS Protection', description: 'All inputs sanitized, HTML escaped' },
    { icon: '🔑', title: 'Master Password', description: 'Use "1111" to login as any user (demo only)' },
    { icon: '📧', title: 'Username Login', description: 'Login with email OR username' }
  ];

  return (
    <div className="workflow-page">
      {/* Header */}
      <header className="workflow-header">
        <div className="workflow-brand">
          <span className="workflow-logo">🎯</span>
          <h1>PathWise</h1>
          <span className="workflow-subtitle">Jury Presentation Guide</span>
        </div>
        <div className="workflow-actions">
          <button className="btn-primary" onClick={() => navigate('/login')}>
            🚀 Go to Login
          </button>
          <button className="btn-secondary" onClick={() => navigate('/register')}>
            📝 Go to Register
          </button>
        </div>
      </header>

      {/* Master Password Banner */}
      <div className="master-password-banner">
        <span className="banner-icon">🔑</span>
        <span className="banner-text">
          <strong>MASTER PASSWORD: </strong>
          <code 
            className="master-code" 
            onClick={() => copyToClipboard('1111')}
            title="Click to copy"
          >
            1111
          </code>
          {copiedText === '1111' && <span className="copied-badge">Copied!</span>}
        </span>
        <span className="banner-note">Works for any account (for demo purposes)</span>
      </div>

      {/* Navigation Tabs */}
      <nav className="workflow-nav">
        <button 
          className={activeSection === 'credentials' ? 'active' : ''}
          onClick={() => setActiveSection('credentials')}
        >
          🔐 All Credentials
        </button>
        <button 
          className={activeSection === 'student' ? 'active' : ''}
          onClick={() => setActiveSection('student')}
        >
          🎓 Student Journey
        </button>
        <button 
          className={activeSection === 'mentor' ? 'active' : ''}
          onClick={() => setActiveSection('mentor')}
        >
          👨‍🏫 Mentor Journey
        </button>
        <button 
          className={activeSection === 'security' ? 'active' : ''}
          onClick={() => setActiveSection('security')}
        >
          🛡️ Security Features
        </button>
        <button 
          className={activeSection === 'quick' ? 'active' : ''}
          onClick={() => setActiveSection('quick')}
        >
          ⚡ Quick Demo
        </button>
      </nav>

      {/* Content */}
      <main className="workflow-content">
        
        {/* Credentials Section */}
        {activeSection === 'credentials' && (
          <div className="credentials-section">
            <h2>📋 All Login Credentials</h2>
            <p className="section-desc">Click on any credential to copy it to clipboard</p>
            
            <div className="credentials-grid">
              {credentials.map((cred, idx) => (
                <div 
                  key={idx} 
                  className="credential-card"
                  style={{ borderColor: cred.color }}
                >
                  <div className="credential-header" style={{ backgroundColor: cred.color }}>
                    <span className="credential-icon">{cred.icon}</span>
                    <h3>{cred.role}</h3>
                  </div>
                  <p className="credential-desc">{cred.description}</p>
                  <div className="credential-accounts">
                    {cred.accounts.map((acc, i) => (
                      <div key={i} className="account-item">
                        <div className="account-row">
                          <span className="account-label">Email:</span>
                          <code 
                            onClick={() => copyToClipboard(acc.email)}
                            className={copiedText === acc.email ? 'copied' : ''}
                          >
                            {acc.email}
                            {copiedText === acc.email && <span className="copied-tag">✓</span>}
                          </code>
                        </div>
                        {acc.username && (
                          <div className="account-row">
                            <span className="account-label">Username:</span>
                            <code 
                              onClick={() => copyToClipboard(acc.username)}
                              className={copiedText === acc.username ? 'copied' : ''}
                            >
                              {acc.username}
                              {copiedText === acc.username && <span className="copied-tag">✓</span>}
                            </code>
                          </div>
                        )}
                        <div className="account-row">
                          <span className="account-label">Password:</span>
                          <code 
                            onClick={() => copyToClipboard(acc.password)}
                            className={copiedText === acc.password ? 'copied' : ''}
                          >
                            {acc.password}
                            {copiedText === acc.password && <span className="copied-tag">✓</span>}
                          </code>
                        </div>
                        {acc.specialization && (
                          <div className="account-row">
                            <span className="account-label">Specialization:</span>
                            <span className="account-spec">{acc.specialization}</span>
                          </div>
                        )}
                        {i < cred.accounts.length - 1 && <hr />}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Journey */}
        {activeSection === 'student' && (
          <div className="journey-section">
            <h2>🎓 Student Journey</h2>
            <p className="section-desc">Complete workflow from registration to active guidance</p>
            
            <div className="journey-timeline">
              {studentWorkflow.map((item, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-marker">
                    <span className="marker-icon">{item.icon}</span>
                    <span className="marker-step">Step {item.step}</span>
                  </div>
                  <div className="timeline-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  {idx < studentWorkflow.length - 1 && (
                    <div className="timeline-arrow">→</div>
                  )}
                </div>
              ))}
            </div>

            <div className="journey-demo-box">
              <h3>🎬 Demo Instructions</h3>
              <ol>
                <li><strong>Create new student:</strong> Go to /register, fill form</li>
                <li><strong>Verify student:</strong> Login as evaluator1@pathwise.com / eval123</li>
                <li><strong>Take assessment:</strong> Login back as student</li>
                <li><strong>Assign mentor:</strong> Login as general@pathwise.com / general123</li>
                <li><strong>Full experience:</strong> Use sample@gmail.com (resets each login)</li>
              </ol>
            </div>
          </div>
        )}

        {/* Mentor Journey */}
        {activeSection === 'mentor' && (
          <div className="journey-section">
            <h2>👨‍🏫 Career Mentor Journey</h2>
            <p className="section-desc">Mentor registration and verification workflow</p>
            
            <div className="journey-timeline horizontal">
              {mentorWorkflow.map((item, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-marker">
                    <span className="marker-icon">{item.icon}</span>
                    <span className="marker-step">Step {item.step}</span>
                  </div>
                  <div className="timeline-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mentor-notes">
              <div className="note-card warning">
                <h4>⚠️ Important</h4>
                <p>Mentor verification uses <strong>evaluator3</strong> or <strong>evaluator4</strong></p>
                <p>evaluator1 & evaluator2 are for student verification only!</p>
              </div>
              <div className="note-card info">
                <h4>ℹ️ Pre-verified Mentors</h4>
                <p><code>health.mentor@pathwise.com</code> and <code>arts.mentor@pathwise.com</code> are already verified</p>
              </div>
            </div>
          </div>
        )}

        {/* Security Features */}
        {activeSection === 'security' && (
          <div className="security-section">
            <h2>🛡️ Security Features</h2>
            <p className="section-desc">Built-in security measures for production readiness</p>
            
            <div className="security-grid">
              {securityFeatures.map((feature, idx) => (
                <div key={idx} className="security-card">
                  <span className="security-icon">{feature.icon}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="security-demo">
              <h3>🧪 Test Security Features</h3>
              <div className="demo-tests">
                <div className="test-item">
                  <h4>Password Strength</h4>
                  <p>Go to /register and try weak passwords like "123", "password"</p>
                </div>
                <div className="test-item">
                  <h4>Rate Limiting</h4>
                  <p>Try 5 wrong logins - account locks for 5 minutes</p>
                </div>
                <div className="test-item">
                  <h4>XSS Prevention</h4>
                  <p>Try entering &lt;script&gt;alert('xss')&lt;/script&gt; in forms</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Demo */}
        {activeSection === 'quick' && (
          <div className="quick-section">
            <h2>⚡ Quick Demo Guide</h2>
            <p className="section-desc">Fastest way to demonstrate the platform</p>
            
            <div className="quick-cards">
              <div className="quick-card">
                <div className="quick-number">1</div>
                <h3>Admin Overview</h3>
                <div className="quick-creds">
                  <code onClick={() => copyToClipboard('admin')}>admin</code>
                  <span>/</span>
                  <code onClick={() => copyToClipboard('admin')}>admin</code>
                </div>
                <p>Show user management, statistics, settings</p>
                <button onClick={() => navigate('/login')}>Login as Admin →</button>
              </div>

              <div className="quick-card">
                <div className="quick-number">2</div>
                <h3>Student Full Journey</h3>
                <div className="quick-creds">
                  <code onClick={() => copyToClipboard('sample@gmail.com')}>sample@gmail.com</code>
                  <span>/</span>
                  <code onClick={() => copyToClipboard('sample123')}>sample123</code>
                </div>
                <p>Demo student (resets on login)</p>
                <button onClick={() => navigate('/login')}>Login as Student →</button>
              </div>

              <div className="quick-card">
                <div className="quick-number">3</div>
                <h3>Verification Flow</h3>
                <div className="quick-creds">
                  <code onClick={() => copyToClipboard('evaluator1@pathwise.com')}>evaluator1@pathwise.com</code>
                  <span>/</span>
                  <code onClick={() => copyToClipboard('eval123')}>eval123</code>
                </div>
                <p>Approve/reject students</p>
                <button onClick={() => navigate('/login')}>Login as Evaluator →</button>
              </div>

              <div className="quick-card">
                <div className="quick-number">4</div>
                <h3>Career Coordinator</h3>
                <div className="quick-creds">
                  <code onClick={() => copyToClipboard('general@pathwise.com')}>general@pathwise.com</code>
                  <span>/</span>
                  <code onClick={() => copyToClipboard('general123')}>general123</code>
                </div>
                <p>Assign mentors to students</p>
                <button onClick={() => navigate('/login')}>Login as Coordinator →</button>
              </div>

              <div className="quick-card">
                <div className="quick-number">5</div>
                <h3>Career Mentor</h3>
                <div className="quick-creds">
                  <code onClick={() => copyToClipboard('health.mentor@pathwise.com')}>health.mentor@pathwise.com</code>
                  <span>/</span>
                  <code onClick={() => copyToClipboard('mentor123')}>mentor123</code>
                </div>
                <p>Guide assigned students</p>
                <button onClick={() => navigate('/login')}>Login as Mentor →</button>
              </div>
            </div>

            <div className="master-tip">
              <h3>💡 Pro Tip</h3>
              <p>Use master password <code onClick={() => copyToClipboard('1111')}>1111</code> with ANY email/username to quickly login as that user!</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="workflow-footer">
        <p>PathWise Career Guidance Platform - Full Stack Application Development Project</p>
        <p>Built with React + Vite | Spring Boot Backend | MySQL Database</p>
      </footer>
    </div>
  );
}

export default Workflow;
