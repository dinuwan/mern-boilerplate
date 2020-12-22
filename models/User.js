const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const {
  JWT_EXPIRE_IN,
  JWT_SECRET,
  DEFAULT_PROFILE_PICTURE,
  PASSWORD_RESET_TOKEN_VALIDITY
} = require('../config/config')

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/]
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    profilePicture: {
      type: String,
      default: DEFAULT_PROFILE_PICTURE
    }
  },
  { timestamps: true }
)

UserSchema.pre('save', async function () {
  // Run when password changes
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  }

  // Run when email changes
  if (this.isModified('email')) {
    this.isEmailVerified = false
  }
})

// Match passwords
UserSchema.methods.matchPassword = async function (plainTextPassword) {
  return await bcrypt.compare(plainTextPassword, this.password)
}

// Sign JWT
UserSchema.methods.getSignedJWT = function () {
  return jwt.sign({ id: this._id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE_IN
  })
}

// Password reset token
UserSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex')
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  this.resetPasswordExpire = Date.now() + PASSWORD_RESET_TOKEN_VALIDITY * 1000

  return resetToken
}

module.exports = mongoose.model('User', UserSchema)
