module.exports = {
  port: 3100,

  kashaAddress: 'http://localhost:3000',

  sentry: {
    dsn: ''
  },

  loglevel: 'debug', // debug, info, warning, error, fatal

  sites: {
    'https://www.example.com:8000': {
      upstream: 'https://bucket-foo.somecloud.com',
      upstreamHeaders: {

      },
      realFileExtensions: ['.html', '.js', '.css', '.jpg', '.jpeg', '.png', '.gif', '.eot', '.ttf', '.woff', '.woff2', '.svg', '.svgz'],
      virtualPathMapping: [
        ['/:project/*', '/$1/index.html'],
        ['*', '/index.html']
      ],
      kashaHeaders: {
        token: 'aaaaaaaa'
      }
    }
  },

  // store sites in remote storage instead of using 'sites' config
  sitesStore: {
    adapter: 'mongodb',
    options: {
      url: 'mongodb://localhost:27017',
      database: 'kasha',
      options: {
        poolSize: 10
      }
    }
  }
}
