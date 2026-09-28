import bcrypt from 'bcryptjs';
import dataStore from '../services/dataStore.js';
import { generateToken } from '../middleware/auth.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await dataStore.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    let employeeProfile = null;
    if (user.employeeId) {
      employeeProfile = await dataStore.getEmployeeByIdOrEmpId(user.employeeId);
    }

    const token = generateToken({ id: user._id, role: user.role, email: user.email });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        employee: employeeProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { username, email, password, role = 'employee', employeeId = null } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username, email and password' });
    }

    const existing = await dataStore.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const user = await dataStore.createUser({ username, email, password, role, employeeId });
    const token = generateToken({ id: user._id, role: user.role, email: user.email });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req, res, next) => {
  try {
    let employeeProfile = null;
    if (req.user.employeeId) {
      employeeProfile = await dataStore.getEmployeeByIdOrEmpId(req.user.employeeId);
    }

    res.json({
      success: true,
      user: {
        ...req.user,
        employee: employeeProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};
