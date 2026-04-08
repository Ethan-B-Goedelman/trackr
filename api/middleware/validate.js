const { validationResult } = require('express-validator');

/**
 * Middleware that reads express-validator results and returns 400 on failure.
 * Place after your validation chain: [...validators, validate, controller]
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
