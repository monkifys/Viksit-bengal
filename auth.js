/**
 * Authentication and Role-Based Access Control (RBAC) Module
 * Viksit Bengal Dashboard — বিকশিত বাংলা ড্যাশবোর্ড
 */

const crypto = require('crypto');

// In-memory session store backed with expiration: token -> { userId, username, role, fullName, expiresAt }
const sessions = new Map();

// Session duration: 24 hours
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

// Role hierarchy rank: higher can perform lower actions
const ROLE_RANKS = {
  'public': 0,
  'researcher': 10,
  'reviewer': 20,
  'admin': 30
};

/**
 * Generate cryptographic salt
 */
function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Hash password with scrypt
 */
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

/**
 * Verify plaintext password against stored hash and salt
 */
function verifyPassword(password, salt, hash) {
  try {
    const computed = hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(hash, 'hex'));
  } catch (err) {
    return false;
  }
}

/**
 * Create a new user session
 */
function createSession(user) {
  const token = 'vbd_' + crypto.randomBytes(32).toString('hex');
  const sessionData = {
    userId: user.id,
    username: user.username,
    role: user.role || 'researcher',
    fullName: user.full_name || user.username,
    email: user.email || '',
    expiresAt: Date.now() + SESSION_TTL_MS
  };
  sessions.set(token, sessionData);
  return { token, session: sessionData };
}

/**
 * Retrieve session if valid and not expired
 */
function getSession(token) {
  if (!token) return null;
  const sess = sessions.get(token);
  if (!sess) return null;
  if (Date.now() > sess.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return sess;
}

/**
 * Destroy a session (Logout)
 */
function destroySession(token) {
  if (token) sessions.delete(token);
}

/**
 * Extract auth token from request header
 */
function extractToken(req) {
  const authHeader = req.headers['authorization'] || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  // Check cookie fallback if present
  const cookieHeader = req.headers['cookie'] || '';
  const match = cookieHeader.match(/vbd_token=([a-zA-Z0-9_]+)/);
  if (match) return match[1];
  return null;
}

/**
 * Get current authenticated user session from request
 */
function authenticate(req) {
  const token = extractToken(req);
  return getSession(token);
}

/**
 * Check if the request user meets the minimum required role
 */
function hasRole(session, requiredRole) {
  if (!session) return false;
  const userRank = ROLE_RANKS[session.role] || 0;
  const requiredRank = ROLE_RANKS[requiredRole] || 0;
  return userRank >= requiredRank;
}

module.exports = {
  generateSalt,
  hashPassword,
  verifyPassword,
  createSession,
  getSession,
  destroySession,
  extractToken,
  authenticate,
  hasRole,
  ROLE_RANKS
};
