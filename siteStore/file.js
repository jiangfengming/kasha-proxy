const { sites } = require('../config')

function getConfig(host) {
  return sites.find(config => config.host === host)
}

function close() {
  // nop
}

module.exports = { getConfig, close }
