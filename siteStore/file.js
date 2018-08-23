const { sites } = require('../config')

function getConfig(origin) {
  return sites[origin]
}

function close() {
  // nop
}

module.exports = { getConfig, close }
