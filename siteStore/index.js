const config = require('../config')

if (config.sitesStore) {
  module.exports = require('./db')
} else {
  module.exports = require('./file')
}
