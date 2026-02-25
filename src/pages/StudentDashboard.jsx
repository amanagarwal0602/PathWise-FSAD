import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

function StudentDashboard() {
  const navigate = useNavigate();
  const { 
    data, currentUser, interestAssessmentQuestions, careerMapping,
    saveTestResult, addChatMessage, saveInterestAssessment,
    calculateInterestScores, getInterestAssessment, STUDENT_STATUS,
    updateStudentStatus
  } = useData();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [chatMessage, setChatMessage] = useState('');
  const [currentSection, setCurrentSection] = useState('');

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
    m.participants?.includes(currentUser?.id) || m.studentId === currentUser?.id
  );

  // Get unique sections from questions
  const sections = [...new Set(interestAssessmentQuestions.map(q => q.section))];

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
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
    const scores = calculateInterestScores(answers);
    
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

  // Get progress percentage
  const getProgress = () => {
    return ((currentQuestion + 1) / interestAssessmentQuestions.length) * 100;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      [STUDENT_STATUS.REGISTERED]: '#fbbf24',
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
      [STUDENT_STATUS.REGISTERED]: 'Registered',
      [STUDENT_STATUS.VERIFIED]: 'Verified',
      [STUDENT_STATUS.ASSESSMENT_COMPLETED]: 'Assessment Done',
      [STUDENT_STATUS.ASSIGNED_TO_GENERAL]: 'Under Review',
      [STUDENT_STATUS.CHAT_EVALUATION]: 'In Evaluation',
      [STUDENT_STATUS.COUNSELLOR_ASSIGNED]: 'Counsellor Assigned',
      [STUDENT_STATUS.ACTIVE_GUIDANCE]: 'Active Guidance'
    };
    return labels[status] || status;
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/logo.png" alt="PathWise" className="logo-img" />
          <h2>PathWise</h2>
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
        
        <nav className="sidebar-nav">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            🏠 Dashboard
          </button>
          <button className={activeTab === 'assessment' ? 'active' : ''} onClick={() => setActiveTab('assessment')}>
            📋 Interest Assessment
          </button>
          <button className={activeTab === 'results' ? 'active' : ''} onClick={() => setActiveTab('results')}>
            📊 My Results
          </button>
          <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>
            💬 Chat
          </button>
          <button className={activeTab === 'meetings' ? 'active' : ''} onClick={() => setActiveTab('meetings')}>
            📅 Meetings
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
            <h1>Welcome, {currentUser?.name}!</h1>
            
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
            
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">📋</span>
                <div>
                  <h3>{myAssessment ? '✓' : 'Pending'}</h3>
                  <p>Assessment</p>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">📅</span>
                <div>
                  <h3>{myMeetings.length}</h3>
                  <p>Meetings</p>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">💬</span>
                <div>
                  <h3>{myChats.length}</h3>
                  <p>Messages</p>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">👨‍🏫</span>
                <div>
                  <h3>{assignedCounsellor ? '✓' : 'Pending'}</h3>
                  <p>Counsellor</p>
                </div>
              </div>
            </div>

            {/* Action Cards */}
            {!myAssessment && (
              <div className="alert-card">
                <h3>📋 Complete Your Interest Assessment</h3>
                <p>Take the assessment to help us understand your career interests and match you with the right counsellor.</p>
                <button className="btn-primary" onClick={() => setActiveTab('assessment')}>
                  Start Assessment
                </button>
              </div>
            )}

            {/* Counsellor Info */}
            {assignedCounsellor ? (
              <div className="info-card counsellor-card">
                <h3>👨‍🏫 Your Assigned Counsellor</h3>
                <div className="counsellor-info">
                  <div className="counsellor-avatar">👨‍🏫</div>
                  <div>
                    <p><strong>{assignedCounsellor.name}</strong></p>
                    <p>{assignedCounsellor.specialization || 'General Guidance'}</p>
                    <button className="btn-secondary btn-small" onClick={() => setActiveTab('chat')}>
                      💬 Chat Now
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="info-card">
                <h3>⏳ Awaiting Counsellor Assignment</h3>
                <p>Complete your assessment and our general counsellor will assign you to a specialist.</p>
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
                  to provide personalized recommendations and help match you with the right career counsellor.
                </p>
                
                <div className="assessment-benefits">
                  <h3>What you'll get:</h3>
                  <ul>
                    <li>✔ Interest Score Breakdown</li>
                    <li>✔ Dominant Career Areas</li>
                    <li>✔ Personality Traits Analysis</li>
                    <li>✔ Suggested Career Fields</li>
                    <li>✔ Counsellor Recommendations</li>
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
                    className="btn-secondary"
                    onClick={prevQuestion}
                    disabled={currentQuestion === 0}
                  >
                    ← Previous
                  </button>
                  
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
                    className="btn-primary"
                    onClick={nextQuestion}
                    disabled={!(answers[interestAssessmentQuestions[currentQuestion].id]?.length > 0)}
                  >
                    {currentQuestion === interestAssessmentQuestions.length - 1 ? 'Submit Assessment' : 'Next →'}
                  </button>
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
            <h1>Chat with {chatPartner?.role === 'general_counsellor' ? 'General Counsellor' : 'Counsellor'}</h1>
            
            {!chatPartner ? (
              <div className="empty-state">
                <span className="empty-icon">💬</span>
                <p>Chat will be available once you are connected to a counsellor.</p>
              </div>
            ) : (
              <div className="chat-container">
                <div className="chat-header">
                  <span className="chat-avatar">👨‍🏫</span>
                  <div className="chat-partner-info">
                    <span className="partner-name">{chatPartner.name}</span>
                    <span className="partner-role">
                      {chatPartner.role === 'general_counsellor' ? 'General Counsellor' : chatPartner.specialization || 'Career Counsellor'}
                    </span>
                  </div>
                </div>
                
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
                        <p style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</p>
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
                  <button className="btn-send" onClick={sendMessage}>Send</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Meetings */}
        {activeTab === 'meetings' && (
          <div className="meetings-section">
            <h1>Scheduled Meetings</h1>
            
            <div className="meetings-list">
              {myMeetings.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📅</span>
                  <p>No meetings scheduled yet.</p>
                  <p className="hint">Your counsellor will schedule meetings with you.</p>
                </div>
              ) : (
                myMeetings.map((meeting, index) => (
                  <div key={index} className={`meeting-card status-${meeting.status}`}>
                    <div className="meeting-info">
                      <h4>{meeting.topic || meeting.title}</h4>
                      <p>📅 {meeting.date} at {meeting.time}</p>
                      <span className={`status-badge ${meeting.status}`}>
                        {meeting.status}
                      </span>
                      {meeting.meetingLink && meeting.status === 'scheduled' && (
                        <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="btn-primary btn-small">
                          Join Meeting
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
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
                  <label>Assigned Counsellor</label>
                  <span>{assignedCounsellor?.name || 'Pending assignment'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentDashboard;
