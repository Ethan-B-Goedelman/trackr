const User = require('../models/User');
const { signJwt, generateToken, hashToken } = require('../utils/token');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }

    const { raw, hashed } = generateToken();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      verificationToken: hashed,
      verificationTokenExpiry: expiry,
    });

    await sendVerificationEmail(user, raw);

    res.status(201).json({
      message: 'Registration successful — please check your email to verify your account',
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/verify-email?token=...
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const hashed = hashToken(token);

    const user = await User.findOne({
      verificationToken: hashed,
      verificationTokenExpiry: { $gt: Date.now() },
    }).select('+verificationToken +verificationTokenExpiry');

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    const jwtToken = signJwt(user._id);

    res.json({
      message: 'Email verified successfully',
      token: jwtToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Please verify your email before logging in',
        needsVerification: true,
      });
    }

    const token = signJwt(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Always return success to prevent email enumeration
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent' });
    }

    const { raw, hashed } = generateToken();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = hashed;
    user.resetPasswordTokenExpiry = expiry;
    await user.save();

    await sendPasswordResetEmail(user, raw);

    res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const hashed = hashToken(token);

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordTokenExpiry');

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully — you can now log in' });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
    },
  });
};

// POST /api/auth/resend-verification
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+verificationToken +verificationTokenExpiry');

    if (!user || user.isVerified) {
      return res.json({ message: 'If a pending account exists, a new verification email has been sent' });
    }

    const { raw, hashed } = generateToken();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = hashed;
    user.verificationTokenExpiry = expiry;
    await user.save();

    await sendVerificationEmail(user, raw);

    res.json({ message: 'If a pending account exists, a new verification email has been sent' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, verifyEmail, login, forgotPassword, resetPassword, getMe, resendVerification };
