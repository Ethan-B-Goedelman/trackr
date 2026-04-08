const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a user.
 */
const signJwt = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Generate a secure random hex token and its SHA-256 hash.
 * Store the HASH in the database, send the RAW token in the email.
 */
const generateToken = () => {
  const raw = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hashed };
};

/**
 * Hash a raw token for comparison against stored hash.
 */
const hashToken = (raw) => {
  return crypto.createHash('sha256').update(raw).digest('hex');
};

module.exports = { signJwt, generateToken, hashToken };
