import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

function GeneralCounsellorDashboard() {
  const navigate = useNavigate();
  const { 
    data, currentUser, STUDENT_STATUS, interestAssessmentQuestions,
    addChatMessage, assignCounsellor, reassignCounsellor,
    addStudentNote, flagStudent, unflagStudent, updateGuidanceStage,
    addChatSummary, getStudentNotes, getInterestAssessment,
    getCounsellorRecommendations, updateStudentStatus, generateCounsellorRecommendations
  } = useData();
  
  // Site settings for dynamic branding
  const { settings } = useSiteSettings();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [summaryContent, setSummaryContent] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCounsellorId, setSelectedCounsellorId] = useState('');
  const [studentFilter, setStudentFilter] = useState('all');
  const chatEndRef = useRef(null);

  // Get all students
  const allStudents = data.users.filter(u => u.role === 'student');
  
  // Filter students based on status
  const filteredStudents = allStudents.filter(student => {
    if (studentFilter === 'all') return true;
    if (studentFilter === 'new') return student.studentStatus === STUDENT_STATUS.REGISTERED || student.studentStatus === STUDENT_STATUS.VERIFIED;
    if (studentFilter === 'assessment_done') return student.studentStatus === STUDENT_STATUS.ASSESSMENT_COMPLETED;
    if (studentFilter === 'chat_active') return student.studentStatus === STUDENT_STATUS.CHAT_EVALUATION;
    if (studentFilter === 'awaiting') return student.studentStatus === STUDENT_STATUS.ASSIGNED_TO_GENERAL;
    if (studentFilter === 'assigned') return student.studentStatus === STUDENT_STATUS.COUNSELLOR_ASSIGNED || student.studentStatus === STUDENT_STATUS.ACTIVE_GUIDANCE;
    if (studentFilter === 'flagged') return student.flagged;
    return true;
  });

  // Get all counsellors
  const counsellors = data.users.filter(u => u.role === 'counsellor' && u.status === 'active');

  // Get chats for selected student
  const getStudentChats = () => {
    if (!selectedStudent) return [];
    return data.chats.filter(c => 
      (c.fromId === currentUser?.id && c.toId === selectedStudent.id) ||
      (c.fromId === selectedStudent.id && c.toId === currentUser?.id)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedStudent, data.chats]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  // Send chat message
  const sendMessage = () => {
    if (chatMessage.trim() && selectedStudent) {
      addChatMessage(currentUser.id, selectedStudent.id, chatMessage.trim());
      setChatMessage('');
      // Update student status to chat evaluation if not already
      if (selectedStudent.studentStatus === STUDENT_STATUS.ASSESSMENT_COMPLETED) {
        updateStudentStatus(selectedStudent.id, STUDENT_STATUS.CHAT_EVALUATION);
      }
    }
  };

  // Add note for student
  const handleAddNote = () => {
    if (noteContent.trim() && selectedStudent) {
      addStudentNote(selectedStudent.id, currentUser.id, noteContent.trim(), 'general');
      setNoteContent('');
    }
  };

  // Add chat summary
  const handleAddSummary = () => {
    if (summaryContent.trim() && selectedStudent) {
      addChatSummary(selectedStudent.id, currentUser.id, summaryContent.trim());
      setSummaryContent('');
    }
  };

  // Flag student
  const handleFlagStudent = () => {
    if (flagReason.trim() && selectedStudent) {
      flagStudent(selectedStudent.id, flagReason.trim());
      setFlagReason('');
      setShowFlagModal(false);
    }
  };

  // Assign counsellor
  const handleAssignCounsellor = () => {
    if (selectedCounsellorId && selectedStudent) {
      assignCounsellor(selectedStudent.id, parseInt(selectedCounsellorId));
      setSelectedCounsellorId('');
      setShowAssignModal(false);
      // Refresh selected student data
      setSelectedStudent(data.users.find(u => u.id === selectedStudent.id));
    }
  };

  // Get status indicator
  const getStatusIndicator = (student) => {
    if (student.flagged) return { color: '#ef4444', label: 'Flagged' };
    
    const statusMap = {
      [STUDENT_STATUS.REGISTERED]: { color: '#fbbf24', label: 'New' },
      [STUDENT_STATUS.VERIFIED]: { color: '#60a5fa', label: 'Verified' },
      [STUDENT_STATUS.ASSESSMENT_COMPLETED]: { color: '#34d399', label: 'Assessment Done' },
      [STUDENT_STATUS.ASSIGNED_TO_GENERAL]: { color: '#a78bfa', label: 'Awaiting' },
      [STUDENT_STATUS.CHAT_EVALUATION]: { color: '#f472b6', label: 'Chat Active' },
      [STUDENT_STATUS.COUNSELLOR_ASSIGNED]: { color: '#22d3ee', label: 'Assigned' },
      [STUDENT_STATUS.ACTIVE_GUIDANCE]: { color: '#4ade80', label: 'Active' }
    };
    return statusMap[student.studentStatus] || { color: '#94a3b8', label: 'Unknown' };
  };

  // Get student assessment data
  const getStudentAssessment = (studentId) => {
    return getInterestAssessment(studentId);
  };

  // Get student's assigned counsellor
  const getAssignedCounsellor = (student) => {
    if (!student.assignedCounsellor) return null;
    return data.users.find(u => u.id === student.assignedCounsellor);
  };

  // Calculate stats
  const stats = {
    total: allStudents.length,
    new: allStudents.filter(s => s.studentStatus === STUDENT_STATUS.REGISTERED || s.studentStatus === STUDENT_STATUS.VERIFIED).length,
    assessmentDone: allStudents.filter(s => s.studentStatus === STUDENT_STATUS.ASSESSMENT_COMPLETED).length,
    chatActive: allStudents.filter(s => s.studentStatus === STUDENT_STATUS.CHAT_EVALUATION).length,
    assigned: allStudents.filter(s => s.studentStatus === STUDENT_STATUS.COUNSELLOR_ASSIGNED || s.studentStatus === STUDENT_STATUS.ACTIVE_GUIDANCE).length,
    flagged: allStudents.filter(s => s.flagged).length
  };

  return (
    <div className="dashboard-layout general-counsellor-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src={settings.logoUrl || "/logo.png"} alt={settings.siteName} className="logo-img" />
          <h2>{settings.siteName}</h2>
        </div>
        <div className="user-info">
          <div className="avatar">👨‍💼</div>
          <span>{currentUser?.name || 'Career Coordinator'}</span>
          <small className="role-badge">Career Coordinator</small>
        </div>
        
        <nav className="sidebar-nav">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => { setActiveTab('dashboard'); setSelectedStudent(null); }}>
            📊 Dashboard
          </button>
          <button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>
            👥 Students {stats.assessmentDone > 0 && <span className="badge">{stats.assessmentDone}</span>}
          </button>
          <button className={activeTab === 'counsellors' ? 'active' : ''} onClick={() => setActiveTab('counsellors')}>
            👨‍🏫 Career Mentors
          </button>
          <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
            📈 Reports
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      {/* Main Content Area with Student List and Detail View */}
      <div className="gc-main-area">
        {/* Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="gc-dashboard">
            {/* Welcome Banner */}
            {settings.dashboard.showWelcomeMessage && (
              <div className="welcome-banner coordinator-banner">
                <h2>👋 Welcome, {currentUser?.name}!</h2>
                <p>Your control center for student guidance and mentor assignment</p>
              </div>
            )}
            
            {!settings.dashboard.showWelcomeMessage && (
              <>
                <h1>Career Coordinator Dashboard</h1>
                <p className="subtitle">Control center for student guidance and mentor assignment</p>
              </>
            )}
            
            <div className="stats-grid gc-stats">
              <div className="stat-card" onClick={() => { setActiveTab('students'); setStudentFilter('all'); }}>
                <span className="stat-icon">👥</span>
                <div>
                  <h3>{stats.total}</h3>
                  <p>Total Students</p>
                </div>
              </div>
              <div className="stat-card highlight" onClick={() => { setActiveTab('students'); setStudentFilter('new'); }}>
                <span className="stat-icon">🆕</span>
                <div>
                  <h3>{stats.new}</h3>
                  <p>New Students</p>
                </div>
              </div>
              <div className="stat-card success" onClick={() => { setActiveTab('students'); setStudentFilter('assessment_done'); }}>
                <span className="stat-icon">📋</span>
                <div>
                  <h3>{stats.assessmentDone}</h3>
                  <p>Ready for Review</p>
                </div>
              </div>
              <div className="stat-card info" onClick={() => { setActiveTab('students'); setStudentFilter('chat_active'); }}>
                <span className="stat-icon">💬</span>
                <div>
                  <h3>{stats.chatActive}</h3>
                  <p>Chat Active</p>
                </div>
              </div>
              <div className="stat-card" onClick={() => { setActiveTab('students'); setStudentFilter('assigned'); }}>
                <span className="stat-icon">✅</span>
                <div>
                  <h3>{stats.assigned}</h3>
                  <p>Assigned</p>
                </div>
              </div>
              {stats.flagged > 0 && (
                <div className="stat-card danger" onClick={() => { setActiveTab('students'); setStudentFilter('flagged'); }}>
                  <span className="stat-icon">🚩</span>
                  <div>
                    <h3>{stats.flagged}</h3>
                    <p>Flagged</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="gc-actions">
              <h3>Priority Actions</h3>
              {stats.assessmentDone > 0 && (
                <div className="action-alert">
                  <span className="alert-icon">📋</span>
                  <div className="alert-content">
                    <strong>{stats.assessmentDone} students</strong> have completed assessment and are waiting for review.
                  </div>
                  <button className="btn-primary btn-small" onClick={() => { setActiveTab('students'); setStudentFilter('assessment_done'); }}>
                    Review Now
                  </button>
                </div>
              )}
              {stats.chatActive > 0 && (
                <div className="action-alert info">
                  <span className="alert-icon">💬</span>
                  <div className="alert-content">
                    <strong>{stats.chatActive} students</strong> are in active chat evaluation.
                  </div>
                  <button className="btn-secondary btn-small" onClick={() => { setActiveTab('students'); setStudentFilter('chat_active'); }}>
                    Continue Chats
                  </button>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="gc-recent">
              <h3>Recent Students</h3>
              <div className="recent-list">
                {allStudents.slice(-5).reverse().map(student => {
                  const status = getStatusIndicator(student);
                  return (
                    <div 
                      key={student.id} 
                      className="recent-item"
                      onClick={() => { setSelectedStudent(student); setActiveTab('students'); }}
                    >
                      <div className="recent-avatar">🎓</div>
                      <div className="recent-info">
                        <span className="recent-name">{student.name}</span>
                        <span className="recent-email">{student.email}</span>
                      </div>
                      <span className="status-dot" style={{ backgroundColor: status.color }}></span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Students View with Split Panel */}
        {activeTab === 'students' && (
          <div className="gc-students-view">
            {/* Student List Panel */}
            <div className="student-list-panel">
              <div className="panel-header">
                <h2>Students</h2>
                <select 
                  value={studentFilter} 
                  onChange={(e) => setStudentFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Students</option>
                  <option value="new">New</option>
                  <option value="assessment_done">Assessment Done</option>
                  <option value="chat_active">Chat Active</option>
                  <option value="awaiting">Awaiting Assignment</option>
                  <option value="assigned">Assigned</option>
                  <option value="flagged">Flagged</option>
                </select>
              </div>

              <div className="student-list">
                {filteredStudents.length === 0 ? (
                  <div className="empty-list">
                    <p>No students match this filter</p>
                  </div>
                ) : (
                  filteredStudents.map(student => {
                    const status = getStatusIndicator(student);
                    const hasUnreadChat = data.chats.some(c => 
                      c.fromId === student.id && c.toId === currentUser?.id
                    );
                    
                    return (
                      <div 
                        key={student.id}
                        className={`student-list-item ${selectedStudent?.id === student.id ? 'selected' : ''} ${student.flagged ? 'flagged' : ''}`}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="student-avatar">
                          🎓
                          {student.flagged && <span className="flag-icon">🚩</span>}
                        </div>
                        <div className="student-details">
                          <span className="student-name">{student.name}</span>
                          <span className="student-email">{student.email}</span>
                        </div>
                        <div className="student-status">
                          <span 
                            className="status-indicator"
                            style={{ backgroundColor: status.color }}
                          >
                            {status.label}
                          </span>
                          {hasUnreadChat && <span className="unread-dot"></span>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Student Detail Panel */}
            {selectedStudent ? (
              <div className="student-detail-panel">
                {/* Detail Header */}
                <div className="detail-header">
                  <div className="detail-avatar">🎓</div>
                  <div className="detail-info">
                    <h2>{selectedStudent.name}</h2>
                    <p>{selectedStudent.email}</p>
                    <div className="detail-badges">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusIndicator(selectedStudent).color }}
                      >
                        {getStatusIndicator(selectedStudent).label}
                      </span>
                      {selectedStudent.flagged && (
                        <span className="flag-badge">🚩 Flagged</span>
                      )}
                    </div>
                  </div>
                  <div className="detail-actions">
                    {!selectedStudent.flagged ? (
                      <button className="btn-icon" onClick={() => setShowFlagModal(true)} title="Flag Student">
                        🚩
                      </button>
                    ) : (
                      <button className="btn-icon" onClick={() => unflagStudent(selectedStudent.id)} title="Remove Flag">
                        ✅
                      </button>
                    )}
                    <button className="btn-primary" onClick={() => setShowAssignModal(true)}>
                      {selectedStudent.assignedCounsellor ? '🔄 Reassign' : '👨‍🏫 Assign'} Mentor
                    </button>
                  </div>
                </div>

                {/* Tabs for Detail View */}
                <div className="detail-tabs">
                  <button className="tab-btn active">📋 Profile</button>
                </div>

                {/* Detail Content */}
                <div className="detail-content">
                  {/* Personal & Academic Info */}
                  <div className="detail-section">
                    <h3>📚 Academic Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>College</label>
                        <span>{selectedStudent.college || 'Not specified'}</span>
                      </div>
                      <div className="info-item">
                        <label>Branch</label>
                        <span>{selectedStudent.branch || 'Not specified'}</span>
                      </div>
                      <div className="info-item">
                        <label>Career Goals</label>
                        <span>{selectedStudent.careerGoals || 'Not specified'}</span>
                      </div>
                      <div className="info-item">
                        <label>Achievements</label>
                        <span>{selectedStudent.achievements || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Info */}
                  {selectedStudent.verifiedBy && (
                    <div className="detail-section">
                      <h3>✅ Verification Details</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Verified By</label>
                          <span>
                            {(() => {
                              const evaluator = data.users.find(u => u.id === selectedStudent.verifiedBy);
                              return evaluator ? `${evaluator.name} (${evaluator.email})` : 'Verification Specialist';
                            })()}
                          </span>
                        </div>
                        <div className="info-item">
                          <label>Verified On</label>
                          <span>{selectedStudent.verifiedAt ? new Date(selectedStudent.verifiedAt).toLocaleString() : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interest Assessment Report */}
                  {(() => {
                    const assessment = getStudentAssessment(selectedStudent.id);
                    if (!assessment) {
                      return (
                        <div className="detail-section">
                          <h3>📋 Interest Assessment</h3>
                          <div className="empty-section">
                            <p>Assessment not completed yet</p>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="detail-section assessment-section">
                        <h3>📋 Interest Assessment Report</h3>
                        <div className="assessment-report">
                          {/* Dominant Traits */}
                          <div className="report-block">
                            <h4>Dominant Traits</h4>
                            <div className="traits-list">
                              {assessment.dominantTraits.map((trait, i) => (
                                <div key={i} className="trait-item">
                                  <span className="trait-name">
                                    {trait.trait.charAt(0).toUpperCase() + trait.trait.slice(1).replace('_', ' ')}
                                  </span>
                                  <div className="trait-bar">
                                    <div 
                                      className="trait-fill"
                                      style={{ width: `${trait.percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="trait-percent">{trait.percentage}%</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Suggested Fields */}
                          <div className="report-block">
                            <h4>Suggested Career Fields</h4>
                            <div className="fields-tags">
                              {assessment.suggestedFields.map((field, i) => (
                                <span key={i} className="field-tag">
                                  {field.field} <small>({field.percentage}%)</small>
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Personality Insights */}
                          <div className="report-block">
                            <h4>Personality Insights</h4>
                            <ul className="insights-list">
                              {assessment.personalityInsights.map((insight, i) => (
                                <li key={i}>{insight}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Assigned Mentor */}
                  {(() => {
                    const counsellor = getAssignedCounsellor(selectedStudent);
                    return (
                      <div className="detail-section">
                        <h3>👨‍🏫 Assigned Mentor</h3>
                        {counsellor ? (
                          <div className="counsellor-card">
                            <div className="counsellor-avatar">👨‍🏫</div>
                            <div className="counsellor-info">
                              <span className="counsellor-name">{counsellor.name}</span>
                              <span className="counsellor-spec">{counsellor.specialization}</span>
                            </div>
                            <button 
                              className="btn-secondary btn-small"
                              onClick={() => setShowAssignModal(true)}
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <div className="empty-section">
                            <p>No mentor assigned yet</p>
                            <button className="btn-primary btn-small" onClick={() => setShowAssignModal(true)}>
                              Assign Mentor
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Mentor Recommendations */}
                  {(() => {
                    const recommendations = getCounsellorRecommendations(selectedStudent.id);
                    if (recommendations.length === 0) return null;
                    
                    return (
                      <div className="detail-section">
                        <h3>🎯 Recommended Mentors</h3>
                        <div className="recommendations-list">
                          {recommendations.slice(0, 3).map((rec, i) => (
                            <div key={i} className="recommendation-card">
                              <div className="rec-header">
                                <span className="rec-name">{rec.counsellorName}</span>
                                <span className="match-score">{rec.matchScore}% Match</span>
                              </div>
                              <div className="rec-details">
                                <span className="rec-spec">{rec.specialization}</span>
                                <span className="rec-students">{rec.currentStudentCount} students</span>
                              </div>
                              <div className="rec-reasons">
                                {rec.matchReasons.slice(0, 2).map((reason, j) => (
                                  <span key={j} className="reason-tag">{reason}</span>
                                ))}
                              </div>
                              <button 
                                className="btn-primary btn-small"
                                onClick={() => {
                                  setSelectedCounsellorId(rec.counsellorId.toString());
                                  handleAssignCounsellor();
                                }}
                              >
                                Assign
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Chat Section */}
                  <div className="detail-section chat-section">
                    <h3>💬 Chat History</h3>
                    <div className="chat-container-inline">
                      <div className="chat-messages-inline">
                        {getStudentChats().length === 0 ? (
                          <div className="no-messages">
                            <p>No messages yet</p>
                          </div>
                        ) : (
                          getStudentChats().map((msg, index) => (
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
                        <div ref={chatEndRef} />
                      </div>
                      <div className="chat-input-inline">
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
                  </div>

                  {/* Notes Section */}
                  <div className="detail-section">
                    <h3>📝 Internal Notes</h3>
                    <div className="notes-container">
                      <div className="notes-list">
                        {getStudentNotes(selectedStudent.id).length === 0 ? (
                          <p className="no-notes">No notes yet</p>
                        ) : (
                          getStudentNotes(selectedStudent.id).map((note, i) => (
                            <div key={i} className={`note-item ${note.noteType}`}>
                              <div className="note-header">
                                <span className="note-type">{note.noteType}</span>
                                <span className="note-date">
                                  {new Date(note.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p>{note.content}</p>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="add-note">
                        <textarea
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                          placeholder="Add a note..."
                          rows={2}
                        />
                        <button className="btn-secondary btn-small" onClick={handleAddNote}>
                          Add Note
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Chat Summary */}
                  <div className="detail-section">
                    <h3>📋 Conversation Summary</h3>
                    <div className="summary-container">
                      <textarea
                        value={summaryContent}
                        onChange={(e) => setSummaryContent(e.target.value)}
                        placeholder="Write a summary of your conversation with this student..."
                        rows={3}
                      />
                      <button className="btn-primary btn-small" onClick={handleAddSummary}>
                        Save Summary
                      </button>
                    </div>
                  </div>

                  {/* Guidance Stage */}
                  <div className="detail-section">
                    <h3>📊 Guidance Stage</h3>
                    <select 
                      value={selectedStudent.guidanceStage || 'initial'}
                      onChange={(e) => updateGuidanceStage(selectedStudent.id, e.target.value)}
                      className="stage-select"
                    >
                      <option value="initial">Initial Contact</option>
                      <option value="assessment_review">Assessment Review</option>
                      <option value="career_exploration">Career Exploration</option>
                      <option value="counsellor_matching">Mentor Matching</option>
                      <option value="active_guidance">Active Guidance</option>
                      <option value="follow_up">Follow Up</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-selection-panel">
                <div className="no-selection-content">
                  <span className="no-selection-icon">👈</span>
                  <h3>Select a Student</h3>
                  <p>Click on a student from the list to view their details</p>
                </div>
              </div>
            )}

            {/* Side Panel (When chatting) */}
            {selectedStudent && (
              <div className="side-panel">
                {/* Student Snapshot */}
                <div className="snapshot-section">
                  <h4>Student Snapshot</h4>
                  <div className="snapshot-content">
                    <div className="snapshot-avatar">🎓</div>
                    <div className="snapshot-name">{selectedStudent.name}</div>
                    <div className="snapshot-college">{selectedStudent.college || 'College N/A'}</div>
                    <div className="snapshot-branch">{selectedStudent.branch || 'Branch N/A'}</div>
                    
                    {/* Interest Summary */}
                    {(() => {
                      const assessment = getStudentAssessment(selectedStudent.id);
                      if (!assessment) return <div className="snapshot-item">Assessment: Pending</div>;
                      return (
                        <div className="snapshot-interests">
                          <span className="snapshot-label">Top Interests:</span>
                          {assessment.suggestedFields.slice(0, 2).map((f, i) => (
                            <span key={i} className="interest-mini">{f.field}</span>
                          ))}
                        </div>
                      );
                    })()}
                    
                    {/* Personality Highlights */}
                    {(() => {
                      const assessment = getStudentAssessment(selectedStudent.id);
                      if (!assessment) return null;
                      return (
                        <div className="snapshot-personality">
                          <span className="snapshot-label">Personality:</span>
                          {assessment.dominantTraits.slice(0, 2).map((t, i) => (
                            <span key={i} className="trait-mini">
                              {t.trait.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                    
                    <div className="snapshot-status">
                      <span 
                        className="status-mini"
                        style={{ backgroundColor: getStatusIndicator(selectedStudent).color }}
                      >
                        {getStatusIndicator(selectedStudent).label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Counsellor Snapshot */}
                {(() => {
                  const counsellor = getAssignedCounsellor(selectedStudent);
                  if (!counsellor) return null;
                  
                  // Get session history
                  const meetings = data.meetings.filter(m => 
                    m.counsellorId === counsellor.id && 
                    (m.participants?.includes(selectedStudent.id) || m.studentId === selectedStudent.id)
                  );
                  
                  return (
                    <div className="snapshot-section counsellor-snapshot">
                      <h4>Mentor Snapshot</h4>
                      <div className="snapshot-content">
                        <div className="snapshot-avatar">👨‍🏫</div>
                        <div className="snapshot-name">{counsellor.name}</div>
                        <div className="snapshot-spec">{counsellor.specialization}</div>
                        <div className="snapshot-sessions">
                          Sessions: {meetings.length}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Career Mentors View */}
        {activeTab === 'counsellors' && (
          <div className="gc-counsellors">
            <h1>Career Mentors</h1>
            <p className="subtitle">View and manage mentor profiles</p>
            
            <div className="counsellors-grid">
              {counsellors.length === 0 ? (
                <div className="empty-state">
                  <p>No mentors available</p>
                </div>
              ) : (
                counsellors.map(counsellor => {
                  const studentCount = allStudents.filter(s => s.assignedCounsellor === counsellor.id).length;
                  const meetings = data.meetings.filter(m => m.counsellorId === counsellor.id);
                  
                  return (
                    <div key={counsellor.id} className="counsellor-profile-card">
                      <div className="profile-header">
                        <div className="profile-avatar">👨‍🏫</div>
                        <div className="profile-info">
                          <h3>{counsellor.name}</h3>
                          <p>{counsellor.email}</p>
                        </div>
                        <span className={`status-dot ${counsellor.status}`}></span>
                      </div>
                      
                      <div className="profile-details">
                        <div className="detail-row">
                          <span className="detail-label">Specialization</span>
                          <span className="detail-value">{counsellor.specialization}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Students</span>
                          <span className="detail-value">{studentCount}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Meetings</span>
                          <span className="detail-value">{meetings.length}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Status</span>
                          <span className={`detail-value status-${counsellor.status}`}>
                            {counsellor.status}
                          </span>
                        </div>
                      </div>

                      <div className="profile-students">
                        <h4>Assigned Students</h4>
                        <div className="mini-student-list">
                          {allStudents.filter(s => s.assignedCounsellor === counsellor.id).slice(0, 3).map(s => (
                            <span key={s.id} className="mini-student">{s.name}</span>
                          ))}
                          {studentCount > 3 && (
                            <span className="more-students">+{studentCount - 3} more</span>
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

        {/* Reports Section */}
        {activeTab === 'reports' && (
          <div className="gc-reports">
            <h1>Reports & Analytics</h1>
            <p className="subtitle">Overview of student progress and assignments</p>
            
            {/* Summary Stats */}
            <div className="report-summary">
              <div className="report-stat-card">
                <h3>👥 Total Students</h3>
                <span className="big-number">{stats.total}</span>
                <div className="stat-breakdown">
                  <span className="positive">✓ {stats.assigned} Assigned</span>
                  <span className="warning">⏳ {stats.total - stats.assigned} Pending</span>
                </div>
              </div>
              <div className="report-stat-card">
                <h3>📋 Assessments</h3>
                <span className="big-number">{stats.assessmentDone}</span>
                <div className="stat-breakdown">
                  <span>Ready for assignment</span>
                </div>
              </div>
              <div className="report-stat-card">
                <h3>👨‍🏫 Career Mentors</h3>
                <span className="big-number">{counsellors.length}</span>
              </div>
              <div className="report-stat-card">
                <h3>🚩 Flagged</h3>
                <span className="big-number">{allStudents.filter(s => s.flagged).length}</span>
              </div>
            </div>

            {/* Student Assignment Report */}
            <div className="report-card">
              <div className="report-card-header">
                <h3>📊 Student Assignment Report</h3>
                <button className="btn-secondary btn-small" onClick={() => {
                  const reportData = allStudents.map(s => {
                    const counsellor = data.users.find(u => u.id === s.assignedCounsellor);
                    const assessment = data.interestAssessments?.find(a => a.studentId === s.id);
                    return {
                      name: s.name,
                      email: s.email,
                      status: s.studentStatus || 'registered',
                      counsellor: counsellor?.name || 'Not Assigned',
                      hasAssessment: assessment ? 'Yes' : 'No',
                      flagged: s.flagged ? 'Yes' : 'No'
                    };
                  });
                  const csv = 'Name,Email,Status,Counsellor,Assessment,Flagged\n' + 
                    reportData.map(r => `${r.name},${r.email},${r.status},${r.counsellor},${r.hasAssessment},${r.flagged}`).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'student_assignment_report.csv';
                  a.click();
                }}>
                  📥 Download CSV
                </button>
              </div>
              <div className="report-table-container">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                      <th>Assessment</th>
                      <th>Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allStudents.map(s => {
                      const counsellor = data.users.find(u => u.id === s.assignedCounsellor);
                      const assessment = data.interestAssessments?.find(a => a.studentId === s.id);
                      return (
                        <tr key={s.id} className={s.flagged ? 'flagged-row' : ''}>
                          <td>
                            <strong>{s.name}</strong>
                            <small>{s.email}</small>
                          </td>
                          <td>
                            <span className={`status-badge ${s.studentStatus || 'registered'}`}>
                              {s.studentStatus || 'Registered'}
                            </span>
                          </td>
                          <td>{counsellor?.name || <span className="unassigned">Not Assigned</span>}</td>
                          <td>{assessment ? <span className="positive">✓ Done</span> : <span className="pending">Pending</span>}</td>
                          <td>{s.flagged ? <span className="flag-indicator">🚩</span> : '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Counsellor Workload */}
            <div className="report-card">
              <div className="report-card-header">
                <h3>👨‍🏫 Mentor Workload</h3>
              </div>
              <div className="report-table-container">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Mentor</th>
                      <th>Specialization</th>
                      <th>Students</th>
                      <th>Meetings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {counsellors.map(c => {
                      const studentCount = allStudents.filter(s => s.assignedCounsellor === c.id).length;
                      const meetings = data.meetings.filter(m => m.counsellorId === c.id);
                      return (
                        <tr key={c.id}>
                          <td>
                            <strong>{c.name}</strong>
                            <small>{c.email}</small>
                          </td>
                          <td>{c.specialization || 'General'}</td>
                          <td>{studentCount}</td>
                          <td>{meetings.length}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flag Modal */}
      {showFlagModal && (
        <div className="modal-overlay" onClick={() => setShowFlagModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>🚩 Flag Student for Special Attention</h3>
            <p>Student: <strong>{selectedStudent?.name}</strong></p>
            <textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Reason for flagging..."
              rows={3}
            />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowFlagModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleFlagStudent}>Flag Student</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Counsellor Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal assign-modal" onClick={e => e.stopPropagation()}>
            <h3>👨‍🏫 Assign Counsellor</h3>
            <p>Student: <strong>{selectedStudent?.name}</strong></p>
            
            {/* Recommendations */}
            {(() => {
              const recommendations = getCounsellorRecommendations(selectedStudent?.id);
              if (recommendations.length > 0) {
                return (
                  <div className="modal-recommendations">
                    <h4>Recommended Based on Assessment:</h4>
                    {recommendations.slice(0, 3).map((rec, i) => (
                      <div 
                        key={i} 
                        className={`rec-option ${selectedCounsellorId === rec.counsellorId.toString() ? 'selected' : ''}`}
                        onClick={() => setSelectedCounsellorId(rec.counsellorId.toString())}
                      >
                        <span className="rec-name">{rec.counsellorName}</span>
                        <span className="rec-match">{rec.matchScore}% match</span>
                        <span className="rec-spec">{rec.specialization}</span>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            })()}
            
            <div className="modal-select">
              <label>Or select manually:</label>
              <select 
                value={selectedCounsellorId}
                onChange={(e) => setSelectedCounsellorId(e.target.value)}
              >
                <option value="">-- Select Counsellor --</option>
                {counsellors.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.specialization}) - {allStudents.filter(s => s.assignedCounsellor === c.id).length} students
                  </option>
                ))}
              </select>
            </div>
            
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button 
                className="btn-primary" 
                onClick={handleAssignCounsellor}
                disabled={!selectedCounsellorId}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Logout Button */}
      <button className="mobile-logout-btn" onClick={handleLogout} title="Logout">
        🚪
      </button>
    </div>
  );
}

export default GeneralCounsellorDashboard;
