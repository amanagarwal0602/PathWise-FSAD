import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useToast } from '../context/ToastContext';

export default function EvaluatorDashboard() {
  const navigate = useNavigate();
  const { 
    currentUser, 
    setCurrentUser, 
    data, 
    verifyStudent, 
    rejectStudent,
    verifyCounsellor,
    rejectCounsellor
  } = useData();
  const { showToast } = useToast();
  
  // Site settings for dynamic branding
  const { settings } = useSiteSettings();
  
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');

  // Redirect if not logged in or not an evaluator
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'evaluator') {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'evaluator') {
    return null;
  }

  // Determine what this evaluator verifies
  const isStudentEvaluator = currentUser.evaluatorType === 'student';
  const entityType = isStudentEvaluator ? 'Student' : 'Career Mentor';
  const entityTypeIcon = isStudentEvaluator ? '🎓' : '👨‍🏫';

  // Get entities based on evaluator type
  const allEntities = isStudentEvaluator 
    ? data.users.filter(u => u.role === 'student')
    : data.users.filter(u => u.role === 'counsellor');
  
  // Get pending verification entities
  const pendingEntities = allEntities.filter(e => 
    isStudentEvaluator 
      ? e.studentStatus === 'pending_verification'
      : e.status === 'pending_verification'
  );
  
  // Get verified entities (by this evaluator)
  const verifiedEntities = allEntities.filter(e => 
    e.verifiedBy === currentUser.id && 
    (isStudentEvaluator 
      ? e.studentStatus !== 'rejected' 
      : e.status === 'active')
  );
  
  // Get rejected entities (by this evaluator)
  const rejectedEntities = allEntities.filter(e => 
    e.verifiedBy === currentUser.id && 
    (isStudentEvaluator ? e.studentStatus === 'rejected' : e.status === 'rejected')
  );

  // Get verification requests/history
  const verificationHistory = (data.verificationRequests || [])
    .filter(r => r.evaluatorId === currentUser.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Stats
  const stats = {
    pending: pendingEntities.length,
    verified: verifiedEntities.length,
    rejected: rejectedEntities.length,
    total: verifiedEntities.length + rejectedEntities.length
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const handleApprove = (entity) => {
    const confirmMsg = isStudentEvaluator
      ? `Are you sure you want to approve ${entity.name}? They will be able to access the platform.`
      : `Are you sure you want to approve ${entity.name}? They will be able to mentor students.`;
    
    if (window.confirm(confirmMsg)) {
      if (isStudentEvaluator) {
        verifyStudent(entity.id, currentUser.id, verificationNotes);
      } else {
        verifyCounsellor(entity.id, currentUser.id, verificationNotes);
      }
      setSelectedEntity(null);
      setVerificationNotes('');
      showToast(`${entity.name} has been verified and approved!`, 'success');
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a reason for rejection.', 'error');
      return;
    }
    if (isStudentEvaluator) {
      rejectStudent(selectedEntity.id, currentUser.id, rejectionReason);
    } else {
      rejectCounsellor(selectedEntity.id, currentUser.id, rejectionReason);
    }
    setShowRejectModal(false);
    setSelectedEntity(null);
    setRejectionReason('');
    showToast(`${selectedEntity.name} has been rejected.`, 'warning');
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
    if (isStudentEvaluator) {
      return entity.studentStatus;
    }
    return entity.status;
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
    <div className="evaluator-dashboard">
      {/* Sidebar */}
      <aside className="ev-sidebar">
        <div className="ev-sidebar-header">
          <img src={settings.logoUrl || "/logo.png"} alt={settings.siteName} className="logo-img" />
          <h2>{settings.siteName}</h2>
        </div>
        
        <div className="ev-user-info">
          <div className="ev-avatar">🔍</div>
          <div>
            <h3>{currentUser.name}</h3>
            <span className="ev-role-badge">
              {isStudentEvaluator ? 'Student Verifier' : 'Mentor Verifier'}
            </span>
          </div>
        </div>

        <nav className="ev-nav">
          <button 
            className={`ev-nav-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => { setActiveTab('pending'); setSelectedEntity(null); }}
          >
            <span className="nav-icon">⏳</span>
            <span>Pending Verification</span>
            {stats.pending > 0 && <span className="badge">{stats.pending}</span>}
          </button>
          <button 
            className={`ev-nav-btn ${activeTab === 'verified' ? 'active' : ''}`}
            onClick={() => { setActiveTab('verified'); setSelectedEntity(null); }}
          >
            <span className="nav-icon">✅</span>
            <span>Verified by Me</span>
            <span className="count">{stats.verified}</span>
          </button>
          <button 
            className={`ev-nav-btn ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => { setActiveTab('rejected'); setSelectedEntity(null); }}
          >
            <span className="nav-icon">❌</span>
            <span>Rejected</span>
            <span className="count">{stats.rejected}</span>
          </button>
          <button 
            className={`ev-nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span className="nav-icon">📋</span>
            <span>My Activity</span>
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

      {/* Main Content */}
      <main className="ev-main">
        {/* Header */}
        <header className="ev-header">
          <div>
            <h1>
              {activeTab === 'pending' && `⏳ Pending ${entityType} Verification`}
              {activeTab === 'verified' && `✅ Verified ${entityType}s`}
              {activeTab === 'rejected' && `❌ Rejected ${entityType}s`}
              {activeTab === 'history' && '📋 My Activity Log'}
            </h1>
            <p className="ev-subtitle">
              {activeTab === 'pending' && `Review and verify ${entityType.toLowerCase()} registrations`}
              {activeTab === 'verified' && `${entityType}s you have verified and approved`}
              {activeTab === 'rejected' && `${entityType}s you have rejected`}
              {activeTab === 'history' && 'Your verification activity history'}
            </p>
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
          {activeTab === 'history' ? (
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
            <div className="ev-students-grid">
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
                        onClick={() => setSelectedEntity(entity)}
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
              <div className="ev-student-detail">
                {!selectedEntity ? (
                  <div className="ev-no-selection">
                    <span className="empty-icon">👈</span>
                    <h3>Select a {entityType.toLowerCase()}</h3>
                    <p>Click on a card to view their details</p>
                  </div>
                ) : (
                  <div className="ev-detail-content">
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
      
      {/* Mobile Logout Button */}
      <button className="mobile-logout-btn" onClick={handleLogout} title="Logout">
        🚪
      </button>
    </div>
  );
}
