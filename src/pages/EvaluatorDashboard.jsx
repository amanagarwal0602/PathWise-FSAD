import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useToast } from '../context/ToastContext';
import ProfilePasswordSection from '../components/ProfilePasswordSection';

export default function EvaluatorDashboard() {
  const navigate = useNavigate();
  const { id: routeEntityId } = useParams();
  const { 
    currentUser, 
    data, 
    verifyStudent, 
    rejectStudent,
    verifyCounsellor,
    rejectCounsellor,
    logout,
    updateUser
  } = useData();
  const { showToast } = useToast();
  
  // Site settings for dynamic branding
  const { settings } = useSiteSettings();
  
  const [activeTab, setActiveTab] = useState('pending');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    username: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileInitialised, setProfileInitialised] = useState(false);

  // Redirect if not logged in or not an evaluator
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'evaluator') {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  // On phones, show the left panel by default so it's clearly visible
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  // Initialise editable profile details once
  useEffect(() => {
    if (!profileInitialised && currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        username: currentUser.username || ''
      });
      setProfileInitialised(true);
    }
  }, [profileInitialised, currentUser]);

  const isStudentEvaluator = currentUser?.evaluatorType === 'student';
  const evaluatorDisplayRole = isStudentEvaluator ? 'Student Verification Specialist' : 'Mentor Verification Specialist';

  // If route has an id, keep selected entity in sync with URL
  useEffect(() => {
    if (!routeEntityId) return;
    const numericId = Number(routeEntityId);
    if (!Number.isNaN(numericId)) {
      const allEntities = isStudentEvaluator 
        ? data.users.filter(u => u.role === 'student')
        : data.users.filter(u => u.role === 'counsellor');
      const found = allEntities.find(e => Number(e.id) === numericId);
      if (found) {
        setSelectedEntity(found);
      }
    }
  }, [routeEntityId, isStudentEvaluator, data.users]);

  if (!currentUser || currentUser.role !== 'evaluator') {
    return null;
  }

  // Determine what this evaluator verifies
  const entityType = isStudentEvaluator ? 'Student' : 'Career Mentor';
  const entityTypeIcon = isStudentEvaluator ? '🎓' : '👨‍🏫';

  // Unified status accessor so students can use workflow studentStatus while
  // mentors continue to rely on the normal status field
  const getEntityStatusValue = (entity) => {
    return isStudentEvaluator
      ? (entity.studentStatus || entity.status)
      : entity.status;
  };

  // Treat as truly pending only if marked pending and not already stamped
  // as verified/rejected by backend metadata.
  const isPendingEntity = (entity) => {
    const status = getEntityStatusValue(entity);
    return (
      status === 'pending_verification' &&
      !entity.verifiedAt &&
      !entity.verificationNotes &&
      !entity.rejectionReason
    );
  };

  // Get entities based on evaluator type
  const allEntities = isStudentEvaluator 
    ? data.users.filter(u => u.role === 'student')
    : data.users.filter(u => u.role === 'counsellor');
  
  // Get pending verification entities
  const pendingEntities = allEntities.filter(isPendingEntity);
  
  // Get verification requests/history for this evaluator
  const verificationHistory = (data.verificationRequests || [])
    .filter(r => r.evaluatorId === currentUser.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const getEntityIdFromRequest = (item) => item.studentId ?? item.counsellorId;

  // Build sets of entity ids this evaluator has approved/rejected
  const approvedIds = new Set(
    verificationHistory
      .filter(item => item.action === 'approved')
      .map(item => String(getEntityIdFromRequest(item)))
  );

  const rejectedIds = new Set(
    verificationHistory
      .filter(item => item.action === 'rejected')
      .map(item => String(getEntityIdFromRequest(item)))
  );

  // Also include any entities that already carry backend metadata linking
  // them to this evaluator, so pre-existing data is counted.
  allEntities.forEach(entity => {
    if (Number(entity.verifiedBy) === Number(currentUser.id)) {
      const status = getEntityStatusValue(entity);
      if (status === (isStudentEvaluator ? 'verified' : 'active')) {
        approvedIds.add(String(entity.id));
      }
      if (status === 'rejected') {
        rejectedIds.add(String(entity.id));
      }
    }
  });

  // Get verified/rejected entities (by this evaluator)
  const verifiedEntities = allEntities.filter(e => approvedIds.has(String(e.id)));
  const rejectedEntities = allEntities.filter(e => rejectedIds.has(String(e.id)));

  // Stats
  const stats = {
    pending: pendingEntities.length,
    verified: verifiedEntities.length,
    rejected: rejectedEntities.length,
    total: verifiedEntities.length + rejectedEntities.length
  };

  const handleBackToList = () => {
    setSelectedEntity(null);
    navigate('/evaluator');
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    const trimmedName = profileForm.name.trim();
    const trimmedEmail = profileForm.email.trim();
    const trimmedUsername = profileForm.username.trim();

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
        setProfileForm(prev => ({
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

  const handleApprove = async (entity) => {
    const confirmMsg = isStudentEvaluator
      ? `Are you sure you want to approve ${entity.name}? They will be able to access the platform.`
      : `Are you sure you want to approve ${entity.name}? They will be able to mentor students.`;
    
    if (window.confirm(confirmMsg)) {
      let success = false;
      if (isStudentEvaluator) {
        success = await verifyStudent(entity.id, currentUser.id, verificationNotes);
      } else {
        success = await verifyCounsellor(entity.id, currentUser.id, verificationNotes);
      }

      if (success) {
        setSelectedEntity(null);
        setVerificationNotes('');
        showToast(`${entity.name} has been verified and approved!`, 'success');
      } else {
        showToast('Failed to verify user. Please try again.', 'error');
      }
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a reason for rejection.', 'error');
      return;
    }

    let success = false;
    if (isStudentEvaluator) {
      success = await rejectStudent(selectedEntity.id, currentUser.id, rejectionReason);
    } else {
      success = await rejectCounsellor(selectedEntity.id, currentUser.id, rejectionReason);
    }

    if (success) {
      setShowRejectModal(false);
      setSelectedEntity(null);
      setRejectionReason('');
      showToast(`${selectedEntity.name} has been rejected.`, 'warning');
    } else {
      showToast('Failed to reject user. Please try again.', 'error');
    }
  };

  const getFilteredEntities = () => {
    switch (activeTab) {
      case 'pending':
        return pendingEntities;
      case 'verified':
        return verifiedEntities;
      case 'rejected':
        return rejectedEntities;
      default:
        return pendingEntities;
    }
  };

  const getEntityStatus = (entity) => {
    return getEntityStatusValue(entity);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-layout evaluator-dashboard">
      {/* Sidebar - reuse global sidebar pattern for consistent left panel */}
      <aside className={`sidebar ev-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="ev-sidebar-header">
          <img src={settings.logoUrl || "/logo.png"} alt={settings.siteName} className="logo-img" />
          <h2>{settings.siteName}</h2>
        </div>
        
        <div className="ev-user-info">
          <div className="ev-avatar">{(currentUser?.evaluatorType === 'mentor' || currentUser?.evaluatorType === 'mentor_verification') ? '👨‍🏫' : '🎓'}</div>
          <div className="ev-user-meta">
            <h3 className="ev-user-name">{currentUser.name}</h3>
            <span className="ev-role-badge">
              {isStudentEvaluator ? 'Student Verification Specialist' : 'Mentor Verification Specialist'}
            </span>
          </div>
        </div>

        <nav className="ev-nav">
          <button 
            className={`ev-nav-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => { setActiveTab('pending'); setSelectedEntity(null); setIsSidebarOpen(false); }}
          >
            <span className="nav-icon">⏳</span>
            <span>Pending Verification</span>
            {stats.pending > 0 && <span className="badge">{stats.pending}</span>}
          </button>
          <button 
            className={`ev-nav-btn ${activeTab === 'verified' ? 'active' : ''}`}
            onClick={() => { setActiveTab('verified'); setSelectedEntity(null); setIsSidebarOpen(false); }}
          >
            <span className="nav-icon">✅</span>
            <span>Verified by Me</span>
            <span className="count">{stats.verified}</span>
          </button>
          <button 
            className={`ev-nav-btn ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => { setActiveTab('rejected'); setSelectedEntity(null); setIsSidebarOpen(false); }}
          >
            <span className="nav-icon">❌</span>
            <span>Rejected</span>
            <span className="count">{stats.rejected}</span>
          </button>
          <button 
            className={`ev-nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => { setActiveTab('history'); setIsSidebarOpen(false); }}
          >
            <span className="nav-icon">📋</span>
            <span>My Activity</span>
          </button>
          <button 
            className={`ev-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveTab('profile'); setSelectedEntity(null); setIsSidebarOpen(false); }}
          >
            <span className="nav-icon">👤</span>
            <span>My Profile</span>
          </button>
        </nav>

        <div className="ev-info-box">
          <span className="info-icon">{entityTypeIcon}</span>
          <p>You verify <strong>{entityType}s</strong></p>
        </div>

        <button className="ev-logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      {isSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="ev-main">
        {/* Header */}
        <header className="ev-header">
          <div className="ev-header-left">
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsSidebarOpen(prev => !prev)}
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>
            <div>
            <h1>
              {activeTab === 'pending' && `⏳ Pending ${entityType} Verification`}
              {activeTab === 'verified' && `✅ Verified ${entityType}s`}
              {activeTab === 'rejected' && `❌ Rejected ${entityType}s`}
              {activeTab === 'history' && '📋 My Activity Log'}
              {activeTab === 'profile' && '👤 My Profile'}
            </h1>
            <p className="ev-subtitle">
              {activeTab === 'pending' && `Review and verify ${entityType.toLowerCase()} registrations`}
              {activeTab === 'verified' && `${entityType}s you have verified and approved`}
              {activeTab === 'rejected' && `${entityType}s you have rejected`}
              {activeTab === 'history' && 'Your verification activity history'}
              {activeTab === 'profile' && 'Your evaluator profile details'}
            </p>
            </div>
          </div>
          <div className="ev-stats-mini">
            <div className="ev-stat-pill pending">
              <span className="stat-num">{stats.pending}</span>
              <span>Pending</span>
            </div>
            <div className="ev-stat-pill success">
              <span className="stat-num">{stats.total}</span>
              <span>Reviewed</span>
            </div>
          </div>
        </header>

        {/* Alert Banner for Pending */}
        {activeTab === 'pending' && stats.pending > 0 && (
          <div className="ev-alert-banner">
            <span className="alert-icon">⚠️</span>
            <span>
              <strong>{stats.pending} {entityType.toLowerCase()}{stats.pending > 1 ? 's' : ''}</strong> waiting for verification. 
              Please review their details carefully before approving.
            </span>
          </div>
        )}

        {/* Content Area */}
        <div className="ev-content">
          {activeTab === 'profile' ? (
            <div className="profile-section">
              <h2>My Profile</h2>
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">{(currentUser?.evaluatorType === 'mentor' || currentUser?.evaluatorType === 'mentor_verification') ? '👨‍🏫' : '🎓'}</div>
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
                    <label>Role</label>
                    <span>{evaluatorDisplayRole}</span>
                  </div>
                  <div className="detail-item">
                    <label>Verification Focus</label>
                    <span>{isStudentEvaluator ? 'Students' : 'Career Mentors'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Total Verified</label>
                    <span>{stats.verified}</span>
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
          ) : activeTab === 'history' ? (
            /* Activity History */
            <div className="ev-history-section">
              <h2>Recent Activity</h2>
              {verificationHistory.length === 0 ? (
                <div className="ev-empty-state">
                  <span className="empty-icon">📋</span>
                  <p>No verification activity yet</p>
                </div>
              ) : (
                <div className="ev-history-list">
                  {verificationHistory.map((item, index) => {
                    const entity = data.users.find(u => u.id === (item.studentId || item.counsellorId));
                    return (
                      <div key={index} className={`ev-history-item ${item.action}`}>
                        <div className="history-icon">
                          {item.action === 'approved' ? '✅' : '❌'}
                        </div>
                        <div className="history-details">
                          <h4>{entity?.name || 'Unknown'}</h4>
                          <p>{entity?.email}</p>
                          {item.action === 'rejected' && (
                            <p className="rejection-reason">Reason: {item.reason}</p>
                          )}
                        </div>
                        <div className="history-meta">
                          <span className={`action-badge ${item.action}`}>
                            {item.action === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
                          <span className="history-time">{formatDate(item.timestamp)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Entity List View */
            <div className={`ev-students-grid ${selectedEntity ? 'has-selection' : ''}`}>
              {/* Entity List */}
              <div className="ev-student-list">
                <div className="ev-list-header">
                  <h3>
                    {activeTab === 'pending' && `${pendingEntities.length} Pending`}
                    {activeTab === 'verified' && `${verifiedEntities.length} Verified`}
                    {activeTab === 'rejected' && `${rejectedEntities.length} Rejected`}
                  </h3>
                </div>
                
                {getFilteredEntities().length === 0 ? (
                  <div className="ev-empty-state">
                    <span className="empty-icon">
                      {activeTab === 'pending' ? '🎉' : '📭'}
                    </span>
                    <p>
                      {activeTab === 'pending' 
                        ? 'No pending verifications! All caught up.' 
                        : `No ${entityType.toLowerCase()}s in this category`}
                    </p>
                  </div>
                ) : (
                  <div className="ev-student-cards">
                    {getFilteredEntities().map(entity => (
                      <div 
                        key={entity.id} 
                        className={`ev-student-card ${selectedEntity?.id === entity.id ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedEntity(entity);
                          navigate(`/evaluator/${entity.id}`);
                        }}
                      >
                        <div className="student-card-header">
                          <div className="student-avatar">
                            {entityTypeIcon}
                            {activeTab === 'pending' && <span className="pending-dot"></span>}
                          </div>
                          <div className="student-basic-info">
                            <h4>{entity.name}</h4>
                            <p>{entity.email}</p>
                          </div>
                        </div>
                        <div className="student-card-meta">
                          {isStudentEvaluator ? (
                            <>
                              <span className="meta-item">
                                <span className="meta-icon">🏫</span>
                                {entity.college || 'Not specified'}
                              </span>
                              <span className="meta-item">
                                <span className="meta-icon">📅</span>
                                {formatDate(entity.createdAt).split(',')[0]}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="meta-item">
                                <span className="meta-icon">💼</span>
                                {entity.specialization || 'General'}
                              </span>
                              <span className="meta-item">
                                <span className="meta-icon">📅</span>
                                {formatDate(entity.createdAt).split(',')[0]}
                              </span>
                            </>
                          )}
                        </div>
                        {activeTab === 'rejected' && entity.rejectionReason && (
                          <div className="rejection-preview">
                            <span className="meta-icon">⚠️</span>
                            {entity.rejectionReason.substring(0, 50)}...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Entity Detail Panel */}
              <div className={`ev-student-detail ${!selectedEntity ? 'empty' : ''}`}>
                {!selectedEntity ? (
                  <div className="ev-no-selection">
                    <span className="empty-icon">👈</span>
                    <h3>Select a {entityType.toLowerCase()}</h3>
                    <p>Click on a card to view their details</p>
                  </div>
                ) : (
                  <div className="ev-detail-content">
                    <button
                      type="button"
                      className="ev-back-btn"
                      onClick={handleBackToList}
                    >
                      ← Back to list
                    </button>
                    <div className="ev-detail-header">
                      <div className="detail-avatar">{entityTypeIcon}</div>
                      <div className="detail-basic">
                        <h2>{selectedEntity.name}</h2>
                        <p>{selectedEntity.email}</p>
                        <span className={`status-badge ${getEntityStatus(selectedEntity)}`}>
                          {getEntityStatus(selectedEntity) === 'pending_verification' && '⏳ Pending Verification'}
                          {getEntityStatus(selectedEntity) === 'verified' && '✅ Verified'}
                          {getEntityStatus(selectedEntity) === 'rejected' && '❌ Rejected'}
                          {getEntityStatus(selectedEntity) === 'active' && '✅ Active'}
                        </span>
                      </div>
                    </div>

                    <div className="ev-detail-sections">
                      {isStudentEvaluator ? (
                        /* Student Details */
                        <>
                          <div className="ev-detail-section">
                            <h3>📋 Personal Information</h3>
                            <div className="detail-grid">
                              <div className="detail-item">
                                <label>Full Name</label>
                                <span>{selectedEntity.name || 'Not provided'}</span>
                              </div>
                              <div className="detail-item">
                                <label>Email Address</label>
                                <span>{selectedEntity.email}</span>
                              </div>
                              <div className="detail-item">
                                <label>Phone Number</label>
                                <span>{selectedEntity.phoneNumber || 'Not provided'}</span>
                              </div>
                              <div className="detail-item">
                                <label>Registration Date</label>
                                <span>{formatDate(selectedEntity.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="ev-detail-section">
                            <h3>🎓 Academic Information</h3>
                            <div className="detail-grid">
                              <div className="detail-item">
                                <label>College/University</label>
                                <span>{selectedEntity.college || 'Not provided'}</span>
                              </div>
                              <div className="detail-item">
                                <label>Branch/Major</label>
                                <span>{selectedEntity.branch || 'Not provided'}</span>
                              </div>
                              <div className="detail-item">
                                <label>Student ID</label>
                                <span>{selectedEntity.studentId || 'Not provided'}</span>
                              </div>
                              <div className="detail-item">
                                <label>ID Proof Type</label>
                                <span>{selectedEntity.idProofType || 'Not provided'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="ev-detail-section">
                            <h3>📝 Additional Details</h3>
                            <div className="detail-full">
                              <div className="detail-item full-width">
                                <label>Career Goals</label>
                                <p>{selectedEntity.careerGoals || 'Not provided'}</p>
                              </div>
                              <div className="detail-item full-width">
                                <label>Achievements</label>
                                <p>{selectedEntity.achievements || 'Not provided'}</p>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Counsellor/Mentor Details */
                        <>
                          <div className="ev-detail-section">
                            <h3>👨‍🏫 Mentor Information</h3>
                            <div className="detail-grid">
                              <div className="detail-item">
                                <label>Full Name</label>
                                <span>{selectedEntity.name || 'Not provided'}</span>
                              </div>
                              <div className="detail-item">
                                <label>Email Address</label>
                                <span>{selectedEntity.email}</span>
                              </div>
                              <div className="detail-item">
                                <label>Specialization</label>
                                <span>{selectedEntity.specialization || 'General'}</span>
                              </div>
                              <div className="detail-item">
                                <label>Registration Date</label>
                                <span>{formatDate(selectedEntity.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="ev-detail-section">
                            <h3>📜 Qualifications</h3>
                            <div className="detail-full">
                              <div className="detail-item full-width">
                                <label>Qualifications & Experience</label>
                                <p>{selectedEntity.qualifications || 'Not provided'}</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Rejection Info (if rejected) */}
                      {(getEntityStatus(selectedEntity) === 'rejected') && (
                        <div className="ev-detail-section rejection-section">
                          <h3>❌ Rejection Details</h3>
                          <div className="rejection-info">
                            <div className="detail-item full-width">
                              <label>Rejection Reason</label>
                              <p className="rejection-text">{selectedEntity.rejectionReason}</p>
                            </div>
                            <div className="detail-item">
                              <label>Rejected On</label>
                              <span>{formatDate(selectedEntity.verifiedAt)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Verification Notes (for pending) */}
                      {activeTab === 'pending' && (
                        <div className="ev-detail-section">
                          <h3>📝 Verification Notes (Optional)</h3>
                          <textarea
                            className="ev-notes-input"
                            placeholder="Add any notes about this verification..."
                            value={verificationNotes}
                            onChange={(e) => setVerificationNotes(e.target.value)}
                            rows={3}
                          />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {activeTab === 'pending' && (
                      <div className="ev-action-buttons">
                        <button 
                          className="ev-btn ev-btn-reject"
                          onClick={() => setShowRejectModal(true)}
                        >
                          ❌ Reject {entityType}
                        </button>
                        <button 
                          className="ev-btn ev-btn-approve"
                          onClick={() => handleApprove(selectedEntity)}
                        >
                          ✅ Approve & Verify
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal ev-reject-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>❌ Reject {entityType}</h2>
              <button className="modal-close" onClick={() => setShowRejectModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="reject-warning">
                You are about to reject <strong>{selectedEntity?.name}</strong>. 
                {isStudentEvaluator 
                  ? ' They will not be able to access the platform.'
                  : ' They will not be able to mentor students.'}
              </p>
              <div className="form-group">
                <label>Reason for Rejection <span className="required">*</span></label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={`Please provide a detailed reason for rejecting this ${entityType.toLowerCase()}...`}
                  rows={4}
                  required
                />
                <span className="form-hint">
                  {isStudentEvaluator 
                    ? 'Examples: Invalid student ID, Fake information, Unable to verify identity, etc.'
                    : 'Examples: Invalid credentials, Unverified qualifications, Incomplete documentation, etc.'}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-danger" 
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
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
