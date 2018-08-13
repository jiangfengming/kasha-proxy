const raven = require('raven')
const Logger = require('raven-logger')
const config = require('./config')

if (config.sentry && config.sentry.dsn) {
  raven.config(config.sentry.dsn, config.sentry.options).install()
}

module.exports = new Logger({ raven, level: config.loglevel })
