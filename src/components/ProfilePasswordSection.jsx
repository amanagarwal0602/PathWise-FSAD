import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

function ProfilePasswordSection({ hideTitle = false }) {
  const { currentUser, login, changePassword } = useData();
  const { showToast } = useToast();

  const [step, setStep] = useState('verify'); // 'verify' | 'change'
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!currentUser) return null;

  const handleVerifyCurrent = async (e) => {
    e.preventDefault();

    if (!currentPasswordInput) {
      showToast('Please enter your current password.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const identifier = currentUser.email || currentUser.username;
      if (!identifier) {
        showToast('Cannot verify password: missing identifier.', 'error');
        setIsLoading(false);
        return;
      }

      // Re-use secure backend login to verify current password (or master password)
      const user = await login(identifier, currentPasswordInput);
      if (user) {
        setStep('change');
        showToast('Current password verified. You can set a new password now.', 'success');
      } else {
        showToast('Current password is incorrect.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!newPasswordInput || !confirmNewPasswordInput) {
      showToast('Please enter and confirm your new password.', 'error');
      return;
    }

    if (newPasswordInput !== confirmNewPasswordInput) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    if (newPasswordInput === currentPasswordInput) {
      showToast('New password must be different from your current password.', 'error');
      return;
    }

    if (newPasswordInput.length < 4) {
      showToast('New password is too short.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await changePassword(currentUser.id, currentPasswordInput, newPasswordInput);
      if (result.success) {
        showToast(result.message || 'Password updated successfully.', 'success');
        setCurrentPasswordInput('');
        setNewPasswordInput('');
        setConfirmNewPasswordInput('');
        setStep('verify');
      } else {
        showToast(result.message || 'Failed to update password.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-password-section">
      {!hideTitle && <h3>Change Password</h3>}
      <p className="password-help">
        {step === 'verify'
          ? 'Step 1 of 2: Confirm your current password to continue.'
          : 'Step 2 of 2: Choose a strong new password you will remember.'}
      </p>
      {step === 'verify' ? (
        <form className="password-form" onSubmit={handleVerifyCurrent}>
          <div className="detail-item">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPasswordInput}
              onChange={(e) => setCurrentPasswordInput(e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Checking...' : 'Verify & Continue'}
          </button>
        </form>
      ) : (
        <form className="password-form" onSubmit={handleChangePassword}>
          <div className="detail-item">
            <label>New Password</label>
            <input
              type="password"
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
            />
          </div>
          <div className="detail-item">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmNewPasswordInput}
              onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
}

export default ProfilePasswordSection;
