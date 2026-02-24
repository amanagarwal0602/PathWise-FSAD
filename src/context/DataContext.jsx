import { createContext, useContext, useState, useEffect } from 'react';

// Create Context for sharing data across components
const DataContext = createContext();

// Initial sample data (will be stored in localStorage)
const initialData = {
  users: [
    { id: 1, name: 'Admin', email: 'admin', password: 'admin', role: 'admin', status: 'active' }
  ],
  meetings: [],
  groups: [],
  chats: [],
  testResults: []
};

// Aptitude Test Questions - Multiple Select
const aptitudeQuestions = [
  {
    id: 1,
    question: "Which activities do you enjoy? (Select all that apply)",
    options: [
      "Solving mathematical problems",
      "Writing stories or articles",
      "Building or fixing things",
      "Helping others with their problems",
      "Working with computers",
      "Creating art or designs"
    ],
    optionCategories: ["analytical", "creative", "technical", "social", "technical", "creative"]
  },
  {
    id: 2,
    question: "What are your strongest skills? (Select all that apply)",
    options: [
      "Logical thinking and analysis",
      "Communication and presentation",
      "Technical and mechanical work",
      "Leadership and management",
      "Creative thinking",
      "Research and investigation"
    ],
    optionCategories: ["analytical", "social", "technical", "social", "creative", "analytical"]
  },
  {
    id: 3,
    question: "Which subjects do you perform well in? (Select all that apply)",
    options: [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "Computer Science",
      "English/Languages"
    ],
    optionCategories: ["analytical", "technical", "technical", "social", "technical", "creative"]
  },
  {
    id: 4,
    question: "What type of work environment do you prefer? (Select all that apply)",
    options: [
      "Working alone in a quiet space",
      "Collaborating with a team",
      "Outdoor fieldwork",
      "Office/desk work",
      "Laboratory or workshop",
      "Meeting different people daily"
    ],
    optionCategories: ["analytical", "social", "technical", "analytical", "technical", "social"]
  },
  {
    id: 5,
    question: "Which values are most important to you in a career? (Select all that apply)",
    options: [
      "High salary",
      "Job security",
      "Work-life balance",
      "Making a difference in society",
      "Continuous learning",
      "Recognition and fame"
    ],
    optionCategories: ["analytical", "technical", "social", "social", "analytical", "creative"]
  },
  {
    id: 6,
    question: "What do you see yourself doing in 10 years? (Select all that apply)",
    options: [
      "Running my own business",
      "Working in a corporate company",
      "Teaching or mentoring others",
      "Doing research and innovation",
      "Working for government",
      "Freelancing or consulting"
    ],
    optionCategories: ["creative", "analytical", "social", "technical", "social", "creative"]
  },
  {
    id: 7,
    question: "Which industries interest you? (Select all that apply)",
    options: [
      "Information Technology",
      "Healthcare and Medicine",
      "Finance and Banking",
      "Education",
      "Media and Entertainment",
      "Manufacturing and Engineering"
    ],
    optionCategories: ["technical", "social", "analytical", "social", "creative", "technical"]
  },
  {
    id: 8,
    question: "How do you prefer to learn new things? (Select all that apply)",
    options: [
      "Reading books and articles",
      "Watching videos and tutorials",
      "Hands-on practice",
      "Attending lectures and classes",
      "Group discussions",
      "Self-experimentation"
    ],
    optionCategories: ["analytical", "creative", "technical", "social", "social", "technical"]
  },
  {
    id: 9,
    question: "What challenges do you enjoy solving? (Select all that apply)",
    options: [
      "Technical problems",
      "People-related issues",
      "Business and strategy problems",
      "Creative challenges",
      "Scientific mysteries",
      "Social issues"
    ],
    optionCategories: ["technical", "social", "analytical", "creative", "technical", "social"]
  },
  {
    id: 10,
    question: "Which extracurricular activities interest you? (Select all that apply)",
    options: [
      "Sports and athletics",
      "Music and performing arts",
      "Debate and public speaking",
      "Coding and robotics",
      "Social service and volunteering",
      "Photography and filmmaking"
    ],
    optionCategories: ["technical", "creative", "social", "technical", "social", "creative"]
  }
];

// Career mapping based on category
const careerMapping = {
  analytical: ["Data Scientist", "Financial Analyst", "Actuary", "Research Scientist", "Statistician", "Business Analyst"],
  creative: ["Graphic Designer", "Content Writer", "UI/UX Designer", "Animator", "Film Director", "Architect"],
  technical: ["Software Engineer", "Mechanical Engineer", "Civil Engineer", "Network Administrator", "Data Engineer", "Robotics Engineer"],
  social: ["Counsellor", "HR Manager", "Teacher", "Social Worker", "Public Relations", "Healthcare Professional"]
};

// Data Provider Component
export function DataProvider({ children }) {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('pathwiseData');
    return saved ? JSON.parse(saved) : initialData;
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

  // Add a new user
  const addUser = (userData) => {
    const newUser = { 
      ...userData, 
      id: Date.now(),
      createdAt: new Date().toISOString(),
      assignedCounsellor: null
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

  // Accept student request (counsellor accepts a student)
  const acceptStudentRequest = (studentId, counsellorId) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => 
        u.id === studentId ? { ...u, assignedCounsellor: counsellorId } : u
      )
    }));
  };

  // Save test results
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

  const value = {
    data,
    currentUser,
    setCurrentUser,
    aptitudeQuestions,
    careerMapping,
    addUser,
    login,
    acceptStudentRequest,
    saveTestResult,
    addChatMessage,
    createMeeting,
    requestMeeting,
    updateMeetingStatus,
    createGroup,
    deleteUser,
    toggleUserStatus
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
