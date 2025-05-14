const { body, validationResult } = require("express-validator");

const validateProposal = (mode = "create") => {
  const isCreate = mode === "create";

  const validator = [
    isCreate
      ? body("title").notEmpty().withMessage("Title is required")
      : body("title").optional().isString(),
    isCreate
      ? body("problemStatement").notEmpty().withMessage("Problem statement is required")
      : body("problemStatement").optional().isString(),
    isCreate
      ? body("intuition").notEmpty().withMessage("Intuition is required")
      : body("intuition").optional().isString(),
    isCreate
      ? body("explanation").notEmpty().withMessage("Explanation is required")
      : body("explanation").optional().isString(),

    isCreate
      ? body("complexity.time").notEmpty().withMessage("Time complexity is required")
      : body("complexity.time").optional().isString(),
    isCreate
      ? body("complexity.space").notEmpty().withMessage("Space complexity is required")
      : body("complexity.space").optional().isString(),

    isCreate
      ? body("category").isArray({ min: 1 }).withMessage("At least one category is required")
      : body("category").optional().isArray(),

    body("tags").optional().isArray(),
    body("codes").optional().isArray(),
    body("links").optional().isArray(),

    // Final error handler
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ];

  return validator;
};

module.exports = validateProposal;
