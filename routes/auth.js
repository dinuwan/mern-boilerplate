const Router = require('express').Router()

const {
  register,
  login,
  logout,
  getUser,
  getUsers,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/auth')

const { protect, authorize } = require('../middleware/auth')
const {
  registerValidation,
  loginValidation
} = require('../middleware/validation')

Router.post('/register', registerValidation, register)
Router.post('/login', loginValidation, login)
Router.get('/user/:id', getUser)
Router.get('/user', getUsers)
Router.get('/me', protect, getMe)
Router.put('/profile', protect, updateProfile)
Router.put('/password', protect, updatePassword)
Router.post('/password', forgotPassword)
Router.put('/password/:token', resetPassword)

module.exports = Router
