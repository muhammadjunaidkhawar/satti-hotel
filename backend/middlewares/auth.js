const JWT = require('jsonwebtoken');
const { JWT_SECRET_KEY } = require('../constants');
const { sendResponse } = require('../utils');

/**
 * Authorization middleware factory
 * @param {string[]} allowedRoles - Array of allowed user types. If empty or not provided, any authenticated user can access.
 * @returns {Function} Express middleware function
 */
const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader === 'undefined') {
      return sendResponse(res, 'fail', 401, 'No token provided');
    }

    const bearerToken = bearerHeader.split(' ')[1];

    if (!bearerToken) {
      return sendResponse(res, 'fail', 401, 'No token provided');
    }

    JWT.verify(bearerToken, JWT_SECRET_KEY, async (err, data) => {
      if (err) {
        return sendResponse(res, 'fail', 401, 'Invalid token');
      }

      // Attach decoded token to request for downstream handlers
      req.user = data;

      // If no roles specified, allow any authenticated user
      if (!allowedRoles || allowedRoles.length === 0) {
        return next();
      }

      // Check if user's role is in the allowed roles
      const userRole = data.role || data.userType;
      if (!userRole || !allowedRoles.includes(userRole)) {
        return sendResponse(res, 'fail', 403, `Access denied. Required roles: ${allowedRoles.join(', ')}`);
      }

      next();
    });
  };
};

module.exports = { authorize };
