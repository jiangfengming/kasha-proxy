const { sites } = require('../config')

module.exports = function(origin) {
  return sites[origin]
}
