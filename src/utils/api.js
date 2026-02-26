// API Service for PathWise Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, message: error.message };
  }
}

// Auth API
export const authAPI = {
  login: async (identifier, password) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  },
  
  register: async (userData) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  checkEmail: async (email) => {
    return apiCall(`/auth/check-email?email=${encodeURIComponent(email)}`);
  },
  
  checkUsername: async (username) => {
    return apiCall(`/auth/check-username?username=${encodeURIComponent(username)}`);
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    return apiCall('/users');
  },
  
  getById: async (id) => {
    return apiCall(`/users/${id}`);
  },
  
  getByRole: async (role) => {
    return apiCall(`/users/role/${role}`);
  },
  
  getByStatus: async (status) => {
    return apiCall(`/users/status/${status}`);
  },
  
  getPendingVerification: async () => {
    return apiCall('/users/pending-verification');
  },
  
  getStudentsByCounsellor: async (counsellorId) => {
    return apiCall(`/users/counsellor/${counsellorId}/students`);
  },
  
  getFlagged: async () => {
    return apiCall('/users/flagged');
  },
  
  update: async (id, userData) => {
    return apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
  
  verify: async (id, verifierId, notes) => {
    return apiCall(`/users/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verifierId, notes }),
    });
  },
  
  reject: async (id, verifierId, reason) => {
    return apiCall(`/users/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ verifierId, reason }),
    });
  },
  
  promote: async (id, role) => {
    return apiCall(`/users/${id}/promote`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },
  
  assignCounsellor: async (studentId, counsellorId) => {
    return apiCall(`/users/${studentId}/assign-counsellor`, {
      method: 'POST',
      body: JSON.stringify({ counsellorId }),
    });
  },
  
  flag: async (studentId, reason) => {
    return apiCall(`/users/${studentId}/flag`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
  
  unflag: async (studentId) => {
    return apiCall(`/users/${studentId}/unflag`, {
      method: 'POST',
    });
  },
  
  delete: async (id) => {
    return apiCall(`/users/${id}`, {
      method: 'DELETE',
    });
  },
  
  getCountByRole: async (role) => {
    return apiCall(`/users/count/${role}`);
  },
  
  create: async (userData) => {
    return apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// Chat API
export const chatAPI = {
  getConversation: async (userId, otherUserId) => {
    return apiCall(`/chat/conversation/${userId}/${otherUserId}`);
  },
  
  sendMessage: async (senderId, receiverId, message) => {
    return apiCall('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ senderId, receiverId, message }),
    });
  },
  
  getUnreadMessages: async (userId) => {
    return apiCall(`/chat/unread/${userId}`);
  },
  
  getUnreadCount: async (userId) => {
    return apiCall(`/chat/unread-count/${userId}`);
  },
  
  markAsRead: async (messageId) => {
    return apiCall(`/chat/mark-read/${messageId}`, {
      method: 'POST',
    });
  },
  
  markConversationAsRead: async (userId, otherUserId) => {
    return apiCall(`/chat/mark-conversation-read/${userId}/${otherUserId}`, {
      method: 'POST',
    });
  },
  
  getParticipants: async (userId) => {
    return apiCall(`/chat/participants/${userId}`);
  },
};

// Meetings API
export const meetingsAPI = {
  getByStudent: async (studentId) => {
    return apiCall(`/meetings/student/${studentId}`);
  },
  
  getByCounsellor: async (counsellorId) => {
    return apiCall(`/meetings/counsellor/${counsellorId}`);
  },
  
  getById: async (id) => {
    return apiCall(`/meetings/${id}`);
  },
  
  schedule: async (meetingData) => {
    return apiCall('/meetings', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  },
  
  updateStatus: async (id, status) => {
    return apiCall(`/meetings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  
  addNotes: async (id, notes) => {
    return apiCall(`/meetings/${id}/notes`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
  },
  
  reschedule: async (id, scheduledTime) => {
    return apiCall(`/meetings/${id}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({ scheduledTime }),
    });
  },
  
  cancel: async (id) => {
    return apiCall(`/meetings/${id}`, {
      method: 'DELETE',
    });
  },
  
  getUpcoming: async (counsellorId, from, to) => {
    return apiCall(`/meetings/counsellor/${counsellorId}/upcoming?from=${from}&to=${to}`);
  },
  
  getCount: async (counsellorId, status) => {
    return apiCall(`/meetings/counsellor/${counsellorId}/count/${status}`);
  },
};

// Tests API
export const testsAPI = {
  getByStudent: async (studentId) => {
    return apiCall(`/tests/student/${studentId}`);
  },
  
  getLatest: async (studentId, testType) => {
    return apiCall(`/tests/student/${studentId}/latest/${testType}`);
  },
  
  save: async (testData) => {
    return apiCall('/tests', {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  },
  
  hasCompleted: async (studentId, testType) => {
    return apiCall(`/tests/student/${studentId}/has-completed/${testType}`);
  },
  
  getCount: async (studentId) => {
    return apiCall(`/tests/student/${studentId}/count`);
  },
};

// Assessments API
export const assessmentsAPI = {
  getByStudent: async (studentId) => {
    return apiCall(`/assessments/student/${studentId}`);
  },
  
  save: async (assessmentData) => {
    return apiCall('/assessments', {
      method: 'POST',
      body: JSON.stringify(assessmentData),
    });
  },
  
  complete: async (studentId) => {
    return apiCall(`/assessments/student/${studentId}/complete`, {
      method: 'POST',
    });
  },
  
  hasCompleted: async (studentId) => {
    return apiCall(`/assessments/student/${studentId}/has-completed`);
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    return apiCall('/health');
  },
};

export default {
  auth: authAPI,
  users: usersAPI,
  chat: chatAPI,
  meetings: meetingsAPI,
  tests: testsAPI,
  assessments: assessmentsAPI,
  health: healthAPI,
};
