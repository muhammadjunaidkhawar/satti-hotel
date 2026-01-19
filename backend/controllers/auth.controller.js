const JWT = require('jsonwebtoken');
const { User } = require('../models');
const { sendResponse, validationError, isPasswordMatched } = require('../utils');
const { loginSchema } = require('../validations/auth.validation');
const { JWT_SECRET_KEY } = require('../constants');

const login = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body || {});
  if (error) {
    return sendResponse(res, 'fail', 400, validationError(error));
  }

  const { email, password } = value;

  const user = await User.findOne({ email, isDeleted: false });
  if (!user) {
    return sendResponse(res, 'fail', 401, 'Invalid email or password');
  }

  const isPasswordValid = await isPasswordMatched(user.password, password);
  if (!isPasswordValid) {
    return sendResponse(res, 'fail', 401, 'Invalid email or password');
  }

  const token = JWT.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET_KEY,
    { expiresIn: '7d' }
  );

  const userResponse = {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return sendResponse(res, 'success', 200, 'Login successful', { token, user: userResponse });
};

module.exports = {
  login,
};
