// Custom ErrorResponse class to standardize error objects
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // Capturing the stack trace, excluding the constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorResponse;
