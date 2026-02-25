import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

function StudentDashboard() {
  const navigate = useNavigate();
  const { 
    data, currentUser, aptitudeQuestions, careerMapping,
    saveTestResult, addChatMessage 
  } = useData();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [chatMessage, setChatMessage] = useState('');

  // Get current student data
  const student = data.users.find(u => u.id === currentUser?.id);
  const assignedCounsellor = student?.assignedCounsellor 
    ? data.users.find(u => u.id === student.assignedCounsellor) 
    : null;

  // Get student's test results, chats, and meetings
  const myResults = data.testResults.filter(r => r.studentId === currentUser?.id);
  const myChats = assignedCounsellor 
    ? data.chats.filter(c => 
        (c.fromId === currentUser?.id && c.toId === assignedCounsellor.id) ||
        (c.fromId === assignedCounsellor.id && c.toId === currentUser?.id)
      ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    : [];
  const myMeetings = data.meetings.filter(m => 
    m.participants?.includes(currentUser?.id) || m.studentId === currentUser?.id
  );

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

  // Next question
  const nextQuestion = () => {
    if (currentQuestion < aptitudeQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitTest();
    }
  };

  // Calculate and save result
  const submitTest = () => {
    const categoryCounts = { analytical: 0, creative: 0, social: 0, technical: 0 };
    
    Object.entries(answers).forEach(([qId, selectedOptions]) => {
      const question = aptitudeQuestions.find(q => q.id === parseInt(qId));
      if (question) {
        selectedOptions.forEach(optIndex => {
          const category = question.optionCategories[optIndex];
          if (category) categoryCounts[category]++;
        });
      }
    });

    const topCategory = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    const careers = careerMapping[topCategory] || [];
    
    saveTestResult(currentUser.id, {
      answers,
      categoryCounts,
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
    if (chatMessage.trim() && assignedCounsellor) {
      addChatMessage(currentUser.id, assignedCounsellor.id, chatMessage.trim());
      setChatMessage('');
    }
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
        </div>
        
        <nav className="sidebar-nav">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            Dashboard
          </button>
          <button className={activeTab === 'test' ? 'active' : ''} onClick={() => setActiveTab('test')}>
            Take Test
          </button>
          <button className={activeTab === 'results' ? 'active' : ''} onClick={() => setActiveTab('results')}>
            My Results
          </button>
          <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>
            Chat
          </button>
          <button className={activeTab === 'meetings' ? 'active' : ''} onClick={() => setActiveTab('meetings')}>
            Meetings
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        
        {/* Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <h1>Welcome, {currentUser?.name}!</h1>
            
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">📝</span>
                <div>
                  <h3>{myResults.length}</h3>
                  <p>Tests Taken</p>
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
            </div>

            {/* Counsellor Info */}
            {assignedCounsellor && (
              <div className="info-card">
                <h3>Your Counsellor</h3>
                <div className="counsellor-info">
                  <p><strong>{assignedCounsellor.name}</strong></p>
                  <p>{assignedCounsellor.specialization || 'General Guidance'}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Take Test */}
        {activeTab === 'test' && (
          <div className="test-section">
            {!testStarted ? (
              <div className="test-intro">
                <h1>Career Aptitude Test</h1>
                <div className="test-info">
                  <p>{aptitudeQuestions.length} Questions</p>
                  <p>~10-15 minutes</p>
                  <p>Multiple selections allowed</p>
                </div>
                <p className="test-desc">
                  This test will analyze your interests and suggest career paths that match your personality.
                  Select all options that apply to you in each question.
                </p>
                <button className="btn-primary" onClick={() => setTestStarted(true)}>
                  Start Test
                </button>
              </div>
            ) : (
              <div className="test-question-card">
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${((currentQuestion + 1) / aptitudeQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                  <span>Question {currentQuestion + 1} of {aptitudeQuestions.length}</span>
                </div>

                <h2>{aptitudeQuestions[currentQuestion].question}</h2>
                <p className="select-hint">Select all that apply:</p>

                <div className="options-list">
                  {aptitudeQuestions[currentQuestion].options.map((option, index) => (
                    <label key={index} className={`option-checkbox ${(answers[aptitudeQuestions[currentQuestion].id] || []).includes(index) ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={(answers[aptitudeQuestions[currentQuestion].id] || []).includes(index)}
                        onChange={() => toggleAnswer(aptitudeQuestions[currentQuestion].id, index)}
                      />
                      <span className="checkmark"></span>
                      <span className="option-text">{option}</span>
                    </label>
                  ))}
                </div>

                <div className="test-navigation">
                  {currentQuestion > 0 && (
                    <button className="btn-secondary" onClick={() => setCurrentQuestion(currentQuestion - 1)}>
                      Previous
                    </button>
                  )}
                  <button 
                    className="btn-primary"
                    onClick={nextQuestion}
                    disabled={!(answers[aptitudeQuestions[currentQuestion].id]?.length > 0)}
                  >
                    {currentQuestion === aptitudeQuestions.length - 1 ? 'Submit Test' : 'Next'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {activeTab === 'results' && (
          <div className="results-section">
            <h1>My Test Results</h1>
            
            {myResults.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📊</span>
                <p>No test results yet.</p>
                <button className="btn-primary" onClick={() => setActiveTab('test')}>
                  Take Your First Test
                </button>
              </div>
            ) : (
              <div className="results-list">
                {myResults.map((result, index) => (
                  <div key={index} className="result-card">
                    <div className="result-header">
                      <h3>Test #{myResults.length - index}</h3>
                      <span className="result-date">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="result-category">
                      <span className="category-label">Your Profile:</span>
                      <span className="category-value">{result.topCategory}</span>
                    </div>

                    <div className="category-scores">
                      {Object.entries(result.categoryCounts).map(([cat, count]) => (
                        <div key={cat} className="score-bar">
                          <span>{cat}</span>
                          <div className="bar">
                            <div className="bar-fill" style={{ width: `${(count / 10) * 100}%` }}></div>
                          </div>
                          <span>{count}</span>
                        </div>
                      ))}
                    </div>

                    <div className="recommended-careers">
                      <h4>Recommended Careers:</h4>
                      <div className="career-tags">
                        {result.recommendedCareers.map((career, i) => (
                          <span key={i} className="career-tag">{career}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat */}
        {activeTab === 'chat' && (
          <div className="chat-section">
            <h1>Chat with Counsellor</h1>
            
            {!assignedCounsellor ? (
              <div className="empty-state">
                <span className="empty-icon">💬</span>
                <p>Chat will be available once a counsellor is assigned to you.</p>
              </div>
            ) : (
              <div className="chat-container">
                <div className="chat-header">
                  <span>👨‍🏫</span>
                  <span>{assignedCounsellor.name}</span>
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
                        <p>{msg.message}</p>
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
                <p className="no-data">No meetings scheduled yet.</p>
              ) : (
                myMeetings.map((meeting, index) => (
                  <div key={index} className={`meeting-card status-${meeting.status}`}>
                    <div className="meeting-info">
                      <h4>{meeting.topic || meeting.title}</h4>
                      <p>{meeting.date} at {meeting.time}</p>
                      <span className={`status-badge ${meeting.status}`}>
                        {meeting.status}
                      </span>
                      {meeting.meetingLink && meeting.status === 'approved' && (
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
      </main>
    </div>
  );
}

export default StudentDashboard;
