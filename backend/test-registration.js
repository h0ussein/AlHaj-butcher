// Script to create admin user
import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/butcher-shop');
    console.log('Connected to database');

    // Admin user data
    const adminUser = {
      name: 'Admin',
      email: 'admin@gmail.com',
      password: 'hussein@123',
      mobile: '76878301',
      role: 'admin',
      isEmailVerified: true
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log('Admin user already exists! Ensuring credentials and verification...');
      existingAdmin.password = adminUser.password; // will be hashed by pre-save hook
      existingAdmin.isEmailVerified = true;
      existingAdmin.role = 'admin';
      await existingAdmin.save();

      console.log('Admin updated:', {
        name: existingAdmin.name,
        email: existingAdmin.email,
        role: existingAdmin.role,
        mobile: existingAdmin.mobile,
        isEmailVerified: existingAdmin.isEmailVerified
      });
      return;
    }

    // Create admin user
    console.log('Creating admin user...');
    const user = new User(adminUser);
    await user.save();
    console.log('Admin user created successfully!');
    console.log('Admin details:', {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    });

    // Test password comparison
    const isPasswordValid = await user.comparePassword('hussein@123');
    console.log('Password validation test:', isPasswordValid);

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
};

createAdmin();