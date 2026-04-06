const rateLimit = require('express-rate-limit');

exports.general = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

exports.auth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

exports.strict = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { success: false, message: 'Rate limit exceeded.' },
});
