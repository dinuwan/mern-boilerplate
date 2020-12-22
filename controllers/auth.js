const crypto = require('crypto')
const mongoose = require('mongoose')
const { validationResult } = require('express-validator')

const asyncHandler = require('../middleware/asyncHandler')
const User = require('../models/User')
const generateCookie = require('../utils/generateCookie')
const ErrorResponse = require('../utils/errorResponse')

// @desc   Register a user
// @route  POST /api/v1/auth/register
// @access Public
const register = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() })
  }

  const { email, password, role, firstName, lastName } = req.body

  let user = await User.findOne({ email })
  if (user)
    res.status(400).json({
      success: false,
      msg: `User already exsists for email: ${email}`
    })

  if (role === 'user' || role === 'admin' || role === undefined)
    user = await User.create({ email, password, role, firstName, lastName })

  res.status(201).json({
    success: true,
    data: user
  })
})

// @desc   Login
// @route  POST /api/v1/auth/login
// @access Public
const login = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() })
  }

  const { email, password } = req.body
  const user = await User.findOne({ email }).select('+password')

  if (!user) return next(new ErrorResponse('User not found', 404))

  const isMatch = await user.matchPassword(password)

  if (isMatch) generateCookie({ user, res, statusCode: 200 })
  else return next(new ErrorResponse('Incorrect password', 401))
})

// @desc   Logout
// @route  GET /api/v1/auth/logout
// @access Private
const logout = asyncHandler(async (req, res, next) => {})

// @desc   Get a user by id
// @route  GET /api/v1/auth/user/:id
// @access Public
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user || user.role === 'admin')
    return next(new ErrorResponse(`No user found for id ${req.params.id}`, 404))

  res.status(200).json({
    success: true,
    data: user
  })
})

// @desc   Get all users
// @route  GET /api/v1/auth/user
// @access Public
const getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find()

  if (!users) return next(new ErrorResponse('No users found!', 404))

  res.status(200).json({
    success: true,
    data: users
  })
})

// @desc   Get logged in user info
// @route  GET /api/v1/auth/me
// @access Public
const getMe = asyncHandler(async (req, res, next) => {
  const user = req.user
  res.status('200').json({
    success: true,
    data: user
  })
})

// @desc   Update user profile
// @route  PUT /api/v1/auth/profile
// @access Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const user = req.user

  req.body.firstName ? (user.firstName = req.body.firstName) : null
  req.body.lastName ? (user.lastName = req.body.lastName) : null
  req.body.email ? (user.email = req.body.email) : null

  // Updating the user profile
  try {
    await user.save({ validateBeforeSave: false })

    res.status(200).json({
      success: true
    })
  } catch (error) {
    throw error
  }
})

// @desc   Update user password
// @route  PUT /api/v1/auth/password
// @access Private
const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password')

  const isMatch = await user.matchPassword(req.body.currentPassword)
  if (!isMatch)
    return next(new ErrorResponse('Current password is incorrect', 400))

  try {
    user.password = req.body.newPassword
    await user.save({ validateBeforeSave: true })
    generateCookie({ user, res, statusCode: 200 })
  } catch (error) {
    throw error
  }
})

// @desc   Forgot password
// @route  POST /api/v1/auth/password
// @access Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user)
    return next(
      new ErrorResponse(`No user found for email: ${req.body.email}`, 404)
    )

  const resetToken = user.generatePasswordResetToken()
  await user.save({ validateBeforeSave: false })

  res.status(200).json({
    success: true,
    data: {
      resetToken
    }
  })
})

// @desc   Reset password
// @route  PUT /api/v1/auth/password/:token
// @access Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  })

  if (!user) return next(new ErrorResponse(`Invalid or expired token`, 400))

  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()
  generateCookie({ user, res, statusCode: 200 })
})

module.exports = {
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
}
