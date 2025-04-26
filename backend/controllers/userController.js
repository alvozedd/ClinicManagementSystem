const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/userModel');
const RefreshToken = require('../models/refreshTokenModel');
const tokenService = require('../utils/tokenService');
const logger = require('../utils/logger');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Use either username or email for login
  const loginIdentifier = username || email;

  if (!loginIdentifier) {
    res.status(400);
    throw new Error('Username or email is required');
  }

  logger.info('Login attempt initiated', { username: loginIdentifier });
  logger.debug('Login request received', { body: req.body });

  // Find user by username or email
  const user = await User.findOne({
    $or: [
      { username: loginIdentifier },
      { email: loginIdentifier }
    ]
  });

  logger.debug('User lookup result', { found: !!user });

  if (user) {
    // Log user details without sensitive information
    logger.debug('User found', {
      _id: user._id,
      role: user.role,
    });
  }

  if (user) {
    const isMatch = await user.matchPassword(password);
    logger.debug('Password validation result', { success: isMatch });

    if (isMatch) {
      // Get client IP address
      const ipAddress = req.ip || req.connection.remoteAddress;

      // Generate access token
      const accessToken = tokenService.generateToken(user._id);

      // Generate refresh token with single session enforcement
      // This will automatically revoke all other sessions for this user
      const { refreshToken, sessionId } = await tokenService.generateRefreshToken(user, ipAddress, true);

      logger.info('Authentication successful, tokens generated', { sessionId });

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Also set session ID cookie (not HTTP-only so frontend can access it)
      res.cookie('sessionId', sessionId, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        token: accessToken,
        sessionId: sessionId, // Include session ID in response
      });
      return;
    }
  }

  logger.info('Authentication failed', { username });
  res.status(401);
  throw new Error('Invalid username or password');
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Private/Admin
const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password, role } = req.body;

  // Check if user exists with the same email or username
  const userExists = await User.findOne({
    $or: [
      { email },
      { username }
    ]
  });

  if (userExists) {
    res.status(400);
    if (userExists.email === email) {
      throw new Error('User with this email already exists');
    } else {
      throw new Error('Username is already taken');
    }
  }

  const user = await User.create({
    name,
    username,
    email,
    password,
    role,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      token: tokenService.generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Check if username is being updated and if it's already taken
    if (req.body.username && req.body.username !== user.username) {
      const usernameExists = await User.findOne({ username: req.body.username });
      if (usernameExists) {
        res.status(400);
        throw new Error('Username is already taken');
      }
    }

    // Update user fields
    user.name = req.body.name || user.name;
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  // Prevent admin from deleting themselves
  if (req.params.id === req.user._id.toString()) {
    res.status(400);
    throw new Error('Admin cannot delete their own account');
  }

  const user = await User.findById(req.params.id);

  if (user) {
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Refresh access token using refresh token
// @route   POST /api/users/refresh-token
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  // Get refresh token from cookie or request body
  const token = req.cookies.refreshToken || req.body.refreshToken;

  // Get session ID from cookie or request body
  const sessionId = req.cookies.sessionId || req.body.sessionId;

  if (!token) {
    res.status(401);
    throw new Error('Refresh token is required');
  }

  // Find the refresh token in the database
  const refreshTokenDoc = await RefreshToken.findOne({ token }).populate('user');

  if (!refreshTokenDoc) {
    res.status(401);
    throw new Error('Invalid refresh token');
  }

  // Check if the token is active (not expired and not revoked)
  if (!refreshTokenDoc.isActive()) {
    res.status(401);
    throw new Error('Refresh token has expired or been revoked');
  }

  // Get the user from the token
  const user = refreshTokenDoc.user;

  // Verify that the session ID matches
  if (sessionId && refreshTokenDoc.sessionId !== sessionId) {
    // Session ID mismatch - this could be a token theft attempt
    // Revoke this token
    refreshTokenDoc.revoked = true;
    refreshTokenDoc.revokedReason = 'Session ID mismatch';
    await refreshTokenDoc.save();

    res.status(401);
    throw new Error('Session validation failed');
  }

  // Get client IP address
  const ipAddress = req.ip || req.connection.remoteAddress;

  // Generate new access token
  const newAccessToken = tokenService.generateToken(user._id);

  // Generate new refresh token but maintain the same session ID
  const { refreshToken: newRefreshToken } = await tokenService.generateRefreshToken(
    user,
    ipAddress,
    false // Don't enforce single session here since we're just refreshing
  );

  // Replace old refresh token with new one
  await tokenService.replaceToken(token, newRefreshToken.token, refreshTokenDoc.sessionId);

  // Set new refresh token as HTTP-only cookie
  res.cookie('refreshToken', newRefreshToken.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Return new access token
  res.json({
    token: newAccessToken,
    sessionId: refreshTokenDoc.sessionId,
  });
});

// @desc    Logout user and revoke refresh token
// @route   POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
  // Get refresh token from cookie or request body
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    res.status(400);
    throw new Error('Refresh token is required');
  }

  // Get client IP address
  const ipAddress = req.ip || req.connection.remoteAddress;

  // Revoke the token
  const revoked = await tokenService.revokeToken(token, ipAddress);

  // Clear the refresh token cookie
  res.clearCookie('refreshToken');

  // Clear the session ID cookie
  res.clearCookie('sessionId');

  if (revoked) {
    res.json({ message: 'Logout successful' });
  } else {
    res.status(400);
    throw new Error('Invalid refresh token');
  }
});

module.exports = {
  authUser,
  registerUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  refreshToken,
  logoutUser,
};
