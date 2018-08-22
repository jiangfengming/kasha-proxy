module.exports = {
  port: 3100,

  sentry: {
    dsn: ''
  },

  loglevel: 'debug', // debug, info, warning, error, fatal

  sites: {
    'https://www.example.com:8000': {
      origin: 'https://bucket-foo.somecloud.com',
      originHeaders: {
        Host: 'www.example.com'
      },
      kasha: 'http://localhost:3000',
      kashaHeaders: {
        token: 'aaaaaaaa'
      },
      realFileExtensions: ['.html', '.js', '.css', '.jpg', '.jpeg', '.png', '.gif', '.eot', '.ttf', '.woff', '.woff2', '.svg', '.svgz'],
      virtualPathMapping: [
        ['/:project/*', '/$1/index.html'],
        ['*', '/index.html']
      ]
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
