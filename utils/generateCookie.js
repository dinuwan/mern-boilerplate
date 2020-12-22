const { AUTH_COOKIE_EXPIRE_IN, NODE_ENV } = require('../config/config')

const generateCookie = ({ user, statusCode, res }) => {
  const token = user.getSignedJWT()
  const options = {
    expires: new Date(Date.now() + AUTH_COOKIE_EXPIRE_IN * 60 * 60 * 1000),
    httpOnly: true
  }

  if (NODE_ENV === 'production') options.secure = true

  res.status(statusCode).cookie('token', token, options).json({
    success: true
  })
}

module.exports = generateCookie
