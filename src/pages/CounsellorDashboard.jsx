import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

function CounsellorDashboard() {
  const navigate = useNavigate();
  const { 
    data, currentUser, acceptStudentRequest, addChatMessage, 
    createMeeting, updateMeetingStatus, createGroup 
  } = useData();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
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
  
  // Pending student requests (students without assigned counsellor)
  const pendingRequests = data.users.filter(u => 
    u.role === 'student' && !u.assignedCounsellor
  );

  // My students (assigned to this counsellor)
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

  // Accept student request
  const handleAcceptStudent = (studentId) => {
    acceptStudentRequest(studentId, currentUser.id);
    alert('Student accepted! They are now in your list.');
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
      alert('Please fill in Title, Date, and Meeting Link');
      return;
    }

    // For individual meetings, require student selection
    if (meetingForm.type === 'individual' && !meetingForm.studentId) {
      alert('Please select a student for individual meeting');
      return;
    }

    // For group meetings, require group selection
    if (meetingForm.type === 'group' && groupForm.studentIds.length === 0) {
      alert('Please select students for group meeting');
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
    
    alert('Meeting created and notification sent to student(s)!');
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
    alert(`Meeting ${status}!`);
  };

  // Share meeting link with student
  const shareMeetingLink = (meeting) => {
    if (!meeting.meetingLink) {
      alert('No meeting link available for this meeting.');
      return;
    }
    const msg = `🔗 Reminder: Meeting "${meeting.title}" on ${meeting.date} at ${formatTime(meeting.time)}\n\nJoin Link: ${meeting.meetingLink}`;
    meeting.participants?.forEach(studentId => {
      addChatMessage(currentUser.id, studentId, msg);
    });
    alert('Meeting link shared with student(s)!');
  };

  // Create group
  const handleCreateGroup = () => {
    if (groupForm.name && groupForm.studentIds.length > 0) {
      createGroup(currentUser.id, groupForm.name, groupForm.studentIds);
      setGroupForm({ name: '', studentIds: [] });
      alert('Group created!');
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
          <img src="/logo.png" alt="PathWise" className="logo-img" />
          <h2>PathWise</h2>
        </div>
        <div className="user-info">
          <div className="avatar">👨‍🏫</div>
          <span>{currentUser?.name || 'Counsellor'}</span>
          <small>{counsellor?.specialization || 'General'}</small>
        </div>
        
        <nav className="sidebar-nav">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            🏠 Dashboard
          </button>
          <button className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>
            📋 Requests {pendingRequests.length > 0 && <span className="badge">{pendingRequests.length}</span>}
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
        </nav>

        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <h1>Welcome, {currentUser?.name}!</h1>
            
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">📋</span>
                <div>
                  <h3>{pendingRequests.length}</h3>
                  <p>Pending Requests</p>
                </div>
              </div>
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
            </div>

            {pendingRequests.length > 0 && (
              <div className="alert-card">
                <h3>⚠️ New Student Requests</h3>
                <p>You have {pendingRequests.length} student(s) waiting to be accepted.</p>
                <button className="btn-primary" onClick={() => setActiveTab('requests')}>
                  View Requests
                </button>
              </div>
            )}

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

        {/* Student Requests */}
        {activeTab === 'requests' && (
          <div className="requests-section">
            <h1>Student Requests</h1>
            
            {pendingRequests.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">✅</span>
                <p>No pending requests.</p>
              </div>
            ) : (
              <div className="requests-list">
                {pendingRequests.map(student => (
                  <div key={student.id} className="request-card">
                    <div className="request-info">
                      <div className="student-avatar">🎓</div>
                      <div>
                        <h3>{student.name}</h3>
                        <p>{student.email}</p>
                        <small>Registered: {new Date(student.createdAt).toLocaleDateString()}</small>
                      </div>
                    </div>
                    <button 
                      className="btn-primary"
                      onClick={() => handleAcceptStudent(student.id)}
                    >
                      Accept Student
                    </button>
                  </div>
                ))}
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
                <p>No students assigned yet.</p>
                <button className="btn-primary" onClick={() => setActiveTab('requests')}>
                  Accept Students
                </button>
              </div>
            ) : (
              <div className="students-grid">
                {myStudents.map(student => {
                  const results = getStudentResults(student.id);
                  return (
                    <div key={student.id} className="student-card">
                      <div className="student-header">
                        <span className="student-avatar">🎓</span>
                        <div>
                          <h3>{student.name}</h3>
                          <p>{student.email}</p>
                        </div>
                      </div>
                      
                      <div className="student-stats">
                        <span>Tests: {results.length}</span>
                        {results.length > 0 && (
                          <span>Profile: {results[results.length - 1].topCategory}</span>
                        )}
                      </div>

                      <div className="student-actions">
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
                          📅 Schedule Meeting
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
      </main>
    </div>
  );
}

export default CounsellorDashboard;
