const errorFactory = require('rest-api-error-factory')
const errors = require('./errors')

module.exports = errorFactory(errors)