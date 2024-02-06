const { body, validationResult } = require('express-validator');

const validateLoginInputs = [
    body('email').notEmpty().withMessage('Email is required').trim().matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/).withMessage('Invalid email entered'),
    body('password').notEmpty().withMessage('Password is required').trim().isLength({ min: 8 }).withMessage('Password is too short'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 'FAILED', message: 'Validation failed', errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateLoginInputs };
