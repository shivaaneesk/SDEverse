const { body, validationResult } = require("express-validator");

const validateAlgorithm = [
  body("title").notEmpty().withMessage("Title is required"),
  body("problemStatement").notEmpty().withMessage("Problem statement is required"),
  body("intuition").notEmpty().withMessage("Intuition is required"),
  body("explanation").notEmpty().withMessage("Explanation is required"),
  body("complexity.time").notEmpty().withMessage("Time complexity is required"),
  body("complexity.space").notEmpty().withMessage("Space complexity is required"),

  // Final error handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = validateAlgorithm;
