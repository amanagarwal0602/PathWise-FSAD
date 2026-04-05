import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useToast } from '../context/ToastContext';
import ProfilePasswordSection from '../components/ProfilePasswordSection';

function CounsellorDashboard() {
  const navigate = useNavigate();
  const { 
    data, currentUser, logout, addChatMessage, 
    createMeeting, updateMeetingStatus, createGroup,
    getStudentNotes, getInterestAssessment, addStudentNote,
    refreshData,
    updateUser,
    loadConversation
  } = useData();
  const { showToast } = useToast();
  
  // Site settings for dynamic branding
  const { settings } = useSiteSettings();

  const sanitizeChatMessage = (message) => {
    if (!message) return '';
    const lower = message.toLowerCase();
    if (lower.includes('instant video call') || message.includes('/call/pathwise')) {
      return 'Note: This is an old automatic meeting message from an earlier version. Please use the latest scheduled meeting details and external meeting link shared by the mentor.';
    }
    return message;
  };
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('counsellorActiveTab');
    return saved || 'dashboard';
  });
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
    meetingLink: '',
    platform: '',
    meetingId: '',
    meetingPassword: ''
  });
  const [groupForm, setGroupForm] = useState({ name: '', studentIds: [] });
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestMeetingForm, setRequestMeetingForm] = useState({
    title: '',
    date: '',
    time: '10:00',
    meetingLink: '',
    platform: '',
    meetingId: '',
    meetingPassword: ''
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    username: '',
    specialization: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileInitialised, setProfileInitialised] = useState(false);

  // Get counsellor's data
  const counsellor = data.users.find(u => u.id === currentUser?.id);

  // Persist active tab so refresh returns to the same section
  useEffect(() => {
    if (currentUser && currentUser.role === 'counsellor') {
      localStorage.setItem('counsellorActiveTab', activeTab);
    }
  }, [activeTab, currentUser?.id]);

  // Persist selected student in chat so refresh keeps the same conversation
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'counsellor') return;
    if (selectedStudent) {
      localStorage.setItem('counsellorSelectedStudentId', String(selectedStudent.id));
    } else {
      localStorage.removeItem('counsellorSelectedStudentId');
    }
  }, [selectedStudent?.id, currentUser?.id]);

  // Restore previously selected student in chat (if any)
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'counsellor') return;
    if (selectedStudent) return; // don't override manual selection
    const savedId = localStorage.getItem('counsellorSelectedStudentId');
    if (!savedId) return;
    const parsed = parseInt(savedId, 10);
    if (Number.isNaN(parsed)) return;
    const existing = data.users.find(u => u.id === parsed && u.role === 'student' && u.assignedCounsellor === currentUser.id);
    if (existing) {
      setSelectedStudent(existing);
    }
  }, [currentUser?.id, data.users, selectedStudent]);

  // Auto-refresh for pending verification
  useEffect(() => {
    if (counsellor && counsellor.status === 'pending_verification') {
      const interval = setInterval(() => {
        refreshData();
      }, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [counsellor?.status, refreshData]);

  // Lightweight polling to keep meetings in sync
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      refreshData();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser?.id, refreshData]);

  // Initialise editable profile details once counsellor data is available
  useEffect(() => {
    if (!profileInitialised && currentUser && counsellor) {
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        username: currentUser.username || '',
        specialization: counsellor.specialization || ''
      });
      setProfileInitialised(true);
    }
  }, [profileInitialised, currentUser, counsellor]);

  // Protect route
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'counsellor') {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'counsellor') {
    return null;
  }

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
            <button
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const normalizeMeetingLink = (raw) => {
    if (!raw) return '';
    const trimmed = raw.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

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
            <button
              onClick={() => {
                localStorage.removeItem('currentUser');
                navigate('/login');
              }}
              className="logout-btn"
            >
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

  // Try to link a chat "meeting request" message to the corresponding pending request
  const getMeetingRequestForChatMessage = (msg) => {
    if (!selectedStudent || !msg || !msg.message) return null;
    if (!msg.message.startsWith('📬 Meeting request sent.')) return null;

    const lines = msg.message.split('\n').map(l => l.trim());
    const topicLine = lines.find(l => l.toLowerCase().startsWith('topic:'));
    const preferredLine = lines.find(l => l.toLowerCase().startsWith('preferred:'));

    const topic = topicLine ? topicLine.substring(topicLine.indexOf(':') + 1).trim() : '';
    let date = '';
    let time = '';

    if (preferredLine) {
      // Expected format: "Preferred: YYYY-MM-DD at HH:MM" (24h) or similar
      const raw = preferredLine.substring(preferredLine.indexOf(':') + 1).trim();
      const match = raw.match(/(\d{4}-\d{2}-\d{2})\s+at\s+(.+)/i);
      if (match) {
        date = match[1];
        time = match[2].trim();
      }
    }

    return meetingRequests.find(m => 
      m.studentId === selectedStudent.id &&
      m.counsellorId === currentUser?.id &&
      (!topic || (m.topic || '').trim() === topic) &&
      (!date || m.date === date) &&
      (!time || m.time === time)
    ) || null;
  };

  // All meetings for this counsellor (only real external-link meetings)
  const myMeetings = data.meetings.filter(m => 
    m.counsellorId === currentUser?.id &&
    m.meetingLink &&
    !(
      (m.title && m.title.toLowerCase().includes('instant video call')) ||
      (m.meetingLink && m.meetingLink.startsWith('/call/pathwise'))
    )
  );

  // My groups
  const myGroups = data.groups.filter(g => g.counsellorId === currentUser?.id);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    const trimmedName = profileForm.name.trim();
    const trimmedEmail = profileForm.email.trim();
    const trimmedUsername = profileForm.username.trim();
    const trimmedSpec = profileForm.specialization.trim();

    if (!trimmedName || !trimmedEmail || !trimmedUsername) {
      showToast('Name, email and username are required.', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      const updated = await updateUser(currentUser.id, {
        name: trimmedName,
        email: trimmedEmail,
        username: trimmedUsername,
        specialization: trimmedSpec
      });

      if (updated) {
        showToast('Profile updated successfully.', 'success');
        setProfileForm(prev => ({
          ...prev,
          name: updated.name || '',
          email: updated.email || '',
          username: updated.username || '',
          specialization: updated.specialization || ''
        }));
      } else {
        showToast('Failed to update profile.', 'error');
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  // (Previously there was special polling for time-sensitive calls.
  // Now mentors simply use the standard meetings list with external links.)

  // Get chat messages with selected student
  const getStudentChats = () => {
    if (!selectedStudent) return [];
    return data.chats.filter(c => 
      (c.fromId === currentUser?.id && c.toId === selectedStudent.id) ||
      (c.fromId === selectedStudent.id && c.toId === currentUser?.id)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  // Load chat history when switching to chat tab or selecting a student
  useEffect(() => {
    if (activeTab === 'chat' && currentUser && selectedStudent) {
      loadConversation(currentUser.id, selectedStudent.id);
    }
  }, [activeTab, currentUser?.id, selectedStudent?.id]);

  // Lightweight polling to keep chat updated in real time while on Chat tab
  useEffect(() => {
    if (activeTab !== 'chat' || !currentUser || !selectedStudent) return;
    const interval = setInterval(() => {
      loadConversation(currentUser.id, selectedStudent.id);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab, currentUser?.id, selectedStudent?.id]);

  // Send chat message
  const sendMessage = () => {
    if (chatMessage.trim() && selectedStudent) {
      addChatMessage(currentUser.id, selectedStudent.id, chatMessage.trim());
      setChatMessage('');
    }
  };

  // From chat, mentors can jump into the Meetings tab
  // with the current student pre-selected and then paste
  // an external Google Meet / Zoom / Teams link there.

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

    const normalizedLink = normalizeMeetingLink(meetingForm.meetingLink);
    if (!normalizedLink) {
      showToast('Please enter a valid meeting link', 'error');
      return;
    }

    // Build human-readable details for description / chat
    const detailsLines = [
      `Title: ${meetingForm.title}`,
      `Date: ${meetingForm.date}`,
      `Time: ${formatTime(meetingForm.time)}`,
      `Link: ${normalizedLink}`
    ];
    if (meetingForm.platform) {
      detailsLines.push(`Platform: ${meetingForm.platform}`);
    }
    if (meetingForm.meetingId) {
      detailsLines.push(`Meeting ID: ${meetingForm.meetingId}`);
    }
    if (meetingForm.meetingPassword) {
      detailsLines.push(`Password: ${meetingForm.meetingPassword}`);
    }

    const description = detailsLines.join('\n');

    // Create the meeting
    createMeeting(currentUser.id, {
      title: meetingForm.title,
      date: meetingForm.date,
      time: meetingForm.time,
      type: meetingForm.type,
      meetingLink: normalizedLink,
      platform: meetingForm.platform,
      meetingId: meetingForm.meetingId,
      meetingPassword: meetingForm.meetingPassword,
      description,
      participants
    });

    // Send notification message to student(s)
    const meetingMessage = `📅 Meeting Scheduled!\n\n${detailsLines.join('\n')}\n\nPlease join on time!`;
    
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
      meetingLink: '',
      platform: '',
      meetingId: '',
      meetingPassword: ''
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

  // Handle meeting request (decline only - approvals use dialog with details)
  const handleMeetingRequest = (meetingId, status) => {
    updateMeetingStatus(meetingId, status);
    const meeting = data.meetings.find(m => m.id === meetingId);
    if (meeting && status === 'rejected') {
      addChatMessage(
        currentUser.id,
        meeting.studentId,
        `❌ Your meeting request "${meeting.topic}" has been declined. Please request another time.`
      );
    }
    showToast(`Meeting ${status}!`, 'success');
  };

  const openRequestDialog = (meeting) => {
    const student = data.users.find(u => u.id === meeting.studentId);
    setSelectedRequest(meeting);
    setRequestMeetingForm({
      title: meeting.topic || `Mentoring session with ${student?.name || 'student'}`,
      date: meeting.date || getTodayDate(),
      time: meeting.time || '10:00',
      meetingLink: '',
      platform: '',
      meetingId: '',
      meetingPassword: ''
    });
    setRequestDialogOpen(true);
  };

  const handleApproveRequestWithDetails = () => {
    if (!selectedRequest) return;
    const normalizedLink = normalizeMeetingLink(requestMeetingForm.meetingLink);
    if (!normalizedLink) {
      showToast('Please enter a valid meeting link', 'error');
      return;
    }

    const detailsLines = [
      `Title: ${requestMeetingForm.title}`,
      `Date: ${requestMeetingForm.date}`,
      `Time: ${formatTime(requestMeetingForm.time)}`,
      `Link: ${normalizedLink}`
    ];
    if (requestMeetingForm.platform) {
      detailsLines.push(`Platform: ${requestMeetingForm.platform}`);
    }
    if (requestMeetingForm.meetingId) {
      detailsLines.push(`Meeting ID: ${requestMeetingForm.meetingId}`);
    }
    if (requestMeetingForm.meetingPassword) {
      detailsLines.push(`Password: ${requestMeetingForm.meetingPassword}`);
    }

    const description = detailsLines.join('\n');

    const participants = [selectedRequest.studentId];

    createMeeting(currentUser.id, {
      title: requestMeetingForm.title,
      date: requestMeetingForm.date,
      time: requestMeetingForm.time,
      type: 'individual',
      meetingLink: normalizedLink,
      platform: requestMeetingForm.platform,
      meetingId: requestMeetingForm.meetingId,
      meetingPassword: requestMeetingForm.meetingPassword,
      description,
      participants
    });

    updateMeetingStatus(selectedRequest.id, 'approved');

    const notifyMessage = `📅 Meeting Scheduled!\n\n${detailsLines.join('\n')}\n\nPlease join on time!`;
    addChatMessage(currentUser.id, selectedRequest.studentId, notifyMessage);

    setRequestDialogOpen(false);
    setSelectedRequest(null);
    showToast('Meeting scheduled and request approved', 'success');
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

  // Share meeting link with student
  const shareMeetingLink = (meeting) => {
    if (!meeting.meetingLink) {
      showToast('No meeting link available for this meeting.', 'warning');
      return;
    }
    const extra = extractMeetingExtra(meeting);
    let msg = `🔗 Reminder: Meeting "${meeting.title || meeting.topic}" on ${meeting.date} at ${formatTime(meeting.time)}\n\nJoin Link: ${meeting.meetingLink}`;

    const extraLines = [];
    if (extra.platform) extraLines.push(`Platform: ${extra.platform}`);
    if (extra.meetingId) extraLines.push(`Meeting ID: ${extra.meetingId}`);
    if (extra.meetingPassword) extraLines.push(`Password: ${extra.meetingPassword}`);
    if (extraLines.length > 0) {
      msg += `\n\n${extraLines.join('\n')}`;
    }

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
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsSidebarOpen(prev => !prev)}
        aria-label="Toggle navigation menu"
      >
        ☰
      </button>
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
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
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}>
            🏠 Dashboard
          </button>
          <button className={activeTab === 'students' ? 'active' : ''} onClick={() => { setActiveTab('students'); setIsSidebarOpen(false); }}>
            👥 My Students
          </button>
          <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => { setActiveTab('chat'); setIsSidebarOpen(false); }}>
            💬 Chat
          </button>
          <button className={activeTab === 'meetings' ? 'active' : ''} onClick={() => { setActiveTab('meetings'); setIsSidebarOpen(false); }}>
            📅 Meetings
          </button>
          <button className={activeTab === 'groups' ? 'active' : ''} onClick={() => { setActiveTab('groups'); setIsSidebarOpen(false); }}>
            👨‍👩‍👧‍👦 Groups
          </button>
          <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => { setActiveTab('reports'); setIsSidebarOpen(false); }}>
            📈 My Reports
          </button>
          <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}>
            👤 Profile
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      {isSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

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

                    <div className="chat-actions">
                      <button
                        type="button"
                        className="btn-secondary btn-small"
                        onClick={() => {
                          if (!selectedStudent) {
                            showToast('Select a student first to schedule a meeting.', 'error');
                            return;
                          }
                          setMeetingForm(prev => ({
                            ...prev,
                            type: 'individual',
                            studentId: selectedStudent.id.toString(),
                            date: prev.date || getTodayDate()
                          }));
                          setActiveTab('meetings');
                        }}
                      >
                        📅 Schedule Meeting
                      </button>
                    </div>
                    
                    <div className="chat-messages">
                      {getStudentChats().length === 0 ? (
                        <div className="no-messages">
                          <p>No messages yet.</p>
                        </div>
                      ) : (
                        getStudentChats().map((msg, index) => {
                          const isFromStudent = msg.fromId === selectedStudent.id;
                          const linkedRequest = isFromStudent ? getMeetingRequestForChatMessage(msg) : null;
                          return (
                            <div 
                              key={index} 
                              className={`chat-bubble ${msg.fromId === currentUser?.id ? 'sent' : 'received'}`}
                            >
                              <p style={{ whiteSpace: 'pre-wrap' }}>{sanitizeChatMessage(msg.message)}</p>

                              {linkedRequest && (
                                <div className="chat-meeting-actions">
                                  <button
                                    type="button"
                                    className="btn-success btn-small"
                                    onClick={() => openRequestDialog(linkedRequest)}
                                  >
                                    ✅ Accept
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-danger btn-small"
                                    onClick={() => handleMeetingRequest(linkedRequest.id, 'rejected')}
                                  >
                                    ❌ Decline
                                  </button>
                                </div>
                              )}

                              <span className="chat-time">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })
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
                      <button
                        className="btn-send"
                        onClick={sendMessage}
                        aria-label="Send message"
                      >
                        ➤
                      </button>
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

                <div className="form-group full-width">
                  <label>Platform (optional)</label>
                  <input
                    type="text"
                    value={meetingForm.platform}
                    onChange={(e) => setMeetingForm({ ...meetingForm, platform: e.target.value })}
                    placeholder="e.g., Google Meet, Zoom, Microsoft Teams"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Meeting ID (optional)</label>
                    <input
                      type="text"
                      value={meetingForm.meetingId}
                      onChange={(e) => setMeetingForm({ ...meetingForm, meetingId: e.target.value })}
                      placeholder="Enter meeting ID if applicable"
                    />
                  </div>
                  <div className="form-group">
                    <label>Meeting Passcode (optional)</label>
                    <input
                      type="text"
                      autoComplete="off"
                      value={meetingForm.meetingPassword}
                      onChange={(e) => setMeetingForm({ ...meetingForm, meetingPassword: e.target.value })}
                      placeholder="Enter meeting passcode if applicable"
                    />
                  </div>
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
                          onClick={() => openRequestDialog(meeting)}
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

                    // Only allow joining/sharing while meeting is upcoming or active
                    const canInteract = ['scheduled', 'in_progress', 'rescheduled'].includes(meeting.status);

                    return (
                      <div key={meeting.id} className={`meeting-card status-${meeting.status}`}>
                        <div className="meeting-info">
                          <h4>{meeting.title || meeting.topic}</h4>
                          <p>👥 {participantNames || 'No participants'}</p>
                          <p>📅 {meeting.date} at {formatTime(meeting.time)}</p>
                          {meeting.meetingLink && canInteract && (
                            <p>
                              🔗 <a href={normalizeMeetingLink(meeting.meetingLink)} target="_blank" rel="noopener noreferrer">
                                Join Meeting
                              </a>
                            </p>
                          )}
                          <span className={`status-badge ${meeting.status}`}>
                            {meeting.status}
                          </span>
                        </div>
                        {meeting.meetingLink && canInteract && (
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

        {/* My Profile */}
        {activeTab === 'profile' && (
          <div className="profile-section">
            <h1>My Profile</h1>
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">👨‍🏫</div>
                <div className="profile-name">
                  <h2>{currentUser?.name}</h2>
                  <p>{currentUser?.email}</p>
                </div>
              </div>

              <div className="profile-details">
                <div className="detail-item">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="detail-item">
                  <label>Username</label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Choose a username"
                  />
                </div>
                <div className="detail-item">
                  <label>Specialization</label>
                  <input
                    type="text"
                    value={profileForm.specialization}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, specialization: e.target.value }))}
                    placeholder="Your specialization"
                  />
                </div>
                <div className="detail-item">
                  <label>Role</label>
                  <span>{currentUser?.role || 'counsellor'}</span>
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Change Password</h3>
            <ProfilePasswordSection hideTitle />
          </div>
        </div>
      )}

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

      {/* Approve Meeting Request Dialog (independent of student detail modal) */}
      {requestDialogOpen && selectedRequest && (
        <div className="modal-overlay" onClick={() => setRequestDialogOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Approve Meeting Request</h2>
              <button className="close-btn" onClick={() => setRequestDialogOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="meeting-request-info">
                Student requested a meeting.
                Please confirm the final time and share your external meeting link (Google Meet, Zoom, etc.).
              </p>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={requestMeetingForm.title}
                  onChange={e => setRequestMeetingForm({ ...requestMeetingForm, title: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={requestMeetingForm.date}
                    min={getTodayDate()}
                    onChange={e => setRequestMeetingForm({ ...requestMeetingForm, date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Time *</label>
                  <input
                    type="time"
                    value={requestMeetingForm.time}
                    onChange={e => setRequestMeetingForm({ ...requestMeetingForm, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Meeting Link * (Google Meet / Zoom / Teams)</label>
                <input
                  type="url"
                  value={requestMeetingForm.meetingLink}
                  onChange={e => setRequestMeetingForm({ ...requestMeetingForm, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                />
              </div>
              <div className="form-group">
                <label>Platform (optional)</label>
                <input
                  type="text"
                  value={requestMeetingForm.platform}
                  onChange={e => setRequestMeetingForm({ ...requestMeetingForm, platform: e.target.value })}
                  placeholder="e.g., Google Meet, Zoom, Microsoft Teams"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Meeting ID (optional)</label>
                  <input
                    type="text"
                    value={requestMeetingForm.meetingId}
                    onChange={e => setRequestMeetingForm({ ...requestMeetingForm, meetingId: e.target.value })}
                    placeholder="Enter meeting ID if applicable"
                  />
                </div>
                <div className="form-group">
                  <label>Meeting Passcode (optional)</label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={requestMeetingForm.meetingPassword}
                    onChange={e => setRequestMeetingForm({ ...requestMeetingForm, meetingPassword: e.target.value })}
                    placeholder="Enter meeting passcode if applicable"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setRequestDialogOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleApproveRequestWithDetails}>
                ✅ Approve & Share Details
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default CounsellorDashboard;
