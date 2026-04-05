import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useToast } from '../context/ToastContext';
import AdminSettingsPanel from '../components/AdminSettingsPanel';
import ProfilePasswordSection from '../components/ProfilePasswordSection';

function AdminDashboard() {
  const navigate = useNavigate();
  const {
    data,
    currentUser,
    addUser,
    deleteUser,
    toggleUserStatus,
    updateUser,
    changePassword,
    createMeeting,
    updateMeetingStatus,
    verifyStudent,
    rejectStudent,
    verifyCounsellor,
    rejectCounsellor,
    getStudentNotes,
    getInterestAssessment,
    addStudentNote,
    flagStudent,
    unflagStudent,
    assignCounsellor,
    deleteChatHistoryForUser,
    logout,
    addSupportMessageFromAdmin,
    closeSupportConversation
  } = useData();
  const { settings } = useSiteSettings();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [viewingCounsellor, setViewingCounsellor] = useState(null);

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddCounsellor, setShowAddCounsellor] = useState(false);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    username: '',
    password: ''
  });

  const [counsellorForm, setCounsellorForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    specialization: '',
    role: 'counsellor',
    evaluatorType: 'student'
  });

  const [editForm, setEditForm] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
    status: 'active',
    role: '',
    specialization: '',
    evaluatorType: 'student'
  });

  const [meetingForm, setMeetingForm] = useState({
    title: '',
    counsellorId: '',
    studentId: '',
    date: '',
    time: '10:00',
    meetingLink: ''
  });

  const [activeSupportId, setActiveSupportId] = useState(null);
  const [supportReply, setSupportReply] = useState('');
  const [adminProfileForm, setAdminProfileForm] = useState({
    name: '',
    email: '',
    username: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileInitialised, setProfileInitialised] = useState(false);

  // Protect route
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  // On phones, open the admin sidebar by default so all controls are visible
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  // Initialise editable admin profile details once
  useEffect(() => {
    if (!profileInitialised && currentUser) {
      setAdminProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        username: currentUser.username || ''
      });
      setProfileInitialised(true);
    }
  }, [profileInitialised, currentUser]);

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const students = data.users.filter(u => u.role === 'student');
  const counsellors = data.users.filter(u => u.role === 'counsellor');

  const stats = {
    totalStudents: students.length,
    totalCounsellors: counsellors.length,
    totalMeetings: data.meetings.length,
    totalTests: data.testResults.length,
    unassignedStudents: students.filter(s => !s.assignedCounsellor).length
  };

  const scrollToElement = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    const trimmedName = adminProfileForm.name.trim();
    const trimmedEmail = adminProfileForm.email.trim();
    const trimmedUsername = adminProfileForm.username.trim();

    if (!trimmedName || !trimmedEmail || !trimmedUsername) {
      showToast('Name, email and username are required.', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      const updated = await updateUser(currentUser.id, {
        name: trimmedName,
        email: trimmedEmail,
        username: trimmedUsername
      });

      if (updated) {
        showToast('Profile updated successfully.', 'success');
        setAdminProfileForm(prev => ({
          ...prev,
          name: updated.name || '',
          email: updated.email || '',
          username: updated.username || ''
        }));
      } else {
        showToast('Failed to update profile.', 'error');
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const getCounsellorName = (id) => {
    if (!id) return 'Not Assigned';
    const c = data.users.find(u => u.id === id);
    return c ? c.name : 'Not Assigned';
  };

  const getStudentCount = (counsellorId) =>
    students.filter(s => s.assignedCounsellor === counsellorId).length;

  const getChatBetween = (studentId, counsellorId) =>
    data.chats.filter(
      c =>
        (c.fromId === studentId && c.toId === counsellorId) ||
        (c.fromId === counsellorId && c.toId === studentId)
    );

  const getStudentData = (studentId) => {
    const student = data.users.find(u => u.id === studentId);
    const counsellor = student?.assignedCounsellor
      ? data.users.find(u => u.id === student.assignedCounsellor)
      : null;
    const testResults = data.testResults.filter(r => r.studentId === studentId);
    const meetings = data.meetings.filter(
      m => m.studentId === studentId || m.participants?.includes(studentId)
    );
    const chats = data.chats
      .filter(c => c.fromId === studentId || c.toId === studentId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    return { student, counsellor, testResults, meetings, chats };
  };

  const getCounsellorData = (counsellorId) => {
    const counsellor = data.users.find(u => u.id === counsellorId);
    const assignedStudents = students.filter(s => s.assignedCounsellor === counsellorId);
    const meetings = data.meetings.filter(m => m.counsellorId === counsellorId);
    const groups = data.groups.filter(g => g.counsellorId === counsellorId);
    const chats = data.chats
      .filter(c => c.fromId === counsellorId || c.toId === counsellorId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    return { counsellor, assignedStudents, meetings, groups, chats };
  };

  const sanitizeChatMessage = (message) => {
    if (!message) return '';
    const lower = message.toLowerCase();
    if (lower.includes('instant video call') || message.includes('/call/pathwise')) {
      return 'Note: This is an old automatic meeting message from an earlier version. Please use the latest scheduled meeting details and external meeting link shared by the mentor.';
    }
    return message;
  };

  // Ensure meeting links open as proper external URLs (not localhost routes)
  const getExternalMeetingUrl = (raw) => {
    if (!raw) return '';
    const trimmed = raw.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed.replace(/^\/+/, '')}`;
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    if (Number.isNaN(hour)) return time;
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const normalized = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${normalized}:${minutes} ${suffix}`;
  };

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const handleToggleStatus = async (userId) => {
    const ok = await toggleUserStatus(userId);
    if (ok) {
      showToast('User status updated', 'success');
    } else {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const ok = await deleteUser(userId);
    if (ok) {
      showToast('User deleted', 'success');
      if (viewingStudent === userId) setViewingStudent(null);
      if (viewingCounsellor === userId) setViewingCounsellor(null);
    } else {
      showToast('Failed to delete user', 'error');
    }
  };

  const startEditUser = (user) => {
    setShowEditUser(true);
    setEditForm({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      password: '',
      status: user.status || 'active',
      role: user.role || '',
      specialization: user.specialization || '',
      evaluatorType: user.evaluatorType || 'student'
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.id) return;
    const payload = {
      name: editForm.name,
      email: editForm.email,
      status: editForm.status,
      specialization: editForm.specialization,
      role: editForm.role
    };
    if (editForm.role === 'evaluator') {
      payload.evaluatorType = editForm.evaluatorType;
    }
    const updated = await updateUser(editForm.id, payload);
    if (!updated) {
      showToast('Failed to update user', 'error');
      return;
    }

    // If admin entered a new password, update it directly (no old password required)
    if (editForm.password) {
      const result = await changePassword(editForm.id, '', editForm.password);
      if (!result.success) {
        showToast(result.message || 'Failed to update password', 'error');
        return;
      }
    }

    showToast('User updated', 'success');
    setShowEditUser(false);
  };

  const handleAddStudent = async () => {
    if (!studentForm.name || !studentForm.email || !studentForm.password) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    const user = await addUser({
      ...studentForm,
      role: 'student',
      status: 'active'
    });
    if (user) {
      showToast('Student added', 'success');
      setShowAddStudent(false);
      setStudentForm({ name: '', email: '', username: '', password: '' });
    } else {
      showToast('Failed to add student', 'error');
    }
  };

  const handleAddCounsellor = async () => {
    if (!counsellorForm.name || !counsellorForm.email || !counsellorForm.password) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    const payload = {
      name: counsellorForm.name,
      email: counsellorForm.email,
      username: counsellorForm.username,
      password: counsellorForm.password,
      specialization: counsellorForm.specialization,
      role: counsellorForm.role,
      status: 'active'
    };

    if (counsellorForm.role === 'evaluator') {
      payload.evaluatorType = counsellorForm.evaluatorType;
    }

    const user = await addUser(payload);
    if (user) {
      const label = counsellorForm.role === 'general_counsellor'
        ? 'General Counsellor added'
        : counsellorForm.role === 'evaluator'
          ? 'Evaluator added'
          : 'Counsellor added';
      showToast(label, 'success');
      setShowAddCounsellor(false);
      setCounsellorForm({ name: '', email: '', username: '', password: '', specialization: '', role: 'counsellor', evaluatorType: 'student' });
    } else {
      showToast('Failed to add counsellor', 'error');
    }
  };

  const handleAssignCounsellor = async (studentId, counsellorId) => {
    if (!counsellorId) return;
    await assignCounsellor(studentId, parseInt(counsellorId, 10));
    showToast('Counsellor assigned', 'success');
  };

  const handleCreateMeeting = async () => {
    if (!meetingForm.title || !meetingForm.date || !meetingForm.counsellorId || !meetingForm.studentId) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    const counsellorId = parseInt(meetingForm.counsellorId, 10);
    const studentId = parseInt(meetingForm.studentId, 10);
    await createMeeting(counsellorId, {
      title: meetingForm.title,
      date: meetingForm.date,
      time: meetingForm.time,
      type: 'individual',
      meetingLink: meetingForm.meetingLink,
      participants: [studentId]
    });
    showToast('Meeting created', 'success');
    setShowCreateMeeting(false);
    setMeetingForm({
      title: '',
      counsellorId: '',
      studentId: '',
      date: '',
      time: '10:00',
      meetingLink: ''
    });
  };

  const handleAdminVerifyStudent = async (student) => {
    if (!student) return;
    const ok = await verifyStudent(student.id, currentUser.id, 'Verified by admin');
    if (ok) {
      showToast('Student verified successfully by admin', 'success');
    } else {
      showToast('Failed to verify student', 'error');
    }
  };

  const handleAdminRejectStudent = async (student, reason) => {
    if (!student || !reason) return;
    const ok = await rejectStudent(student.id, currentUser.id, reason);
    if (ok) {
      showToast('Student rejected by admin', 'warning');
    } else {
      showToast('Failed to reject student', 'error');
    }
  };

  const handleAdminVerifyCounsellor = async (counsellor) => {
    if (!counsellor) return;
    const ok = await verifyCounsellor(counsellor.id, currentUser.id, 'Verified by admin');
    if (ok) {
      showToast('Counsellor verified successfully by admin', 'success');
    } else {
      showToast('Failed to verify counsellor', 'error');
    }
  };

  const handleAdminRejectCounsellor = async (counsellor, reason) => {
    if (!counsellor || !reason) return;
    const ok = await rejectCounsellor(counsellor.id, currentUser.id, reason);
    if (ok) {
      showToast('Counsellor rejected by admin', 'warning');
    } else {
      showToast('Failed to reject counsellor', 'error');
    }
  };

  const handleMeetingStatus = async (meetingId, status) => {
    const ok = await updateMeetingStatus(meetingId, status);
    if (ok) {
      showToast(`Meeting ${status}`, 'success');
    } else {
      showToast('Failed to update meeting', 'error');
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Cancel this meeting?')) return;
    const ok = await updateMeetingStatus(meetingId, 'cancelled');
    if (ok) {
      showToast('Meeting cancelled', 'success');
    } else {
      showToast('Failed to cancel meeting', 'error');
    }
  };

  const supportConversations = data.supportConversations || [];

  const activeSupportConversation =
    (activeSupportId && supportConversations.find(c => c.id === activeSupportId)) ||
    supportConversations[0] ||
    null;

  const handleSendSupportReply = () => {
    if (!activeSupportConversation || !supportReply.trim()) return;
    // Admin reply will flow back to the visitor's widget via DataContext
    addSupportMessageFromAdmin(activeSupportConversation.id, supportReply.trim());
    setSupportReply('');
    showToast('Reply sent to visitor', 'success');
  };

  const handleCloseSupportConversation = () => {
    if (!activeSupportConversation) return;
    closeSupportConversation(activeSupportConversation.id);
    showToast('Conversation closed', 'success');
  };

  return (
    <div className="dashboard-layout admin-dashboard">
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
          <img
            src={settings.logoUrl || '/logo.png'}
            alt={settings.siteName || 'PathWise'}
            className="logo-img"
          />
          <h2>{settings.siteName || 'PathWise'}</h2>
        </div>
        <div className="user-info">
          <div className="avatar">🛠️</div>
          <span>{currentUser?.name || 'Admin'}</span>
        </div>
        <nav className="sidebar-nav">
          <button
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
          >
            🏠 Overview
          </button>
          <button
            className={activeTab === 'students' ? 'active' : ''}
            onClick={() => { setActiveTab('students'); setIsSidebarOpen(false); }}
          >
            🎓 Students
          </button>
          <button
            className={activeTab === 'counsellors' ? 'active' : ''}
            onClick={() => { setActiveTab('counsellors'); setIsSidebarOpen(false); }}
          >
            👨‍🏫 Counsellors
          </button>
          <button
            className={activeTab === 'assignments' ? 'active' : ''}
            onClick={() => { setActiveTab('assignments'); setIsSidebarOpen(false); }}
          >
            🔗 Assignments
          </button>
          <button
            className={activeTab === 'meetings' ? 'active' : ''}
            onClick={() => { setActiveTab('meetings'); setIsSidebarOpen(false); }}
          >
            📅 Meetings
          </button>
          <button
            className={activeTab === 'reports' ? 'active' : ''}
            onClick={() => { setActiveTab('reports'); setIsSidebarOpen(false); }}
          >
            📈 Reports
          </button>
          <button
            className={activeTab === 'support' ? 'active' : ''}
            onClick={() => { setActiveTab('support'); setIsSidebarOpen(false); }}
          >
            🛟 Support Inbox
          </button>
          <button
            className={activeTab === 'database' ? 'active' : ''}
            onClick={() => { setActiveTab('database'); setIsSidebarOpen(false); navigate('/database'); }}
          >
            🗄️ Database Live View
          </button>
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
          >
            👤 My Profile
          </button>
          <button className="settings-btn" onClick={() => setShowSettings(true)}>
            ⚙️ Site Settings
          </button>
        </nav>
        <div className="sidebar-footer">
          {settings.maintenanceMode?.enabled && (
            <div className="maintenance-indicator">🔧 Maintenance Mode ON</div>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
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
            <h1>Admin Dashboard</h1>
            <p className="subtitle">Full platform control and management</p>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button
                  className="btn-primary"
                  onClick={() => setShowAddCounsellor(true)}
                >
                  ➕ Add Counsellor
                </button>
                <button
                  className="btn-primary"
                  onClick={() => setShowAddStudent(true)}
                >
                  ➕ Add Student
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowCreateMeeting(true)}
                >
                  📅 Create Meeting
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setActiveTab('reports')}
                >
                  📈 View Reports
                </button>
              </div>
            </div>

            {stats.unassignedStudents > 0 && (
              <div className="alert-card warning">
                <h3>⚠️ Unassigned Students</h3>
                <p>{stats.unassignedStudents} student(s) without a counsellor.</p>
                <button
                  className="btn-primary"
                  onClick={() => setActiveTab('assignments')}
                >
                  Assign Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* Students - list */}
        {activeTab === 'students' && !viewingStudent && (
          <div className="manage-section">
            <div className="section-header">
              <h1>Manage Students</h1>
              <button
                className="btn-primary"
                onClick={() => setShowAddStudent(true)}
              >
                ➕ Add Student
              </button>
            </div>

            {students.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">👥</span>
                <p>No students registered yet.</p>
                <button
                  className="btn-primary"
                  onClick={() => setShowAddStudent(true)}
                >
                  Add First Student
                </button>
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mentor</th>
                      <th>Tests</th>
                      <th>Flag</th>
                      <th>Student Journey</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr
                        key={student.id}
                        className={student.flagged ? 'flagged-row' : ''}
                      >
                        <td>
                          <span
                            className="clickable-name"
                            onClick={() => setViewingStudent(student.id)}
                          >
                            {student.name}
                            {student.flagged && (
                              <span className="flag-mini">🚩</span>
                            )}
                          </span>
                        </td>
                        <td>{student.email}</td>
                        <td>
                          <span
                            className={
                              student.assignedCounsellor ? 'assigned' : 'unassigned'
                            }
                          >
                            {getCounsellorName(student.assignedCounsellor)}
                          </span>
                        </td>
                        <td>
                          {data.testResults.filter(
                            t => t.studentId === student.id
                          ).length}
                        </td>
                        <td>
                          {student.flagged ? (
                            <span
                              className="flag-indicator"
                              title={student.flagReason}
                            >
                              🚩
                            </span>
                          ) : (
                            <span className="no-flag">-</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              student.studentStatus || 'registered'
                            }`}
                          >
                            {student.studentStatus || 'Registered'}
                          </span>
                        </td>
                        <td className="action-cell">
                          <button
                            className="btn-small btn-primary"
                            onClick={() => setViewingStudent(student.id)}
                          >
                            👁️ View
                          </button>
                          <button
                            className="btn-small btn-info"
                            onClick={() => startEditUser(student)}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-small btn-secondary"
                            onClick={() => handleToggleStatus(student.id)}
                          >
                            {student.status === 'inactive' ? '✅' : '🚫'}
                          </button>
                          <button
                            className="btn-small btn-danger"
                            onClick={() => handleDeleteUser(student.id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Student profile */}
        {activeTab === 'students' && viewingStudent && (
          <div className="profile-view">
            <button
              className="btn-back"
              onClick={() => setViewingStudent(null)}
            >
              ← Back to Students
            </button>

            {(() => {
              const {
                student,
                counsellor,
                testResults,
                meetings,
                chats
              } = getStudentData(viewingStudent);
              if (!student) return <p>Student not found</p>;

              return (
                <>
                  <div className="profile-header">
                    <div className="profile-avatar">🎓</div>
                    <div className="profile-info">
                      <h1>{student.name}</h1>
                      <p>{student.email}</p>
                      <span
                        className={`status-badge ${
                          student.studentStatus || 'registered'
                        }`}
                      >
                        {student.studentStatus || 'Registered'}
                      </span>
                    </div>
                    <div className="profile-actions">
                      <button
                        className="btn-info"
                        onClick={() => startEditUser(student)}
                      >
                        ✏️ Edit Profile
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => scrollToElement('admin-student-chat-history')}
                      >
                        💬 View Chats
                      </button>
                    </div>
                  </div>

                  <div className="profile-section">
                    <h3>👨‍🏫 Assigned Counsellor</h3>
                    {counsellor ? (
                      <div
                        className="info-card clickable"
                        onClick={() => {
                          setViewingStudent(null);
                          setViewingCounsellor(counsellor.id);
                          setActiveTab('counsellors');
                        }}
                      >
                        <span className="card-icon">👨‍🏫</span>
                        <div>
                          <strong>{counsellor.name}</strong>
                          <p>{counsellor.email}</p>
                          <small>{counsellor.specialization || 'General'}</small>
                        </div>
                      </div>
                    ) : (
                      <p className="no-data">No counsellor assigned</p>
                    )}
                  </div>

                  {/* Flag status */}
                  <div className="profile-section flag-info-section">
                    <h3>🚩 Flag Status</h3>
                    {student.flagged ? (
                      <div className="flag-alert-box">
                        <div className="flag-status-header">
                          <span className="flag-badge large">
                            🚩 This student is flagged
                          </span>
                          <button
                            className="btn-small btn-secondary"
                            onClick={() => {
                              unflagStudent(student.id);
                              showToast('Flag removed', 'success');
                            }}
                          >
                            Remove Flag
                          </button>
                        </div>
                        <div className="flag-reason-display">
                          <strong>Reason:</strong>{' '}
                          {student.flagReason || 'No reason provided'}
                        </div>
                      </div>
                    ) : (
                      <div className="no-flag-box">
                        <p>Student is not flagged.</p>
                        <button
                          className="btn-small btn-warning"
                          onClick={() => {
                            const reason = prompt('Enter flag reason:');
                            if (reason) {
                              flagStudent(student.id, reason);
                              showToast('Student flagged', 'warning');
                            }
                          }}
                        >
                          🚩 Flag Student
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Admin verification controls for pending students */}
                  {(student.studentStatus === 'pending_verification' || student.status === 'pending_verification') && (
                    <div className="profile-section admin-verification-section">
                      <h3>✅ Admin Verification</h3>
                      <p className="subtitle">
                        This student is pending verification. As admin, you can approve or reject directly without using the evaluator dashboard.
                      </p>
                      <div className="profile-actions" style={{ gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          className="btn-primary btn-small"
                          onClick={() => handleAdminVerifyStudent(student)}
                        >
                          ✅ Approve & Verify
                        </button>
                        <button
                          className="btn-danger btn-small"
                          onClick={() => {
                            const reason = window.prompt('Enter rejection reason (this will be visible to the student):');
                            if (reason && reason.trim()) {
                              handleAdminRejectStudent(student, reason.trim());
                            }
                          }}
                        >
                          ❌ Reject Student
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Evaluator Notes */}
                  {(student.verificationNotes || student.rejectionReason) && (
                    <div className="profile-section evaluator-notes-section">
                      <h3>📝 Evaluator Notes</h3>
                      <div className="evaluator-notes-box">
                        {student.verificationNotes && (
                          <div className="eval-note approved">
                            <span className="eval-note-label">✅ Verification Notes:</span>
                            <p>{student.verificationNotes}</p>
                          </div>
                        )}
                        {student.rejectionReason && (
                          <div className="eval-note rejected">
                            <span className="eval-note-label">❌ Rejection Reason:</span>
                            <p>{student.rejectionReason}</p>
                          </div>
                        )}
                        {student.verifiedAt && (
                          <span className="eval-note-meta">
                            Verified on: {new Date(student.verifiedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Interest assessment */}
                  <div className="profile-section">
                    <h3>📊 Interest Assessment</h3>
                    {(() => {
                      const assessment = getInterestAssessment(student.id);
                      if (!assessment)
                        return (
                          <p className="no-data">
                            Assessment not completed yet
                          </p>
                        );
                      return (
                        <div className="assessment-details">
                          <div className="assessment-row">
                            <strong>Completed:</strong>{' '}
                            {new Date(
                              assessment.completedAt
                            ).toLocaleDateString()}
                          </div>
                          <div className="assessment-row">
                            <strong>Dominant Traits:</strong>
                            <div className="trait-tags">
                              {assessment.dominantTraits?.map((trait, i) => (
                                <span key={i} className="trait-tag">
                                  {trait.trait} ({trait.percentage}%)
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="assessment-row">
                            <strong>Suggested Fields:</strong>
                            <div className="field-tags">
                              {assessment.suggestedFields?.map((field, i) => (
                                <span key={i} className="field-tag">
                                  {field.field} ({field.percentage}%)
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Notes */}
                  <div className="profile-section notes-section">
                    <h3>
                      📝 Notes & Comments ({
                        getStudentNotes(student.id).length
                      })
                    </h3>
                    {getStudentNotes(student.id).length === 0 ? (
                      <p className="no-data">No notes for this student</p>
                    ) : (
                      <div className="notes-timeline">
                        {getStudentNotes(student.id).map((note, i) => {
                          const author = data.users.find(
                            u => u.id === note.authorId
                          );
                          return (
                            <div
                              key={i}
                              className={`note-entry ${note.noteType}`}
                            >
                              <div className="note-entry-header">
                                <span className="note-author">
                                  {author?.name || 'System'}
                                </span>
                                <span
                                  className={`note-type-tag ${note.noteType}`}
                                >
                                  {note.noteType}
                                </span>
                                <span className="note-date">
                                  {new Date(
                                    note.createdAt
                                  ).toLocaleString()}
                                </span>
                              </div>
                              <p className="note-text">{note.content}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="add-note-inline">
                      <h4>Add Admin Note</h4>
                      <textarea
                        id="admin-note-input"
                        placeholder="Add a note..."
                        rows={2}
                      />
                      <button
                        className="btn-primary btn-small"
                        onClick={() => {
                          const input = document.getElementById(
                            'admin-note-input'
                          );
                          if (input.value.trim()) {
                            addStudentNote(
                              student.id,
                              currentUser.id,
                              input.value.trim(),
                              'admin'
                            );
                            input.value = '';
                            showToast('Note added', 'success');
                          }
                        }}
                      >
                        Add Note
                      </button>
                    </div>
                  </div>

                  {/* Test results */}
                  <div className="profile-section">
                    <h3>📝 Test Results ({testResults.length})</h3>
                    {testResults.length === 0 ? (
                      <p className="no-data">No tests taken yet</p>
                    ) : (
                      <div className="results-list">
                        {testResults.map((result, i) => (
                          <div key={i} className="result-card">
                            <div className="result-header">
                              <span className="category-badge">
                                {result.topCategory}
                              </span>
                              <small>
                                {new Date(
                                  result.completedAt
                                ).toLocaleDateString()}
                              </small>
                            </div>
                            <div className="result-careers">
                              <strong>Recommended Careers:</strong>
                              <ul>
                                {result.recommendedCareers?.map(
                                  (career, j) => (
                                    <li key={j}>{career}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Meetings */}
                  <div className="profile-section">
                    <h3>📅 Meetings ({meetings.length})</h3>
                    {meetings.length === 0 ? (
                      <p className="no-data">No meetings scheduled</p>
                    ) : (
                      <div className="meetings-list">
                        {meetings.map(meeting => (
                          <div key={meeting.id} className="meeting-item">
                            <strong>{meeting.title || meeting.topic}</strong>
                            <span>
                              {meeting.date} at {formatTime(meeting.time)}
                            </span>
                            <span
                              className={`status-badge ${meeting.status}`}
                            >
                              {meeting.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Chats */}
                  <div className="profile-section" id="admin-student-chat-history">
                    <div className="profile-section-header-row">
                      <h3>💬 Chat History ({chats.length})</h3>
                      {chats.length > 0 && (
                        <button
                          className="btn-small btn-danger"
                          onClick={async () => {
                            if (!window.confirm('Delete all chat messages for this student? This cannot be undone.')) return;
                            const ok = await deleteChatHistoryForUser(student.id);
                            if (ok) {
                              showToast('Chat history deleted for this student', 'success');
                            } else {
                              showToast('Failed to delete chat history', 'error');
                            }
                          }}
                        >
                          🗑️ Delete Chat History
                        </button>
                      )}
                    </div>
                    {chats.length === 0 ? (
                      <p className="no-data">No chats for this student yet.</p>
                    ) : (
                      <div className="chat-history-list">
                        {chats.map(msg => {
                          const isStudentMessage = msg.fromId === student.id;
                          return (
                            <div
                              key={msg.id}
                              className={`chat-bubble ${isStudentMessage ? 'sent' : 'received'}`}
                            >
                              <p style={{ whiteSpace: 'pre-wrap' }}>{sanitizeChatMessage(msg.message)}</p>
                              <span className="chat-time">
                                {msg.timestamp
                                  ? new Date(msg.timestamp).toLocaleString()
                                  : ''}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Counsellors - list */}
        {activeTab === 'counsellors' && !viewingCounsellor && (
          <div className="manage-section">
            <div className="section-header">
              <h1>Manage Counsellors</h1>
              <button
                className="btn-primary"
                onClick={() => setShowAddCounsellor(true)}
              >
                ➕ Add Counsellor
              </button>
            </div>

            {counsellors.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">👨‍🏫</span>
                <p>No counsellors registered yet.</p>
                <button
                  className="btn-primary"
                  onClick={() => setShowAddCounsellor(true)}
                >
                  Add First Counsellor
                </button>
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Specialization</th>
                      <th>Students</th>
                      <th>Meetings</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {counsellors.map(counsellor => (
                      <tr key={counsellor.id}>
                        <td>
                          <span
                            className="clickable-name"
                            onClick={() => setViewingCounsellor(counsellor.id)}
                          >
                            {counsellor.name}
                          </span>
                        </td>
                        <td>{counsellor.email}</td>
                        <td>{counsellor.specialization || 'General'}</td>
                        <td>{getStudentCount(counsellor.id)}</td>
                        <td>
                          {
                            data.meetings.filter(
                              m => m.counsellorId === counsellor.id
                            ).length
                          }
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              counsellor.status || 'active'
                            }`}
                          >
                            {counsellor.status || 'active'}
                          </span>
                        </td>
                        <td className="action-cell">
                          <button
                            className="btn-small btn-primary"
                            onClick={() => setViewingCounsellor(counsellor.id)}
                          >
                            👁️ View
                          </button>
                          <button
                            className="btn-small btn-info"
                            onClick={() => startEditUser(counsellor)}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-small btn-secondary"
                            onClick={() => handleToggleStatus(counsellor.id)}
                          >
                            {counsellor.status === 'inactive'
                              ? '✅'
                              : '🚫'}
                          </button>
                          <button
                            className="btn-small btn-danger"
                            onClick={() => handleDeleteUser(counsellor.id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Counsellor profile */}
        {activeTab === 'counsellors' && viewingCounsellor && (
          <div className="profile-view">
            <button
              className="btn-back"
              onClick={() => setViewingCounsellor(null)}
            >
              ← Back to Counsellors
            </button>

            {(() => {
              const {
                counsellor,
                assignedStudents,
                meetings,
                groups,
                chats
              } = getCounsellorData(viewingCounsellor);
              if (!counsellor) return <p>Counsellor not found</p>;

              return (
                <>
                  <div className="profile-header">
                    <div className="profile-avatar">👨‍🏫</div>
                    <div className="profile-info">
                      <h1>{counsellor.name}</h1>
                      <p>{counsellor.email}</p>
                      <span className="specialization-badge">
                        {counsellor.specialization || 'General'}
                      </span>
                      <span
                        className={`status-badge ${
                          counsellor.status || 'active'
                        }`}
                      >
                        {counsellor.status || 'active'}
                      </span>
                    </div>
                    <div className="profile-actions">
                      <button
                        className="btn-info"
                        onClick={() => startEditUser(counsellor)}
                      >
                        ✏️ Edit Profile
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => scrollToElement('admin-counsellor-chat-history')}
                      >
                        💬 View Chats
                      </button>
                    </div>
                  </div>

                  {/* Admin verification controls for pending counsellors */}
                  {counsellor.status === 'pending_verification' && (
                    <div className="profile-section admin-verification-section">
                      <h3>✅ Admin Verification</h3>
                      <p className="subtitle">
                        This counsellor is pending verification. As admin, you can approve or reject their mentor profile.
                      </p>
                      <div className="profile-actions" style={{ gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          className="btn-primary btn-small"
                          onClick={() => handleAdminVerifyCounsellor(counsellor)}
                        >
                          ✅ Approve & Verify
                        </button>
                        <button
                          className="btn-danger btn-small"
                          onClick={() => {
                            const reason = window.prompt('Enter rejection reason for this counsellor:');
                            if (reason && reason.trim()) {
                              handleAdminRejectCounsellor(counsellor, reason.trim());
                            }
                          }}
                        >
                          ❌ Reject Counsellor
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="profile-stats">
                    <div className="stat-item">
                      <span className="stat-num">{assignedStudents.length}</span>
                      <span>Students</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-num">{meetings.length}</span>
                      <span>Meetings</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-num">{groups.length}</span>
                      <span>Groups</span>
                    </div>
                  </div>

                  {(counsellor.verificationNotes || counsellor.rejectionReason) && (
                    <div className="profile-section evaluator-notes-section">
                      <h3>📝 Evaluator Notes</h3>
                      <div className="evaluator-notes-box">
                        {counsellor.verificationNotes && (
                          <div className="eval-note approved">
                            <span className="eval-note-label">✅ Verification Notes:</span>
                            <p>{counsellor.verificationNotes}</p>
                          </div>
                        )}
                        {counsellor.rejectionReason && (
                          <div className="eval-note rejected">
                            <span className="eval-note-label">❌ Rejection Reason:</span>
                            <p>{counsellor.rejectionReason}</p>
                          </div>
                        )}
                        {counsellor.verifiedAt && (
                          <span className="eval-note-meta">
                            Verified on: {new Date(counsellor.verifiedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="profile-section" id="admin-counsellor-chat-history">
                    <h3>👥 Assigned Students ({assignedStudents.length})</h3>
                    {assignedStudents.length === 0 ? (
                      <p className="no-data">No students assigned</p>
                    ) : (
                      <div className="students-grid">
                        {assignedStudents.map(student => {
                          const chatCount = getChatBetween(
                            student.id,
                            counsellor.id
                          ).length;
                          const testCount = data.testResults.filter(
                            t => t.studentId === student.id
                          ).length;
                          return (
                            <div
                              key={student.id}
                              className="student-mini-card"
                            >
                              <div className="mini-card-header">
                                <span>🎓</span>
                                <strong>{student.name}</strong>
                              </div>
                              <p>{student.email}</p>
                              <div className="mini-stats">
                                <span>📝 {testCount} tests</span>
                                <span>💬 {chatCount} messages</span>
                              </div>
                              <div className="mini-actions">
                                <button
                                  className="btn-small btn-primary"
                                  onClick={() => {
                                    setViewingCounsellor(null);
                                    setViewingStudent(student.id);
                                    setActiveTab('students');
                                  }}
                                >
                                  View Profile
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="profile-section">
                    <h3>📅 Meetings ({meetings.length})</h3>
                    {meetings.length === 0 ? (
                      <p className="no-data">No meetings scheduled</p>
                    ) : (
                      <div className="meetings-list">
                        {meetings.map(meeting => {
                          const participants =
                            meeting.participants
                              ?.map(pId => {
                                const s = data.users.find(
                                  u => u.id === pId
                                );
                                return s?.name || 'Unknown';
                              })
                              .join(', ') || '';
                          return (
                            <div key={meeting.id} className="meeting-item">
                              <strong>{meeting.title || meeting.topic}</strong>
                              <span>👥 {participants}</span>
                              <span>
                                📅 {meeting.date} at {formatTime(meeting.time)}
                              </span>
                              <span
                                className={`status-badge ${meeting.status}`}
                              >
                                {meeting.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="profile-section">
                    <div className="profile-section-header-row">
                      <h3>💬 Chat History ({chats.length})</h3>
                      {chats.length > 0 && (
                        <button
                          className="btn-small btn-danger"
                          onClick={async () => {
                            if (!window.confirm('Delete all chat messages for this counsellor? This cannot be undone.')) return;
                            const ok = await deleteChatHistoryForUser(counsellor.id);
                            if (ok) {
                              showToast('Chat history deleted for this counsellor', 'success');
                            } else {
                              showToast('Failed to delete chat history', 'error');
                            }
                          }}
                        >
                          🗑️ Delete Chat History
                        </button>
                      )}
                    </div>
                    {chats.length === 0 ? (
                      <p className="no-data">No chats for this counsellor yet.</p>
                    ) : (
                      <div className="chat-history-list">
                        {chats.map(msg => {
                          const isCounsellorMessage = msg.fromId === counsellor.id;
                          return (
                            <div
                              key={msg.id}
                              className={`chat-bubble ${isCounsellorMessage ? 'sent' : 'received'}`}
                            >
                              <p style={{ whiteSpace: 'pre-wrap' }}>{sanitizeChatMessage(msg.message)}</p>
                              <span className="chat-time">
                                {msg.timestamp
                                  ? new Date(msg.timestamp).toLocaleString()
                                  : ''}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Assignments */}
        {activeTab === 'assignments' && (
          <div className="manage-section">
            <h1>Student-Counsellor Assignments</h1>
            <p className="subtitle">View and manage all assignments</p>

            {students.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🔗</span>
                <p>No students to assign.</p>
              </div>
            ) : (
              <div className="assignments-table">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Assigned Counsellor</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => {
                      const counsellor = student.assignedCounsellor
                        ? data.users.find(
                            u => u.id === student.assignedCounsellor
                          )
                        : null;
                      return (
                        <tr key={student.id}>
                          <td>
                            <span
                              className="clickable-name"
                              onClick={() => {
                                setViewingStudent(student.id);
                                setActiveTab('students');
                              }}
                            >
                              🎓 {student.name}
                            </span>
                          </td>
                          <td>{student.email}</td>
                          <td>
                            {counsellor ? (
                              <span
                                className="clickable-name"
                                onClick={() => {
                                  setViewingCounsellor(counsellor.id);
                                  setActiveTab('counsellors');
                                }}
                              >
                                👨‍🏫 {counsellor.name}
                              </span>
                            ) : (
                              <span className="unassigned">Not Assigned</span>
                            )}
                          </td>
                          <td className="action-cell">
                            <select
                              value={student.assignedCounsellor || ''}
                              onChange={e =>
                                handleAssignCounsellor(
                                  student.id,
                                  e.target.value
                                )
                              }
                            >
                              <option value="">-- Assign --</option>
                              {counsellors.map(c => (
                                <option key={c.id} value={c.id}>
                                  {c.name} ({getStudentCount(c.id)} students)
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Meetings */}
        {activeTab === 'meetings' && (
          <div className="manage-section">
            <div className="section-header">
              <h1>All Meetings</h1>
              <button
                className="btn-primary"
                onClick={() => setShowCreateMeeting(true)}
              >
                📅 Create Meeting
              </button>
            </div>

            {data.meetings.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📅</span>
                <p>No meetings scheduled yet.</p>
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Mentor</th>
                      <th>Student(s)</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Link</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.meetings.map(meeting => {
                      const counsellor = data.users.find(
                        u => u.id === meeting.counsellorId
                      );
                      const participants =
                        meeting.participants
                          ?.map(pId => {
                            const s = data.users.find(
                              u => u.id === pId
                            );
                            return s?.name || 'Unknown';
                          })
                          .join(', ') || 'N/A';
                      return (
                        <tr key={meeting.id}>
                          <td>{meeting.title || meeting.topic}</td>
                          <td>{counsellor?.name || 'Unknown'}</td>
                          <td>{participants}</td>
                          <td>{meeting.date}</td>
                          <td>{formatTime(meeting.time)}</td>
                          <td>
                            {meeting.meetingLink ? (
                              <a
                                href={getExternalMeetingUrl(meeting.meetingLink)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                🔗
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td>
                            <span
                              className={`status-badge ${meeting.status}`}
                            >
                              {meeting.status}
                            </span>
                          </td>
                          <td className="action-cell">
                            {meeting.status === 'pending' && (
                              <>
                                <button
                                  className="btn-small btn-success"
                                  onClick={() =>
                                    handleMeetingStatus(
                                      meeting.id,
                                      'approved'
                                    )
                                  }
                                >
                                  ✅
                                </button>
                                <button
                                  className="btn-small btn-warning"
                                  onClick={() =>
                                    handleMeetingStatus(
                                      meeting.id,
                                      'rejected'
                                    )
                                  }
                                >
                                  ❌
                                </button>
                              </>
                            )}
                            <button
                              className="btn-small btn-danger"
                              onClick={() => handleDeleteMeeting(meeting.id)}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Reports - simple summary */}
        {activeTab === 'reports' && (
          <div className="manage-section reports-section">
            <div className="section-header">
              <h1>Reports &amp; Analytics</h1>
            </div>

            <div className="report-summary">
              <div className="report-stat-card">
                <h3>👥 Total Students</h3>
                <span className="big-number">{stats.totalStudents}</span>
                <div className="stat-breakdown">
                  <span className="positive">
                    ✓ {students.filter(s => s.assignedCounsellor).length}{' '}
                    Assigned
                  </span>
                  <span className="warning">
                    ⏳ {stats.unassignedStudents} Pending
                  </span>
                </div>
              </div>
              <div className="report-stat-card">
                <h3>👨‍🏫 Total Counsellors</h3>
                <span className="big-number">{stats.totalCounsellors}</span>
                <div className="stat-breakdown">
                  <span>
                    Avg{' '}
                    {stats.totalStudents > 0 && stats.totalCounsellors > 0
                      ? Math.round(
                          stats.totalStudents / stats.totalCounsellors
                        )
                      : 0}{' '}
                    students each
                  </span>
                </div>
              </div>
              <div className="report-stat-card">
                <h3>📋 Assessments</h3>
                <span className="big-number">
                  {data.interestAssessments?.length || 0}
                </span>
                <div className="stat-breakdown">
                  <span>{stats.totalTests} test results</span>
                </div>
              </div>
              <div className="report-stat-card">
                <h3>📅 Meetings</h3>
                <span className="big-number">{stats.totalMeetings}</span>
                <div className="stat-breakdown">
                  <span className="positive">
                    ✓{' '}
                    {
                      data.meetings.filter(m => m.status === 'completed')
                        .length
                    }{' '}
                    completed
                  </span>
                  <span>
                    ⏳{' '}
                    {
                      data.meetings.filter(
                        m =>
                          m.status === 'scheduled' ||
                          m.status === 'pending'
                      ).length
                    }{' '}
                    pending
                  </span>
                </div>
              </div>
            </div>

            <div className="detailed-reports">
              <div className="report-card">
                <div className="report-card-header">
                  <h3>📊 Student Progress</h3>
                </div>
                <div className="report-table-container">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Status</th>
                        <th>Mentor</th>
                        <th>Assessment</th>
                        <th>Meetings</th>
                        <th>Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(s => {
                        const counsellor = data.users.find(
                          u => u.id === s.assignedCounsellor
                        );
                        const assessment = data.interestAssessments?.find(
                          a => a.studentId === s.id
                        );
                        const meetings = data.meetings.filter(m =>
                          m.participants?.includes(s.id)
                        );
                        return (
                          <tr
                            key={s.id}
                            className={s.flagged ? 'flagged-row' : ''}
                          >
                            <td>
                              <strong>{s.name}</strong>
                              <small>{s.email}</small>
                            </td>
                            <td>
                              <span
                                className={`status-badge ${
                                  s.studentStatus || 'registered'
                                }`}
                              >
                                {s.studentStatus || 'Registered'}
                              </span>
                            </td>
                            <td>
                              {counsellor?.name || (
                                <span className="unassigned">
                                  Not Assigned
                                </span>
                              )}
                            </td>
                            <td>
                              {assessment ? (
                                <span className="positive">✓ Done</span>
                              ) : (
                                <span className="pending">Pending</span>
                              )}
                            </td>
                            <td>{meetings.length}</td>
                            <td>
                              {s.flagged ? (
                                <span
                                  className="flag-indicator"
                                  title={s.flagReason}
                                >
                                  🚩
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="report-card">
                <div className="report-card-header">
                  <h3>👨‍🏫 Counsellor Workload</h3>
                </div>
                <div className="report-table-container">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Mentor</th>
                        <th>Specialization</th>
                        <th>Students Assigned</th>
                        <th>Total Meetings</th>
                        <th>Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {counsellors.map(c => {
                        const assignedStudents = students.filter(
                          s => s.assignedCounsellor === c.id
                        );
                        const meetings = data.meetings.filter(
                          m => m.counsellorId === c.id
                        );
                        return (
                          <tr key={c.id}>
                            <td>
                              <strong>{c.name}</strong>
                              <small>{c.email}</small>
                            </td>
                            <td>{c.specialization || 'General'}</td>
                            <td>{assignedStudents.length}</td>
                            <td>{meetings.length}</td>
                            <td>
                              {
                                meetings.filter(
                                  m => m.status === 'completed'
                                ).length
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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
                <div className="profile-avatar">🛠️</div>
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
                    value={adminProfileForm.name}
                    onChange={(e) => setAdminProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <input
                    type="email"
                    value={adminProfileForm.email}
                    onChange={(e) => setAdminProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="detail-item">
                  <label>Username</label>
                  <input
                    type="text"
                    value={adminProfileForm.username}
                    onChange={(e) => setAdminProfileForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Choose a username"
                  />
                </div>
                <div className="detail-item">
                  <label>Role</label>
                  <span>{currentUser?.role || 'admin'}</span>
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

        {/* Support Inbox */}
        {activeTab === 'support' && (
          <div className="manage-section support-section">
            <div className="section-header">
              <h1>Support Inbox</h1>
            </div>

            {supportConversations.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">💬</span>
                <p>No support conversations yet. Messages that the bot cannot auto-answer will appear here.</p>
              </div>
            ) : (
              <div className="support-layout">
                <div className="support-list">
                  <h3>Open Conversations</h3>
                  <ul>
                    {supportConversations.map(conv => {
                      const lastMessage = (conv.messages || [])[conv.messages.length - 1];
                      const statusLabel = conv.status === 'closed' ? 'Closed' : 'Open';
                      return (
                        <li
                          key={conv.id}
                          className={`support-list-item ${
                            activeSupportConversation && activeSupportConversation.id === conv.id
                              ? 'active'
                              : ''
                          }`}
                          onClick={() => setActiveSupportId(conv.id)}
                        >
                          <div className="support-list-main">
                            <span className="support-list-title">
                              Visitor Session
                            </span>
                            <span className={`status-badge ${conv.status || 'open'}`}>
                              {statusLabel}
                            </span>
                          </div>
                          {lastMessage && (
                            <div className="support-list-snippet">
                              <span className="snippet-text">
                                {lastMessage.text.length > 60
                                  ? `${lastMessage.text.slice(0, 57)}...`
                                  : lastMessage.text}
                              </span>
                              <span className="snippet-time">
                                {lastMessage.timestamp
                                  ? new Date(lastMessage.timestamp).toLocaleString()
                                  : ''}
                              </span>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="support-detail">
                  {activeSupportConversation ? (
                    <>
                      <h3>Conversation Details</h3>
                      <div className="chat-history-list support-chat-history">
                        {(activeSupportConversation.messages || []).map(msg => {
                          const isAdmin = msg.from === 'admin';
                          return (
                            <div
                              key={msg.id}
                              className={`chat-bubble ${isAdmin ? 'sent' : 'received'}`}
                            >
                              <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                              <span className="chat-time">
                                {msg.timestamp
                                  ? new Date(msg.timestamp).toLocaleString()
                                  : ''}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {activeSupportConversation.status !== 'closed' && (
                        <div className="support-reply-box">
                          <h4>Reply as Admin</h4>
                          <textarea
                            value={supportReply}
                            onChange={e => setSupportReply(e.target.value)}
                            rows={2}
                            placeholder="Type your reply..."
                          />
                          <div className="support-actions-row">
                            <button
                              className="btn-primary btn-small"
                              onClick={handleSendSupportReply}
                              disabled={!supportReply.trim()}
                            >
                              Send Reply
                            </button>
                            <button
                              className="btn-secondary btn-small"
                              onClick={handleCloseSupportConversation}
                            >
                              Close Conversation
                            </button>
                          </div>
                        </div>
                      )}
                      {activeSupportConversation.status === 'closed' && (
                        <p className="no-data">This conversation is closed.</p>
                      )}
                    </>
                  ) : (
                    <p className="no-data">Select a conversation from the left.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Settings Panel */}
      {showSettings && (
        <AdminSettingsPanel onClose={() => setShowSettings(false)} />
      )}

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Student</h2>
              <button
                className="modal-close"
                onClick={() => setShowAddStudent(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={e =>
                    setStudentForm({ ...studentForm, name: e.target.value })
                  }
                  placeholder="Full name"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={studentForm.email}
                  onChange={e =>
                    setStudentForm({ ...studentForm, email: e.target.value })
                  }
                  placeholder="Email"
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={studentForm.username}
                  onChange={e =>
                    setStudentForm({
                      ...studentForm,
                      username: e.target.value
                    })
                  }
                  placeholder="Username (optional)"
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  autoComplete="off"
                  value={studentForm.password}
                  onChange={e =>
                    setStudentForm({
                      ...studentForm,
                      password: e.target.value
                    })
                  }
                  placeholder="Password"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowAddStudent(false)}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddStudent}>
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Counsellor Modal */}
      {showAddCounsellor && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Counsellor</h2>
              <button
                className="modal-close"
                onClick={() => setShowAddCounsellor(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={counsellorForm.name}
                  onChange={e =>
                    setCounsellorForm({
                      ...counsellorForm,
                      name: e.target.value
                    })
                  }
                  placeholder="Full name"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={counsellorForm.email}
                  onChange={e =>
                    setCounsellorForm({
                      ...counsellorForm,
                      email: e.target.value
                    })
                  }
                  placeholder="Email"
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={counsellorForm.username}
                  onChange={e =>
                    setCounsellorForm({
                      ...counsellorForm,
                      username: e.target.value
                    })
                  }
                  placeholder="Username (optional)"
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  autoComplete="off"
                  value={counsellorForm.password}
                  onChange={e =>
                    setCounsellorForm({
                      ...counsellorForm,
                      password: e.target.value
                    })
                  }
                  placeholder="Password"
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={counsellorForm.role}
                  onChange={e =>
                    setCounsellorForm({
                      ...counsellorForm,
                      role: e.target.value
                    })
                  }
                >
                  <option value="counsellor">Mentor (Counsellor)</option>
                  <option value="general_counsellor">General Counsellor</option>
                  <option value="evaluator">Evaluator</option>
                </select>
              </div>
              {counsellorForm.role === 'evaluator' && (
                <div className="form-group">
                  <label>Evaluator Type</label>
                  <select
                    value={counsellorForm.evaluatorType}
                    onChange={e =>
                      setCounsellorForm({
                        ...counsellorForm,
                        evaluatorType: e.target.value
                      })
                    }
                  >
                    <option value="student">Student Evaluator</option>
                    <option value="mentor">Mentor Evaluator</option>
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Specialization</label>
                <input
                  type="text"
                  value={counsellorForm.specialization}
                  onChange={e =>
                    setCounsellorForm({
                      ...counsellorForm,
                      specialization: e.target.value
                    })
                  }
                  placeholder="e.g. Technical Careers"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowAddCounsellor(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleAddCounsellor}
              >
                Add Counsellor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit User</h2>
              <button
                className="modal-close"
                onClick={() => setShowEditUser(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="text"
                  value={editForm.password}
                  onChange={e =>
                    setEditForm({
                      ...editForm,
                      password: e.target.value
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={editForm.role}
                  onChange={e =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                >
                  <option value="student">Student</option>
                  <option value="counsellor">Mentor (Counsellor)</option>
                  <option value="general_counsellor">General Counsellor</option>
                  <option value="evaluator">Evaluator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {editForm.role === 'evaluator' && (
                <div className="form-group">
                  <label>Evaluator Type</label>
                  <select
                    value={editForm.evaluatorType}
                    onChange={e =>
                      setEditForm({ ...editForm, evaluatorType: e.target.value })
                    }
                  >
                    <option value="student">Student Evaluator</option>
                    <option value="mentor">Mentor Evaluator</option>
                  </select>
                </div>
              )}
              {(editForm.role === 'counsellor' || editForm.role === 'general_counsellor') && (
                <div className="form-group">
                  <label>Specialization</label>
                  <input
                    type="text"
                    value={editForm.specialization}
                    onChange={e =>
                      setEditForm({
                        ...editForm,
                        specialization: e.target.value
                      })
                    }
                  />
                </div>
              )}
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editForm.status}
                  onChange={e =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowEditUser(false)}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Meeting Modal */}
      {showCreateMeeting && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h2>Create Meeting</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreateMeeting(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={meetingForm.title}
                  onChange={e =>
                    setMeetingForm({
                      ...meetingForm,
                      title: e.target.value
                    })
                  }
                  placeholder="Meeting title"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Counsellor *</label>
                  <select
                    value={meetingForm.counsellorId}
                    onChange={e =>
                      setMeetingForm({
                        ...meetingForm,
                        counsellorId: e.target.value
                      })
                    }
                  >
                    <option value="">Select</option>
                    {counsellors.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Student *</label>
                  <select
                    value={meetingForm.studentId}
                    onChange={e =>
                      setMeetingForm({
                        ...meetingForm,
                        studentId: e.target.value
                      })
                    }
                  >
                    <option value="">Select</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={meetingForm.date}
                    onChange={e =>
                      setMeetingForm({
                        ...meetingForm,
                        date: e.target.value
                      })
                    }
                    min={getTodayDate()}
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <select
                    value={meetingForm.time}
                    onChange={e =>
                      setMeetingForm({
                        ...meetingForm,
                        time: e.target.value
                      })
                    }
                  >
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Meeting Link</label>
                <input
                  type="url"
                  value={meetingForm.meetingLink}
                  onChange={e =>
                    setMeetingForm({
                      ...meetingForm,
                      meetingLink: e.target.value
                    })
                  }
                  placeholder="https://meet.google.com/..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowCreateMeeting(false)}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleCreateMeeting}>
                Create Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Change Password</h3>
            <ProfilePasswordSection hideTitle />
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;
