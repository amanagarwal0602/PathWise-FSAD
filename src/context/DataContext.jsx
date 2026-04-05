import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { verifyPassword } from '../utils/security';
import { apiFetch } from '../utils/api';

// Create Context for sharing data across components
const DataContext = createContext();

// API Base URL - use backend server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090/api';

// Student Status Workflow
const STUDENT_STATUS = {
  PENDING_VERIFICATION: 'pending_verification',  // New student - awaiting evaluator review
  REJECTED: 'rejected',  // Evaluator rejected the student
  VERIFIED: 'verified',  // Evaluator approved the student
  ASSESSMENT_COMPLETED: 'assessment_completed',
  ASSIGNED_TO_GENERAL: 'assigned_to_general',
  CHAT_EVALUATION: 'chat_evaluation',
  COUNSELLOR_ASSIGNED: 'counsellor_assigned',
  ACTIVE_GUIDANCE: 'active_guidance'
};

// Initial state
const initialData = {
  users: [],
  meetings: [],
  groups: [],
  chats: [],
  supportConversations: [],
  testResults: [],
  interestAssessments: [],
  studentNotes: [],
  counsellorRecommendations: [],
  verificationRequests: []
};

// ============================================
// ENHANCED INTEREST ASSESSMENT QUESTIONS
// ============================================

const interestAssessmentQuestions = [
  // Section 1: Career Interests
  {
    id: 1,
    section: 'Career Interests',
    question: 'Which career paths appeal to you the most?',
    options: [
      'Technology & Software Development',
      'Healthcare & Medicine',
      'Business & Entrepreneurship',
      'Arts & Creative Design',
      'Science & Research',
      'Education & Training',
      'Law & Public Service'
    ],
    optionTraits: ['technical', 'social', 'analytical', 'creative', 'analytical', 'social', 'analytical'],
    optionFields: ['IT', 'Healthcare', 'Business', 'Design', 'Research', 'Education', 'Law']
  },
  {
    id: 2,
    section: 'Career Interests',
    question: 'What type of work outcomes motivate you?',
    options: [
      'Creating innovative products',
      'Helping people directly',
      'Achieving financial success',
      'Expressing creativity',
      'Discovering new knowledge',
      'Making societal impact'
    ],
    optionTraits: ['technical', 'social', 'analytical', 'creative', 'analytical', 'social'],
    optionFields: ['IT', 'Healthcare', 'Business', 'Design', 'Research', 'Social Work']
  },

  // Section 2: Technical vs Creative Inclination
  {
    id: 3,
    section: 'Technical vs Creative',
    question: 'Which activities do you enjoy more?',
    options: [
      'Writing code or solving logical puzzles',
      'Designing graphics or visual content',
      'Analyzing data and numbers',
      'Writing stories or content',
      'Building or fixing physical things',
      'Performing or presenting'
    ],
    optionTraits: ['technical', 'creative', 'analytical', 'creative', 'technical', 'creative'],
    optionFields: ['IT', 'Design', 'Data Science', 'Media', 'Engineering', 'Media']
  },
  {
    id: 4,
    section: 'Technical vs Creative',
    question: 'How do you prefer to solve problems?',
    options: [
      'Using systematic, step-by-step approaches',
      'Thinking outside the box creatively',
      'Analyzing all available data first',
      'Brainstorming with others',
      'Trial and error experimentation',
      'Relying on intuition and experience'
    ],
    optionTraits: ['technical', 'creative', 'analytical', 'social', 'technical', 'creative'],
    optionFields: ['IT', 'Design', 'Data Science', 'Business', 'Engineering', 'Arts']
  },

  // Section 3: Leadership & Teamwork Preference
  {
    id: 5,
    section: 'Leadership & Teamwork',
    question: 'What role do you prefer in a team?',
    options: [
      'Leading and directing the team',
      'Contributing as a team member',
      'Working independently with minimal interaction',
      'Coordinating between team members',
      'Mentoring and guiding others',
      'Supporting and assisting others'
    ],
    optionTraits: ['leadership', 'teamwork', 'independent', 'leadership', 'social', 'teamwork'],
    optionFields: ['Management', 'Any', 'Research', 'Management', 'Education', 'Healthcare']
  },
  {
    id: 6,
    section: 'Leadership & Teamwork',
    question: 'How do you handle group decisions?',
    options: [
      'Take charge and make final decisions',
      'Seek consensus from everyone',
      'Contribute ideas but let others decide',
      'Analyze options and present recommendations',
      'Go with the majority opinion',
      'Prefer to work on individual tasks'
    ],
    optionTraits: ['leadership', 'teamwork', 'teamwork', 'analytical', 'teamwork', 'independent'],
    optionFields: ['Management', 'HR', 'Any', 'Consulting', 'Any', 'Research']
  },

  // Section 4: Risk-Taking Ability
  {
    id: 7,
    section: 'Risk-Taking Ability',
    question: 'How comfortable are you with uncertainty?',
    options: [
      'Very comfortable - I thrive on challenges',
      'Somewhat comfortable with calculated risks',
      'Prefer stability with occasional risks',
      'Prefer stable and predictable situations',
      'Only take risks when necessary',
      'Avoid risks whenever possible'
    ],
    optionTraits: ['risk_taker', 'risk_taker', 'balanced', 'risk_averse', 'balanced', 'risk_averse'],
    optionFields: ['Entrepreneurship', 'Business', 'Corporate', 'Government', 'Corporate', 'Government']
  },
  {
    id: 8,
    section: 'Risk-Taking Ability',
    question: 'Which career path appeals to you more?',
    options: [
      'Starting my own business/startup',
      'Working in an innovative company',
      'Stable corporate job with growth',
      'Government or public sector job',
      'Freelancing and consulting',
      'Academic or research position'
    ],
    optionTraits: ['risk_taker', 'risk_taker', 'balanced', 'risk_averse', 'risk_taker', 'balanced'],
    optionFields: ['Entrepreneurship', 'IT', 'Corporate', 'Government', 'Consulting', 'Research']
  },

  // Section 5: Problem-Solving Style
  {
    id: 9,
    section: 'Problem-Solving Style',
    question: 'How do you approach complex problems?',
    options: [
      'Break down into smaller parts systematically',
      'Look for patterns and connections',
      'Research how others have solved similar problems',
      'Experiment with different approaches',
      'Discuss with others to get perspectives',
      'Trust my gut feeling and experience'
    ],
    optionTraits: ['analytical', 'analytical', 'technical', 'creative', 'social', 'creative'],
    optionFields: ['Engineering', 'Data Science', 'IT', 'Design', 'HR', 'Arts']
  },
  {
    id: 10,
    section: 'Problem-Solving Style',
    question: 'What tools do you prefer for problem-solving?',
    options: [
      'Spreadsheets and data analysis tools',
      'Design and visualization software',
      'Programming and technical tools',
      'Writing and documentation',
      'Meetings and discussions',
      'Research papers and case studies'
    ],
    optionTraits: ['analytical', 'creative', 'technical', 'creative', 'social', 'analytical'],
    optionFields: ['Data Science', 'Design', 'IT', 'Media', 'Management', 'Research']
  },

  // Section 6: Communication Preference
  {
    id: 11,
    section: 'Communication Preference',
    question: 'How do you prefer to communicate?',
    options: [
      'Written communication (emails, reports)',
      'Verbal communication (calls, meetings)',
      'Visual presentations',
      'One-on-one discussions',
      'Group presentations',
      'Technical documentation'
    ],
    optionTraits: ['analytical', 'social', 'creative', 'social', 'leadership', 'technical'],
    optionFields: ['Any', 'Sales', 'Marketing', 'Counselling', 'Management', 'IT']
  },
  {
    id: 12,
    section: 'Communication Preference',
    question: 'What type of interaction energizes you?',
    options: [
      'Deep conversations with individuals',
      'Presenting to large audiences',
      'Online/remote communication',
      'Collaborative team discussions',
      'Teaching and explaining concepts',
      'Minimal interaction, focused work'
    ],
    optionTraits: ['social', 'leadership', 'independent', 'teamwork', 'social', 'independent'],
    optionFields: ['Counselling', 'Marketing', 'IT', 'Any', 'Education', 'Research']
  },

  // Section 7: Work Environment Preference
  {
    id: 13,
    section: 'Work Environment',
    question: 'What work environment suits you best?',
    options: [
      'Modern tech office with flexibility',
      'Traditional corporate setting',
      'Healthcare/hospital environment',
      'Creative studio or agency',
      'Academic institution',
      'Remote/work from home'
    ],
    optionTraits: ['technical', 'analytical', 'social', 'creative', 'analytical', 'independent'],
    optionFields: ['IT', 'Corporate', 'Healthcare', 'Design', 'Education', 'IT']
  },
  {
    id: 14,
    section: 'Work Environment',
    question: 'What schedule preference do you have?',
    options: [
      'Flexible hours, outcome-based',
      'Fixed 9-5 schedule',
      'Shift work (rotational)',
      'Project-based with deadlines',
      'Teaching/academic schedule',
      'Freelance/self-managed time'
    ],
    optionTraits: ['risk_taker', 'risk_averse', 'teamwork', 'technical', 'social', 'risk_taker'],
    optionFields: ['IT', 'Government', 'Healthcare', 'IT', 'Education', 'Consulting']
  },
  {
    id: 15,
    section: 'Work Environment',
    question: 'What motivates you to go to work?',
    options: [
      'Solving challenging problems',
      'Helping and serving others',
      'Financial rewards and growth',
      'Creative expression',
      'Learning and development',
      'Job security and stability'
    ],
    optionTraits: ['technical', 'social', 'analytical', 'creative', 'analytical', 'risk_averse'],
    optionFields: ['Engineering', 'Healthcare', 'Business', 'Arts', 'Research', 'Government']
  }
];

// Career mapping based on category
const careerMapping = {
  analytical: ["Data Scientist", "Financial Analyst", "Actuary", "Research Scientist", "Statistician", "Business Analyst", "Management Consultant"],
  creative: ["Graphic Designer", "Content Writer", "UI/UX Designer", "Animator", "Film Director", "Architect", "Art Director", "Brand Strategist"],
  technical: ["Software Engineer", "Mechanical Engineer", "Civil Engineer", "Network Administrator", "Data Engineer", "Robotics Engineer", "DevOps Engineer", "Cloud Architect"],
  social: ["Career Counsellor", "HR Manager", "Teacher", "Social Worker", "Public Relations", "Healthcare Professional", "Psychologist", "NGO Manager"],
  leadership: ["Product Manager", "Project Manager", "CEO/Entrepreneur", "Operations Manager", "Team Lead", "Business Development Manager"],
  teamwork: ["Marketing Manager", "Event Coordinator", "Customer Success Manager", "Account Manager", "HR Coordinator"],
  independent: ["Freelance Developer", "Research Analyst", "Technical Writer", "Consultant", "Data Analyst"],
  risk_taker: ["Startup Founder", "Venture Capitalist", "Stock Trader", "Sales Executive", "Business Developer"],
  risk_averse: ["Government Employee", "Bank Officer", "Accountant", "Auditor", "Insurance Agent"],
  balanced: ["Corporate Manager", "IT Professional", "Healthcare Administrator", "Legal Advisor"]
};

// Field to Specialization mapping for counsellor matching
const fieldToSpecialization = {
  'IT': 'Engineering',
  'Engineering': 'Engineering',
  'Healthcare': 'Medical',
  'Business': 'Business',
  'Corporate': 'Business',
  'Design': 'Arts',
  'Arts': 'Arts',
  'Media': 'Arts',
  'Research': 'Science',
  'Data Science': 'Engineering',
  'Education': 'General',
  'Law': 'Law',
  'Government': 'General',
  'Management': 'Business',
  'Consulting': 'Business',
  'Entrepreneurship': 'Business',
  'HR': 'Business',
  'Social Work': 'General',
  'Marketing': 'Business',
  'Sales': 'Business',
  'Counselling': 'General',
  'Any': 'General'
};

// Helper function to upload data to backend
const uploadToBackend = async (data) => {
  try {
    // Exclude local-only collections from sync payload
    const { chats, supportConversations, ...syncPayload } = data || {};
    const token = localStorage.getItem('jwtToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/sync/upload`, {
      method: 'POST',
      headers,
      body: JSON.stringify(syncPayload)
    });
    if (response.ok) {
      console.log('✅ Data uploaded to server');
      return true;
    }
  } catch (error) {
    console.log('⚠️ Upload failed (offline mode):', error);
  }
  return false;
};

// Helper function to fetch data from backend
const fetchFromBackend = async () => {
  try {
    const token = localStorage.getItem('jwtToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/sync/download`, { headers });
    if (response.ok) {
      const serverData = await response.json();
      console.log('✅ Data fetched from server');
      return serverData;
    }
  } catch (error) {
    console.log('⚠️ Fetch failed:', error);
  }
  return null;
};

// Normalize chat message shape from backend
const normalizeChatMessage = (msg) => ({
  id: msg.id,
  fromId: msg.senderId,
  toId: msg.receiverId,
  message: msg.message,
  timestamp: msg.timestamp,
  isRead: msg.isRead
});

// Normalize meeting object from backend
const normalizeMeeting = (meeting) => {
  const scheduled = meeting.scheduledTime || meeting.scheduled_time || null;
  let date = meeting.date || null;
  let time = meeting.time || null;

  if (scheduled && (!date || !time)) {
    try {
      const [d, t] = scheduled.split('T');
      date = date || d;
      time = time || (t ? t.substring(0, 5) : null);
    } catch (e) {
      console.warn('Failed to parse scheduledTime for meeting', meeting, e);
    }
  }

  return {
    ...meeting,
    date,
    time,
    status: meeting.status?.toLowerCase()
  };
};

// Data Provider Component
export function DataProvider({ children }) {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('pathwiseData');
    if (saved) {
      return { ...initialData, ...JSON.parse(saved) };
    }
    return initialData;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [syncStatus, setSyncStatus] = useState('idle');

  const refreshData = async () => {
    setSyncStatus('syncing');
    const serverData = await fetchFromBackend();
    if (serverData) {
      // Normalize all user roles/statuses to lowercase for frontend compatibility
      if (serverData.users) {
        const BASE_WORKFLOW_STATUSES = new Set([
          STUDENT_STATUS.PENDING_VERIFICATION,
          STUDENT_STATUS.VERIFIED,
          STUDENT_STATUS.REJECTED
        ]);

        serverData.users = serverData.users.map(u => {
          const normalizedRole = u.role?.toLowerCase();
          const normalizedStatus = u.status?.toLowerCase();

          // Try to preserve richer frontend-only workflow states (assessment_completed, etc.)
          // while still reflecting backend verification status changes.
          let mergedStudentStatus;
          const existing = data.users?.find(prev => prev.id === u.id);

          if (existing && existing.studentStatus) {
            const prevStatus = existing.studentStatus;
            if (BASE_WORKFLOW_STATUSES.has(prevStatus)) {
              // For base verification states, always sync with backend status (may have changed).
              mergedStudentStatus = normalizedStatus || prevStatus;
            } else {
              // For advanced workflow states, keep the richer local value.
              mergedStudentStatus = prevStatus;
            }
          } else if (normalizedRole === 'student') {
            // For students without a workflow state yet, start from backend status.
            mergedStudentStatus = normalizedStatus;
          }

          return {
            ...u,
            role: normalizedRole,
            status: normalizedStatus,
            studentStatus: mergedStudentStatus
          };
        });
      }

      const finalData = { ...initialData, ...serverData };
      setData(prev => {
        const merged = { ...finalData };
        // Preserve locally managed, backend-driven collections that are not part of sync
        // (e.g. chat messages loaded via /api/chat)
        merged.chats = prev.chats || [];
        merged.supportConversations = prev.supportConversations || [];
        return merged;
      });
      localStorage.setItem('pathwiseData', JSON.stringify({ ...initialData, ...serverData }));

      if (currentUser && serverData.users) {
        const updatedUser = serverData.users.find(u => u.id === currentUser.id);
        if (updatedUser) setCurrentUser(updatedUser);
      }
      setSyncStatus('synced');
    } else {
      setSyncStatus('error');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      refreshData();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pathwiseData', JSON.stringify(data));
    // Upload to backend (debounced)
    const timeout = setTimeout(() => {
      uploadToBackend(data);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [data]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Add a new user via API
  const addUser = async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, name: userData.name || userData.username })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        // Normalize role/status to lowercase for frontend compatibility
        const normalizedRole = resData.data.role?.toLowerCase();
        const normalizedStatus = resData.data.status?.toLowerCase();
        const newUser = {
          ...resData.data,
          role: normalizedRole,
          status: normalizedStatus,
          // For students, initialise workflow state from backend verification status
          studentStatus: normalizedRole === 'student' ? normalizedStatus : resData.data.studentStatus
        };
        // Optimistically add to local state
        setData(prev => ({
          ...prev,
          users: [...prev.users, newUser]
        }));
        return newUser;
      }
      console.error(resData);
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Logout function
  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('pathwiseSession');
    // Clear pathwiseData too if you want a complete reset, 
    // but usually we keep it for offline caching unless it's sensitive.
  }, []);

  // Secure API Login wrapper
  const login = async (emailOrUsername, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: emailOrUsername, password })
      });
      const resData = await res.json();
      
      if (res.ok && resData.success) {
        localStorage.setItem('jwtToken', resData.token);
        // Backend LoginResponse uses "user" field, normalize role to lowercase
        const rawUser = resData.user || resData.data;
        const user = { ...rawUser, role: rawUser.role?.toLowerCase(), status: rawUser.status?.toLowerCase() };
        setCurrentUser(user);
        
        // Refresh all application data once logged in securely
        await refreshData();
        return user;
      }
      return null;
    } catch (err) {
      console.error('Login error', err);
      return null;
    }
  };

  // Update student status workflow
  const updateStudentStatus = (studentId, newStatus) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u =>
        u.id === studentId ? { ...u, studentStatus: newStatus } : u
      )
    }));
  };

  // Verify student (evaluator approves the student)
  const verifyStudent = async (studentId, evaluatorId, notes = '') => {
    try {
      const res = await apiFetch(`/users/${studentId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ verifierId: evaluatorId, notes })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        const updatedUser = { 
          ...resData.data, 
          role: resData.data.role?.toLowerCase(), 
          status: resData.data.status?.toLowerCase(),
          studentStatus: resData.data.status?.toLowerCase() // Ensure frontend backward compatibility
        };
        setData(prev => ({
          ...prev,
          users: prev.users.map(u => u.id === studentId ? updatedUser : u),
          verificationRequests: [...(prev.verificationRequests || []), {
            id: Date.now(),
            studentId,
            evaluatorId,
            action: 'approved',
            notes,
            timestamp: new Date().toISOString()
          }]
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Reject student (evaluator rejects the student)
  const rejectStudent = async (studentId, evaluatorId, reason) => {
    try {
      const res = await apiFetch(`/users/${studentId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ verifierId: evaluatorId, reason })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        const updatedUser = { 
          ...resData.data, 
          role: resData.data.role?.toLowerCase(), 
          status: resData.data.status?.toLowerCase(),
          studentStatus: resData.data.status?.toLowerCase() // Ensure frontend backward compatibility
        };
        setData(prev => ({
          ...prev,
          users: prev.users.map(u => u.id === studentId ? updatedUser : u),
          verificationRequests: [...(prev.verificationRequests || []), {
            id: Date.now(),
            studentId,
            evaluatorId,
            action: 'rejected',
            reason,
            timestamp: new Date().toISOString()
          }]
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Verify counsellor/mentor (evaluator approves the counsellor)
  const verifyCounsellor = async (counsellorId, evaluatorId, notes = '') => {
    return verifyStudent(counsellorId, evaluatorId, notes); // Backend uses same endpoint for both
  };

  // Reject counsellor/mentor (evaluator rejects the counsellor)
  const rejectCounsellor = async (counsellorId, evaluatorId, reason) => {
    return rejectStudent(counsellorId, evaluatorId, reason); // Backend uses same endpoint for both
  };

  // Get students pending verification
  const getPendingVerificationStudents = () => {
    return data.users.filter(u =>
      u.role === 'student' && u.studentStatus === STUDENT_STATUS.PENDING_VERIFICATION
    );
  };

  // Get all evaluators
  const getEvaluators = () => {
    return data.users.filter(u => u.role === 'evaluator');
  };

  // Save interest assessment results with scoring
  const saveInterestAssessment = (studentId, assessmentData) => {
    const { answers, sectionScores, dominantTraits, suggestedFields, personalityInsights } = assessmentData;

    const assessment = {
      id: Date.now(),
      studentId,
      answers,
      sectionScores,
      dominantTraits,
      suggestedFields,
      personalityInsights,
      completedAt: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      interestAssessments: [...prev.interestAssessments, assessment],
      users: prev.users.map(u =>
        u.id === studentId ? { ...u, studentStatus: STUDENT_STATUS.ASSESSMENT_COMPLETED, assessmentCompleted: true } : u
      )
    }));

    apiFetch(`/users/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify({ assessmentCompleted: true })
    }).catch(err => console.warn('Could not persist assessment flag:', err));

    // Generate counsellor recommendations
    generateCounsellorRecommendations(studentId, suggestedFields);

    return assessment;
  };

  // Skip interest assessment
  const skipInterestAssessment = async (studentId) => {
    try {
      const res = await apiFetch(`/users/${studentId}`, {
        method: 'PUT',
        body: JSON.stringify({ assessmentSkipped: true })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        const updatedUser = { 
          ...resData.data, 
          role: resData.data.role?.toLowerCase(), 
          status: resData.data.status?.toLowerCase() 
        };
        setData(prev => ({
          ...prev,
          users: prev.users.map(u => u.id === studentId ? updatedUser : u)
        }));
        if (currentUser && currentUser.id === studentId) {
          setCurrentUser(updatedUser);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Generate personality insights based on assessment
  const calculateInterestScores = (answers) => {
    const traitCounts = {
      technical: 0, creative: 0, analytical: 0, social: 0,
      leadership: 0, teamwork: 0, independent: 0,
      risk_taker: 0, risk_averse: 0, balanced: 0
    };

    const fieldCounts = {};
    const sectionScores = {};

    Object.entries(answers).forEach(([qId, selectedOptions]) => {
      const question = interestAssessmentQuestions.find(q => q.id === parseInt(qId));
      if (question) {
        if (!sectionScores[question.section]) {
          sectionScores[question.section] = { total: 0, traits: {} };
        }

        selectedOptions.forEach(optIndex => {
          const trait = question.optionTraits[optIndex];
          const field = question.optionFields[optIndex];

          if (trait) {
            traitCounts[trait] = (traitCounts[trait] || 0) + 1;
            sectionScores[question.section].traits[trait] =
              (sectionScores[question.section].traits[trait] || 0) + 1;
          }
          if (field) {
            fieldCounts[field] = (fieldCounts[field] || 0) + 1;
          }
        });
        sectionScores[question.section].total += selectedOptions.length;
      }
    });

    // Get dominant traits (top 3)
    const dominantTraits = Object.entries(traitCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([trait, count]) => ({ trait, count, percentage: Math.round((count / 15) * 100) }));

    // Get suggested fields (top 5)
    const suggestedFields = Object.entries(fieldCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([field, count]) => ({ field, count, percentage: Math.round((count / 15) * 100) }));

    // Generate personality insights
    const personalityInsights = generatePersonalityInsights(dominantTraits, sectionScores);

    return {
      traitCounts,
      fieldCounts,
      sectionScores,
      dominantTraits,
      suggestedFields,
      personalityInsights
    };
  };

  // Generate personality insights based on assessment
  const generatePersonalityInsights = (dominantTraits, sectionScores) => {
    const insights = [];

    const topTrait = dominantTraits[0]?.trait;

    if (topTrait === 'technical') {
      insights.push("You have a strong technical inclination and enjoy working with systems and logic.");
    } else if (topTrait === 'creative') {
      insights.push("You are highly creative and thrive in environments that allow artistic expression.");
    } else if (topTrait === 'analytical') {
      insights.push("You have excellent analytical skills and enjoy data-driven decision making.");
    } else if (topTrait === 'social') {
      insights.push("You are people-oriented and excel in roles involving human interaction.");
    } else if (topTrait === 'leadership') {
      insights.push("You have natural leadership qualities and prefer taking charge of situations.");
    }

    // Add work style insight
    if (dominantTraits.find(t => t.trait === 'independent')) {
      insights.push("You prefer working independently and are self-motivated.");
    } else if (dominantTraits.find(t => t.trait === 'teamwork')) {
      insights.push("You thrive in collaborative environments and enjoy team projects.");
    }

    // Add risk profile
    if (dominantTraits.find(t => t.trait === 'risk_taker')) {
      insights.push("You are comfortable with uncertainty and enjoy taking calculated risks.");
    } else if (dominantTraits.find(t => t.trait === 'risk_averse')) {
      insights.push("You prefer stability and structured career paths.");
    }

    return insights;
  };

  // Generate counsellor recommendations based on student assessment
  const generateCounsellorRecommendations = (studentId, suggestedFields) => {
    const counsellors = data.users.filter(u => u.role === 'counsellor' && u.status === 'active');

    const recommendations = counsellors.map(counsellor => {
      let matchScore = 0;
      const matchReasons = [];

      // Calculate match based on specialization
      suggestedFields.forEach(({ field, percentage }) => {
        const requiredSpec = fieldToSpecialization[field];
        if (counsellor.specialization === requiredSpec) {
          matchScore += percentage * 0.5;
          matchReasons.push(`Expertise in ${field}`);
        }
      });

      // Bonus for general guidance counsellors
      if (counsellor.specialization === 'General') {
        matchScore += 20;
        matchReasons.push('General guidance experience');
      }

      // Consider counsellor's current student load
      const currentStudents = data.users.filter(u => u.assignedCounsellor === counsellor.id).length;
      if (currentStudents < 5) {
        matchScore += 10;
        matchReasons.push('Available capacity');
      }

      return {
        counsellorId: counsellor.id,
        counsellorName: counsellor.name,
        specialization: counsellor.specialization,
        matchScore: Math.min(100, Math.round(matchScore)),
        matchReasons,
        currentStudentCount: currentStudents,
        isAvailable: counsellor.status === 'active'
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    // Save recommendations
    setData(prev => ({
      ...prev,
      counsellorRecommendations: [
        ...prev.counsellorRecommendations.filter(r => r.studentId !== studentId),
        { studentId, recommendations, generatedAt: new Date().toISOString() }
      ]
    }));

    return recommendations;
  };

  // Assign counsellor to student (by general counsellor or admin)
  const assignCounsellor = async (studentId, counsellorId) => {
    try {
      const res = await apiFetch(`/users/${studentId}/assign-counsellor`, {
        method: 'POST',
        body: JSON.stringify({ counsellorId })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        const updatedUser = {
          ...resData.data,
          role: resData.data.role?.toLowerCase(),
          status: resData.data.status?.toLowerCase()
        };
        setData(prev => ({
          ...prev,
          users: prev.users.map(u => u.id === studentId ? updatedUser : u)
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to assign counsellor', err);
      return false;
    }
  };

  // Accept student request (Legacy mapping for AdminDashboard)
  const acceptStudentRequest = (studentId, counsellorId) => {
    return assignCounsellor(studentId, counsellorId);
  };

  // Reassign counsellor
  const reassignCounsellor = (studentId, newCounsellorId) => {
    return assignCounsellor(studentId, newCounsellorId);
  };

  // Add student note (by general counsellor or admin)
  const addStudentNote = (studentId, authorId, content, noteType = 'general') => {
    const note = {
      id: Date.now(),
      studentId,
      authorId,
      content,
      noteType, // 'general', 'flag', 'summary', 'system'
      createdAt: new Date().toISOString()
    };
    setData(prev => ({
      ...prev,
      studentNotes: [...prev.studentNotes, note]
    }));
    return note;
  };

  // Flag student for special attention (persisted to backend)
  const flagStudent = async (studentId, reason) => {
    try {
      const res = await apiFetch(`/users/${studentId}/flag`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        const updatedUser = {
          ...resData.data,
          role: resData.data.role?.toLowerCase(),
          status: resData.data.status?.toLowerCase()
        };
        setData(prev => ({
          ...prev,
          users: prev.users.map(u =>
            u.id === studentId ? updatedUser : u
          )
        }));
        addStudentNote(studentId, currentUser?.id || 2, `Flagged: ${reason}`, 'flag');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to flag student', err);
      return false;
    }
  };

  // Unflag student (persisted to backend)
  const unflagStudent = async (studentId) => {
    try {
      const res = await apiFetch(`/users/${studentId}/unflag`, {
        method: 'POST'
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        const updatedUser = {
          ...resData.data,
          role: resData.data.role?.toLowerCase(),
          status: resData.data.status?.toLowerCase()
        };
        setData(prev => ({
          ...prev,
          users: prev.users.map(u =>
            u.id === studentId ? updatedUser : u
          )
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to unflag student', err);
      return false;
    }
  };

  // Update guidance stage (persisted to backend via updateUser)
  const updateGuidanceStage = async (studentId, stage) => {
    try {
      const updatedUser = await updateUser(studentId, { guidanceStage: stage });
      return !!updatedUser;
    } catch (err) {
      console.error('Failed to update guidance stage', err);
      return false;
    }
  };

  // Mark conversation summary
  const addChatSummary = (studentId, counsellorId, summary) => {
    addStudentNote(studentId, counsellorId, summary, 'summary');
  };

  // Save test results (legacy aptitude test)
  const saveTestResult = (studentId, result) => {
    const newResult = {
      id: Date.now(),
      studentId,
      ...result
    };
    setData(prev => ({
      ...prev,
      testResults: [...prev.testResults, newResult]
    }));
  };

  // ============================================
  // SUPPORT CONVERSATIONS (Customer Chat → Admin)
  // ============================================

  const addSupportMessage = ({ from, sessionId, conversationId, text, userId }) => {
    if (!text) return null;

    let createdConversationId = null;

    setData(prev => {
      const now = new Date().toISOString();
      const existingList = prev.supportConversations || [];

      let targetConversation = null;

      if (conversationId != null) {
        targetConversation = existingList.find(c => c.id === conversationId);
      } else if (userId != null) {
        targetConversation = existingList.find(
          c => c.userId === userId && c.status !== 'closed'
        );
      } else if (sessionId) {
        targetConversation = existingList.find(
          c => c.sessionId === sessionId && c.status !== 'closed'
        );
      }

      let conversations = existingList;

      if (!targetConversation) {
        const newId = Date.now();
        createdConversationId = newId;
        targetConversation = {
          id: newId,
          sessionId: sessionId || `session_${newId}`,
          userId: userId != null ? userId : null,
          createdAt: now,
          lastUpdatedAt: now,
          status: 'open',
          messages: []
        };
        conversations = [...conversations, targetConversation];
      } else {
        createdConversationId = targetConversation.id;
      }

      const newMessage = {
        id: Date.now(),
        from,
        text,
        timestamp: now
      };

      const updatedConversation = {
        ...targetConversation,
        messages: [...(targetConversation.messages || []), newMessage],
        lastUpdatedAt: now
      };

      const updatedList = conversations.map(c =>
        c.id === updatedConversation.id ? updatedConversation : c
      );

      return {
        ...prev,
        supportConversations: updatedList
      };
    });

    return createdConversationId;
  };

  const addSupportMessageFromVisitor = (sessionId, text) => {
    const userId = currentUser?.id != null ? currentUser.id : null;
    return addSupportMessage({ from: 'user', sessionId, text, userId });
  };

  const addSupportMessageFromAdmin = (conversationId, text) => {
    return addSupportMessage({ from: 'admin', conversationId, text });
  };

  const closeSupportConversation = (conversationId) => {
    setData(prev => ({
      ...prev,
      supportConversations: (prev.supportConversations || []).map(c =>
        c.id === conversationId
          ? { ...c, status: 'closed', closedAt: new Date().toISOString() }
          : c
      )
    }));
  };

  // Add chat message (persisted to backend)
  const addChatMessage = async (fromId, toId, message) => {
    try {
      const res = await apiFetch(`/chat/send`, {
        method: 'POST',
        body: JSON.stringify({ senderId: fromId, receiverId: toId, message })
      });
      const backendMsg = await res.json();
      const normalized = normalizeChatMessage(backendMsg);
      setData(prev => ({
        ...prev,
        chats: [...prev.chats, normalized]
      }));
      return normalized;
    } catch (err) {
      console.error('Failed to send chat message, falling back to local only', err);
      const fallback = {
        id: Date.now(),
        fromId,
        toId,
        message,
        timestamp: new Date().toISOString()
      };
      setData(prev => ({
        ...prev,
        chats: [...prev.chats, fallback]
      }));
      return fallback;
    }
  };

  // Delete all chat messages for a specific user (admin use)
  const deleteChatHistoryForUser = async (userId) => {
    try {
      const res = await apiFetch(`/chat/user/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setData(prev => ({
          ...prev,
          chats: prev.chats.filter(c => c.fromId !== userId && c.toId !== userId)
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete chat history for user', err);
      return false;
    }
  };

  // Load full conversation between two users from backend
  const loadConversation = async (userId, otherUserId) => {
    try {
      const res = await apiFetch(`/chat/conversation/${userId}/${otherUserId}`);
      const messages = await res.json();
      const normalized = messages.map(normalizeChatMessage);

      const isBetween = (m) => (
        (m.fromId === userId && m.toId === otherUserId) ||
        (m.fromId === otherUserId && m.toId === userId)
      );

      setData(prev => ({
        ...prev,
        chats: [
          // keep chats that are not between these two users
          ...prev.chats.filter(c =>
            !(
              (c.fromId === userId && c.toId === otherUserId) ||
              (c.fromId === otherUserId && c.toId === userId)
            )
          ),
          ...normalized
        ]
      }));

      return normalized;
    } catch (err) {
      console.error('Failed to load conversation', err);
      return [];
    }
  };

  // Merge meetings by id (helper)
  const mergeMeetings = (existing, incoming) => {
    const byId = new Map();
    (existing || []).forEach(m => {
      if (m && m.id != null) {
        byId.set(m.id, m);
      }
    });
    (incoming || []).forEach(m => {
      if (m && m.id != null) {
        const prev = byId.get(m.id) || {};
        byId.set(m.id, { ...prev, ...m });
      }
    });
    return Array.from(byId.values());
  };

  // Create meeting (counsellor or admin creates, persisted to backend)
  const createMeeting = async (counsellorId, meetingData) => {
    if (!meetingData || !meetingData.participants || meetingData.participants.length === 0) {
      console.warn('createMeeting called without participants');
      return [];
    }

    const {
      title,
      date,
      time,
      meetingLink,
      description,
      duration,
      type
    } = meetingData;

    const scheduledTime = date && time ? `${date}T${time}:00` : null;
    const createdMeetings = [];

    for (const studentId of meetingData.participants) {
      try {
        const res = await apiFetch(`/meetings`, {
          method: 'POST',
          body: JSON.stringify({
            studentId,
            counsellorId,
            title,
            description: description || '',
            scheduledTime,
            duration: duration || 30,
            meetingLink: meetingLink || ''
          })
        });
        const backendMeeting = await res.json();
        const normalized = {
          ...normalizeMeeting(backendMeeting),
          participants: type === 'group' ? meetingData.participants : [studentId]
        };
        createdMeetings.push(normalized);
      } catch (err) {
        console.error('Failed to schedule meeting', err);
      }
    }

    if (createdMeetings.length > 0) {
      setData(prev => ({
        ...prev,
        meetings: mergeMeetings(prev.meetings, createdMeetings)
      }));
    }

    return createdMeetings;
  };

  // Request meeting (student requests) - remains local for now
  const requestMeeting = (studentId, counsellorId, meetingData) => {
    const newMeeting = {
      id: Date.now(),
      studentId,
      counsellorId,
      ...meetingData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setData(prev => ({
      ...prev,
      meetings: [...prev.meetings, newMeeting]
    }));
  };

  // Update meeting status (backend for real meetings, local for legacy statuses)
  const updateMeetingStatus = async (meetingId, status) => {
    const backendStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'];

    if (!backendStatuses.includes(status)) {
      // Legacy/local-only statuses like 'pending', 'approved', 'rejected'
      setData(prev => ({
        ...prev,
        meetings: prev.meetings.map(m =>
          m.id === meetingId ? { ...m, status } : m
        )
      }));
      return true;
    }

    try {
      const res = await apiFetch(`/meetings/${meetingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        const updatedMeeting = normalizeMeeting(resData.data);
        setData(prev => ({
          ...prev,
          meetings: prev.meetings.map(m =>
            m.id === meetingId ? { ...m, ...updatedMeeting } : m
          )
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update meeting status', err);
      return false;
    }
  };

  // Create group
  const createGroup = (counsellorId, name, studentIds) => {
    const newGroup = {
      id: Date.now(),
      counsellorId,
      name,
      studentIds,
      createdAt: new Date().toISOString()
    };
    setData(prev => ({
      ...prev,
      groups: [...prev.groups, newGroup]
    }));
  };


  // Toggle user status (admin, persisted to backend)
  const toggleUserStatus = async (userId) => {
    const user = data.users.find(u => u.id === userId);
    if (!user) return false;
    const newStatus = user.status === 'inactive' ? 'active' : 'inactive';
    try {
      const updatedUser = await updateUser(userId, { status: newStatus });
      return !!updatedUser;
    } catch (err) {
      console.error('Failed to toggle user status', err);
      return false;
    }
  };

  // Update an existing user via API
  const updateUser = async (userId, updateData) => {
    try {
      const res = await apiFetch(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        const updatedUser = { 
          ...resData.data, 
          role: resData.data.role?.toLowerCase(), 
          status: resData.data.status?.toLowerCase(),
          studentStatus: resData.data.status?.toLowerCase() // Ensure frontend backward compatibility
        };
        setData(prev => ({
          ...prev,
          users: prev.users.map(u => u.id === userId ? updatedUser : u)
        }));
        if (currentUser?.id === userId) {
          setCurrentUser(updatedUser);
        }
        return updatedUser;
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Delete a user via API
  const deleteUser = async (userId) => {
    try {
      const res = await apiFetch(`/users/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setData(prev => ({
          ...prev,
          users: prev.users.filter(u => u.id !== userId)
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Change password for a user (self-service or admin override)
  const changePassword = async (userId, currentPassword, newPassword) => {
    try {
      const res = await apiFetch(`/users/${userId}/change-password`, {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const resData = await res.json();

      if (res.ok && resData.success) {
        const updatedUser = {
          ...resData.data,
          role: resData.data.role?.toLowerCase(),
          status: resData.data.status?.toLowerCase(),
          studentStatus: resData.data.status?.toLowerCase()
        };

        setData(prev => ({
          ...prev,
          users: prev.users.map(u => u.id === userId ? updatedUser : u)
        }));

        if (currentUser?.id === userId) {
          setCurrentUser(updatedUser);
        }

        return { success: true, message: resData.message || 'Password updated successfully' };
      }

      return { success: false, message: resData.message || 'Failed to update password' };
    } catch (err) {
      console.error('Failed to change password', err);
      return { success: false, message: 'Failed to update password' };
    }
  };

  // Update user profile
  const updateUserProfile = (userId, updates) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u =>
        u.id === userId ? { ...u, ...updates } : u
      )
    }));
  };

  // Get counsellor recommendations for a student
  const getCounsellorRecommendations = (studentId) => {
    const rec = data.counsellorRecommendations.find(r => r.studentId === studentId);
    return rec ? rec.recommendations : [];
  };

  // Get student notes
  const getStudentNotes = (studentId) => {
    return data.studentNotes.filter(n => n.studentId === studentId);
  };

  // Get interest assessment for student
  const getInterestAssessment = (studentId) => {
    return data.interestAssessments.find(a => a.studentId === studentId);
  };

  const value = {
    data,
    currentUser,
    setCurrentUser,
    STUDENT_STATUS,
    interestAssessmentQuestions,
    careerMapping,
    fieldToSpecialization,
    addUser,
    login,
    logout,
    updateStudentStatus,
    verifyStudent,
    rejectStudent,
    verifyCounsellor,
    rejectCounsellor,
    getPendingVerificationStudents,
    getEvaluators,
    saveInterestAssessment,
    calculateInterestScores,
    generateCounsellorRecommendations,
    assignCounsellor,
    reassignCounsellor,
    acceptStudentRequest,
    addStudentNote,
    flagStudent,
    unflagStudent,
    updateGuidanceStage,
    addChatSummary,
    saveTestResult,
    addChatMessage,
    deleteChatHistoryForUser,
    createMeeting,
    requestMeeting,
    updateMeetingStatus,
    createGroup,
    deleteUser,
    toggleUserStatus,
    updateUser,
    changePassword,
    updateUserProfile: updateUser, // Alias for backward compatibility
    skipInterestAssessment,
    getCounsellorRecommendations,
    getStudentNotes,
    getInterestAssessment,
    loadConversation,
    // Support conversations (CustomerChat -> Admin)
    supportConversations: data.supportConversations || [],
    addSupportMessageFromVisitor,
    addSupportMessageFromAdmin,
    closeSupportConversation,
    // Meeting loading helpers for backend-backed meetings
    // (used by dashboards to ensure cross-user consistency)
    // Expose minimal API for now; can be extended later
    refreshData,
    syncStatus,
    // Legacy support
    aptitudeQuestions: interestAssessmentQuestions
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// Custom hook to use the data context
export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
