import User from '../models/User.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' }).select('-password -emailVerificationToken -resetPasswordToken');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot ban an admin user' });
    }
    user.isBanned = true;
    await user.save();
    res.json({ message: 'User banned successfully', user });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isBanned = false;
    await user.save();
    res.json({ message: 'User unbanned successfully', user });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
