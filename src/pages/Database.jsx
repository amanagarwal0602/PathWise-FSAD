import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

function Database() {
  const navigate = useNavigate();
  const {
    data,
    refreshData,
    syncStatus,
    currentUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    changePassword,
    verifyStudent,
    rejectStudent,
    verifyCounsellor,
    rejectCounsellor
  } = useData();
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [actionUser, setActionUser] = useState(null);

  const goBackToDashboard = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    switch (currentUser.role) {
      case 'student':
        navigate('/student');
        break;
      case 'counsellor':
        navigate('/counsellor');
        break;
      case 'general_counsellor':
        navigate('/general-counsellor');
        break;
      case 'evaluator':
        navigate('/evaluator');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate('/login');
    }
  };

  // Protect route - only admins should access full database view
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  // Sync with backend on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Live auto-refresh for near real-time view
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 10000); // every 10 seconds
    return () => clearInterval(interval);
  }, [refreshData]);

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

  const openActionMenu = (user) => {
    setActionUser(user);
  };

  const closeActionMenu = () => {
    setActionUser(null);
  };

  const openEditUser = (user) => {
    setEditUser({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      username: user.username || '',
      role: user.role || '',
      status: user.status || 'active',
      specialization: user.specialization || '',
      collegeName: user.collegeName || user.college || '',
      branch: user.branch || '',
      currentYear: user.currentYear || user.year || '',
      studentId: user.studentId || '',
      password: ''
    });
  };

  const handleEditChange = (field, value) => {
    setEditUser(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editUser?.id) return;
    const payload = {
      name: editUser.name,
      email: editUser.email,
      username: editUser.username,
      status: editUser.status,
      specialization: editUser.specialization,
      collegeName: editUser.collegeName,
      branch: editUser.branch,
      currentYear: editUser.currentYear,
      studentId: editUser.studentId
    };
    const updated = await updateUser(editUser.id, payload);
    if (!updated) {
      return;
    }

    // Optional: admin can set a new password for this user directly
    if (editUser.password) {
      const result = await changePassword(editUser.id, '', editUser.password);
      if (!result.success) {
        window.alert(result.message || 'Failed to update password');
        return;
      }
    }

    setEditUser(null);
  };

  const handleToggleStatus = async (userId) => {
    if (!userId) return;
    await toggleUserStatus(userId);
  };

  const handleDeleteUserRow = async (userId) => {
    if (!userId) return;
    if (!window.confirm('Are you sure you want to delete this user from the database?')) return;
    await deleteUser(userId);
    if (selectedUser?.id === userId) setSelectedUser(null);
    if (editUser?.id === userId) setEditUser(null);
  };

  const handleVerifyUser = async (user) => {
    if (!user || !currentUser) return;

    try {
      if (user.role === 'student') {
        await verifyStudent(user.id, currentUser.id, 'Verified by admin from Database view');
      } else if (user.role === 'counsellor' || user.role === 'general_counsellor') {
        await verifyCounsellor(user.id, currentUser.id, 'Verified by admin from Database view');
      }
      await refreshData();
    } catch (err) {
      // Toasts are handled inside DataContext
    }
  };

  const handleRejectUser = async (user) => {
    if (!user || !currentUser) return;
    const reason = window.prompt('Enter rejection reason (this will be visible to the user):');
    if (!reason || !reason.trim()) return;

    try {
      if (user.role === 'student') {
        await rejectStudent(user.id, currentUser.id, reason.trim());
      } else if (user.role === 'counsellor' || user.role === 'general_counsellor') {
        await rejectCounsellor(user.id, currentUser.id, reason.trim());
      }
      await refreshData();
    } catch (err) {
      // Toasts are handled inside DataContext
    }
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
          {currentUser && (
            <button className="btn-secondary" onClick={goBackToDashboard}>
              ⬅ Back to Admin Dashboard
            </button>
          )}
          <button 
            className={`btn-sync ${syncStatus}`}
            onClick={refreshData}
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
        {/* Tabular live view for each role */}
        <div className="db-table-wrapper">
          {activeTab === 'students' && (
            <div className="db-table-section">
              <h3>Students Table (Live)</h3>
              <div className="table-responsive">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th className="hide-mobile">Email</th>
                      <th className="hide-mobile">College</th>
                      <th>Status</th>
                      <th>Mentor</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterUsers(students).map(s => (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>{s.name}</td>
                        <td className="hide-mobile">{s.email}</td>
                        <td className="hide-mobile">{s.collegeName || s.college || 'N/A'}</td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              backgroundColor: getStatusColor(s.studentStatus),
                              color: '#fff'
                            }}
                          >
                            {formatStatus(s.studentStatus)}
                          </span>
                        </td>
                        <td>{getCounsellorName(s.assignedCounsellor)}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => openActionMenu(s)}
                          >
                            ⋯ Actions
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'counsellors' && (
            <div className="db-table-section">
              <h3>Mentors Table (Live)</h3>
              <div className="table-responsive">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th className="hide-mobile">Email</th>
                      <th>Specialization</th>
                      <th>Students</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterUsers(counsellors).map(c => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.name}</td>
                        <td className="hide-mobile">{c.email}</td>
                        <td>{c.specialization || 'General'}</td>
                        <td>{getStudentCount(c.id)}</td>
                        <td>{c.status || 'active'}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => openActionMenu(c)}
                          >
                            ⋯ Actions
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="db-table-section">
              <h3>Coordinators Table (Live)</h3>
              <div className="table-responsive">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th className="hide-mobile">Email</th>
                      <th>Specialization</th>
                      <th>Students</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterUsers(generalCounsellors).map(g => (
                      <tr key={g.id}>
                        <td>{g.id}</td>
                        <td>{g.name}</td>
                        <td className="hide-mobile">{g.email}</td>
                        <td>{g.specialization || 'General'}</td>
                        <td>{getStudentCount(g.id)}</td>
                        <td>{g.status || 'active'}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => openActionMenu(g)}
                          >
                            ⋯ Actions
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'evaluators' && (
            <div className="db-table-section">
              <h3>Evaluators Table (Live)</h3>
              <div className="table-responsive">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th className="hide-mobile">Email</th>
                      <th>Type</th>
                      <th>Specialization</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterUsers(evaluators).map(e => (
                      <tr key={e.id}>
                        <td>{e.id}</td>
                        <td>{e.name}</td>
                        <td className="hide-mobile">{e.email}</td>
                        <td>{e.evaluatorType === 'counsellor' ? 'Mentor Verifier' : 'Student Verifier'}</td>
                        <td>{e.specialization || 'N/A'}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => openActionMenu(e)}
                          >
                            ⋯ Actions
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'admins' && (
            <div className="db-table-section">
              <h3>Admins Table (Live)</h3>
              <div className="table-responsive">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th className="hide-mobile">Email</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterUsers(admins).map(a => (
                      <tr key={a.id}>
                        <td>{a.id}</td>
                        <td>{a.name}</td>
                        <td className="hide-mobile">{a.email}</td>
                        <td>{a.status || 'active'}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => openActionMenu(a)}
                          >
                            ⋯ Actions
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

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

      {/* Unified Actions Modal */}
      {actionUser && (
        <div className="db-modal-overlay" onClick={closeActionMenu}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <div className="db-modal-header">
              <h2>
                Actions 
                {actionUser.role === 'student' ? '🎓' : 
                 actionUser.role === 'counsellor' ? '👨‍🏫' : 
                 actionUser.role === 'general_counsellor' ? '🎯' : 
                 actionUser.role === 'evaluator' ? '✅' : '👑'}
                {actionUser.name}
              </h2>
              <button className="db-modal-close" onClick={closeActionMenu}>✕</button>
            </div>
            <div className="db-modal-body">
              <div className="db-modal-section">
                <h3>Quick actions</h3>
                <p className="db-tip">Choose what you want to do for this user.</p>
                <div className="db-action-list">
                  {(actionUser.role === 'student' && actionUser.studentStatus === 'pending_verification') && (
                    <>
                      <button
                        type="button"
                        className="btn-primary db-action-btn"
                        onClick={async () => {
                          await handleVerifyUser(actionUser);
                          closeActionMenu();
                        }}
                      >
                        ✅ Verify student
                      </button>
                      <button
                        type="button"
                        className="btn-secondary db-action-btn"
                        onClick={async () => {
                          await handleRejectUser(actionUser);
                          closeActionMenu();
                        }}
                      >
                        ❌ Reject student
                      </button>
                    </>
                  )}

                  {((actionUser.role === 'counsellor' || actionUser.role === 'general_counsellor') && actionUser.status === 'pending_verification') && (
                    <>
                      <button
                        type="button"
                        className="btn-primary db-action-btn"
                        onClick={async () => {
                          await handleVerifyUser(actionUser);
                          closeActionMenu();
                        }}
                      >
                        ✅ Verify mentor
                      </button>
                      <button
                        type="button"
                        className="btn-secondary db-action-btn"
                        onClick={async () => {
                          await handleRejectUser(actionUser);
                          closeActionMenu();
                        }}
                      >
                        ❌ Reject mentor
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    className="btn-secondary db-action-btn"
                    onClick={() => {
                      openEditUser(actionUser);
                      closeActionMenu();
                    }}
                  >
                    ✏ Edit details
                  </button>

                  <button
                    type="button"
                    className="btn-secondary db-action-btn"
                    onClick={async () => {
                      await handleToggleStatus(actionUser.id);
                      closeActionMenu();
                    }}
                  >
                    {actionUser.status === 'inactive' ? '✓ Activate account' : '⏸ Deactivate account'}
                  </button>

                  <button
                    type="button"
                    className="btn-danger db-action-btn"
                    onClick={async () => {
                      await handleDeleteUserRow(actionUser.id);
                      closeActionMenu();
                    }}
                  >
                    🗑 Permanently delete user
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

              {selectedUser.email && (
                <div className="db-modal-section">
                  <h3>🔐 Login Credentials</h3>
                  <table className="db-detail-table credentials-table">
                    <tbody>
                      <tr><td>Email</td><td><code>{selectedUser.email}</code></td></tr>
                      {selectedUser.username && <tr><td>Username</td><td><code>{selectedUser.username}</code></td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal for inline database table edits */}
      {editUser && (
        <div className="db-modal-overlay" onClick={() => setEditUser(null)}>
          <div className="db-modal" onClick={e => e.stopPropagation()}>
            <div className="db-modal-header">
              <h2>Edit User #{editUser.id}</h2>
              <button className="db-modal-close" onClick={() => setEditUser(null)}>✕</button>
            </div>
            <div className="db-modal-body">
              <div className="db-modal-section">
                <h3>Basic Details</h3>
                <table className="db-detail-table">
                  <tbody>
                    <tr>
                      <td>Name</td>
                      <td>
                        <input
                          type="text"
                          value={editUser.name}
                          onChange={e => handleEditChange('name', e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Email</td>
                      <td>
                        <input
                          type="email"
                          value={editUser.email}
                          onChange={e => handleEditChange('email', e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Username</td>
                      <td>
                        <input
                          type="text"
                          value={editUser.username}
                          onChange={e => handleEditChange('username', e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Status</td>
                      <td>
                        <select
                          value={editUser.status}
                          onChange={e => handleEditChange('status', e.target.value)}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <td>New Password (admin)</td>
                      <td>
                        <input
                          type="password"
                          value={editUser.password}
                          onChange={e => handleEditChange('password', e.target.value)}
                          placeholder="Set new password (optional)"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {editUser.role === 'student' && (
                <div className="db-modal-section">
                  <h3>Academic Details</h3>
                  <table className="db-detail-table">
                    <tbody>
                      <tr>
                        <td>College</td>
                        <td>
                          <input
                            type="text"
                            value={editUser.collegeName}
                            onChange={e => handleEditChange('collegeName', e.target.value)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Branch</td>
                        <td>
                          <input
                            type="text"
                            value={editUser.branch}
                            onChange={e => handleEditChange('branch', e.target.value)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Year</td>
                        <td>
                          <input
                            type="text"
                            value={editUser.currentYear}
                            onChange={e => handleEditChange('currentYear', e.target.value)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Student ID</td>
                        <td>
                          <input
                            type="text"
                            value={editUser.studentId}
                            onChange={e => handleEditChange('studentId', e.target.value)}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {(editUser.role === 'counsellor' || editUser.role === 'general_counsellor') && (
                <div className="db-modal-section">
                  <h3>Mentor Details</h3>
                  <table className="db-detail-table">
                    <tbody>
                      <tr>
                        <td>Specialization</td>
                        <td>
                          <input
                            type="text"
                            value={editUser.specialization}
                            onChange={e => handleEditChange('specialization', e.target.value)}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="db-modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" type="button" onClick={() => setEditUser(null)}>
                Cancel
              </button>
              <button className="btn-primary" type="button" onClick={handleSaveEdit}>
                Save Changes
              </button>
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
