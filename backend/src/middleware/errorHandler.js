// errorHandler.js
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Error:', err.message);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = { message: `Resource not found with id: ${err.value}`, statusCode: 404 };
  }
  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = { message: `${field} already exists`, statusCode: 400 };
  }
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = { message: Object.values(err.errors).map(e => e.message).join(', '), statusCode: 400 };
  }
  // JWT errors
  if (err.name === 'JsonWebTokenError') error = { message: 'Invalid token', statusCode: 401 };
  if (err.name === 'TokenExpiredError') error = { message: 'Token expired', statusCode: 401 };

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
