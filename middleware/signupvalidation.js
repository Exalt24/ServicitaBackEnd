const { body, validationResult } = require('express-validator');

const validateSignupInputs = [
    body('name').notEmpty().withMessage('Name is required').trim().matches(/^[a-zA-Z\s]+$/).withMessage('Invalid name entered'),
    body('email').notEmpty().withMessage('Email is required').trim().matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/).withMessage('Invalid email entered'),
    body('password').notEmpty().withMessage('Password is required').trim().isLength({ min: 8 }).withMessage('Password is too short'),
    body('dateOfBirth').notEmpty().withMessage('Date of birth is required').trim().matches(/^\d{1,2}-\d{1,2}-\d{4}$/).withMessage('Invalid date entered'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 'FAILED', message: 'Validation failed', errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateSignupInputs };
