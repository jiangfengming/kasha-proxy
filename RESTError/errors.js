module.exports = {
  CLIENT_PROXY_INVALID_HOST_HEADER: {
    message: 'Invalid Host header.',
    httpStatus: 400
  },

  CLIENT_PROXY_HOST_CONFIG_NOT_EXIST: {
    message: 'Host config not existed.',
    httpStatus: 400
  },

  CLIENT_PROXY_FETCHING_ERROR: {
    message: 'Error occurred while fetching from the origin server (%s).'
    httpStatus: 500
  }
}