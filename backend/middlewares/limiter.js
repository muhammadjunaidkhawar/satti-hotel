const rateLimit = require('express-rate-limit');

// 1000 requests per IP in 15 minutes is allowed only
const limiter = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests, please try again later.',
  });
};

module.exports = { limiter };
