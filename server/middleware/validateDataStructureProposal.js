const { body, validationResult } = require("express-validator");

const validateDataStructureProposal = (action) => [
  body("title").trim().notEmpty().withMessage("Title cannot be empty"),

  body("definition")
    .trim()
    .notEmpty()
    .withMessage("Definition cannot be empty"),

  body("category")
    .isArray({ min: 1 })
    .withMessage("Category must be an array and cannot be empty"),

  body("type").trim().notEmpty().withMessage("Type cannot be empty"),

  body("characteristics")
    .trim()
    .notEmpty()
    .withMessage("Characteristics cannot be empty"),

  ...(action === "create" || action === "update"
    ? [
        body("operations")
          .isArray()
          .withMessage("Operations must be an array")
          .optional(),

        body("operations.*.name")
          .trim()
          .notEmpty()
          .withMessage("Operation name is required"),
        body("operations.*.description")
          .trim()
          .notEmpty()
          .withMessage("Operation description is required"),
        body("operations.*.complexity.time")
          .trim()
          .notEmpty()
          .withMessage("Operation time complexity is required"),
        body("operations.*.complexity.space")
          .trim()
          .notEmpty()
          .withMessage("Operation space complexity is required"),

        body("operations.*.implementations")
          .isArray()
          .withMessage("Operation implementations must be an array")
          .optional(),

        body("operations.*.implementations.*.codeDetails.language")
          .trim()
          .notEmpty()
          .withMessage("Implementation language is required"),

        body("operations.*.implementations.*.codeDetails.code")
          .trim()
          .notEmpty()
          .withMessage("Implementation code is required"),

        body("operations.*.implementations.*.explanation")
          .trim()
          .notEmpty()
          .withMessage("Implementation explanation is required"),

        body("operations.*.implementations.*.complexity.time")
          .trim()
          .notEmpty()
          .withMessage("Implementation time complexity is required"),

        body("operations.*.implementations.*.complexity.space")
          .trim()
          .notEmpty()
          .withMessage("Implementation space complexity is required"),
      ]
    : []),

  body("fullImplementations")
    .optional()
    .isArray()
    .withMessage("Full implementations must be an array"),
  body("fullImplementations.*.language")
    .if(body("fullImplementations").exists())
    .trim()
    .notEmpty()
    .withMessage("Full implementation language is required"),
  body("fullImplementations.*.code")
    .if(body("fullImplementations").exists())
    .trim()
    .notEmpty()
    .withMessage("Full implementation code is required"),

  body("applications")
    .optional()
    .isArray()
    .withMessage("Applications must be an array"),
  body("applications.*.domain")
    .if(body("applications").exists())
    .trim()
    .notEmpty()
    .withMessage("Application domain is required"),
  body("applications.*.examples")
    .if(body("applications").exists())
    .isArray()
    .withMessage("Application examples must be an array"),

  body("comparisons")
    .optional()
    .isArray()
    .withMessage("Comparisons must be an array"),
  body("comparisons.*.with")
    .if(body("comparisons").exists())
    .trim()
    .notEmpty()
    .withMessage("Comparison target is required"),
  body("comparisons.*.advantages")
    .if(body("comparisons").exists())
    .isArray()
    .withMessage("Comparison advantages must be an array"),
  body("comparisons.*.disadvantages")
    .if(body("comparisons").exists())
    .isArray()
    .withMessage("Comparison disadvantages must be an array"),
  body("comparisons.*.whenToUse")
    .if(body("comparisons").exists())
    .trim()
    .optional(),

  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("references")
    .optional()
    .isArray()
    .withMessage("References must be an array"),
  body("videoLinks")
    .optional()
    .isArray()
    .withMessage("Video links must be an array"),
  body("visualization")
    .optional()
    .isString()
    .withMessage("Visualization must be a string (URL)"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = validateDataStructureProposal;
