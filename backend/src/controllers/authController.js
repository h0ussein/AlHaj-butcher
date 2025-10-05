import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';

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

    // Create new user (no verification needed)
    const user = new User({
      firstName,
      lastName,
      fatherName,
      email,
      password,
      mobile,
      isEmailVerified: true // No verification required
    });

    await user.save();

    // Generate token for immediate login
    const token = generateToken(user._id);

    // Auto-login after successful registration
    res.status(201).json({
      message: 'User registered successfully',
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

    // No verification required - allow login

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

