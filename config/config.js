// This file reads env variables from config.env and export them
const dotenv = require('dotenv').config({ path: './config/config.env' })
if (dotenv.error) {
  throw dotenv.error
}

const { parsed: envs } = dotenv

module.exports = envs
