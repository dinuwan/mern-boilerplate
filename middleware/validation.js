const { body } = require('express-validator')

const registerValidation = [
  body('firstName', 'Firstname is required.').not().isEmpty(),
  body('lastName', 'Lastname is required.').not().isEmpty(),
  body('email', 'Email is required').not().isEmpty().isEmail().normalizeEmail(),
  body('password', 'Password must be at least 8 characters long')
    .not()
    .isEmpty()
    .isLength({ min: 8 }),
  body('role').custom(value => {
    if (!(value === 'user' || value === 'admin'))
      throw new Error('Invalid role')
    else return true
  })
]

const loginValidation = [
  body('email', 'Email is required').not().isEmpty().isEmail().normalizeEmail(),
  body('password', 'Password is required').not().isEmpty().isLength({ min: 8 })
]

module.exports = { registerValidation, loginValidation }
