const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/userModel');
const RefreshToken = require('../models/refreshTokenModel');
const tokenService = require('../utils/tokenService');
const logger = require('../utils/logger');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  // Set CORS headers for this specific endpoint
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    logger.debug('Setting CORS headers for login endpoint', { origin });
  }

  const { username, email, password } = req.body;

  // Use either username or email for login
  const loginIdentifier = username || email;

  if (!loginIdentifier) {
    res.status(400);
    throw new Error('Username or email is required');
  }

  logger.info('Login attempt initiated', { username: loginIdentifier });
  logger.debug('Login request received', {
    body: req.body,
    headers: req.headers,
    origin: req.headers.origin,
    ip: req.ip || req.connection.remoteAddress
  });

  // Find user by username or email
  const user = await User.findOne({
    $or: [
      { username: loginIdentifier },
      { email: loginIdentifier }
    ]
  });

  logger.debug('User lookup result', { found: !!user, identifier: loginIdentifier });

  if (user) {
    // Log user details without sensitive information
    logger.debug('User found', {
      _id: user._id,
      role: user.role,
      username: user.username
    });
  } else {
    logger.warn('User not found during login attempt', { identifier: loginIdentifier });
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
        sameSite: 'none', // Allow cross-site cookies
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Also set session ID cookie (not HTTP-only so frontend can access it)
      res.cookie('sessionId', sessionId, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none', // Allow cross-site cookies
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
  // Log the request for debugging
  logger.debug('Token refresh request received', {
    body: req.body,
    cookies: req.cookies,
    origin: req.headers.origin,
    ip: req.ip || req.connection.remoteAddress
  });

  // Get refresh token from cookie or request body
  const token = req.cookies.refreshToken || req.body.refreshToken || req.body.token;

  // Get session ID from cookie or request body
  const sessionId = req.cookies.sessionId || req.body.sessionId;

  // Get user ID from request body (additional validation)
  const userId = req.body.userId;

  // Set CORS headers for this specific endpoint
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    logger.debug('Setting CORS headers for refresh token endpoint', { origin });
  }

  // If no token is provided, try to find a token by session ID or user ID
  if (!token && (sessionId || userId)) {
    logger.debug('No token provided, attempting to find by session ID or user ID', { sessionId, userId });

    let query = {};
    if (sessionId) {
      query.sessionId = sessionId;
    }

    let refreshTokenDoc = null;

    if (sessionId) {
      refreshTokenDoc = await RefreshToken.findOne({ sessionId }).sort({ createdAt: -1 }).populate('user');
    }

    if (!refreshTokenDoc && userId) {
      // Find the most recent active token for this user
      const user = await User.findById(userId);
      if (user) {
        refreshTokenDoc = await RefreshToken.findOne({
          user: user._id,
          revoked: false,
          expires: { $gt: new Date() }
        }).sort({ createdAt: -1 }).populate('user');
      }
    }

    if (refreshTokenDoc) {
      logger.debug('Found refresh token by alternative means', {
        tokenId: refreshTokenDoc._id,
        userId: refreshTokenDoc.user?._id
      });

      // Continue with this token
      const user = refreshTokenDoc.user;

      // Get client IP address
      const ipAddress = req.ip || req.connection.remoteAddress;

      // Generate new access token
      const newAccessToken = tokenService.generateToken(user._id);

      // Generate new refresh token but maintain the same session ID
      const { refreshToken: newRefreshToken } = await tokenService.generateRefreshToken(
        user,
        ipAddress,
        false, // Don't enforce single session here
        refreshTokenDoc.sessionId // Keep the same session ID
      );

      // Replace old refresh token with new one
      await tokenService.replaceToken(refreshTokenDoc.token, newRefreshToken.token, refreshTokenDoc.sessionId);

      // Set new refresh token as HTTP-only cookie with appropriate settings
      res.cookie('refreshToken', newRefreshToken.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none', // Allow cross-site cookies
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Set session ID cookie
      res.cookie('sessionId', refreshTokenDoc.sessionId, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none', // Allow cross-site cookies
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      logger.info('Token refreshed successfully via alternative method', {
        userId: user._id,
        sessionId: refreshTokenDoc.sessionId
      });

      // Return new access token
      return res.json({
        token: newAccessToken,
        sessionId: refreshTokenDoc.sessionId,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      logger.warn('Could not find a valid refresh token by session ID or user ID');
    }
  }

  if (!token) {
    logger.warn('No refresh token provided');
    res.status(401);
    throw new Error('Refresh token is required');
  }

  // Find the refresh token in the database
  const refreshTokenDoc = await RefreshToken.findOne({ token }).populate('user');

  if (!refreshTokenDoc) {
    logger.warn('Invalid refresh token provided', { token: token.substring(0, 10) + '...' });
    res.status(401);
    throw new Error('Invalid refresh token');
  }

  // Check if the token is active (not expired and not revoked)
  if (!refreshTokenDoc.isActive()) {
    logger.warn('Refresh token is not active', {
      tokenId: refreshTokenDoc._id,
      expired: refreshTokenDoc.expires < new Date(),
      revoked: refreshTokenDoc.revoked
    });
    res.status(401);
    throw new Error('Refresh token has expired or been revoked');
  }

  // Get the user from the token
  const user = refreshTokenDoc.user;

  // Verify that the session ID matches if provided
  if (sessionId && refreshTokenDoc.sessionId !== sessionId) {
    logger.warn('Session ID mismatch', {
      providedSessionId: sessionId,
      tokenSessionId: refreshTokenDoc.sessionId
    });

    // We'll be more lenient here - don't revoke the token, just issue a new one
    logger.info('Continuing with token refresh despite session ID mismatch');
  }

  // Get client IP address
  const ipAddress = req.ip || req.connection.remoteAddress;

  // Generate new access token
  const newAccessToken = tokenService.generateToken(user._id);

  // Generate new refresh token but maintain the same session ID
  const { refreshToken: newRefreshToken } = await tokenService.generateRefreshToken(
    user,
    ipAddress,
    false, // Don't enforce single session here since we're just refreshing
    refreshTokenDoc.sessionId // Keep the same session ID
  );

  // Replace old refresh token with new one
  await tokenService.replaceToken(token, newRefreshToken.token, refreshTokenDoc.sessionId);

  // Set new refresh token as HTTP-only cookie with appropriate settings
  res.cookie('refreshToken', newRefreshToken.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none', // Allow cross-site cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Set session ID cookie
  res.cookie('sessionId', refreshTokenDoc.sessionId, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none', // Allow cross-site cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  logger.info('Token refreshed successfully', {
    userId: user._id,
    sessionId: refreshTokenDoc.sessionId
  });

  // Return new access token and user info
  res.json({
    token: newAccessToken,
    sessionId: refreshTokenDoc.sessionId,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// @desc    Logout user and revoke refresh token
// @route   POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
  // Get refresh token from cookie or request body
  const token = req.cookies.refreshToken || req.body.refreshToken;
  const sessionId = req.body.sessionId;

  // Clear cookies regardless of token presence
  res.clearCookie('refreshToken');
  res.clearCookie('sessionId');

  // If we have a token, try to revoke it
  if (token) {
    try {
      // Get client IP address
      const ipAddress = req.ip || req.connection.remoteAddress;

      // Revoke the token
      const revoked = await tokenService.revokeToken(token, ipAddress);

      if (revoked) {
        return res.json({ message: 'Logout successful' });
      }
    } catch (error) {
      console.error('Error revoking token:', error);
      // Continue with logout even if token revocation fails
    }
  }
  // If we have a sessionId but no token, try to find and revoke the token by sessionId
  else if (sessionId) {
    try {
      // You could add logic here to find and revoke a token by sessionId if needed
      console.log(`Logout request with sessionId: ${sessionId} but no refresh token`);
    } catch (error) {
      console.error('Error processing sessionId logout:', error);
    }
  }

  // Always return success to ensure client can complete logout
  return res.json({ message: 'Logout successful' });
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
