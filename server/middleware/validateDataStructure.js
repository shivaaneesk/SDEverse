const { body, validationResult } = require("express-validator");

const validateDataStructure = [
  body("title")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Title must be at least 5 characters long"),
  body("definition")
    .trim()
    .isLength({ min: 20 })
    .withMessage("Definition must be at least 20 characters long"),
  body("category")
    .isArray({ min: 1 })
    .withMessage("At least one category must be selected"),
  body("type")
    .isIn(["Linear", "Non-Linear", "Hierarchical", "Graph", "Other"])
    .withMessage("Invalid data structure type"),
  body("characteristics")
    .trim()
    .isLength({ min: 20 })
    .withMessage("Characteristics must be at least 20 characters long"),
  body("operations")
    .isArray()
    .withMessage("Operations must be an array"),
  body("operations.*.name")
    .trim()
    .notEmpty()
    .withMessage("Operation name is required"),
  body("operations.*.description")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Operation description must be at least 10 characters"),
  body("operations.*.complexity.time")
    .trim()
    .notEmpty()
    .withMessage("Time complexity is required"),
  body("operations.*.complexity.space")
    .trim()
    .notEmpty()
    .withMessage("Space complexity is required"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = validateDataStructure;