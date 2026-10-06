// backend/middleware/validate.js
const { validationResult } = require("express-validator");

const validate = (validations) => {
  return async (req, res, next) => {
    // Normalize req.body if created with Object.create(null) by multer
    if (req.body && typeof req.body === "object") {
      req.body = { ...req.body };
    }
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };
};

module.exports = validate;