import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useToast } from '../context/ToastContext';

function StudentDashboard() {
  const navigate = useNavigate();
  const { 
    data, currentUser, interestAssessmentQuestions, careerMapping,
    saveTestResult, addChatMessage, saveInterestAssessment,
    calculateInterestScores, getInterestAssessment, STUDENT_STATUS,
    updateStudentStatus, refreshData, syncStatus, logout,
    loadConversation, requestMeeting, skipInterestAssessment
  } = useData();
  const { showToast } = useToast();
  
  // Site settings for dynamic branding
  const { settings } = useSiteSettings();

  const sanitizeChatMessage = (message) => {
    if (!message) return '';
    const lower = message.toLowerCase();
    if (lower.includes('instant video call') || message.includes('/call/pathwise')) {
      return 'Note: This is an old automatic meeting message from an earlier version. Please use the latest scheduled meeting details and external meeting link shared by your mentor.';
    }
    return message;
  };

  // Ensure meeting links open as proper external URLs (not localhost routes)
  const getExternalMeetingUrl = (raw) => {
    if (!raw) return '';
    const trimmed = raw.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    // Strip leading slashes like "/meeting.com" then prefix https
    return `https://${trimmed.replace(/^\/+/, '')}`;
  };
  
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('studentActiveTab');
    return saved || 'assessment';
  }); // Start with saved tab or assessment
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [chatMessage, setChatMessage] = useState('');
  const [currentSection, setCurrentSection] = useState('');
  const [meetingRequestForm, setMeetingRequestForm] = useState({
    topic: '',
    date: '',
    time: ''
  });
  const [showMeetingRequestForm, setShowMeetingRequestForm] = useState(false);

  // Protect route
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student') {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'student') {
    return null;
  }

  // Persist active tab so refresh returns to the same section
  useEffect(() => {
    if (currentUser && currentUser.role === 'student') {
      localStorage.setItem('studentActiveTab', activeTab);
    }
  }, [activeTab, currentUser?.id]);

  // Get current student data
  const student = data.users.find(u => u.id === currentUser?.id);
  const assignedCounsellor = student?.assignedCounsellor 
    ? data.users.find(u => u.id === student.assignedCounsellor) 
    : null;
  const generalCounsellor = data.users.find(u => u.role === 'general_counsellor');

  // Get student's interest assessment
  const myAssessment = getInterestAssessment(currentUser?.id);
  
  // Get student's test results, chats, and meetings
  const myResults = data.testResults.filter(r => r.studentId === currentUser?.id);
  
  // Chat with assigned counsellor or general counsellor
  const chatPartner = assignedCounsellor || generalCounsellor;
  const myChats = chatPartner 
    ? data.chats.filter(c => 
        (c.fromId === currentUser?.id && c.toId === chatPartner.id) ||
        (c.fromId === chatPartner.id && c.toId === currentUser?.id)
      ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    : [];
  const myMeetings = data.meetings.filter(m => 
    (m.participants?.includes(currentUser?.id) || m.studentId === currentUser?.id) &&
    m.meetingLink &&
    !(
      (m.title && m.title.toLowerCase().includes('instant video call')) ||
      (m.topic && m.topic.toLowerCase().includes('instant video call')) ||
      (m.meetingLink && m.meetingLink.startsWith('/call/pathwise'))
    )
  );

  // Check if student has had a meeting with general counsellor (completed)
  const hasCompletedMeetingWithGeneral = myMeetings.some(m => 
    m.status === 'completed' && 
    (m.counsellorId === generalCounsellor?.id || m.participants?.includes(generalCounsellor?.id))
  );

  // Determine student journey stage - check both local state AND backend flag
  const hasAssessment = !!myAssessment || !!student?.assessmentCompleted || !!student?.assessmentSkipped;
  const hasCounsellor = !!assignedCounsellor;
  // Student can access dashboard if they have a counsellor assigned (simplified flow)
  const canAccessDashboard = hasAssessment && hasCounsellor;

  // Get unique sections from questions
  const sections = [...new Set(interestAssessmentQuestions.map(q => q.section))];

  // Auto-refresh for pending verification status
  useEffect(() => {
    if (student?.studentStatus === 'pending_verification') {
      const interval = setInterval(() => {
        refreshData();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [student?.studentStatus, refreshData]);

  // Load chat history from backend when chat partner is available
  useEffect(() => {
    if (currentUser && chatPartner) {
      loadConversation(currentUser.id, chatPartner.id);
    }
  }, [currentUser?.id, chatPartner?.id]);

  // Lightweight polling to keep chat updated in real time
  useEffect(() => {
    if (!currentUser || !chatPartner) return;
    const interval = setInterval(() => {
      loadConversation(currentUser.id, chatPartner.id);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser?.id, chatPartner?.id]);

  // Lightweight polling to keep meetings (and chats) in sync
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      refreshData();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser?.id, refreshData]);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Multiple select answer toggle
  const toggleAnswer = (questionId, optionIndex) => {
    const current = answers[questionId] || [];
    if (current.includes(optionIndex)) {
      setAnswers({ ...answers, [questionId]: current.filter(i => i !== optionIndex) });
    } else {
      setAnswers({ ...answers, [questionId]: [...current, optionIndex] });
    }
  };

  // Update current section
  useEffect(() => {
    if (testStarted && interestAssessmentQuestions[currentQuestion]) {
      setCurrentSection(interestAssessmentQuestions[currentQuestion].section);
    }
  }, [currentQuestion, testStarted]);

  // Auto-navigate based on student progress
  useEffect(() => {
    const hasSavedTab = !!localStorage.getItem('studentActiveTab');

    if (!hasAssessment) {
      // If assessment not completed, force assessment tab
      if (activeTab !== 'assessment') {
        setActiveTab('assessment');
      }
      return;
    }

    if (hasAssessment && !hasCounsellor) {
      // Assessment done but no counsellor yet - avoid landing on locked dashboard
      if (activeTab === 'dashboard') {
        setActiveTab('chat');
      }
      return;
    }

    if (canAccessDashboard && !hasSavedTab && (activeTab === 'assessment' || activeTab === 'waiting')) {
      // First time after full access is granted, default to dashboard
      setActiveTab('dashboard');
    }
  }, [hasAssessment, hasCounsellor, canAccessDashboard, activeTab, student?.assessmentCompleted]);

  // Next question
  const nextQuestion = () => {
    if (currentQuestion < interestAssessmentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitAssessment();
    }
  };

  // Previous question
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Calculate and save assessment result
  const submitAssessment = () => {
    // Ensure user is logged in
    if (!currentUser) {
      showToast('Session expired. Please log in again.', 'error');
      navigate('/login');
      return;
    }
    
    // Check if at least some answers exist
    const answeredCount = Object.keys(answers).filter(k => answers[k]?.length > 0).length;
    
    if (answeredCount === 0) {
      if (!window.confirm('You haven\'t answered any questions. Submit anyway with default results?')) {
        return;
      }
    } else if (answeredCount < interestAssessmentQuestions.length) {
      if (!window.confirm(`You've answered ${answeredCount} of ${interestAssessmentQuestions.length} questions. Submit with current answers?`)) {
        return;
      }
    }
    
    console.log('Submitting assessment with answers:', answers);
    console.log('Current user:', currentUser);
    
    // Calculate scores
    const scores = calculateInterestScores(answers);
    console.log('Calculated scores:', scores);
    
    // Save interest assessment
    saveInterestAssessment(currentUser.id, {
      answers,
      sectionScores: scores.sectionScores,
      dominantTraits: scores.dominantTraits,
      suggestedFields: scores.suggestedFields,
      personalityInsights: scores.personalityInsights
    });

    // Also save as test result for backward compatibility
    const topCategory = scores.dominantTraits[0]?.trait || 'analytical';
    const careers = careerMapping[topCategory] || [];
    
    saveTestResult(currentUser.id, {
      answers,
      categoryCounts: scores.traitCounts,
      topCategory,
      recommendedCareers: careers,
      completedAt: new Date().toISOString()
    });

    console.log('Assessment saved successfully');
    
    setTestStarted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setActiveTab('results');
  };

  // Send chat message
  const sendMessage = () => {
    if (chatMessage.trim() && chatPartner) {
      addChatMessage(currentUser.id, chatPartner.id, chatMessage.trim());
      setChatMessage('');
    }
  };

  // Student meeting request to assigned counsellor
  const handleRequestMeeting = () => {
    if (!assignedCounsellor) {
      showToast('You can request meetings once a mentor is assigned.', 'info');
      return;
    }

    const { topic, date, time } = meetingRequestForm;
    if (!topic.trim() || !date || !time) {
      showToast('Please fill topic, date, and time for your meeting request.', 'error');
      return;
    }

    requestMeeting(currentUser.id, assignedCounsellor.id, {
      topic: topic.trim(),
      date,
      time
    });

    addChatMessage(
      currentUser.id,
      assignedCounsellor.id,
      `📬 Meeting request sent.\n\nTopic: ${topic.trim()}\nPreferred: ${date} at ${time}`
    );

    showToast('Your meeting request has been sent to your mentor.', 'success');
    setMeetingRequestForm({ topic: '', date: '', time: '' });
    setShowMeetingRequestForm(false);
  };

  // Get progress percentage
  const getProgress = () => {
    return ((currentQuestion + 1) / interestAssessmentQuestions.length) * 100;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      'pending_verification': '#fbbf24',
      'rejected': '#ef4444',
      [STUDENT_STATUS.VERIFIED]: '#60a5fa',
      [STUDENT_STATUS.ASSESSMENT_COMPLETED]: '#34d399',
      [STUDENT_STATUS.ASSIGNED_TO_GENERAL]: '#a78bfa',
      [STUDENT_STATUS.CHAT_EVALUATION]: '#f472b6',
      [STUDENT_STATUS.COUNSELLOR_ASSIGNED]: '#22d3ee',
      [STUDENT_STATUS.ACTIVE_GUIDANCE]: '#4ade80'
    };
    return colors[status] || '#94a3b8';
  };

  // Format status for display
  const formatStatus = (status) => {
    const labels = {
      'pending_verification': 'Pending Verification',
      'rejected': 'Registration Rejected',
      [STUDENT_STATUS.VERIFIED]: 'Profile Verified',
      [STUDENT_STATUS.ASSESSMENT_COMPLETED]: 'Assessment Complete',
      [STUDENT_STATUS.ASSIGNED_TO_GENERAL]: 'Profile Under Review',
      [STUDENT_STATUS.CHAT_EVALUATION]: 'In Consultation',
      [STUDENT_STATUS.COUNSELLOR_ASSIGNED]: 'Mentor Matched',
      [STUDENT_STATUS.ACTIVE_GUIDANCE]: 'Active Guidance'
    };
    return labels[status] || status;
  };

  // Extract platform / ID / password details from meeting
  const extractMeetingExtra = (meeting) => {
    const extra = {
      platform: meeting.platform || '',
      meetingId: meeting.meetingId || '',
      meetingPassword: meeting.meetingPassword || ''
    };

    if (meeting.description && (!extra.platform || !extra.meetingId || !extra.meetingPassword)) {
      const lines = meeting.description.split('\n').map(line => line.trim());
      lines.forEach(line => {
        const lower = line.toLowerCase();
        if (!extra.platform && lower.startsWith('platform:')) {
          extra.platform = line.substring(line.indexOf(':') + 1).trim();
        } else if (!extra.meetingId && lower.startsWith('meeting id:')) {
          extra.meetingId = line.substring(line.indexOf(':') + 1).trim();
        } else if (!extra.meetingPassword && (lower.startsWith('password:') || lower.startsWith('passcode:'))) {
          extra.meetingPassword = line.substring(line.indexOf(':') + 1).trim();
        }
      });
    }

    return extra;
  };

  // If student is pending verification or rejected, show appropriate screen
  if (student?.studentStatus === 'pending_verification') {
    return (
      <div className="verification-pending-page">
        <div className="verification-container">
          <div className="verification-header">
            <img src="/logo.png" alt="PathWise" className="verification-logo" />
            <h1>PathWise</h1>
          </div>
          <div className="verification-content">
            <div className="verification-icon pending">⏳</div>
            <h2>Verification Pending</h2>
            <p className="verification-message">
              Thank you for registering with PathWise! Your account is currently under review 
              by our verification team.
            </p>
            
            <div className="verification-info-box">
              <h3>What happens next?</h3>
              <ul>
                <li>✓ Our verification team will review your registration details</li>
                <li>✓ They will verify your student credentials</li>
                <li>✓ You'll receive access once approved</li>
                <li>✓ This usually takes 24-48 hours</li>
              </ul>
            </div>

            <div className="verification-details">
              <h3>Your Submission Details</h3>
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{student.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{student.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">College:</span>
                <span className="detail-value">{student.college || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Branch:</span>
                <span className="detail-value">{student.branch || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Submitted:</span>
                <span className="detail-value">{new Date(student.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="verification-note">
              <span className="note-icon">💡</span>
              <p>
                Page auto-refreshes every 5 seconds. Click refresh to check manually.
              </p>
            </div>

            <div className="verification-actions">
              <button className="btn-primary" onClick={refreshData}>
                🔄 Refresh Status
              </button>
              <button className="btn-secondary" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If student is rejected, show rejection screen
  if (student?.studentStatus === 'rejected') {
    return (
      <div className="verification-pending-page rejected">
        <div className="verification-container">
          <div className="verification-header">
            <img src="/logo.png" alt="PathWise" className="verification-logo" />
            <h1>PathWise</h1>
          </div>
          <div className="verification-content">
            <div className="verification-icon rejected">❌</div>
            <h2>Registration Rejected</h2>
            <p className="verification-message">
              Unfortunately, your registration could not be verified. Please review the 
              reason below and consider re-registering with correct information.
            </p>
            
            <div className="rejection-reason-box">
              <h3>Reason for Rejection:</h3>
              <p className="rejection-text">{student.rejectionReason || 'No reason provided.'}</p>
            </div>

            <div className="verification-info-box warning">
              <h3>What can you do?</h3>
              <ul>
                <li>Review the rejection reason carefully</li>
                <li>Ensure you have valid student credentials</li>
                <li>Re-register with accurate information</li>
                <li>Contact support if you believe this is an error</li>
              </ul>
            </div>

            <div className="verification-actions">
              <button className="btn-primary" onClick={() => {
                handleLogout();
                setTimeout(() => navigate('/register'), 100);
              }}>
                📝 Register Again
              </button>
              <button className="btn-secondary" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>

            <div className="verification-note">
              <span className="note-icon">📧</span>
              <p>
                If you believe this rejection was made in error, please contact 
                <strong> support@pathwise.com</strong> with your details.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no user (redirect will happen)
  if (!currentUser) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src={settings.logoUrl || "/logo.png"} alt={settings.siteName} className="logo-img" />
          <h2>{settings.siteName}</h2>
        </div>
        <div className="user-info">
          <div className="avatar">🎓</div>
          <span>{currentUser?.name || 'Student'}</span>
          {student?.studentStatus && (
            <span 
              className="status-pill"
              style={{ backgroundColor: getStatusColor(student.studentStatus) }}
            >
              {formatStatus(student.studentStatus)}
            </span>
          )}
        </div>
        
        {/* Sync Status Indicator */}
        <button 
          onClick={refreshData}
          className="sync-btn"
          style={{
            margin: '10px 15px',
            padding: '8px 15px',
            background: syncStatus === 'synced' ? '#27ae60' : syncStatus === 'syncing' ? '#f39c12' : syncStatus === 'error' ? '#e74c3c' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          {syncStatus === 'syncing' ? '⏳ Syncing...' : syncStatus === 'synced' ? '✅ Synced' : syncStatus === 'error' ? '⚠️ Offline' : '🔄 Sync Data'}
        </button>
        
        <nav className="sidebar-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => canAccessDashboard && setActiveTab('dashboard')}
            disabled={!canAccessDashboard}
            style={{ opacity: canAccessDashboard ? 1 : 0.5 }}
          >
            🏠 Dashboard {!canAccessDashboard && '🔒'}
          </button>
          <button className={activeTab === 'assessment' ? 'active' : ''} onClick={() => setActiveTab('assessment')}>
            📋 Interest Assessment
          </button>
          <button 
            className={activeTab === 'results' ? 'active' : ''} 
            onClick={() => hasAssessment && setActiveTab('results')}
            disabled={!hasAssessment}
            style={{ opacity: hasAssessment ? 1 : 0.5 }}
          >
            📊 My Results {!hasAssessment && '🔒'}
          </button>
          <button 
            className={activeTab === 'chat' ? 'active' : ''} 
            onClick={() => hasAssessment && setActiveTab('chat')}
            disabled={!hasAssessment}
            style={{ opacity: hasAssessment ? 1 : 0.5 }}
          >
            💬 Chat {!hasAssessment && '🔒'}
          </button>
          <button 
            className={activeTab === 'meetings' ? 'active' : ''} 
            onClick={() => hasAssessment && setActiveTab('meetings')}
            disabled={!hasAssessment}
            style={{ opacity: hasAssessment ? 1 : 0.5 }}
          >
            📅 Meetings {!hasAssessment && '🔒'}
          </button>
          <button 
            className={activeTab === 'skills' ? 'active' : ''} 
            onClick={() => hasAssessment && setActiveTab('skills')}
            disabled={!hasAssessment}
            style={{ opacity: hasAssessment ? 1 : 0.5 }}
          >
            🎯 Skill Assessment {!hasAssessment && '🔒'}
          </button>
          <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
            👤 Profile
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        
        {/* Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            {/* Welcome Banner */}
            {settings.dashboard.showWelcomeMessage && (
              <div className="welcome-banner">
                <h2>👋 {settings.dashboard.welcomeMessage.replace('{name}', currentUser?.name || 'Student')}</h2>
                <p>Track your progress and connect with your career mentor</p>
              </div>
            )}
            
            {!settings.dashboard.showWelcomeMessage && (
              <h1>Welcome, {currentUser?.name}!</h1>
            )}
            
            {/* Status Progress */}
            <div className="status-tracker">
              <h3>Your Journey</h3>
              <div className="status-steps">
                {Object.values(STUDENT_STATUS).map((status, index) => (
                  <div 
                    key={status}
                    className={`status-step ${student?.studentStatus === status ? 'current' : ''} 
                      ${Object.values(STUDENT_STATUS).indexOf(student?.studentStatus) > index ? 'completed' : ''}`}
                  >
                    <div className="step-number">{index + 1}</div>
                    <span>{formatStatus(status)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Cards */}
            {!myAssessment && (
              <div className="alert-card">
                <h3>📋 Complete Your Interest Assessment</h3>
                <p>Take the assessment to help us understand your career interests and match you with the right mentor.</p>
                <button className="btn-primary" onClick={() => setActiveTab('assessment')}>
                  Start Assessment
                </button>
              </div>
            )}

            {/* Mentor Info */}
            {assignedCounsellor ? (
              <div className="info-card counsellor-card">
                <h3>👨‍🏫 Your Career Mentor</h3>
                <div className="counsellor-info">
                  <div className="counsellor-avatar">👨‍🏫</div>
                  <div>
                    <p><strong>{assignedCounsellor.name}</strong></p>
                    <p>{assignedCounsellor.specialization || 'Career Guidance'}</p>
                    <button className="btn-secondary btn-small" onClick={() => setActiveTab('chat')}>
                      💬 Chat Now
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="info-card">
                <h3>⏳ Finding Your Career Mentor</h3>
                <p>Complete your assessment and our team will match you with a specialist mentor.</p>
              </div>
            )}

            {/* Quick Assessment Results */}
            {myAssessment && (
              <div className="info-card">
                <h3>📊 Your Interest Profile</h3>
                <div className="quick-results">
                  <div className="dominant-traits">
                    {myAssessment.dominantTraits.slice(0, 3).map((trait, i) => (
                      <span key={i} className="trait-badge">
                        {trait.trait.charAt(0).toUpperCase() + trait.trait.slice(1).replace('_', ' ')}
                        <small>{trait.percentage}%</small>
                      </span>
                    ))}
                  </div>
                </div>
                <button className="btn-link" onClick={() => setActiveTab('results')}>
                  View Full Report →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Waiting for Mentor Matching */}
        {activeTab === 'waiting' && (
          <div className="waiting-section">
            <div className="waiting-container">
              <div className="waiting-icon">⏳</div>
              <h1>Finding Your Perfect Match</h1>
              <p>Great job! You've completed your assessment and initial consultation.</p>
              <p>We are now matching you with a specialized career mentor based on your interests and goals.</p>
              
              <div className="waiting-progress">
                <div className="progress-step completed">
                  <span className="step-check">✓</span>
                  <span>Assessment Completed</span>
                </div>
                <div className="progress-step completed">
                  <span className="step-check">✓</span>
                  <span>Initial Consultation</span>
                </div>
                <div className="progress-step active">
                  <span className="step-spinner">⟳</span>
                  <span>Matching in Progress</span>
                </div>
              </div>

              <div className="waiting-info">
                <p>📧 You will be notified once your career mentor is assigned.</p>
                <p>💬 Meanwhile, you can continue chatting if you have any questions.</p>
              </div>

              <button className="btn-secondary" onClick={() => setActiveTab('chat')}>
                💬 Continue Chat
              </button>
            </div>
          </div>
        )}

        {/* Interest Assessment */}
        {activeTab === 'assessment' && (
          <div className="assessment-section">
            {myAssessment ? (
              <div className="assessment-completed">
                <div className="completion-icon">✅</div>
                <h1>Assessment Completed!</h1>
                <p>You have already completed the interest assessment on {new Date(myAssessment.completedAt).toLocaleDateString()}.</p>
                <button className="btn-primary" onClick={() => setActiveTab('results')}>
                  View Results
                </button>
              </div>
            ) : !testStarted ? (
              <div className="assessment-intro">
                <h1>Career Interest Assessment</h1>
                <div className="assessment-info">
                  <div className="info-item">
                    <span className="info-icon">📝</span>
                    <span>{interestAssessmentQuestions.length} Questions</span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">⏱️</span>
                    <span>~15-20 minutes</span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">✓</span>
                    <span>Multiple selections allowed</span>
                  </div>
                </div>
                
                <div className="assessment-sections">
                  <h3>Assessment Sections:</h3>
                  <div className="section-list">
                    {sections.map((section, index) => (
                      <div key={index} className="section-item">
                        <span className="section-num">{index + 1}</span>
                        <span>{section}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <p className="assessment-desc">
                  This comprehensive assessment will analyze your interests, personality traits, and career preferences 
                  to provide personalized recommendations and help match you with the right career mentor.
                </p>
                
                <div className="assessment-benefits">
                  <h3>What you'll get:</h3>
                  <ul>
                    <li>✔ Interest Score Breakdown</li>
                    <li>✔ Dominant Career Areas</li>
                    <li>✔ Personality Traits Analysis</li>
                    <li>✔ Suggested Career Fields</li>
                    <li>✔ Mentor Matching</li>
                  </ul>
                </div>
                
                <button className="btn-primary btn-large" onClick={() => setTestStarted(true)}>
                  Start Assessment
                </button>
              </div>
            ) : (
              <div className="assessment-test">
                {/* Progress Header */}
                <div className="assessment-header">
                  <div className="section-indicator">
                    <span className="current-section">{currentSection}</span>
                    <span className="question-count">Question {currentQuestion + 1} of {interestAssessmentQuestions.length}</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${getProgress()}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{Math.round(getProgress())}%</span>
                  </div>
                </div>

                {/* Question Card */}
                <div className="question-card">
                  <h2>{interestAssessmentQuestions[currentQuestion].question}</h2>
                  <p className="select-hint">Select all that apply to you:</p>

                  <div className="options-grid">
                    {interestAssessmentQuestions[currentQuestion].options.map((option, index) => (
                      <label 
                        key={index} 
                        className={`option-card ${(answers[interestAssessmentQuestions[currentQuestion].id] || []).includes(index) ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={(answers[interestAssessmentQuestions[currentQuestion].id] || []).includes(index)}
                          onChange={() => toggleAnswer(interestAssessmentQuestions[currentQuestion].id, index)}
                        />
                        <span className="option-content">
                          <span className="checkmark">✓</span>
                          <span className="option-text">{option}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="assessment-navigation">
                  <button 
                    className="nav-btn nav-btn-prev"
                    onClick={prevQuestion}
                    disabled={currentQuestion === 0}
                  >
                    ← Previous
                  </button>
                  
                  <div className="nav-center">
                    <div className="section-dots">
                      {interestAssessmentQuestions.map((_, i) => (
                        <span 
                          key={i}
                          className={`dot ${i === currentQuestion ? 'active' : ''} ${answers[interestAssessmentQuestions[i].id]?.length > 0 ? 'answered' : ''}`}
                          onClick={() => setCurrentQuestion(i)}
                        ></span>
                      ))}
                    </div>
                    <button 
                      className="skip-assessment-btn"
                      onClick={() => {
                        if (window.confirm('Skip assessment? You can take it later from your dashboard.')) {
                          skipInterestAssessment(student.id);
                          setActiveTab('chat');
                        }
                      }}
                    >
                      Skip for now →
                    </button>
                  </div>
                  
                  {currentQuestion === interestAssessmentQuestions.length - 1 ? (
                    <button 
                      className="nav-btn nav-btn-submit"
                      onClick={submitAssessment}
                    >
                      ✓ Submit Assessment
                    </button>
                  ) : (
                    <button 
                      className="nav-btn nav-btn-next"
                      onClick={nextQuestion}
                    >
                      Next →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {activeTab === 'results' && (
          <div className="results-section">
            <h1>My Assessment Results</h1>
            
            {!myAssessment ? (
              <div className="empty-state">
                <span className="empty-icon">📊</span>
                <p>No assessment results yet.</p>
                <button className="btn-primary" onClick={() => setActiveTab('assessment')}>
                  Take Assessment
                </button>
              </div>
            ) : (
              <div className="results-report">
                {/* Report Header */}
                <div className="report-header">
                  <div className="report-title">
                    <h2>Interest Assessment Report</h2>
                    <span className="report-date">
                      Completed: {new Date(myAssessment.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Dominant Traits */}
                <div className="report-section">
                  <h3>🎯 Your Dominant Traits</h3>
                  <div className="traits-chart">
                    {myAssessment.dominantTraits.map((trait, i) => (
                      <div key={i} className="trait-bar">
                        <div className="trait-label">
                          <span className="trait-name">
                            {trait.trait.charAt(0).toUpperCase() + trait.trait.slice(1).replace('_', ' ')}
                          </span>
                          <span className="trait-percentage">{trait.percentage}%</span>
                        </div>
                        <div className="bar-container">
                          <div 
                            className="bar-fill"
                            style={{ 
                              width: `${trait.percentage}%`,
                              backgroundColor: ['#6366f1', '#8b5cf6', '#a855f7'][i]
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested Fields */}
                <div className="report-section">
                  <h3>🚀 Suggested Career Fields</h3>
                  <div className="fields-grid">
                    {myAssessment.suggestedFields.map((field, i) => (
                      <div key={i} className="field-card">
                        <span className="field-rank">#{i + 1}</span>
                        <span className="field-name">{field.field}</span>
                        <span className="field-match">{field.percentage}% match</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personality Insights */}
                <div className="report-section">
                  <h3>💡 Personality Insights</h3>
                  <div className="insights-list">
                    {myAssessment.personalityInsights.map((insight, i) => (
                      <div key={i} className="insight-item">
                        <span className="insight-icon">✨</span>
                        <p>{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Careers */}
                {myResults.length > 0 && (
                  <div className="report-section">
                    <h3>💼 Recommended Careers</h3>
                    <div className="careers-list">
                      {myResults[myResults.length - 1].recommendedCareers.map((career, i) => (
                        <span key={i} className="career-tag">{career}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section Scores */}
                <div className="report-section">
                  <h3>📈 Section-wise Analysis</h3>
                  <div className="sections-analysis">
                    {Object.entries(myAssessment.sectionScores).map(([section, data]) => (
                      <div key={section} className="section-score-card">
                        <h4>{section}</h4>
                        <div className="section-traits">
                          {Object.entries(data.traits).slice(0, 3).map(([trait, count]) => (
                            <span key={trait} className="mini-trait">
                              {trait}: {count}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat */}
        {activeTab === 'chat' && (
          <div className="chat-section">
            <h1>Chat with Your Mentor</h1>
            
            {!chatPartner ? (
              <div className="empty-state">
                <span className="empty-icon">💬</span>
                <p>Chat will be available once you are connected to a mentor.</p>
              </div>
            ) : (
              <div className="chat-container">
                <div className="chat-header">
                  <span className="chat-avatar">👨‍🏫</span>
                  <div className="chat-partner-info">
                    <span className="partner-name">
                      {chatPartner.role === 'general_counsellor' ? 'Career Coordinator' : chatPartner.name}
                    </span>
                    <span className="partner-role">
                      {chatPartner.role === 'general_counsellor' ? 'Assigns specialized mentors' : chatPartner.specialization || 'Career Mentor'}
                    </span>
                  </div>
                </div>
                <div className="chat-actions">
                  <button
                    type="button"
                    className="btn-secondary btn-small"
                    onClick={() => setShowMeetingRequestForm(prev => !prev)}
                  >
                    📅 Request Meeting
                  </button>
                </div>

                {showMeetingRequestForm && (
                  <div className="meeting-request-card">
                    <p className="meeting-request-info">
                      Your mentor will schedule the call on Google Meet, Zoom, or another platform and share the meeting link, ID, and password (if any) with you in chat.
                    </p>
                    <div className="meeting-request-form">
                      <div className="form-group">
                        <label>Topic / Reason *</label>
                        <input
                          type="text"
                          value={meetingRequestForm.topic}
                          onChange={(e) => setMeetingRequestForm({ ...meetingRequestForm, topic: e.target.value })}
                          placeholder="e.g., Discuss career options after B.Tech"
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Preferred Date *</label>
                          <input
                            type="date"
                            value={meetingRequestForm.date}
                            onChange={(e) => setMeetingRequestForm({ ...meetingRequestForm, date: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Preferred Time *</label>
                          <input
                            type="time"
                            value={meetingRequestForm.time}
                            onChange={(e) => setMeetingRequestForm({ ...meetingRequestForm, time: e.target.value })}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-primary btn-small"
                        onClick={handleRequestMeeting}
                      >
                        Send Request
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="chat-messages">
                  {myChats.length === 0 ? (
                    <div className="no-messages">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    myChats.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`chat-bubble ${msg.fromId === currentUser?.id ? 'sent' : 'received'}`}
                      >
                        <p style={{ whiteSpace: 'pre-wrap' }}>{sanitizeChatMessage(msg.message)}</p>
                        <span className="chat-time">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="chat-input">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button className="btn-send" onClick={sendMessage} aria-label="Send message">
                    ➤
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Meetings */}
        {activeTab === 'meetings' && (
          <div className="meetings-section">
            <h1>Scheduled Meetings</h1>
            <p className="section-subtitle">
              All video or voice sessions happen on external tools like Google Meet or Zoom.
              Your mentor will share the meeting link, ID, and password (if needed) in the chat and inside each meeting card.
            </p>

            <div className="meetings-list">
              {myMeetings.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📅</span>
                  <p>No meetings scheduled yet.</p>
                  <p className="hint">Your career mentor will schedule meetings with you.</p>
                </div>
              ) : (
                myMeetings.map((meeting, index) => {
                  const extra = extractMeetingExtra(meeting);
                  return (
                    <div key={index} className={`meeting-card status-${meeting.status}`}>
                      <div className="meeting-info">
                        <h4>{meeting.topic || meeting.title}</h4>
                        <p>📅 {meeting.date} at {meeting.time}</p>
                        {extra.platform && (
                          <p>🧩 Platform: {extra.platform}</p>
                        )}
                        {extra.meetingId && (
                          <p>🆔 Meeting ID: {extra.meetingId}</p>
                        )}
                        {extra.meetingPassword && (
                          <p>🔑 Password: {extra.meetingPassword}</p>
                        )}
                        <div className="meeting-footer">
                          <span className={`status-badge ${meeting.status}`}>
                            {meeting.status}
                          </span>
                          {meeting.meetingLink && meeting.status === 'scheduled' && (
                            <a
                              href={getExternalMeetingUrl(meeting.meetingLink)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-primary btn-small"
                            >
                              Join Meeting
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Skill Assessment */}
        {activeTab === 'skills' && (
          <div className="skills-section">
            <h1>Skill Assessment</h1>
            <p className="section-subtitle">Evaluate your technical and soft skills to get personalized improvement recommendations.</p>
            
            <div className="skills-grid">
              <div className="skill-category-card">
                <div className="skill-icon">💻</div>
                <h3>Technical Skills</h3>
                <p>Assess your programming, data analysis, and technical abilities</p>
                <div className="skill-list">
                  <span className="skill-tag">Programming</span>
                  <span className="skill-tag">Data Analysis</span>
                  <span className="skill-tag">Problem Solving</span>
                  <span className="skill-tag">System Design</span>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setActiveTab('assessment');
                    setTestStarted(true);
                    setCurrentQuestion(0);
                  }}
                >
                  Start Assessment
                </button>
              </div>
              
              <div className="skill-category-card">
                <div className="skill-icon">🗣️</div>
                <h3>Communication Skills</h3>
                <p>Evaluate your verbal, written, and presentation skills</p>
                <div className="skill-list">
                  <span className="skill-tag">Public Speaking</span>
                  <span className="skill-tag">Writing</span>
                  <span className="skill-tag">Listening</span>
                  <span className="skill-tag">Negotiation</span>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setActiveTab('assessment');
                    setTestStarted(true);
                    setCurrentQuestion(0);
                  }}
                >
                  Start Assessment
                </button>
              </div>
              
              <div className="skill-category-card">
                <div className="skill-icon">🤝</div>
                <h3>Leadership Skills</h3>
                <p>Assess your team management and leadership qualities</p>
                <div className="skill-list">
                  <span className="skill-tag">Team Building</span>
                  <span className="skill-tag">Decision Making</span>
                  <span className="skill-tag">Conflict Resolution</span>
                  <span className="skill-tag">Mentoring</span>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setActiveTab('assessment');
                    setTestStarted(true);
                    setCurrentQuestion(0);
                  }}
                >
                  Start Assessment
                </button>
              </div>
              
              <div className="skill-category-card">
                <div className="skill-icon">🧠</div>
                <h3>Analytical Skills</h3>
                <p>Test your critical thinking and analytical abilities</p>
                <div className="skill-list">
                  <span className="skill-tag">Critical Thinking</span>
                  <span className="skill-tag">Research</span>
                  <span className="skill-tag">Logic</span>
                  <span className="skill-tag">Attention to Detail</span>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setActiveTab('assessment');
                    setTestStarted(true);
                    setCurrentQuestion(0);
                  }}
                >
                  Start Assessment
                </button>
              </div>
            </div>
            
            <div className="skills-info-card">
              <h3>📊 How Skill Assessment Works</h3>
              <ol>
                <li><strong>Choose a Category:</strong> Select the skill area you want to assess</li>
                <li><strong>Answer Questions:</strong> Complete scenario-based questions</li>
                <li><strong>Get Results:</strong> Receive a detailed skill report</li>
                <li><strong>Improvement Plan:</strong> Get personalized recommendations from your mentor</li>
              </ol>
            </div>
          </div>
        )}

        {/* Profile */}
        {activeTab === 'profile' && (
          <div className="profile-section">
            <h1>My Profile</h1>
            
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">🎓</div>
                <div className="profile-name">
                  <h2>{currentUser?.name}</h2>
                  <p>{currentUser?.email}</p>
                </div>
              </div>

              <div className="profile-details">
                <div className="detail-item">
                  <label>College</label>
                  <span>{student?.college || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <label>Branch</label>
                  <span>{student?.branch || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className="status-pill" style={{ backgroundColor: getStatusColor(student?.studentStatus) }}>
                    {formatStatus(student?.studentStatus)}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Career Goals</label>
                  <span>{student?.careerGoals || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <label>Achievements</label>
                  <span>{student?.achievements || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <label>Your Career Mentor</label>
                  <span>{assignedCounsellor?.name || 'Matching in progress'}</span>
                </div>
              </div>

              {/* Verification Notes from Evaluator */}
              {student?.verificationNotes && (
                <div className="profile-notes-section">
                  <h3>📝 Evaluator Notes</h3>
                  <div className="evaluator-note-box">
                    <p>{student.verificationNotes}</p>
                    <span className="note-meta">
                      Verified on: {student.verifiedAt ? new Date(student.verifiedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              )}

              {/* Flag Status (if flagged by counsellor/admin) */}
              {student?.flagged && (
                <div className="profile-flag-section">
                  <h3>🚩 Account Flag</h3>
                  <div className="flag-notice-box">
                    <p><strong>Reason:</strong> {student.flagReason || 'No reason provided'}</p>
                    {student.flaggedAt && (
                      <span className="note-meta">
                        Flagged on: {new Date(student.flaggedAt).toLocaleDateString()}
                      </span>
                    )}
                    <p className="flag-info">Your account has been flagged for review. Please contact your counsellor for more information.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Mobile Logout Button */}
      <button className="mobile-logout-btn" onClick={handleLogout} title="Logout">
        🚪
      </button>
    </div>
  );
}

export default StudentDashboard;
