import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

function Database() {
  const navigate = useNavigate();
  const { data, refreshData, syncStatus } = useData();
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Sync with backend on mount
  useEffect(() => {
    refreshData();
  }, []);

  // Filter users by role
  const students = data.users.filter(u => u.role === 'student');
  const counsellors = data.users.filter(u => u.role === 'counsellor');
  const generalCounsellors = data.users.filter(u => u.role === 'general_counsellor');
  const evaluators = data.users.filter(u => u.role === 'evaluator');
  const admins = data.users.filter(u => u.role === 'admin');

  // Search filter
  const filterUsers = (users) => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(u => 
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.username?.toLowerCase().includes(term) ||
      u.collegeName?.toLowerCase().includes(term) ||
      u.specialization?.toLowerCase().includes(term)
    );
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'pending_verification': '#f59e0b',
      'verified': '#10b981',
      'assessment_completed': '#3b82f6',
      'counsellor_assigned': '#8b5cf6',
      'active_guidance': '#06b6d4',
      'rejected': '#ef4444',
      'active': '#10b981'
    };
    return colors[status] || '#64748b';
  };

  // Format status
  const formatStatus = (status) => {
    if (!status) return 'N/A';
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // Get assigned counsellor name
  const getCounsellorName = (counsellorId) => {
    if (!counsellorId) return 'Not Assigned';
    const counsellor = data.users.find(u => u.id === counsellorId);
    return counsellor?.name || 'Unknown';
  };

  // Get student count for counsellor
  const getStudentCount = (counsellorId) => {
    return students.filter(s => s.assignedCounsellor === counsellorId).length;
  };

  // Get assessment for student
  const getAssessment = (studentId) => {
    return data.interestAssessments?.find(a => a.studentId === studentId);
  };

  const renderUserCard = (user, type) => {
    const assessment = type === 'student' ? getAssessment(user.id) : null;
    
    return (
      <div key={user.id} className="db-user-card" onClick={() => setSelectedUser(user)}>
        <div className="db-card-header">
          <div className="db-avatar">
            {type === 'student' ? '🎓' : type === 'counsellor' ? '👨‍🏫' : type === 'evaluator' ? '✅' : type === 'general' ? '🎯' : '👑'}
          </div>
          <div className="db-user-info">
            <h3>{user.name}</h3>
            <span className="db-email">{user.email}</span>
            {user.username && <span className="db-username">@{user.username}</span>}
          </div>
          {user.studentStatus && (
            <span 
              className="db-status-badge"
              style={{ backgroundColor: getStatusColor(user.studentStatus) }}
            >
              {formatStatus(user.studentStatus)}
            </span>
          )}
        </div>
        
        <div className="db-card-details">
          {type === 'student' && (
            <>
              <div className="db-detail-row">
                <span className="db-label">College:</span>
                <span className="db-value">{user.collegeName || 'N/A'}</span>
              </div>
              <div className="db-detail-row">
                <span className="db-label">Branch:</span>
                <span className="db-value">{user.branch || 'N/A'}</span>
              </div>
              <div className="db-detail-row">
                <span className="db-label">Year:</span>
                <span className="db-value">{user.currentYear || 'N/A'}</span>
              </div>
              <div className="db-detail-row">
                <span className="db-label">Mentor:</span>
                <span className="db-value">{getCounsellorName(user.assignedCounsellor)}</span>
              </div>
              {assessment && (
                <div className="db-detail-row">
                  <span className="db-label">Assessment:</span>
                  <span className="db-value assessment-done">✓ Completed</span>
                </div>
              )}
            </>
          )}
          
          {(type === 'counsellor' || type === 'general') && (
            <>
              <div className="db-detail-row">
                <span className="db-label">Specialization:</span>
                <span className="db-value">{user.specialization || 'General'}</span>
              </div>
              <div className="db-detail-row">
                <span className="db-label">Students:</span>
                <span className="db-value">{getStudentCount(user.id)} assigned</span>
              </div>
              <div className="db-detail-row">
                <span className="db-label">Status:</span>
                <span className="db-value" style={{ color: user.isActive !== false ? '#10b981' : '#ef4444' }}>
                  {user.isActive !== false ? '● Active' : '○ Inactive'}
                </span>
              </div>
            </>
          )}
          
          {type === 'evaluator' && (
            <>
              <div className="db-detail-row">
                <span className="db-label">Type:</span>
                <span className="db-value">{user.evaluatorType === 'counsellor' ? 'Mentor Verifier' : 'Student Verifier'}</span>
              </div>
              <div className="db-detail-row">
                <span className="db-label">Status:</span>
                <span className="db-value" style={{ color: '#10b981' }}>● Active</span>
              </div>
            </>
          )}
        </div>
        
        <div className="db-card-footer">
          <span className="db-id">ID: {user.id}</span>
          <span className="db-created">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="database-page">
      {/* Header */}
      <header className="db-header">
        <div className="db-brand">
          <span className="db-logo">🗄️</span>
          <h1>Database Viewer</h1>
          <span className="db-subtitle">PathWise User Database</span>
        </div>
        <div className="db-actions">
          <button 
            className={`btn-sync ${syncStatus}`}
            onClick={refreshData}
            style={{
              background: syncStatus === 'synced' ? '#27ae60' : syncStatus === 'syncing' ? '#f39c12' : syncStatus === 'error' ? '#e74c3c' : '#3498db',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            {syncStatus === 'syncing' ? '⏳ Syncing...' : syncStatus === 'synced' ? '✅ Synced' : syncStatus === 'error' ? '⚠️ Offline' : '🔄 Sync'}
          </button>
          <button className="btn-secondary" onClick={() => navigate('/workflow')}>
            📋 Workflow Guide
          </button>
          <button className="btn-primary" onClick={() => navigate('/login')}>
            🚀 Go to Login
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="db-stats-bar">
        <div className="db-stat">
          <span className="db-stat-icon">🎓</span>
          <span className="db-stat-value">{students.length}</span>
          <span className="db-stat-label">Students</span>
        </div>
        <div className="db-stat">
          <span className="db-stat-icon">👨‍🏫</span>
          <span className="db-stat-value">{counsellors.length}</span>
          <span className="db-stat-label">Mentors</span>
        </div>
        <div className="db-stat">
          <span className="db-stat-icon">🎯</span>
          <span className="db-stat-value">{generalCounsellors.length}</span>
          <span className="db-stat-label">Coordinators</span>
        </div>
        <div className="db-stat">
          <span className="db-stat-icon">✅</span>
          <span className="db-stat-value">{evaluators.length}</span>
          <span className="db-stat-label">Evaluators</span>
        </div>
        <div className="db-stat">
          <span className="db-stat-icon">👑</span>
          <span className="db-stat-value">{admins.length}</span>
          <span className="db-stat-label">Admins</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="db-nav">
        <button 
          className={activeTab === 'students' ? 'active' : ''}
          onClick={() => setActiveTab('students')}
        >
          🎓 Students ({students.length})
        </button>
        <button 
          className={activeTab === 'counsellors' ? 'active' : ''}
          onClick={() => setActiveTab('counsellors')}
        >
          👨‍🏫 Career Mentors ({counsellors.length})
        </button>
        <button 
          className={activeTab === 'general' ? 'active' : ''}
          onClick={() => setActiveTab('general')}
        >
          🎯 Coordinators ({generalCounsellors.length})
        </button>
        <button 
          className={activeTab === 'evaluators' ? 'active' : ''}
          onClick={() => setActiveTab('evaluators')}
        >
          ✅ Evaluators ({evaluators.length})
        </button>
        <button 
          className={activeTab === 'admins' ? 'active' : ''}
          onClick={() => setActiveTab('admins')}
        >
          👑 Admins ({admins.length})
        </button>
      </nav>

      {/* Search */}
      <div className="db-search">
        <input
          type="text"
          placeholder="🔍 Search by name, email, username, college, specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
        )}
      </div>

      {/* Content */}
      <main className="db-content">
        {activeTab === 'students' && (
          <div className="db-section">
            <h2>🎓 Registered Students</h2>
            <div className="db-grid">
              {filterUsers(students).length > 0 ? (
                filterUsers(students).map(user => renderUserCard(user, 'student'))
              ) : (
                <div className="db-empty">
                  <span>📭</span>
                  <p>No students found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'counsellors' && (
          <div className="db-section">
            <h2>👨‍🏫 Career Mentors</h2>
            <div className="db-grid">
              {filterUsers(counsellors).length > 0 ? (
                filterUsers(counsellors).map(user => renderUserCard(user, 'counsellor'))
              ) : (
                <div className="db-empty">
                  <span>📭</span>
                  <p>No mentors found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="db-section">
            <h2>🎯 Career Coordinators</h2>
            <div className="db-grid">
              {filterUsers(generalCounsellors).length > 0 ? (
                filterUsers(generalCounsellors).map(user => renderUserCard(user, 'general'))
              ) : (
                <div className="db-empty">
                  <span>📭</span>
                  <p>No coordinators found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'evaluators' && (
          <div className="db-section">
            <h2>✅ Verification Specialists</h2>
            <div className="db-grid">
              {filterUsers(evaluators).length > 0 ? (
                filterUsers(evaluators).map(user => renderUserCard(user, 'evaluator'))
              ) : (
                <div className="db-empty">
                  <span>📭</span>
                  <p>No evaluators found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="db-section">
            <h2>👑 System Administrators</h2>
            <div className="db-grid">
              {filterUsers(admins).length > 0 ? (
                filterUsers(admins).map(user => renderUserCard(user, 'admin'))
              ) : (
                <div className="db-empty">
                  <span>📭</span>
                  <p>No admins found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="db-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <div className="db-modal-header">
              <h2>
                {selectedUser.role === 'student' ? '🎓' : 
                 selectedUser.role === 'counsellor' ? '👨‍🏫' : 
                 selectedUser.role === 'evaluator' ? '✅' :
                 selectedUser.role === 'general_counsellor' ? '🎯' : '👑'} 
                {selectedUser.name}
              </h2>
              <button className="db-modal-close" onClick={() => setSelectedUser(null)}>✕</button>
            </div>
            <div className="db-modal-body">
              <div className="db-modal-section">
                <h3>📋 Basic Information</h3>
                <table className="db-detail-table">
                  <tbody>
                    <tr><td>ID</td><td>{selectedUser.id}</td></tr>
                    <tr><td>Name</td><td>{selectedUser.name}</td></tr>
                    <tr><td>Email</td><td>{selectedUser.email}</td></tr>
                    <tr><td>Username</td><td>{selectedUser.username || 'N/A'}</td></tr>
                    <tr><td>Role</td><td>{formatStatus(selectedUser.role)}</td></tr>
                    <tr><td>Phone</td><td>{selectedUser.phone || 'N/A'}</td></tr>
                    <tr><td>Created</td><td>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}</td></tr>
                  </tbody>
                </table>
              </div>

              {selectedUser.role === 'student' && (
                <div className="db-modal-section">
                  <h3>🎓 Academic Details</h3>
                  <table className="db-detail-table">
                    <tbody>
                      <tr><td>College</td><td>{selectedUser.collegeName || 'N/A'}</td></tr>
                      <tr><td>Branch</td><td>{selectedUser.branch || 'N/A'}</td></tr>
                      <tr><td>Year</td><td>{selectedUser.currentYear || 'N/A'}</td></tr>
                      <tr><td>Student ID</td><td>{selectedUser.studentId || 'N/A'}</td></tr>
                      <tr><td>Status</td><td style={{ color: getStatusColor(selectedUser.studentStatus) }}>{formatStatus(selectedUser.studentStatus)}</td></tr>
                      <tr><td>Assigned Mentor</td><td>{getCounsellorName(selectedUser.assignedCounsellor)}</td></tr>
                      <tr><td>Verified At</td><td>{selectedUser.verifiedAt ? new Date(selectedUser.verifiedAt).toLocaleString() : 'N/A'}</td></tr>
                    </tbody>
                  </table>
                </div>
              )}

              {(selectedUser.role === 'counsellor' || selectedUser.role === 'general_counsellor') && (
                <div className="db-modal-section">
                  <h3>👨‍🏫 Mentor Details</h3>
                  <table className="db-detail-table">
                    <tbody>
                      <tr><td>Specialization</td><td>{selectedUser.specialization || 'General'}</td></tr>
                      <tr><td>Status</td><td style={{ color: selectedUser.isActive !== false ? '#10b981' : '#ef4444' }}>{selectedUser.isActive !== false ? 'Active' : 'Inactive'}</td></tr>
                      <tr><td>Students Assigned</td><td>{getStudentCount(selectedUser.id)}</td></tr>
                      <tr><td>Verified</td><td>{selectedUser.isVerified ? 'Yes ✓' : 'Pending'}</td></tr>
                    </tbody>
                  </table>
                </div>
              )}

              {selectedUser.role === 'evaluator' && (
                <div className="db-modal-section">
                  <h3>✅ Evaluator Details</h3>
                  <table className="db-detail-table">
                    <tbody>
                      <tr><td>Evaluator Type</td><td>{selectedUser.evaluatorType === 'counsellor' ? 'Mentor Verifier' : 'Student Verifier'}</td></tr>
                      <tr><td>Specialization</td><td>{selectedUser.specialization || 'N/A'}</td></tr>
                    </tbody>
                  </table>
                </div>
              )}

              {selectedUser.password && (
                <div className="db-modal-section">
                  <h3>🔐 Login Credentials</h3>
                  <table className="db-detail-table credentials-table">
                    <tbody>
                      <tr><td>Email</td><td><code>{selectedUser.email}</code></td></tr>
                      {selectedUser.username && <tr><td>Username</td><td><code>{selectedUser.username}</code></td></tr>}
                      <tr><td>Password</td><td><code>{selectedUser.password}</code></td></tr>
                    </tbody>
                  </table>
                  <p className="db-tip">💡 Or use master password: <code>1111</code></p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="db-footer">
        <p>PathWise Database Viewer - Total Users: {data.users.length}</p>
        <p>Click on any user card to view full details</p>
      </footer>
    </div>
  );
}

export default Database;
