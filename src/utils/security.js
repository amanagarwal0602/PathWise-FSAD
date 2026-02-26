/**
 * Security Utilities for PathWise
 * Provides password hashing, input sanitization, and security validation
 */

// ============================================================================
// PASSWORD HASHING (using Web Crypto API - SHA-256)
// ============================================================================

/**
 * Hash a password using SHA-256 with salt
 * @param {string} password - The plain text password
 * @param {string} salt - Optional salt (generated if not provided)
 * @returns {Promise<{hash: string, salt: string}>} - The hashed password and salt
 */
export async function hashPassword(password, salt = null) {
  // Generate a random salt if not provided
  if (!salt) {
    const saltArray = new Uint8Array(16);
    crypto.getRandomValues(saltArray);
    salt = Array.from(saltArray, b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Combine password with salt
  const saltedPassword = password + salt;
  
  // Convert to bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(saltedPassword);
  
  // Hash using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return { hash, salt };
}

/**
 * Verify a password against a stored hash
 * @param {string} password - The plain text password to verify
 * @param {string} storedHash - The stored hash
 * @param {string} salt - The salt used for hashing
 * @returns {Promise<boolean>} - True if password matches
 */
export async function verifyPassword(password, storedHash, salt) {
  const { hash } = await hashPassword(password, salt);
  return hash === storedHash;
}

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

/**
 * Sanitize string input to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Sanitize an object's string properties
 * @param {Object} obj - The object to sanitize
 * @returns {Object} - Sanitized object
 */
export function sanitizeObject(obj) {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Validate and sanitize email
 * @param {string} email - Email to validate
 * @returns {{isValid: boolean, sanitized: string, error: string}}
 */
export function validateEmail(email) {
  const sanitized = sanitizeInput(email).toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!sanitized) {
    return { isValid: false, sanitized: '', error: 'Email is required' };
  }
  
  if (!emailRegex.test(sanitized)) {
    return { isValid: false, sanitized, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true, sanitized, error: '' };
}

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {{isValid: boolean, sanitized: string, error: string}}
 */
export function validatePhone(phone) {
  const sanitized = phone.replace(/[^\d+\-\s()]/g, '').trim();
  const digitsOnly = sanitized.replace(/\D/g, '');
  
  if (!sanitized) {
    return { isValid: false, sanitized: '', error: 'Phone number is required' };
  }
  
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return { isValid: false, sanitized, error: 'Phone number must be 10-15 digits' };
  }
  
  return { isValid: true, sanitized, error: '' };
}

// ============================================================================
// PASSWORD STRENGTH VALIDATION
// ============================================================================

/**
 * Check password strength
 * @param {string} password - Password to check
 * @returns {{isStrong: boolean, score: number, feedback: string[], requirements: Object}}
 */
export function checkPasswordStrength(password) {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    noSpaces: !/\s/.test(password),
    notCommon: !isCommonPassword(password)
  };
  
  const feedback = [];
  let score = 0;
  
  if (!requirements.minLength) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 20;
  }
  
  if (!requirements.hasUppercase) {
    feedback.push('Add at least one uppercase letter (A-Z)');
  } else {
    score += 15;
  }
  
  if (!requirements.hasLowercase) {
    feedback.push('Add at least one lowercase letter (a-z)');
  } else {
    score += 15;
  }
  
  if (!requirements.hasNumber) {
    feedback.push('Add at least one number (0-9)');
  } else {
    score += 20;
  }
  
  if (!requirements.hasSpecial) {
    feedback.push('Add at least one special character (!@#$%^&*)');
  } else {
    score += 20;
  }
  
  if (!requirements.noSpaces) {
    feedback.push('Password should not contain spaces');
    score -= 10;
  }
  
  if (!requirements.notCommon) {
    feedback.push('This password is too common. Choose something more unique.');
    score -= 20;
  } else {
    score += 10;
  }
  
  // Bonus for extra length
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  score = Math.max(0, Math.min(100, score));
  
  const isStrong = score >= 60 && requirements.minLength && 
                   (requirements.hasUppercase || requirements.hasLowercase) && 
                   requirements.hasNumber;
  
  return { isStrong, score, feedback, requirements };
}

/**
 * Check if password is in common passwords list
 * @param {string} password - Password to check
 * @returns {boolean} - True if password is common
 */
function isCommonPassword(password) {
  const commonPasswords = [
    'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', 'master',
    'dragon', '111111', 'baseball', 'iloveyou', 'trustno1', 'sunshine',
    'princess', 'admin', 'welcome', 'shadow', 'ashley', 'football', 'jesus',
    'michael', 'ninja', 'mustang', 'password1', 'password123', 'letmein',
    '1234567', '12345', '1234567890', 'passw0rd', 'starwars', 'hello',
    'test123', 'mentor123', 'student123', 'pathwise', 'career', 'sample123'
  ];
  return commonPasswords.includes(password.toLowerCase());
}

/**
 * Get password strength label and color
 * @param {number} score - Password strength score
 * @returns {{label: string, color: string}}
 */
export function getPasswordStrengthLabel(score) {
  if (score < 30) return { label: 'Very Weak', color: '#dc3545' };
  if (score < 50) return { label: 'Weak', color: '#fd7e14' };
  if (score < 70) return { label: 'Fair', color: '#ffc107' };
  if (score < 90) return { label: 'Strong', color: '#20c997' };
  return { label: 'Very Strong', color: '#28a745' };
}

// ============================================================================
// RATE LIMITING
// ============================================================================

const loginAttempts = new Map();

/**
 * Check if login is rate limited
 * @param {string} identifier - Email or IP to check
 * @returns {{isLimited: boolean, remainingTime: number, attempts: number}}
 */
export function checkRateLimit(identifier) {
  // Rate limiting disabled as per user request
  return { isLimited: false, remainingTime: 0, attempts: 0 };
}

/**
 * Record a failed login attempt
 * @param {string} identifier - Email or IP
 */
export function recordFailedAttempt(identifier) {
  const attempts = loginAttempts.get(identifier) || [];
  attempts.push(Date.now());
  loginAttempts.set(identifier, attempts);
}

/**
 * Clear login attempts after successful login
 * @param {string} identifier - Email or IP
 */
export function clearLoginAttempts(identifier) {
  loginAttempts.delete(identifier);
}

// ============================================================================
// SESSION SECURITY
// ============================================================================

/**
 * Generate a secure session token
 * @returns {string} - Secure random token
 */
export function generateSessionToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create secure session data
 * @param {Object} user - User object
 * @returns {Object} - Session data with token and expiry
 */
export function createSecureSession(user) {
  const sessionToken = generateSessionToken();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    sessionToken,
    expiresAt,
    createdAt: Date.now()
  };
}

/**
 * Validate session
 * @param {Object} session - Session object to validate
 * @returns {boolean} - True if session is valid
 */
export function validateSession(session) {
  if (!session || !session.sessionToken || !session.expiresAt) {
    return false;
  }
  return Date.now() < session.expiresAt;
}

// ============================================================================
// CONTENT SECURITY
// ============================================================================

/**
 * Escape HTML to prevent XSS in user-generated content
 * @param {string} html - HTML string to escape
 * @returns {string} - Escaped HTML
 */
export function escapeHtml(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Validate URL to prevent open redirect attacks
 * @param {string} url - URL to validate
 * @returns {boolean} - True if URL is safe
 */
export function isValidInternalUrl(url) {
  if (!url) return false;
  
  // Allow relative URLs
  if (url.startsWith('/') && !url.startsWith('//')) {
    return true;
  }
  
  // Check for javascript: or data: URLs
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:')) {
    return false;
  }
  
  return false; // Only allow relative URLs for redirects
}

// ============================================================================
// SECURE STORAGE HELPERS
// ============================================================================

/**
 * Securely store data in localStorage with optional encryption marker
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 */
export function secureStore(key, data) {
  const wrappedData = {
    data,
    timestamp: Date.now(),
    version: '1.0'
  };
  localStorage.setItem(key, JSON.stringify(wrappedData));
}

/**
 * Retrieve securely stored data
 * @param {string} key - Storage key
 * @returns {any} - Retrieved data or null
 */
export function secureRetrieve(key) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    const wrappedData = JSON.parse(stored);
    
    // Check if data is too old (7 days)
    if (Date.now() - wrappedData.timestamp > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    
    return wrappedData.data;
  } catch {
    return null;
  }
}

/**
 * Clear all secure storage
 */
export function clearSecureStorage() {
  const keysToRemove = ['currentUser', 'pathwiseSession'];
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

export default {
  hashPassword,
  verifyPassword,
  sanitizeInput,
  sanitizeObject,
  validateEmail,
  validatePhone,
  checkPasswordStrength,
  getPasswordStrengthLabel,
  checkRateLimit,
  recordFailedAttempt,
  clearLoginAttempts,
  generateSessionToken,
  createSecureSession,
  validateSession,
  escapeHtml,
  isValidInternalUrl,
  secureStore,
  secureRetrieve,
  clearSecureStorage
};
