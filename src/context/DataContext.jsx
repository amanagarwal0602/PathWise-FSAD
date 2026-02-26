import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { verifyPassword } from '../utils/security';

// Create Context for sharing data across components
const DataContext = createContext();

// API Base URL - use backend server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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

// Initial sample data (will be stored in localStorage)
const initialData = {
  users: [
    { id: 1, name: 'Admin', email: 'admin', username: 'admin', password: 'admin', role: 'admin', status: 'active' },
    {
      id: 2,
      name: 'Career Coordinator',
      email: 'general@pathwise.com',
      username: 'generalcounsellor',
      password: 'general123',
      role: 'general_counsellor',
      status: 'active',
      specialization: 'Career Coordination'
    },
    // Evaluators 1-2 (for STUDENT verification)
    {
      id: 3,
      name: 'Student Verification Specialist',
      email: 'evaluator1@pathwise.com',
      username: 'evaluator1',
      password: 'eval123',
      role: 'evaluator',
      status: 'active',
      evaluatorType: 'student',
      specialization: 'Student Verification'
    },
    {
      id: 4,
      name: 'Student Verification Specialist',
      email: 'evaluator2@pathwise.com',
      username: 'evaluator2',
      password: 'eval123',
      role: 'evaluator',
      status: 'active',
      evaluatorType: 'student',
      specialization: 'Student Verification'
    },
    // Evaluators 3-4 (for COUNSELLOR/MENTOR verification)
    {
      id: 5,
      name: 'Mentor Verification Specialist',
      email: 'evaluator3@pathwise.com',
      username: 'evaluator3',
      password: 'eval123',
      role: 'evaluator',
      status: 'active',
      evaluatorType: 'counsellor',
      specialization: 'Mentor Verification'
    },
    {
      id: 6,
      name: 'Mentor Verification Specialist',
      email: 'evaluator4@pathwise.com',
      username: 'evaluator4',
      password: 'eval123',
      role: 'evaluator',
      status: 'active',
      evaluatorType: 'counsellor',
      specialization: 'Mentor Verification'
    },
    // Sample Career Mentors (needing verification by Evaluator 3-4)
    {
      id: 201,
      name: 'Rahul Sharma',
      email: 'tech.mentor@pathwise.com',
      username: 'techmentor',
      password: 'mentor123',
      role: 'counsellor',
      status: 'pending_verification',
      specialization: 'Technology',
      qualifications: '10+ years in Software Development, Google certified, Former Tech Lead at TCS',
      createdAt: new Date().toISOString()
    },
    {
      id: 202,
      name: 'Priya Patel',
      email: 'business.mentor@pathwise.com',
      username: 'businessmentor',
      password: 'mentor123',
      role: 'counsellor',
      status: 'pending_verification',
      specialization: 'Business',
      qualifications: 'MBA from IIM, 8 years corporate experience, Startup founder',
      createdAt: new Date().toISOString()
    },
    {
      id: 203,
      name: 'Dr. Anita Desai',
      email: 'health.mentor@pathwise.com',
      username: 'healthmentor',
      password: 'mentor123',
      role: 'counsellor',
      status: 'active',
      specialization: 'Healthcare',
      qualifications: 'MBBS, MD, 15 years medical practice, Health counselor',
      verifiedBy: 5,
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: 204,
      name: 'Vikram Singh',
      email: 'arts.mentor@pathwise.com',
      username: 'artsmentor',
      password: 'mentor123',
      role: 'counsellor',
      status: 'active',
      specialization: 'Arts & Design',
      qualifications: 'NID Graduate, Award-winning designer, 12 years in creative industry',
      verifiedBy: 6,
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
    // NOTE: More counsellors and students will appear as they register
  ],
  meetings: [],
  groups: [],
  chats: [],
  testResults: [],
  interestAssessments: [],
  studentNotes: [],
  counsellorRecommendations: [],
  verificationRequests: []  // Track verification history
};

// ============================================
// ENHANCED INTEREST ASSESSMENT QUESTIONS
// ============================================

const interestAssessmentQuestions = [
  // Section 1: Career Interests
  {
    id: 1,
    section: 'Career Interests',
    question: "Which career paths appeal to you the most?",
    options: [
      "Technology & Software Development",
      "Healthcare & Medicine",
      "Business & Entrepreneurship",
      "Arts & Creative Design",
      "Science & Research",
      "Education & Training",
      "Law & Public Service"
    ],
    optionTraits: ["technical", "social", "analytical", "creative", "analytical", "social", "analytical"],
    optionFields: ["IT", "Healthcare", "Business", "Design", "Research", "Education", "Law"]
  },
  {
    id: 2,
    section: 'Career Interests',
    question: "What type of work outcomes motivate you?",
    options: [
      "Creating innovative products",
      "Helping people directly",
      "Achieving financial success",
      "Expressing creativity",
      "Discovering new knowledge",
      "Making societal impact"
    ],
    optionTraits: ["technical", "social", "analytical", "creative", "analytical", "social"],
    optionFields: ["IT", "Healthcare", "Business", "Design", "Research", "Social Work"]
  },

  // Section 2: Technical vs Creative Inclination
  {
    id: 3,
    section: 'Technical vs Creative',
    question: "Which activities do you enjoy more?",
    options: [
      "Writing code or solving logical puzzles",
      "Designing graphics or visual content",
      "Analyzing data and numbers",
      "Writing stories or content",
      "Building or fixing physical things",
      "Performing or presenting"
    ],
    optionTraits: ["technical", "creative", "analytical", "creative", "technical", "creative"],
    optionFields: ["IT", "Design", "Data Science", "Media", "Engineering", "Media"]
  },
  {
    id: 4,
    section: 'Technical vs Creative',
    question: "How do you prefer to solve problems?",
    options: [
      "Using systematic, step-by-step approaches",
      "Thinking outside the box creatively",
      "Analyzing all available data first",
      "Brainstorming with others",
      "Trial and error experimentation",
      "Relying on intuition and experience"
    ],
    optionTraits: ["technical", "creative", "analytical", "social", "technical", "creative"],
    optionFields: ["IT", "Design", "Data Science", "Business", "Engineering", "Arts"]
  },

  // Section 3: Leadership & Teamwork Preference
  {
    id: 5,
    section: 'Leadership & Teamwork',
    question: "What role do you prefer in a team?",
    options: [
      "Leading and directing the team",
      "Contributing as a team member",
      "Working independently with minimal interaction",
      "Coordinating between team members",
      "Mentoring and guiding others",
      "Supporting and assisting others"
    ],
    optionTraits: ["leadership", "teamwork", "independent", "leadership", "social", "teamwork"],
    optionFields: ["Management", "Any", "Research", "Management", "Education", "Healthcare"]
  },
  {
    id: 6,
    section: 'Leadership & Teamwork',
    question: "How do you handle group decisions?",
    options: [
      "Take charge and make final decisions",
      "Seek consensus from everyone",
      "Contribute ideas but let others decide",
      "Analyze options and present recommendations",
      "Go with the majority opinion",
      "Prefer to work on individual tasks"
    ],
    optionTraits: ["leadership", "teamwork", "teamwork", "analytical", "teamwork", "independent"],
    optionFields: ["Management", "HR", "Any", "Consulting", "Any", "Research"]
  },

  // Section 4: Risk-Taking Ability
  {
    id: 7,
    section: 'Risk-Taking Ability',
    question: "How comfortable are you with uncertainty?",
    options: [
      "Very comfortable - I thrive on challenges",
      "Somewhat comfortable with calculated risks",
      "Prefer stability with occasional risks",
      "Prefer stable and predictable situations",
      "Only take risks when necessary",
      "Avoid risks whenever possible"
    ],
    optionTraits: ["risk_taker", "risk_taker", "balanced", "risk_averse", "balanced", "risk_averse"],
    optionFields: ["Entrepreneurship", "Business", "Corporate", "Government", "Corporate", "Government"]
  },
  {
    id: 8,
    section: 'Risk-Taking Ability',
    question: "Which career path appeals to you more?",
    options: [
      "Starting my own business/startup",
      "Working in an innovative company",
      "Stable corporate job with growth",
      "Government or public sector job",
      "Freelancing and consulting",
      "Academic or research position"
    ],
    optionTraits: ["risk_taker", "risk_taker", "balanced", "risk_averse", "risk_taker", "balanced"],
    optionFields: ["Entrepreneurship", "IT", "Corporate", "Government", "Consulting", "Research"]
  },

  // Section 5: Problem-Solving Style
  {
    id: 9,
    section: 'Problem-Solving Style',
    question: "How do you approach complex problems?",
    options: [
      "Break down into smaller parts systematically",
      "Look for patterns and connections",
      "Research how others have solved similar problems",
      "Experiment with different approaches",
      "Discuss with others to get perspectives",
      "Trust my gut feeling and experience"
    ],
    optionTraits: ["analytical", "analytical", "technical", "creative", "social", "creative"],
    optionFields: ["Engineering", "Data Science", "IT", "Design", "HR", "Arts"]
  },
  {
    id: 10,
    section: 'Problem-Solving Style',
    question: "What tools do you prefer for problem-solving?",
    options: [
      "Spreadsheets and data analysis tools",
      "Design and visualization software",
      "Programming and technical tools",
      "Writing and documentation",
      "Meetings and discussions",
      "Research papers and case studies"
    ],
    optionTraits: ["analytical", "creative", "technical", "creative", "social", "analytical"],
    optionFields: ["Data Science", "Design", "IT", "Media", "Management", "Research"]
  },

  // Section 6: Communication Preference
  {
    id: 11,
    section: 'Communication Preference',
    question: "How do you prefer to communicate?",
    options: [
      "Written communication (emails, reports)",
      "Verbal communication (calls, meetings)",
      "Visual presentations",
      "One-on-one discussions",
      "Group presentations",
      "Technical documentation"
    ],
    optionTraits: ["analytical", "social", "creative", "social", "leadership", "technical"],
    optionFields: ["Any", "Sales", "Marketing", "Counselling", "Management", "IT"]
  },
  {
    id: 12,
    section: 'Communication Preference',
    question: "What type of interaction energizes you?",
    options: [
      "Deep conversations with individuals",
      "Presenting to large audiences",
      "Online/remote communication",
      "Collaborative team discussions",
      "Teaching and explaining concepts",
      "Minimal interaction, focused work"
    ],
    optionTraits: ["social", "leadership", "independent", "teamwork", "social", "independent"],
    optionFields: ["Counselling", "Marketing", "IT", "Any", "Education", "Research"]
  },

  // Section 7: Work Environment Preference
  {
    id: 13,
    section: 'Work Environment',
    question: "What work environment suits you best?",
    options: [
      "Modern tech office with flexibility",
      "Traditional corporate setting",
      "Healthcare/hospital environment",
      "Creative studio or agency",
      "Academic institution",
      "Remote/work from home"
    ],
    optionTraits: ["technical", "analytical", "social", "creative", "analytical", "independent"],
    optionFields: ["IT", "Corporate", "Healthcare", "Design", "Education", "IT"]
  },
  {
    id: 14,
    section: 'Work Environment',
    question: "What schedule preference do you have?",
    options: [
      "Flexible hours, outcome-based",
      "Fixed 9-5 schedule",
      "Shift work (rotational)",
      "Project-based with deadlines",
      "Teaching/academic schedule",
      "Freelance/self-managed time"
    ],
    optionTraits: ["risk_taker", "risk_averse", "teamwork", "technical", "social", "risk_taker"],
    optionFields: ["IT", "Government", "Healthcare", "IT", "Education", "Consulting"]
  },
  {
    id: 15,
    section: 'Work Environment',
    question: "What motivates you to go to work?",
    options: [
      "Solving challenging problems",
      "Helping and serving others",
      "Financial rewards and growth",
      "Creative expression",
      "Learning and development",
      "Job security and stability"
    ],
    optionTraits: ["technical", "social", "analytical", "creative", "analytical", "risk_averse"],
    optionFields: ["Engineering", "Healthcare", "Business", "Arts", "Research", "Government"]
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

// Helper function to sync with backend
const syncWithBackend = async (localData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sync/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localData)
    });
    if (response.ok) {
      const mergedData = await response.json();
      console.log('✅ Data synced with server');
      return mergedData;
    }
  } catch (error) {
    console.log('⚠️ Backend sync failed (offline mode):', error);
  }
  return null;
};

// Helper function to upload data to backend
const uploadToBackend = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sync/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
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
    const response = await fetch(`${API_BASE_URL}/sync/download`);
    if (response.ok) {
      const serverData = await response.json();
      console.log('✅ Data fetched from server');
      return serverData;
    }
  } catch (error) {
    console.log('⚠️ Fetch failed (offline mode):', error);
  }
  return null;
};

// Data Provider Component
export function DataProvider({ children }) {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('pathwiseData');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge system users (admin, evaluators) with saved users to ensure they always exist
      const systemUserEmails = initialData.users.map(u => u.email);
      const savedNonSystemUsers = parsed.users?.filter(u => !systemUserEmails.includes(u.email)) || [];
      const mergedUsers = [...initialData.users, ...savedNonSystemUsers];

      return {
        ...initialData,
        ...parsed,
        users: mergedUsers, // Use merged users
        interestAssessments: parsed.interestAssessments || [],
        studentNotes: parsed.studentNotes || [],
        counsellorRecommendations: parsed.counsellorRecommendations || []
      };
    }
    return initialData;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, synced, error

  // Sync with backend on initial load
  useEffect(() => {
    const initSync = async () => {
      setSyncStatus('syncing');
      const localData = JSON.parse(localStorage.getItem('pathwiseData') || 'null');

      if (localData) {
        // Try to merge local data with server
        const mergedData = await syncWithBackend(localData);
        if (mergedData && mergedData.users) {
          // Ensure system users always exist
          const systemUserEmails = initialData.users.map(u => u.email);
          const nonSystemUsers = mergedData.users.filter(u => !systemUserEmails.includes(u.email));
          const finalUsers = [...initialData.users, ...nonSystemUsers];

          const finalData = {
            ...initialData,
            ...mergedData,
            users: finalUsers
          };

          setData(finalData);
          localStorage.setItem('pathwiseData', JSON.stringify(finalData));
          setSyncStatus('synced');
        } else {
          setSyncStatus('error');
        }
      } else {
        // No local data, fetch from server
        const serverData = await fetchFromBackend();
        if (serverData && serverData.users) {
          const systemUserEmails = initialData.users.map(u => u.email);
          const nonSystemUsers = serverData.users.filter(u => !systemUserEmails.includes(u.email));
          const finalUsers = [...initialData.users, ...nonSystemUsers];

          const finalData = {
            ...initialData,
            ...serverData,
            users: finalUsers
          };

          setData(finalData);
          localStorage.setItem('pathwiseData', JSON.stringify(finalData));
          setSyncStatus('synced');
        } else {
          setSyncStatus('idle');
        }
      }
    };

    initSync();
  }, []);

  // Save to localStorage AND sync to backend whenever data changes
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
    }
  }, [currentUser]);

  // Sync data across tabs using localStorage events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'pathwiseData' && e.newValue) {
        const newData = JSON.parse(e.newValue);
        setData(newData);

        // Update currentUser if their data changed
        if (currentUser) {
          const updatedUser = newData.users.find(u => u.id === currentUser.id);
          if (updatedUser && JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) {
            setCurrentUser(updatedUser);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser]);

  // Refresh data from localStorage AND backend (for manual refresh)
  const refreshData = async () => {
    setSyncStatus('syncing');
    const localData = JSON.parse(localStorage.getItem('pathwiseData') || 'null') || data;

    // Try to sync with backend
    const mergedData = await syncWithBackend(localData);

    if (mergedData && mergedData.users) {
      // Ensure system users always exist
      const systemUserEmails = initialData.users.map(u => u.email);
      const nonSystemUsers = mergedData.users.filter(u => !systemUserEmails.includes(u.email));
      const finalUsers = [...initialData.users, ...nonSystemUsers];

      const finalData = {
        ...initialData,
        ...mergedData,
        users: finalUsers
      };

      setData(finalData);
      localStorage.setItem('pathwiseData', JSON.stringify(finalData));

      if (currentUser) {
        const updatedUser = finalData.users.find(u => u.id === currentUser.id);
        if (updatedUser) {
          setCurrentUser(updatedUser);
        }
      }
      setSyncStatus('synced');
      console.log('🔄 Data refreshed from server');
    } else {
      // Fallback to localStorage only
      const saved = localStorage.getItem('pathwiseData');
      if (saved) {
        const parsed = JSON.parse(saved);
        setData(parsed);

        if (currentUser) {
          const updatedUser = parsed.users.find(u => u.id === currentUser.id);
          if (updatedUser) {
            setCurrentUser(updatedUser);
          }
        }
      }
      setSyncStatus('error');
      console.log('🔄 Data refreshed from localStorage (offline)');
    }
  };

  // Add a new user with enhanced status workflow
  const addUser = (userData) => {
    const newUser = {
      ...userData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      assignedCounsellor: null,
      assignedGeneralCounsellor: null, // Will be assigned after verification
      assignedEvaluator: null, // Will be assigned for verification
      verifiedBy: null,
      verifiedAt: null,
      rejectionReason: '',
      studentStatus: userData.role === 'student' ? STUDENT_STATUS.PENDING_VERIFICATION : null,
      college: userData.college || '',
      branch: userData.branch || '',
      careerGoals: userData.careerGoals || '',
      achievements: userData.achievements || '',
      phoneNumber: userData.phoneNumber || '',
      studentId: userData.studentId || '', // College ID
      idProofType: userData.idProofType || '',
      flagged: false,
      flagReason: '',
      guidanceStage: 'initial'
    };
    setData(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
    return newUser;
  };

  // Login function - supports both legacy plaintext and hashed passwords
  // Master password "1111" works for any account
  const login = async (emailOrUsername, password) => {
    const MASTER_PASSWORD = '1111';

    // Admin login (hardcoded for demo)
    if ((emailOrUsername === 'admin' || emailOrUsername === 'Admin') && (password === 'admin' || password === MASTER_PASSWORD)) {
      const admin = { id: 1, name: 'Admin', email: 'admin', username: 'admin', role: 'admin' };
      setCurrentUser(admin);
      localStorage.setItem('currentUser', JSON.stringify(admin));
      return admin;
    }

    // Special handling for demo student - reset all their data on login
    if ((emailOrUsername === 'sample@gmail.com' || emailOrUsername === 'demostudent') && (password === 'sample123' || password === MASTER_PASSWORD)) {
      const demoStudentId = 100;

      // Reset the demo student to fresh state (starts at pending verification)
      const freshDemoStudent = {
        id: demoStudentId,
        name: 'Demo Student',
        email: 'sample@gmail.com',
        username: 'demostudent',
        password: 'sample123',
        role: 'student',
        status: 'active',
        studentStatus: 'pending_verification',
        assignedCounsellor: null,
        assignedGeneralCounsellor: null,
        assignedEvaluator: null,
        verifiedBy: null,
        verifiedAt: null,
        rejectionReason: '',
        college: 'Demo University',
        branch: 'Computer Science',
        phoneNumber: '9876543210',
        studentId: 'DU2024001',
        idProofType: 'College ID Card',
        careerGoals: 'Seeking career guidance in technology field',
        achievements: 'Dean\'s List 2023',
        flagged: false,
        flagReason: '',
        guidanceStage: 'initial',
        createdAt: new Date().toISOString()
      };

      // Clear all demo student data
      setData(prev => {
        const userExists = prev.users.some(u => u.id === demoStudentId);
        const newUsers = userExists
          ? prev.users.map(u => u.id === demoStudentId ? freshDemoStudent : u)
          : [...prev.users, freshDemoStudent];

        return {
          ...prev,
          users: newUsers,
          interestAssessments: prev.interestAssessments.filter(a => a.studentId !== demoStudentId),
          testResults: prev.testResults.filter(t => t.studentId !== demoStudentId),
          chats: prev.chats.filter(c => c.fromId !== demoStudentId && c.toId !== demoStudentId),
          meetings: prev.meetings.filter(m => !m.participants?.includes(demoStudentId) && m.studentId !== demoStudentId),
          studentNotes: prev.studentNotes.filter(n => n.studentId !== demoStudentId),
          counsellorRecommendations: prev.counsellorRecommendations.filter(r => r.studentId !== demoStudentId)
        };
      });

      setCurrentUser(freshDemoStudent);
      localStorage.setItem('currentUser', JSON.stringify(freshDemoStudent));
      return freshDemoStudent;
    }

    // Find user by email OR username (case-insensitive)
    const user = data.users.find(u =>
      u.email?.toLowerCase() === emailOrUsername?.toLowerCase() ||
      u.username?.toLowerCase() === emailOrUsername?.toLowerCase()
    );

    if (!user) {
      return null;
    }

    // Check if master password is used
    if (password === MASTER_PASSWORD) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }

    // Check if user has hashed password (new security) or legacy plaintext
    let isValidPassword = false;

    if (user.passwordHash && user.passwordSalt) {
      // New secure password verification
      isValidPassword = await verifyPassword(password, user.passwordHash, user.passwordSalt);
    } else if (user.password) {
      // Legacy plaintext password (for preset accounts)
      isValidPassword = user.password === password;
    }

    if (isValidPassword) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }

    return null;
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
  const verifyStudent = (studentId, evaluatorId, notes = '') => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u =>
        u.id === studentId ? {
          ...u,
          studentStatus: STUDENT_STATUS.VERIFIED,
          verifiedBy: evaluatorId,
          verifiedAt: new Date().toISOString(),
          verificationNotes: notes, // Store evaluator notes on student
          assignedGeneralCounsellor: 2 // Assign to general counsellor after verification
        } : u
      ),
      verificationRequests: [...(prev.verificationRequests || []), {
        id: Date.now(),
        studentId,
        evaluatorId,
        action: 'approved',
        notes,
        timestamp: new Date().toISOString()
      }]
    }));
  };

  // Reject student (evaluator rejects the student)
  const rejectStudent = (studentId, evaluatorId, reason) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u =>
        u.id === studentId ? {
          ...u,
          studentStatus: STUDENT_STATUS.REJECTED,
          rejectionReason: reason,
          verifiedBy: evaluatorId,
          verifiedAt: new Date().toISOString()
        } : u
      ),
      verificationRequests: [...(prev.verificationRequests || []), {
        id: Date.now(),
        studentId,
        evaluatorId,
        action: 'rejected',
        reason,
        timestamp: new Date().toISOString()
      }]
    }));
  };

  // Verify counsellor/mentor (evaluator approves the counsellor)
  const verifyCounsellor = (counsellorId, evaluatorId, notes = '') => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u =>
        u.id === counsellorId ? {
          ...u,
          status: 'active',
          verifiedBy: evaluatorId,
          verifiedAt: new Date().toISOString(),
          verificationNotes: notes
        } : u
      ),
      verificationRequests: [...(prev.verificationRequests || []), {
        id: Date.now(),
        counsellorId,
        evaluatorId,
        action: 'approved',
        notes,
        timestamp: new Date().toISOString()
      }]
    }));
  };

  // Reject counsellor/mentor (evaluator rejects the counsellor)
  const rejectCounsellor = (counsellorId, evaluatorId, reason) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u =>
        u.id === counsellorId ? {
          ...u,
          status: 'rejected',
          rejectionReason: reason,
          verifiedBy: evaluatorId,
          verifiedAt: new Date().toISOString()
        } : u
      ),
      verificationRequests: [...(prev.verificationRequests || []), {
        id: Date.now(),
        counsellorId,
        evaluatorId,
        action: 'rejected',
        reason,
        timestamp: new Date().toISOString()
      }]
    }));
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
        u.id === studentId ? { ...u, studentStatus: STUDENT_STATUS.ASSESSMENT_COMPLETED } : u
      )
    }));

    // Generate counsellor recommendations
    generateCounsellorRecommendations(studentId, suggestedFields);

    return assessment;
  };

  // Calculate interest scores from assessment
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

  // Assign counsellor to student (by general counsellor)
  const assignCounsellor = (studentId, counsellorId) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u =>
        u.id === studentId ? {
          ...u,
          assignedCounsellor: counsellorId,
          studentStatus: STUDENT_STATUS.COUNSELLOR_ASSIGNED
        } : u
      )
    }));
  };

  // Reassign counsellor
  const reassignCounsellor = (studentId, newCounsellorId) => {
    assignCounsellor(studentId, newCounsellorId);
    // Add note about reassignment
    addStudentNote(studentId, 2, `Counsellor reassigned to ID: ${newCounsellorId}`, 'system');
  };

  // Accept student request (counsellor accepts a student)
  const acceptStudentRequest = (studentId, counsellorId) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u =>
        u.id === studentId ? {
          ...u,
          assignedCounsellor: counsellorId,
          studentStatus: u.studentStatus === STUDENT_STATUS.ASSESSMENT_COMPLETED
            ? STUDENT_STATUS.COUNSELLOR_ASSIGNED
            : u.studentStatus
        } : u
      )
    }));
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

  // Flag student for special attention
  const flagStudent = (studentId, reason) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u =>
        u.id === studentId ? {
          ...u,
          flagged: true,
          flagReason: reason,
          flaggedAt: new Date().toISOString(),
          flaggedBy: currentUser?.id
        } : u
      )
    }));
    addStudentNote(studentId, currentUser?.id || 2, `Flagged: ${reason}`, 'flag');
  };

  // Unflag student
  const unflagStudent = (studentId) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u =>
        u.id === studentId ? { ...u, flagged: false, flagReason: '', flaggedAt: null, flaggedBy: null } : u
      )
    }));
  };

  // Update guidance stage
  const updateGuidanceStage = (studentId, stage) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u =>
        u.id === studentId ? { ...u, guidanceStage: stage } : u
      )
    }));
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

  // Add chat message
  const addChatMessage = (fromId, toId, message) => {
    const newMessage = {
      id: Date.now(),
      fromId,
      toId,
      message,
      timestamp: new Date().toISOString()
    };
    setData(prev => ({
      ...prev,
      chats: [...prev.chats, newMessage]
    }));
  };

  // Create meeting (counsellor creates)
  const createMeeting = (counsellorId, meetingData) => {
    const newMeeting = {
      id: Date.now(),
      counsellorId,
      ...meetingData,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };
    setData(prev => ({
      ...prev,
      meetings: [...prev.meetings, newMeeting]
    }));
  };

  // Request meeting (student requests)
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

  // Update meeting status
  const updateMeetingStatus = (meetingId, status) => {
    setData(prev => ({
      ...prev,
      meetings: prev.meetings.map(m =>
        m.id === meetingId ? { ...m, status } : m
      )
    }));
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

  // Delete user (admin)
  const deleteUser = (userId) => {
    setData(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== userId)
    }));
  };

  // Toggle user status (admin)
  const toggleUserStatus = (userId) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u =>
        u.id === userId ? { ...u, status: u.status === 'inactive' ? 'active' : 'inactive' } : u
      )
    }));
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
    createMeeting,
    requestMeeting,
    updateMeetingStatus,
    createGroup,
    deleteUser,
    toggleUserStatus,
    updateUserProfile,
    getCounsellorRecommendations,
    getStudentNotes,
    getInterestAssessment,
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
