module.exports = {
  CLIENT_PROXY_INVALID_HOST_HEADER: {
    message: 'Invalid Host header.',
    httpStatus: 400
  },

  CLIENT_PROXY_HOST_CONFIG_NOT_EXIST: {
    message: 'Host config does not exist.',
    httpStatus: 400
  },

  CLIENT_PROXY_VIRTUAL_PATH_NO_MAPPING: {
    message: 'Can\'t find virtual path mapping for %s.',
    httpStatus: 400
  },

  CLIENT_PROXY_METHOD_NOT_ALLOWED: {
    message: 'Method %s not allowed.',
    httpStatus: 400
  },

  SERVER_PROXY_FETCHING_ERROR: {
    message: 'Error occurred while fetching from the %s server (%s).',
    httpStatus: 500
  },

  SERVER_PROXY_INTERNAL_ERROR: {
    message: 'Server Internal Error (EVENT_ID: %s-%s).',
    httpStatus: 500
  }
}
