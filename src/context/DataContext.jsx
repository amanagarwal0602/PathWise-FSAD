import { createContext, useContext, useState, useEffect } from 'react';

// Create Context for sharing data across components
const DataContext = createContext();

// Student Status Workflow
const STUDENT_STATUS = {
  REGISTERED: 'registered',
  VERIFIED: 'verified',
  ASSESSMENT_COMPLETED: 'assessment_completed',
  ASSIGNED_TO_GENERAL: 'assigned_to_general',
  CHAT_EVALUATION: 'chat_evaluation',
  COUNSELLOR_ASSIGNED: 'counsellor_assigned',
  ACTIVE_GUIDANCE: 'active_guidance'
};

// Initial sample data (will be stored in localStorage)
const initialData = {
  users: [
    { id: 1, name: 'Admin', email: 'admin', password: 'admin', role: 'admin', status: 'active' },
    { 
      id: 2, 
      name: 'General Counsellor', 
      email: 'general@pathwise.com', 
      password: 'general123', 
      role: 'general_counsellor', 
      status: 'active',
      specialization: 'General Guidance'
    },
    // Evaluators (General Counsellors for student evaluation)
    { 
      id: 3, 
      name: 'Evaluator 1', 
      email: 'evaluator1@pathwise.com', 
      password: 'eval123', 
      role: 'general_counsellor', 
      status: 'active',
      specialization: 'General Guidance'
    },
    { 
      id: 4, 
      name: 'Evaluator 2', 
      email: 'evaluator2@pathwise.com', 
      password: 'eval123', 
      role: 'general_counsellor', 
      status: 'active',
      specialization: 'General Guidance'
    },
    { 
      id: 5, 
      name: 'Evaluator 3', 
      email: 'evaluator3@pathwise.com', 
      password: 'eval123', 
      role: 'general_counsellor', 
      status: 'active',
      specialization: 'General Guidance'
    },
    { 
      id: 6, 
      name: 'Evaluator 4', 
      email: 'evaluator4@pathwise.com', 
      password: 'eval123', 
      role: 'general_counsellor', 
      status: 'active',
      specialization: 'General Guidance'
    }
  ],
  meetings: [],
  groups: [],
  chats: [],
  testResults: [],
  interestAssessments: [],
  studentNotes: [],
  counsellorRecommendations: []
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

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('pathwiseData', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Add a new user with enhanced status workflow
  const addUser = (userData) => {
    const newUser = { 
      ...userData, 
      id: Date.now(),
      createdAt: new Date().toISOString(),
      assignedCounsellor: null,
      assignedGeneralCounsellor: userData.role === 'student' ? 2 : null, // Auto-assign to general counsellor
      studentStatus: userData.role === 'student' ? STUDENT_STATUS.REGISTERED : null,
      college: userData.college || '',
      branch: userData.branch || '',
      careerGoals: userData.careerGoals || '',
      achievements: userData.achievements || '',
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

  // Login function
  const login = (email, password) => {
    if (email === 'admin' && password === 'admin') {
      const admin = { id: 1, name: 'Admin', email: 'admin', role: 'admin' };
      setCurrentUser(admin);
      return admin;
    }
    
    const user = data.users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
    }
    return user || null;
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

  // Verify student (move from registered to verified)
  const verifyStudent = (studentId) => {
    updateStudentStatus(studentId, STUDENT_STATUS.VERIFIED);
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
        u.id === studentId ? { ...u, flagged: true, flagReason: reason } : u
      )
    }));
    addStudentNote(studentId, currentUser?.id || 2, `Flagged: ${reason}`, 'flag');
  };

  // Unflag student
  const unflagStudent = (studentId) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => 
        u.id === studentId ? { ...u, flagged: false, flagReason: '' } : u
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
