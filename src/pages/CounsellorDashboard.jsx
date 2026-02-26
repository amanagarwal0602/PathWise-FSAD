import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useToast } from '../context/ToastContext';

function CounsellorDashboard() {
  const navigate = useNavigate();
  const { 
    data, currentUser, addChatMessage, 
    createMeeting, updateMeetingStatus, createGroup,
    getStudentNotes, getInterestAssessment, addStudentNote,
    refreshData
  } = useData();
  const { showToast } = useToast();
  
  // Site settings for dynamic branding
  const { settings } = useSiteSettings();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('general');
  const [meetingForm, setMeetingForm] = useState({ 
    title: '', 
    date: '', 
    time: '10:00', 
    type: 'individual',
    studentId: '',
    meetingLink: ''
  });
  const [groupForm, setGroupForm] = useState({ name: '', studentIds: [] });

  // Get counsellor's data
  const counsellor = data.users.find(u => u.id === currentUser?.id);

  // Auto-refresh for pending verification
  useEffect(() => {
    if (counsellor && counsellor.status === 'pending_verification') {
      const interval = setInterval(() => {
        refreshData();
      }, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [counsellor?.status, refreshData]);

  // Check if counsellor is pending verification
  if (counsellor && counsellor.status === 'pending_verification') {
    return (
      <div className="verification-pending-page">
        <div className="verification-pending-container">
          <div className="verification-icon">⏳</div>
          <h1>Verification Pending</h1>
          <p>Your Career Mentor account is currently under review.</p>
          <div className="verification-info">
            <div className="info-item">
              <span className="label">Name:</span>
              <span className="value">{counsellor.name}</span>
            </div>
            <div className="info-item">
              <span className="label">Email:</span>
              <span className="value">{counsellor.email}</span>
            </div>
            <div className="info-item">
              <span className="label">Specialization:</span>
              <span className="value">{counsellor.specialization || 'General'}</span>
            </div>
            <div className="info-item">
              <span className="label">Status:</span>
              <span className="value status-pending">Pending Verification</span>
            </div>
          </div>
          <p className="verification-note">
            A Mentor Verification Specialist will review your credentials and approve your account.
            This page will automatically refresh when your account is verified.
          </p>
          <div className="verification-actions">
            <button onClick={() => window.location.reload()} className="refresh-btn">
              🔄 Refresh Status
            </button>
            <button onClick={() => {
              localStorage.removeItem('currentUser');
              navigate('/login');
            }} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if counsellor was rejected
  if (counsellor && counsellor.status === 'rejected') {
    return (
      <div className="verification-pending-page">
        <div className="verification-pending-container rejected">
          <div className="verification-icon">❌</div>
          <h1>Application Rejected</h1>
          <p>Unfortunately, your Career Mentor application was not approved.</p>
          <div className="verification-info">
            <div className="info-item">
              <span className="label">Reason:</span>
              <span className="value">{counsellor.rejectionReason || 'No reason provided'}</span>
            </div>
          </div>
          <p className="verification-note">
            If you believe this was an error, please contact our support team.
          </p>
          <div className="verification-actions">
            <button onClick={() => {
              localStorage.removeItem('currentUser');
              navigate('/login');
            }} className="logout-btn">
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // My students (assigned to this counsellor by the Career Coordinator)
  const myStudents = data.users.filter(u => 
    u.role === 'student' && u.assignedCounsellor === currentUser?.id
  );

  // Meeting requests for this counsellor
  const meetingRequests = data.meetings.filter(m => 
    m.counsellorId === currentUser?.id && m.status === 'pending'
  );

  // All meetings for this counsellor
  const myMeetings = data.meetings.filter(m => m.counsellorId === currentUser?.id);

  // My groups
  const myGroups = data.groups.filter(g => g.counsellorId === currentUser?.id);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  // Get chat messages with selected student
  const getStudentChats = () => {
    if (!selectedStudent) return [];
    return data.chats.filter(c => 
      (c.fromId === currentUser?.id && c.toId === selectedStudent.id) ||
      (c.fromId === selectedStudent.id && c.toId === currentUser?.id)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  // Send chat message
  const sendMessage = () => {
    if (chatMessage.trim() && selectedStudent) {
      addChatMessage(currentUser.id, selectedStudent.id, chatMessage.trim());
      setChatMessage('');
    }
  };

  // Create meeting with link and notify student
  const handleCreateMeeting = () => {
    if (!meetingForm.title || !meetingForm.date || !meetingForm.meetingLink) {
      showToast('Please fill in Title, Date, and Meeting Link', 'error');
      return;
    }

    // For individual meetings, require student selection
    if (meetingForm.type === 'individual' && !meetingForm.studentId) {
      showToast('Please select a student for individual meeting', 'error');
      return;
    }

    // For group meetings, require group selection
    if (meetingForm.type === 'group' && groupForm.studentIds.length === 0) {
      showToast('Please select students for group meeting', 'error');
      return;
    }

    const participants = meetingForm.type === 'individual' 
      ? [parseInt(meetingForm.studentId)] 
      : groupForm.studentIds;

    // Create the meeting
    createMeeting(currentUser.id, {
      title: meetingForm.title,
      date: meetingForm.date,
      time: meetingForm.time,
      type: meetingForm.type,
      meetingLink: meetingForm.meetingLink,
      participants
    });

    // Send notification message to student(s)
    const meetingMessage = `📅 Meeting Scheduled!\n\nTitle: ${meetingForm.title}\nDate: ${meetingForm.date}\nTime: ${formatTime(meetingForm.time)}\n\n🔗 Meeting Link: ${meetingForm.meetingLink}\n\nPlease join on time!`;
    
    participants.forEach(studentId => {
      addChatMessage(currentUser.id, studentId, meetingMessage);
    });

    // Reset form
    setMeetingForm({ 
      title: '', 
      date: '', 
      time: '10:00', 
      type: 'individual',
      studentId: '',
      meetingLink: ''
    });
    setGroupForm({ ...groupForm, studentIds: [] });
    
    showToast('Meeting created and notification sent!', 'success');
  };

  // Format time for display
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  // Handle meeting request
  const handleMeetingRequest = (meetingId, status) => {
    updateMeetingStatus(meetingId, status);
    const meeting = data.meetings.find(m => m.id === meetingId);
    if (meeting && status === 'approved') {
      addChatMessage(currentUser.id, meeting.studentId, `✅ Your meeting request "${meeting.topic}" has been approved for ${meeting.date} at ${formatTime(meeting.time)}.`);
    } else if (meeting && status === 'rejected') {
      addChatMessage(currentUser.id, meeting.studentId, `❌ Your meeting request "${meeting.topic}" has been declined. Please request another time.`);
    }
    showToast(`Meeting ${status}!`, 'success');
  };

  // Share meeting link with student
  const shareMeetingLink = (meeting) => {
    if (!meeting.meetingLink) {
      showToast('No meeting link available for this meeting.', 'warning');
      return;
    }
    const msg = `🔗 Reminder: Meeting "${meeting.title}" on ${meeting.date} at ${formatTime(meeting.time)}\n\nJoin Link: ${meeting.meetingLink}`;
    meeting.participants?.forEach(studentId => {
      addChatMessage(currentUser.id, studentId, msg);
    });
    showToast('Meeting link shared with student(s)!', 'success');
  };

  // Create group
  const handleCreateGroup = () => {
    if (groupForm.name && groupForm.studentIds.length > 0) {
      createGroup(currentUser.id, groupForm.name, groupForm.studentIds);
      setGroupForm({ name: '', studentIds: [] });
      showToast('Group created!', 'success');
    }
  };

  // Toggle student selection for group
  const toggleGroupStudent = (studentId) => {
    if (groupForm.studentIds.includes(studentId)) {
      setGroupForm({ ...groupForm, studentIds: groupForm.studentIds.filter(id => id !== studentId) });
    } else {
      setGroupForm({ ...groupForm, studentIds: [...groupForm.studentIds, studentId] });
    }
  };

  // Get test results for a student
  const getStudentResults = (studentId) => {
    return data.testResults.filter(r => r.studentId === studentId);
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src={settings.logoUrl || "/logo.png"} alt={settings.siteName} className="logo-img" />
          <h2>{settings.siteName}</h2>
        </div>
        <div className="user-info">
          <div className="avatar">👨‍🏫</div>
          <span>{currentUser?.name || 'Career Mentor'}</span>
          <small>{counsellor?.specialization || 'General'}</small>
        </div>
        
        <nav className="sidebar-nav">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            🏠 Dashboard
          </button>
          <button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>
            👥 My Students
          </button>
          <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>
            💬 Chat
          </button>
          <button className={activeTab === 'meetings' ? 'active' : ''} onClick={() => setActiveTab('meetings')}>
            📅 Meetings
          </button>
          <button className={activeTab === 'groups' ? 'active' : ''} onClick={() => setActiveTab('groups')}>
            👨‍👩‍👧‍👦 Groups
          </button>
          <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
            📈 My Reports
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            {/* Welcome Banner for Counsellor */}
            {settings.dashboard.showWelcomeMessage && (
              <div className="welcome-banner counsellor-banner">
                <h2>👋 Welcome back, {currentUser?.name}!</h2>
                <p>Manage your students and track their career progress</p>
              </div>
            )}
            
            {!settings.dashboard.showWelcomeMessage && (
              <h1>Welcome, {currentUser?.name}!</h1>
            )}
            
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Students are assigned to you by the Career Coordinator based on your specialization.
            </p>
            
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">👥</span>
                <div>
                  <h3>{myStudents.length}</h3>
                  <p>My Students</p>
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
                <span className="stat-icon">👨‍👩‍👧‍👦</span>
                <div>
                  <h3>{myGroups.length}</h3>
                  <p>Groups</p>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">💬</span>
                <div>
                  <h3>{data.chats.filter(c => c.fromId === currentUser?.id || c.toId === currentUser?.id).length}</h3>
                  <p>Messages</p>
                </div>
              </div>
            </div>

            {meetingRequests.length > 0 && (
              <div className="alert-card">
                <h3>📅 Meeting Requests</h3>
                <p>You have {meetingRequests.length} pending meeting request(s).</p>
                <button className="btn-secondary" onClick={() => setActiveTab('meetings')}>
                  View Meetings
                </button>
              </div>
            )}
          </div>
        )}

        {/* My Students */}
        {activeTab === 'students' && (
          <div className="students-section">
            <h1>My Students</h1>
            
            {myStudents.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">👥</span>
                <p>No students assigned yet. The Career Coordinator will assign students to you based on your specialization.</p>
              </div>
            ) : (
              <div className="students-grid">
                {myStudents.map(student => {
                  const results = getStudentResults(student.id);
                  const assessment = getInterestAssessment(student.id);
                  const notes = getStudentNotes(student.id);
                  return (
                    <div key={student.id} className={`student-card ${student.flagged ? 'flagged-card' : ''}`}>
                      <div className="student-header">
                        <span className="student-avatar">
                          🎓
                          {student.flagged && <span className="flag-indicator">🚩</span>}
                        </span>
                        <div>
                          <h3>{student.name}</h3>
                          <p>{student.email}</p>
                          {student.flagged && (
                            <span className="flag-badge">🚩 Flagged</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="student-stats">
                        {assessment ? (
                          <>
                            <span>✅ Assessment Done</span>
                            <span>Profile: {assessment.dominantTraits?.[0]?.trait || 'N/A'}</span>
                          </>
                        ) : (
                          <span>⏳ Assessment Pending</span>
                        )}
                        {notes.length > 0 && <span>📝 {notes.length} Notes</span>}
                      </div>

                      {student.flagged && student.flagReason && (
                        <div className="flag-reason-box">
                          <strong>Flag Reason:</strong> {student.flagReason}
                        </div>
                      )}

                      <div className="student-actions">
                        <button 
                          className="btn-outline"
                          onClick={() => { setSelectedStudent(student); setShowStudentDetail(true); }}
                        >
                          📋 View Profile
                        </button>
                        <button 
                          className="btn-secondary"
                          onClick={() => { setSelectedStudent(student); setActiveTab('chat'); }}
                        >
                          💬 Chat
                        </button>
                        <button 
                          className="btn-primary"
                          onClick={() => { 
                            setMeetingForm({ ...meetingForm, studentId: student.id.toString(), type: 'individual' }); 
                            setActiveTab('meetings'); 
                          }}
                        >
                          📅 Schedule
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Chat */}
        {activeTab === 'chat' && (
          <div className="chat-section">
            <h1>Chat with Students</h1>
            
            <div className="chat-layout">
              {/* Student List */}
              <div className="chat-sidebar">
                <h3>Students</h3>
                {myStudents.length === 0 ? (
                  <p className="no-data">No students assigned.</p>
                ) : (
                  myStudents.map(student => (
                    <div 
                      key={student.id}
                      className={`chat-contact ${selectedStudent?.id === student.id ? 'active' : ''}`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <span className="contact-avatar">🎓</span>
                      <span>{student.name}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Area */}
              <div className="chat-main">
                {!selectedStudent ? (
                  <div className="no-selection">
                    <span>💬</span>
                    <p>Select a student to start chatting</p>
                  </div>
                ) : (
                  <>
                    <div className="chat-header">
                      <span>🎓</span>
                      <span>{selectedStudent.name}</span>
                    </div>
                    
                    <div className="chat-messages">
                      {getStudentChats().length === 0 ? (
                        <div className="no-messages">
                          <p>No messages yet.</p>
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
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Meetings */}
        {activeTab === 'meetings' && (
          <div className="meetings-section">
            <h1>Meetings</h1>
            
            {/* Create Meeting */}
            <div className="create-meeting-form">
              <h3>Create New Meeting</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Meeting Title *</label>
                  <input
                    type="text"
                    value={meetingForm.title}
                    onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                    placeholder="e.g., Career Counselling Session"
                  />
                </div>
                
                <div className="form-group">
                  <label>Meeting Type</label>
                  <select
                    value={meetingForm.type}
                    onChange={(e) => setMeetingForm({ ...meetingForm, type: e.target.value })}
                  >
                    <option value="individual">Individual (1 Student)</option>
                    <option value="group">Group (Multiple Students)</option>
                  </select>
                </div>

                {meetingForm.type === 'individual' && (
                  <div className="form-group">
                    <label>Select Student *</label>
                    <select
                      value={meetingForm.studentId}
                      onChange={(e) => setMeetingForm({ ...meetingForm, studentId: e.target.value })}
                    >
                      <option value="">-- Choose Student --</option>
                      {myStudents.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.name} ({student.email})
                        </option>
                      ))}
                    </select>
                    {myStudents.length === 0 && (
                      <small className="form-hint">No students available. Accept students first.</small>
                    )}
                  </div>
                )}

                {meetingForm.type === 'group' && (
                  <div className="form-group full-width">
                    <label>Select Students for Group Meeting *</label>
                    <div className="student-checkboxes">
                      {myStudents.map(student => (
                        <label key={student.id} className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={groupForm.studentIds.includes(student.id)}
                            onChange={() => toggleGroupStudent(student.id)}
                          />
                          <span>{student.name}</span>
                        </label>
                      ))}
                    </div>
                    {groupForm.studentIds.length > 0 && (
                      <small className="form-hint">{groupForm.studentIds.length} student(s) selected</small>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    min={getTodayDate()}
                  />
                </div>

                <div className="form-group">
                  <label>Time *</label>
                  <select
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                  >
                    <option value="09:00">9:00 AM</option>
                    <option value="09:30">9:30 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="10:30">10:30 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="14:30">2:30 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="15:30">3:30 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="16:30">4:30 PM</option>
                    <option value="17:00">5:00 PM</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Meeting Link * (Google Meet / Zoom / Teams)</label>
                  <input
                    type="url"
                    value={meetingForm.meetingLink}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  />
                  <small className="form-hint">Paste your meeting link here. The student will receive this link automatically.</small>
                </div>
              </div>
              
              <button className="btn-primary" onClick={handleCreateMeeting}>
                📅 Create Meeting & Notify Student
              </button>
            </div>

            {/* Meeting Requests from Students */}
            {meetingRequests.length > 0 && (
              <div className="meeting-requests">
                <h3>📬 Pending Meeting Requests</h3>
                {meetingRequests.map(meeting => {
                  const student = data.users.find(u => u.id === meeting.studentId);
                  return (
                    <div key={meeting.id} className="meeting-request-card">
                      <div className="meeting-info">
                        <h4>{meeting.topic}</h4>
                        <p>👤 From: {student?.name || 'Unknown'}</p>
                        <p>📅 Preferred: {meeting.date} at {formatTime(meeting.time)}</p>
                      </div>
                      <div className="meeting-actions">
                        <button 
                          className="btn-success"
                          onClick={() => handleMeetingRequest(meeting.id, 'approved')}
                        >
                          ✅ Accept
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={() => handleMeetingRequest(meeting.id, 'rejected')}
                        >
                          ❌ Decline
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* All Meetings */}
            <div className="all-meetings">
              <h3>📋 All Meetings</h3>
              {myMeetings.length === 0 ? (
                <p className="no-data">No meetings scheduled.</p>
              ) : (
                <div className="meetings-list">
                  {myMeetings.map(meeting => {
                    const participantNames = meeting.participants?.map(pId => {
                      const student = data.users.find(u => u.id === pId);
                      return student?.name || 'Unknown';
                    }).join(', ');

                    return (
                      <div key={meeting.id} className={`meeting-card status-${meeting.status}`}>
                        <div className="meeting-info">
                          <h4>{meeting.title || meeting.topic}</h4>
                          <p>👥 {participantNames || 'No participants'}</p>
                          <p>📅 {meeting.date} at {formatTime(meeting.time)}</p>
                          {meeting.meetingLink && (
                            <p>
                              🔗 <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                                Join Meeting
                              </a>
                            </p>
                          )}
                          <span className={`status-badge ${meeting.status}`}>
                            {meeting.status}
                          </span>
                        </div>
                        {meeting.meetingLink && (
                          <button 
                            className="btn-secondary btn-small"
                            onClick={() => shareMeetingLink(meeting)}
                          >
                            📤 Share Link Again
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Groups */}
        {activeTab === 'groups' && (
          <div className="groups-section">
            <h1>Student Groups</h1>
            
            {/* Create Group */}
            <div className="create-group-form">
              <h3>Create New Group</h3>
              <div className="form-group">
                <label>Group Name</label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="Enter group name"
                />
              </div>
              <div className="form-group">
                <label>Select Students</label>
                <div className="student-checkboxes">
                  {myStudents.map(student => (
                    <label key={student.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={groupForm.studentIds.includes(student.id)}
                        onChange={() => toggleGroupStudent(student.id)}
                      />
                      <span>{student.name}</span>
                    </label>
                  ))}
                </div>
                {myStudents.length === 0 && (
                  <p className="no-data">No students to add. Accept students first.</p>
                )}
              </div>
              <button 
                className="btn-primary" 
                onClick={handleCreateGroup}
                disabled={myStudents.length === 0}
              >
                Create Group
              </button>
            </div>

            {/* Existing Groups */}
            <div className="existing-groups">
              <h3>My Groups</h3>
              {myGroups.length === 0 ? (
                <p className="no-data">No groups created yet.</p>
              ) : (
                <div className="groups-grid">
                  {myGroups.map(group => (
                    <div key={group.id} className="group-card">
                      <h4>{group.name}</h4>
                      <p>{group.studentIds.length} students</p>
                      <ul className="group-members">
                        {group.studentIds.map(studentId => {
                          const student = data.users.find(u => u.id === studentId);
                          return student ? <li key={studentId}>{student.name}</li> : null;
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Reports Section */}
        {activeTab === 'reports' && (
          <div className="manage-section reports-section">
            <h1>My Reports & Progress</h1>
            
            {/* Summary Stats */}
            <div className="report-summary">
              <div className="report-stat-card">
                <h3>👥 My Students</h3>
                <span className="big-number">{myStudents.length}</span>
              </div>
              <div className="report-stat-card">
                <h3>📅 Total Meetings</h3>
                <span className="big-number">{myMeetings.length}</span>
                <div className="stat-breakdown">
                  <span className="positive">✓ {myMeetings.filter(m => m.status === 'completed').length} completed</span>
                </div>
              </div>
              <div className="report-stat-card">
                <h3>💬 Messages Sent</h3>
                <span className="big-number">{data.chats.filter(c => c.fromId === currentUser?.id).length}</span>
              </div>
              <div className="report-stat-card">
                <h3>👨‍👩‍👧‍👦 Groups</h3>
                <span className="big-number">{myGroups.length}</span>
              </div>
            </div>

            {/* Student Progress Report */}
            <div className="report-card">
              <div className="report-card-header">
                <h3>📊 Student Progress Summary</h3>
                <button className="btn-secondary btn-small" onClick={() => {
                  const reportData = myStudents.map(s => {
                    const assessment = data.interestAssessments?.find(a => a.studentId === s.id);
                    const studentMeetings = data.meetings.filter(m => m.participants?.includes(s.id) && m.counsellorId === currentUser?.id);
                    return {
                      name: s.name,
                      email: s.email,
                      status: s.studentStatus || 'active',
                      hasAssessment: assessment ? 'Yes' : 'No',
                      meetingsCount: studentMeetings.length,
                      flagged: s.flagged ? 'Yes' : 'No'
                    };
                  });
                  const csv = 'Name,Email,Status,Assessment,Meetings,Flagged\n' + 
                    reportData.map(r => `${r.name},${r.email},${r.status},${r.hasAssessment},${r.meetingsCount},${r.flagged}`).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'my_students_report.csv';
                  a.click();
                }}>
                  📥 Download CSV
                </button>
              </div>
              {myStudents.length === 0 ? (
                <p className="no-data">No students assigned yet.</p>
              ) : (
                <div className="report-table-container">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Status</th>
                        <th>Assessment</th>
                        <th>Meetings</th>
                        <th>Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myStudents.map(s => {
                        const assessment = data.interestAssessments?.find(a => a.studentId === s.id);
                        const studentMeetings = data.meetings.filter(m => m.participants?.includes(s.id) && m.counsellorId === currentUser?.id);
                        return (
                          <tr key={s.id} className={s.flagged ? 'flagged-row' : ''}>
                            <td>
                              <strong>{s.name}</strong>
                              <small>{s.email}</small>
                            </td>
                            <td>
                              <span className={`status-badge ${s.studentStatus || 'active'}`}>
                                {s.studentStatus || 'Active'}
                              </span>
                            </td>
                            <td>{assessment ? <span className="positive">✓ Done</span> : <span className="pending">Pending</span>}</td>
                            <td>{studentMeetings.length}</td>
                            <td>{s.flagged ? <span className="flag-indicator">🚩</span> : '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Meeting Summary */}
            <div className="report-card">
              <div className="report-card-header">
                <h3>📅 Meeting Summary</h3>
              </div>
              <div className="report-table-container">
                {myMeetings.length === 0 ? (
                  <p className="no-data">No meetings scheduled.</p>
                ) : (
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Students</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myMeetings.map(m => {
                        const participants = m.participants?.map(pId => data.users.find(u => u.id === pId)?.name).filter(Boolean).join(', ');
                        return (
                          <tr key={m.id}>
                            <td>{m.title || m.topic}</td>
                            <td>{participants || 'N/A'}</td>
                            <td>{m.date}</td>
                            <td><span className={`status-badge ${m.status}`}>{m.status}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Student Detail Modal */}
      {showStudentDetail && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowStudentDetail(false)}>
          <div className="modal student-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Profile</h2>
              <button className="close-btn" onClick={() => setShowStudentDetail(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Basic Info */}
              <div className="profile-section">
                <div className="profile-header-card">
                  <div className="profile-avatar-large">🎓</div>
                  <div className="profile-basic-info">
                    <h3>{selectedStudent.name}</h3>
                    <p>{selectedStudent.email}</p>
                    <p>{selectedStudent.college || 'College N/A'} • {selectedStudent.branch || 'Branch N/A'}</p>
                    {selectedStudent.flagged && (
                      <span className="flag-badge large">🚩 Flagged Student</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Flag Information */}
              {selectedStudent.flagged && (
                <div className="profile-section flag-section">
                  <h4>🚩 Flag Information</h4>
                  <div className="flag-details">
                    <p><strong>Reason:</strong> {selectedStudent.flagReason || 'No reason provided'}</p>
                    {selectedStudent.flaggedAt && (
                      <p><strong>Flagged On:</strong> {new Date(selectedStudent.flaggedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Evaluator Verification Notes */}
              {(selectedStudent.verificationNotes || selectedStudent.rejectionReason) && (
                <div className="profile-section evaluator-notes-section">
                  <h4>📋 Evaluator Notes</h4>
                  <div className="evaluator-notes-box">
                    {selectedStudent.verificationNotes && (
                      <div className="eval-note approved">
                        <span className="eval-note-label">✅ Verification Notes:</span>
                        <p>{selectedStudent.verificationNotes}</p>
                      </div>
                    )}
                    {selectedStudent.rejectionReason && (
                      <div className="eval-note rejected">
                        <span className="eval-note-label">❌ Rejection Reason:</span>
                        <p>{selectedStudent.rejectionReason}</p>
                      </div>
                    )}
                    {selectedStudent.verifiedAt && (
                      <span className="eval-note-meta">
                        Verified on: {new Date(selectedStudent.verifiedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Assessment Results */}
              <div className="profile-section">
                <h4>📊 Assessment Results</h4>
                {(() => {
                  const assessment = getInterestAssessment(selectedStudent.id);
                  if (!assessment) return <p className="no-data">Assessment not completed yet.</p>;
                  return (
                    <div className="assessment-summary">
                      <div className="traits-display">
                        <strong>Dominant Traits:</strong>
                        <div className="trait-tags">
                          {assessment.dominantTraits?.map((trait, i) => (
                            <span key={i} className="trait-tag">
                              {trait.trait} ({trait.percentage}%)
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="fields-display">
                        <strong>Suggested Fields:</strong>
                        <div className="field-tags">
                          {assessment.suggestedFields?.map((field, i) => (
                            <span key={i} className="field-tag">
                              {field.field} ({field.percentage}%)
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="insights-display">
                        <strong>Personality Insights:</strong>
                        <ul>
                          {assessment.personalityInsights?.map((insight, i) => (
                            <li key={i}>{insight}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Notes from General Counsellor */}
              <div className="profile-section">
                <h4>📝 Notes & Comments</h4>
                {(() => {
                  const notes = getStudentNotes(selectedStudent.id);
                  if (notes.length === 0) return <p className="no-data">No notes yet.</p>;
                  return (
                    <div className="notes-list-view">
                      {notes.map((note, i) => {
                        const author = data.users.find(u => u.id === note.authorId);
                        return (
                          <div key={i} className={`note-card ${note.noteType}`}>
                            <div className="note-meta">
                              <span className="note-author">{author?.name || 'System'}</span>
                              <span className="note-type-badge">{note.noteType}</span>
                              <span className="note-date">{new Date(note.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="note-content">{note.content}</p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Add Note Section for Counsellor */}
              <div className="profile-section add-note-section">
                <h4>➕ Add Note</h4>
                <div className="add-note-form">
                  <select value={noteType} onChange={(e) => setNoteType(e.target.value)}>
                    <option value="general">General</option>
                    <option value="progress">Progress Update</option>
                    <option value="important">Important</option>
                  </select>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this student..."
                    rows={3}
                  />
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      if (newNote.trim()) {
                        addStudentNote(selectedStudent.id, currentUser.id, newNote.trim(), noteType);
                        setNewNote('');
                        showToast('Note added successfully!', 'success');
                      }
                    }}
                  >
                    Add Note
                  </button>
                </div>
              </div>

              {/* Student Status */}
              <div className="profile-section">
                <h4>📋 Student Status</h4>
                <div className="status-info">
                  <p><strong>Journey Stage:</strong> {selectedStudent.guidanceStage || 'Initial'}</p>
                  <p><strong>Status:</strong> {selectedStudent.studentStatus || 'Active'}</p>
                  <p><strong>Registered:</strong> {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setShowStudentDetail(false); setSelectedStudent(selectedStudent); setActiveTab('chat'); }}>
                💬 Chat with Student
              </button>
              <button className="btn-primary" onClick={() => setShowStudentDetail(false)}>
                Close
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

export default CounsellorDashboard;
