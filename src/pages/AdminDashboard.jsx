import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

function AdminDashboard() {
  const navigate = useNavigate();
  const { 
    data, currentUser, aptitudeQuestions, addUser, deleteUser, 
    toggleUserStatus, acceptStudentRequest, createMeeting, 
    updateMeetingStatus, addChatMessage 
  } = useData();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddCounsellor, setShowAddCounsellor] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showEditUser, setShowEditUser] = useState(null);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  
  // Profile view states
  const [viewingStudent, setViewingStudent] = useState(null);
  const [viewingCounsellor, setViewingCounsellor] = useState(null);
  const [viewingChat, setViewingChat] = useState(null); // { studentId, counsellorId }
  
  // Form states
  const [counsellorForm, setCounsellorForm] = useState({
    name: '', email: '', password: '', specialization: ''
  });
  const [studentForm, setStudentForm] = useState({
    name: '', email: '', password: ''
  });
  const [editForm, setEditForm] = useState({});
  const [meetingForm, setMeetingForm] = useState({
    title: '', date: '', time: '10:00', counsellorId: '', studentId: '', meetingLink: ''
  });

  // Filter users by role
  const students = data.users.filter(u => u.role === 'student');
  const counsellors = data.users.filter(u => u.role === 'counsellor');
  
  // Statistics
  const stats = {
    totalStudents: students.length,
    totalCounsellors: counsellors.length,
    totalMeetings: data.meetings.length,
    totalTests: data.testResults.length,
    totalGroups: data.groups.length,
    totalChats: data.chats.length,
    unassignedStudents: students.filter(s => !s.assignedCounsellor).length
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  // Add Counsellor
  const handleAddCounsellor = () => {
    if (!counsellorForm.name || !counsellorForm.email || !counsellorForm.password) {
      alert('Please fill all required fields');
      return;
    }
    if (data.users.find(u => u.email === counsellorForm.email)) {
      alert('Email already exists!');
      return;
    }
    addUser({ ...counsellorForm, role: 'counsellor', status: 'active' });
    setCounsellorForm({ name: '', email: '', password: '', specialization: '' });
    setShowAddCounsellor(false);
    alert('Counsellor added successfully!');
  };

  // Add Student
  const handleAddStudent = () => {
    if (!studentForm.name || !studentForm.email || !studentForm.password) {
      alert('Please fill all required fields');
      return;
    }
    if (data.users.find(u => u.email === studentForm.email)) {
      alert('Email already exists!');
      return;
    }
    addUser({ ...studentForm, role: 'student', status: 'active' });
    setStudentForm({ name: '', email: '', password: '' });
    setShowAddStudent(false);
    alert('Student added successfully!');
  };

  // Delete user
  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  // Toggle user status
  const handleToggleStatus = (userId) => {
    toggleUserStatus(userId);
  };

  // Assign counsellor to student
  const handleAssignCounsellor = (studentId, counsellorId) => {
    if (!counsellorId) {
      alert('Please select a counsellor');
      return;
    }
    acceptStudentRequest(studentId, parseInt(counsellorId));
    alert('Counsellor assigned successfully!');
  };

  // Edit user
  const handleEditUser = (user) => {
    setEditForm({ ...user });
    setShowEditUser(user.id);
  };

  // Save edited user
  const handleSaveEdit = () => {
    const updatedUsers = data.users.map(u => 
      u.id === editForm.id ? { ...u, ...editForm } : u
    );
    localStorage.setItem('pathwiseData', JSON.stringify({ ...data, users: updatedUsers }));
    window.location.reload();
  };

  // Create meeting
  const handleCreateMeeting = () => {
    if (!meetingForm.title || !meetingForm.date || !meetingForm.counsellorId || !meetingForm.studentId) {
      alert('Please fill all required fields');
      return;
    }
    createMeeting(parseInt(meetingForm.counsellorId), {
      title: meetingForm.title,
      date: meetingForm.date,
      time: meetingForm.time,
      meetingLink: meetingForm.meetingLink,
      participants: [parseInt(meetingForm.studentId)],
      type: 'individual'
    });
    if (meetingForm.meetingLink) {
      const counsellor = data.users.find(u => u.id === parseInt(meetingForm.counsellorId));
      addChatMessage(parseInt(meetingForm.counsellorId), parseInt(meetingForm.studentId), 
        `📅 Admin scheduled a meeting:\n\nTitle: ${meetingForm.title}\nDate: ${meetingForm.date}\nTime: ${formatTime(meetingForm.time)}\nCounsellor: ${counsellor?.name}\n\n🔗 Meeting Link: ${meetingForm.meetingLink}`
      );
    }
    setMeetingForm({ title: '', date: '', time: '10:00', counsellorId: '', studentId: '', meetingLink: '' });
    setShowCreateMeeting(false);
    alert('Meeting created successfully!');
  };

  // Delete meeting
  const handleDeleteMeeting = (meetingId) => {
    if (window.confirm('Delete this meeting?')) {
      const updatedMeetings = data.meetings.filter(m => m.id !== meetingId);
      localStorage.setItem('pathwiseData', JSON.stringify({ ...data, meetings: updatedMeetings }));
      window.location.reload();
    }
  };

  // Handle meeting status
  const handleMeetingStatus = (meetingId, status) => {
    updateMeetingStatus(meetingId, status);
    alert(`Meeting ${status}!`);
  };

  // Format time
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  // Get assigned counsellor name
  const getCounsellorName = (counsellorId) => {
    if (!counsellorId) return 'Not Assigned';
    const counsellor = data.users.find(u => u.id === counsellorId);
    return counsellor ? counsellor.name : 'Not Assigned';
  };

  // Get student count for counsellor
  const getStudentCount = (counsellorId) => {
    return students.filter(s => s.assignedCounsellor === counsellorId).length;
  };

  // Get all data for a student
  const getStudentData = (studentId) => {
    const student = data.users.find(u => u.id === studentId);
    const counsellor = student?.assignedCounsellor 
      ? data.users.find(u => u.id === student.assignedCounsellor) 
      : null;
    const testResults = data.testResults.filter(t => t.studentId === studentId);
    const meetings = data.meetings.filter(m => 
      m.participants?.includes(studentId) || m.studentId === studentId
    );
    const chats = counsellor 
      ? data.chats.filter(c => 
          (c.fromId === studentId && c.toId === counsellor.id) ||
          (c.fromId === counsellor.id && c.toId === studentId)
        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      : [];
    return { student, counsellor, testResults, meetings, chats };
  };

  // Get all data for a counsellor
  const getCounsellorData = (counsellorId) => {
    const counsellor = data.users.find(u => u.id === counsellorId);
    const assignedStudents = students.filter(s => s.assignedCounsellor === counsellorId);
    const meetings = data.meetings.filter(m => m.counsellorId === counsellorId);
    const groups = data.groups.filter(g => g.counsellorId === counsellorId);
    return { counsellor, assignedStudents, meetings, groups };
  };

  // Get chat between student and counsellor
  const getChatBetween = (studentId, counsellorId) => {
    return data.chats.filter(c => 
      (c.fromId === studentId && c.toId === counsellorId) ||
      (c.fromId === counsellorId && c.toId === studentId)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  return (
    <div className="dashboard-layout admin-layout">
      {/* Sidebar */}
      <aside className="sidebar admin-sidebar">
        <div className="sidebar-header">
          <img src="/logo.png" alt="PathWise" className="logo-img" />
          <h2>PathWise</h2>
        </div>
        <div className="user-info">
          <div className="avatar">👤</div>
          <span>Admin</span>
        </div>
        
        <nav className="sidebar-nav">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            📊 Dashboard
          </button>
          <button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>
            👥 Students {stats.unassignedStudents > 0 && <span className="badge">{stats.unassignedStudents}</span>}
          </button>
          <button className={activeTab === 'counsellors' ? 'active' : ''} onClick={() => setActiveTab('counsellors')}>
            👨‍🏫 Counsellors
          </button>
          <button className={activeTab === 'assignments' ? 'active' : ''} onClick={() => setActiveTab('assignments')}>
            🔗 Assignments
          </button>
          <button className={activeTab === 'meetings' ? 'active' : ''} onClick={() => setActiveTab('meetings')}>
            📅 Meetings
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <h1>Admin Dashboard</h1>
            <p className="subtitle">Full platform control and management</p>
            
            <div className="stats-grid">
              <div className="stat-card admin-stat" onClick={() => setActiveTab('students')}>
                <span className="stat-icon">👥</span>
                <div>
                  <h3>{stats.totalStudents}</h3>
                  <p>Students</p>
                </div>
              </div>
              <div className="stat-card admin-stat" onClick={() => setActiveTab('counsellors')}>
                <span className="stat-icon">👨‍🏫</span>
                <div>
                  <h3>{stats.totalCounsellors}</h3>
                  <p>Counsellors</p>
                </div>
              </div>
              <div className="stat-card admin-stat" onClick={() => setActiveTab('meetings')}>
                <span className="stat-icon">📅</span>
                <div>
                  <h3>{stats.totalMeetings}</h3>
                  <p>Meetings</p>
                </div>
              </div>
              <div className="stat-card admin-stat" onClick={() => setActiveTab('chats')}>
                <span className="stat-icon">💬</span>
                <div>
                  <h3>{stats.totalChats}</h3>
                  <p>Messages</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button className="btn-primary" onClick={() => setShowAddCounsellor(true)}>
                  ➕ Add Counsellor
                </button>
                <button className="btn-primary" onClick={() => setShowAddStudent(true)}>
                  ➕ Add Student
                </button>
                <button className="btn-secondary" onClick={() => setShowCreateMeeting(true)}>
                  📅 Create Meeting
                </button>
                <button className="btn-secondary" onClick={() => setActiveTab('chats')}>
                  💬 View All Chats
                </button>
              </div>
            </div>

            {stats.unassignedStudents > 0 && (
              <div className="alert-card warning">
                <h3>⚠️ Unassigned Students</h3>
                <p>{stats.unassignedStudents} student(s) without a counsellor.</p>
                <button className="btn-primary" onClick={() => setActiveTab('assignments')}>
                  Assign Now
                </button>
              </div>
            )}

            {/* Assignment Overview */}
            <div className="admin-summary">
              <div className="summary-card">
                <h3>📋 Student-Counsellor Assignments</h3>
                {students.filter(s => s.assignedCounsellor).length === 0 ? (
                  <p className="no-data">No assignments yet</p>
                ) : (
                  students.filter(s => s.assignedCounsellor).slice(0, 5).map(s => (
                    <div key={s.id} className="summary-item clickable" onClick={() => setViewingStudent(s.id)}>
                      <span>🎓 {s.name}</span>
                      <small>→ 👨‍🏫 {getCounsellorName(s.assignedCounsellor)}</small>
                    </div>
                  ))
                )}
                {students.filter(s => s.assignedCounsellor).length > 5 && (
                  <button className="btn-link" onClick={() => setActiveTab('assignments')}>
                    View all →
                  </button>
                )}
              </div>
              
              <div className="summary-card">
                <h3>💬 Recent Chats</h3>
                {data.chats.length === 0 ? (
                  <p className="no-data">No messages yet</p>
                ) : (
                  data.chats.slice(-5).reverse().map((chat, i) => {
                    const from = data.users.find(u => u.id === chat.fromId);
                    const to = data.users.find(u => u.id === chat.toId);
                    return (
                      <div key={i} className="summary-item">
                        <span>{from?.name} → {to?.name}</span>
                        <small>{chat.message.substring(0, 30)}...</small>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Students Management */}
        {activeTab === 'students' && !viewingStudent && (
          <div className="manage-section">
            <div className="section-header">
              <h1>Manage Students</h1>
              <button className="btn-primary" onClick={() => setShowAddStudent(true)}>
                ➕ Add Student
              </button>
            </div>
            
            {students.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">👥</span>
                <p>No students registered yet.</p>
                <button className="btn-primary" onClick={() => setShowAddStudent(true)}>
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
                      <th>Counsellor</th>
                      <th>Tests</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td>
                          <span className="clickable-name" onClick={() => setViewingStudent(student.id)}>
                            {student.name}
                          </span>
                        </td>
                        <td>{student.email}</td>
                        <td>
                          <span className={student.assignedCounsellor ? 'assigned' : 'unassigned'}>
                            {getCounsellorName(student.assignedCounsellor)}
                          </span>
                        </td>
                        <td>{data.testResults.filter(t => t.studentId === student.id).length}</td>
                        <td>
                          <span className={`status-badge ${student.status || 'active'}`}>
                            {student.status || 'active'}
                          </span>
                        </td>
                        <td className="action-cell">
                          <button className="btn-small btn-primary" onClick={() => setViewingStudent(student.id)}>
                            👁️ View
                          </button>
                          <button className="btn-small btn-info" onClick={() => handleEditUser(student)}>
                            ✏️
                          </button>
                          <button className="btn-small btn-secondary" onClick={() => handleToggleStatus(student.id)}>
                            {student.status === 'inactive' ? '✅' : '🚫'}
                          </button>
                          <button className="btn-small btn-danger" onClick={() => handleDeleteUser(student.id)}>
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

        {/* Student Profile View */}
        {activeTab === 'students' && viewingStudent && (
          <div className="profile-view">
            <button className="btn-back" onClick={() => setViewingStudent(null)}>
              ← Back to Students
            </button>
            
            {(() => {
              const { student, counsellor, testResults, meetings, chats } = getStudentData(viewingStudent);
              if (!student) return <p>Student not found</p>;
              
              return (
                <>
                  <div className="profile-header">
                    <div className="profile-avatar">🎓</div>
                    <div className="profile-info">
                      <h1>{student.name}</h1>
                      <p>{student.email}</p>
                      <span className={`status-badge ${student.status || 'active'}`}>
                        {student.status || 'active'}
                      </span>
                    </div>
                    <div className="profile-actions">
                      <button className="btn-info" onClick={() => handleEditUser(student)}>
                        ✏️ Edit Profile
                      </button>
                    </div>
                  </div>

                  <div className="profile-section">
                    <h3>👨‍🏫 Assigned Counsellor</h3>
                    {counsellor ? (
                      <div className="info-card clickable" onClick={() => { setViewingStudent(null); setViewingCounsellor(counsellor.id); setActiveTab('counsellors'); }}>
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

                  <div className="profile-section">
                    <h3>📝 Test Results ({testResults.length})</h3>
                    {testResults.length === 0 ? (
                      <p className="no-data">No tests taken yet</p>
                    ) : (
                      <div className="results-list">
                        {testResults.map((result, i) => (
                          <div key={i} className="result-card">
                            <div className="result-header">
                              <span className="category-badge">{result.topCategory}</span>
                              <small>{new Date(result.completedAt).toLocaleDateString()}</small>
                            </div>
                            <div className="result-careers">
                              <strong>Recommended Careers:</strong>
                              <ul>
                                {result.recommendedCareers?.map((career, j) => (
                                  <li key={j}>{career}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="profile-section">
                    <h3>📅 Meetings ({meetings.length})</h3>
                    {meetings.length === 0 ? (
                      <p className="no-data">No meetings scheduled</p>
                    ) : (
                      <div className="meetings-list">
                        {meetings.map(meeting => (
                          <div key={meeting.id} className="meeting-item">
                            <strong>{meeting.title || meeting.topic}</strong>
                            <span>{meeting.date} at {formatTime(meeting.time)}</span>
                            <span className={`status-badge ${meeting.status}`}>{meeting.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="profile-section">
                    <h3>💬 Chat History with Counsellor ({chats.length} messages)</h3>
                    {chats.length === 0 ? (
                      <p className="no-data">No chat messages</p>
                    ) : (
                      <div className="chat-history">
                        {chats.map((msg, i) => {
                          const sender = data.users.find(u => u.id === msg.fromId);
                          return (
                            <div key={i} className={`chat-message ${msg.fromId === student.id ? 'student-msg' : 'counsellor-msg'}`}>
                              <div className="msg-header">
                                <strong>{sender?.name}</strong>
                                <small>{new Date(msg.timestamp).toLocaleString()}</small>
                              </div>
                              <p style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</p>
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

        {/* Counsellors Management */}
        {activeTab === 'counsellors' && !viewingCounsellor && (
          <div className="manage-section">
            <div className="section-header">
              <h1>Manage Counsellors</h1>
              <button className="btn-primary" onClick={() => setShowAddCounsellor(true)}>
                ➕ Add Counsellor
              </button>
            </div>
            
            {counsellors.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">👨‍🏫</span>
                <p>No counsellors registered yet.</p>
                <button className="btn-primary" onClick={() => setShowAddCounsellor(true)}>
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
                          <span className="clickable-name" onClick={() => setViewingCounsellor(counsellor.id)}>
                            {counsellor.name}
                          </span>
                        </td>
                        <td>{counsellor.email}</td>
                        <td>{counsellor.specialization || 'General'}</td>
                        <td>{getStudentCount(counsellor.id)}</td>
                        <td>{data.meetings.filter(m => m.counsellorId === counsellor.id).length}</td>
                        <td>
                          <span className={`status-badge ${counsellor.status || 'active'}`}>
                            {counsellor.status || 'active'}
                          </span>
                        </td>
                        <td className="action-cell">
                          <button className="btn-small btn-primary" onClick={() => setViewingCounsellor(counsellor.id)}>
                            👁️ View
                          </button>
                          <button className="btn-small btn-info" onClick={() => handleEditUser(counsellor)}>
                            ✏️
                          </button>
                          <button className="btn-small btn-secondary" onClick={() => handleToggleStatus(counsellor.id)}>
                            {counsellor.status === 'inactive' ? '✅' : '🚫'}
                          </button>
                          <button className="btn-small btn-danger" onClick={() => handleDeleteUser(counsellor.id)}>
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

        {/* Counsellor Profile View */}
        {activeTab === 'counsellors' && viewingCounsellor && (
          <div className="profile-view">
            <button className="btn-back" onClick={() => setViewingCounsellor(null)}>
              ← Back to Counsellors
            </button>
            
            {(() => {
              const { counsellor, assignedStudents, meetings, groups } = getCounsellorData(viewingCounsellor);
              if (!counsellor) return <p>Counsellor not found</p>;
              
              return (
                <>
                  <div className="profile-header">
                    <div className="profile-avatar">👨‍🏫</div>
                    <div className="profile-info">
                      <h1>{counsellor.name}</h1>
                      <p>{counsellor.email}</p>
                      <span className="specialization-badge">{counsellor.specialization || 'General'}</span>
                      <span className={`status-badge ${counsellor.status || 'active'}`}>
                        {counsellor.status || 'active'}
                      </span>
                    </div>
                    <div className="profile-actions">
                      <button className="btn-info" onClick={() => handleEditUser(counsellor)}>
                        ✏️ Edit Profile
                      </button>
                    </div>
                  </div>

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

                  <div className="profile-section">
                    <h3>👥 Assigned Students ({assignedStudents.length})</h3>
                    {assignedStudents.length === 0 ? (
                      <p className="no-data">No students assigned</p>
                    ) : (
                      <div className="students-grid">
                        {assignedStudents.map(student => {
                          const chatCount = getChatBetween(student.id, counsellor.id).length;
                          const testCount = data.testResults.filter(t => t.studentId === student.id).length;
                          return (
                            <div key={student.id} className="student-mini-card">
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
                                  onClick={() => { setViewingCounsellor(null); setViewingStudent(student.id); setActiveTab('students'); }}
                                >
                                  View Profile
                                </button>
                                <button 
                                  className="btn-small btn-secondary"
                                  onClick={() => setViewingChat({ studentId: student.id, counsellorId: counsellor.id })}
                                >
                                  View Chat
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
                          const participants = meeting.participants?.map(pId => {
                            const s = data.users.find(u => u.id === pId);
                            return s?.name || 'Unknown';
                          }).join(', ');
                          return (
                            <div key={meeting.id} className="meeting-item">
                              <strong>{meeting.title || meeting.topic}</strong>
                              <span>👥 {participants}</span>
                              <span>📅 {meeting.date} at {formatTime(meeting.time)}</span>
                              <span className={`status-badge ${meeting.status}`}>{meeting.status}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="profile-section">
                    <h3>👨‍👩‍👧‍👦 Groups ({groups.length})</h3>
                    {groups.length === 0 ? (
                      <p className="no-data">No groups created</p>
                    ) : (
                      <div className="groups-list">
                        {groups.map(group => (
                          <div key={group.id} className="group-item">
                            <strong>{group.name}</strong>
                            <span>{group.studentIds.length} members</span>
                          </div>
                        ))}
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
                      <th>Messages</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => {
                      const counsellor = student.assignedCounsellor 
                        ? data.users.find(u => u.id === student.assignedCounsellor)
                        : null;
                      const chatCount = counsellor 
                        ? getChatBetween(student.id, counsellor.id).length 
                        : 0;
                      return (
                        <tr key={student.id}>
                          <td>
                            <span className="clickable-name" onClick={() => { setViewingStudent(student.id); setActiveTab('students'); }}>
                              🎓 {student.name}
                            </span>
                          </td>
                          <td>{student.email}</td>
                          <td>
                            {counsellor ? (
                              <span className="clickable-name" onClick={() => { setViewingCounsellor(counsellor.id); setActiveTab('counsellors'); }}>
                                👨‍🏫 {counsellor.name}
                              </span>
                            ) : (
                              <span className="unassigned">Not Assigned</span>
                            )}
                          </td>
                          <td>{chatCount > 0 ? `💬 ${chatCount}` : '-'}</td>
                          <td className="action-cell">
                            <select
                              value={student.assignedCounsellor || ''}
                              onChange={(e) => handleAssignCounsellor(student.id, e.target.value)}
                            >
                              <option value="">-- Assign --</option>
                              {counsellors.map(c => (
                                <option key={c.id} value={c.id}>
                                  {c.name} ({getStudentCount(c.id)} students)
                                </option>
                              ))}
                            </select>
                            {counsellor && chatCount > 0 && (
                              <button 
                                className="btn-small btn-secondary"
                                onClick={() => setViewingChat({ studentId: student.id, counsellorId: counsellor.id })}
                              >
                                View Chat
                              </button>
                            )}
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

        {/* View Chat Between Student-Counsellor */}
        {viewingChat && (
          <div className="modal-overlay" onClick={() => setViewingChat(null)}>
            <div className="modal modal-large" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>💬 Chat Conversation</h2>
                <button className="modal-close" onClick={() => setViewingChat(null)}>×</button>
              </div>
              <div className="modal-body">
                {(() => {
                  const student = data.users.find(u => u.id === viewingChat.studentId);
                  const counsellor = data.users.find(u => u.id === viewingChat.counsellorId);
                  const chats = getChatBetween(viewingChat.studentId, viewingChat.counsellorId);
                  
                  return (
                    <>
                      <div className="chat-participants">
                        <div className="participant">
                          <span>🎓</span>
                          <strong>{student?.name}</strong>
                          <small>Student</small>
                        </div>
                        <span>↔️</span>
                        <div className="participant">
                          <span>👨‍🏫</span>
                          <strong>{counsellor?.name}</strong>
                          <small>Counsellor</small>
                        </div>
                      </div>
                      
                      <div className="admin-chat-view">
                        {chats.length === 0 ? (
                          <p className="no-data">No messages in this conversation</p>
                        ) : (
                          chats.map((msg, i) => {
                            const isStudent = msg.fromId === viewingChat.studentId;
                            const sender = data.users.find(u => u.id === msg.fromId);
                            return (
                              <div key={i} className={`admin-chat-msg ${isStudent ? 'from-student' : 'from-counsellor'}`}>
                                <div className="msg-meta">
                                  <strong>{sender?.name}</strong>
                                  <small>{new Date(msg.timestamp).toLocaleString()}</small>
                                </div>
                                <div className="msg-content">
                                  <p style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setViewingChat(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Meetings */}
        {activeTab === 'meetings' && (
          <div className="manage-section">
            <div className="section-header">
              <h1>All Meetings</h1>
              <button className="btn-primary" onClick={() => setShowCreateMeeting(true)}>
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
                      <th>Counsellor</th>
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
                      const counsellor = data.users.find(u => u.id === meeting.counsellorId);
                      const participants = meeting.participants?.map(pId => {
                        const s = data.users.find(u => u.id === pId);
                        return s?.name || 'Unknown';
                      }).join(', ') || 'N/A';
                      return (
                        <tr key={meeting.id}>
                          <td>{meeting.title || meeting.topic}</td>
                          <td>{counsellor?.name || 'Unknown'}</td>
                          <td>{participants}</td>
                          <td>{meeting.date}</td>
                          <td>{formatTime(meeting.time)}</td>
                          <td>
                            {meeting.meetingLink ? (
                              <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">🔗</a>
                            ) : '-'}
                          </td>
                          <td>
                            <span className={`status-badge ${meeting.status}`}>{meeting.status}</span>
                          </td>
                          <td className="action-cell">
                            {meeting.status === 'pending' && (
                              <>
                                <button className="btn-small btn-success" onClick={() => handleMeetingStatus(meeting.id, 'approved')}>✅</button>
                                <button className="btn-small btn-warning" onClick={() => handleMeetingStatus(meeting.id, 'rejected')}>❌</button>
                              </>
                            )}
                            <button className="btn-small btn-danger" onClick={() => handleDeleteMeeting(meeting.id)}>🗑️</button>
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

        {/* Add Counsellor Modal */}
        {showAddCounsellor && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Add New Counsellor</h2>
                <button className="modal-close" onClick={() => setShowAddCounsellor(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" value={counsellorForm.name} onChange={(e) => setCounsellorForm({ ...counsellorForm, name: e.target.value })} placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={counsellorForm.email} onChange={(e) => setCounsellorForm({ ...counsellorForm, email: e.target.value })} placeholder="Email" />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input type="password" value={counsellorForm.password} onChange={(e) => setCounsellorForm({ ...counsellorForm, password: e.target.value })} placeholder="Password" />
                </div>
                <div className="form-group">
                  <label>Specialization</label>
                  <select value={counsellorForm.specialization} onChange={(e) => setCounsellorForm({ ...counsellorForm, specialization: e.target.value })}>
                    <option value="">General</option>
                    <option value="Career Counselling">Career Counselling</option>
                    <option value="Academic Guidance">Academic Guidance</option>
                    <option value="Technical Careers">Technical Careers</option>
                    <option value="Creative Arts">Creative Arts</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowAddCounsellor(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleAddCounsellor}>Add Counsellor</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Student Modal */}
        {showAddStudent && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Add New Student</h2>
                <button className="modal-close" onClick={() => setShowAddStudent(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} placeholder="Email" />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input type="password" value={studentForm.password} onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} placeholder="Password" />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowAddStudent(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleAddStudent}>Add Student</button>
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
                <button className="modal-close" onClick={() => setShowEditUser(null)}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="text" value={editForm.password || ''} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                </div>
                {editForm.role === 'counsellor' && (
                  <div className="form-group">
                    <label>Specialization</label>
                    <input type="text" value={editForm.specialization || ''} onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })} />
                  </div>
                )}
                <div className="form-group">
                  <label>Status</label>
                  <select value={editForm.status || 'active'} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowEditUser(null)}>Cancel</button>
                <button className="btn-primary" onClick={handleSaveEdit}>Save Changes</button>
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
                <button className="modal-close" onClick={() => setShowCreateMeeting(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title *</label>
                  <input type="text" value={meetingForm.title} onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })} placeholder="Meeting title" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Counsellor *</label>
                    <select value={meetingForm.counsellorId} onChange={(e) => setMeetingForm({ ...meetingForm, counsellorId: e.target.value })}>
                      <option value="">Select</option>
                      {counsellors.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Student *</label>
                    <select value={meetingForm.studentId} onChange={(e) => setMeetingForm({ ...meetingForm, studentId: e.target.value })}>
                      <option value="">Select</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date *</label>
                    <input type="date" value={meetingForm.date} onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })} min={getTodayDate()} />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <select value={meetingForm.time} onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}>
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
                  <input type="url" value={meetingForm.meetingLink} onChange={(e) => setMeetingForm({ ...meetingForm, meetingLink: e.target.value })} placeholder="https://meet.google.com/..." />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowCreateMeeting(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleCreateMeeting}>Create Meeting</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
