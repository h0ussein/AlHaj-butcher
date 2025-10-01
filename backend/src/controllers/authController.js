import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendVerificationEmail, resendVerificationEmail } from '../utils/emailService.js';

// Generate JWT token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register user
export const register = async (req, res) => {
  try {
    const { firstName, lastName, fatherName, email, password, mobile } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !fatherName || !email || !password || !mobile) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Strong password: at least 8 chars, one number and one symbol
    const strongPwd = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-={}\[\]|;:'",.<>/?]).{8,}$/;
    if (!strongPwd.test(password)) {
      return res.status(400).json({ message: 'Password must be 8+ characters with a number and a symbol' });
    }

    // Check if user already exists by email
    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check existing mobile
    const existingUserMobile = await User.findOne({ mobile });
    if (existingUserMobile) {
      return res.status(400).json({ message: 'A user already exists with this mobile number' });
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create new user
    const user = new User({
      firstName,
      lastName,
      fatherName,
      email,
      password,
      mobile,
      emailVerificationToken
    });

    await user.save();

    // Send verification email (with error handling)
    try {
      const emailResult = await sendVerificationEmail(email, emailVerificationToken);
      if (!emailResult.success) {
        console.error('Email sending failed during registration:', emailResult.error);
        // Still allow registration to succeed, but log the error
      }
    } catch (emailError) {
      console.error('Email sending failed during registration:', emailError);
      // Don't fail registration if email fails, just log the error
    }

    // Do NOT auto-login; require email verification first
    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fatherName: user.fatherName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Block login if not verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fatherName: user.fatherName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
};

// Resend verification email
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    await user.save();

    // Send verification email
    try {
      const emailResult = await resendVerificationEmail(email, emailVerificationToken);
      if (emailResult.success) {
        res.json({ message: 'Verification email sent successfully' });
      } else {
        console.error('Email sending failed:', emailResult.error);
        res.status(500).json({ 
          message: 'Failed to send verification email', 
          error: emailResult.error 
        });
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      res.status(500).json({ 
        message: 'Failed to send verification email',
        error: emailError.message 
      });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        fatherName: req.user.fatherName,
        email: req.user.email,
        mobile: req.user.mobile,
        role: req.user.role,
        isEmailVerified: req.user.isEmailVerified,
        isBanned: req.user.isBanned
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
