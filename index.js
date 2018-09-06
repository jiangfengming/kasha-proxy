#!/usr/bin/env node

(async() => {
  const Koa = require('koa')
  const { URL } = require('url')
  const path = require('path')
  const http = require('http')
  const URLRouter = require('url-router')
  const config = require('./config')
  const logger = require('./logger')
  const RESTError = require('./RESTError')
  const siteStore = await require('./siteStore')

  const app = new Koa()
  const stoppable = require('stoppable')

  app.on('error', e => {
    logger.error(e)
  })

  app.use(async(ctx, next) => {
    try {
      logger.debug(`${ctx.method} ${ctx.url}`)
      await next()
    } catch (e) {
      let err = e
      if (!(e instanceof RESTError)) {
        const { timestamp, eventId } = logger.error(e)
        err = new RESTError('SERVER_PROXY_INTERNAL_ERROR', timestamp, eventId)
      }
      ctx.status = err.httpStatus
      ctx.body = err.toJSON()
    }
  })

  app.use(async(ctx, next) => {
    if (ctx.method !== 'GET') throw new RESTError('CLIENT_PROXY_METHOD_NOT_ALLOWED', ctx.method)

    const host = ctx.host
    if (!host) throw new RESTError('CLIENT_PROXY_INVALID_HOST_HEADER')

    const siteConf = await siteStore.getConfig(host)
    if (!siteConf) throw new RESTError('CLIENT_PROXY_HOST_CONFIG_NOT_EXIST')

    ctx.siteConf = siteConf

    return next()
  })

  app.use(async(ctx, next) => {
    await proxy(ctx)
    return next()
  })

  async function proxy(ctx) {
    const url = new URL(ctx.siteConf.protocol + ctx.host + ctx.url)
    const ext = path.extname(url.pathname)
    const isHTML = ['.html', '.htm'].includes(ext)
    const isAsset = isHTML ? false : ctx.siteConf.assetExtensions.includes(ext)
    const noPrerender = ['', '1'].includes(ctx.query._no_prerender)
    const isRobotsTxt = url.pathname === '/robots.txt' && !noPrerender
    const upstream = !isRobotsTxt && (isAsset || noPrerender) ? 'origin' : 'kasha'

    let upstreamURL, headers
    if (upstream === 'origin') {
      if (!isHTML && !isAsset) {
        const pathname = fileMap(url.pathname, ctx.siteConf.virtualPathMapping)
        if (!pathname) throw new RESTError('CLIENT_PROXY_VIRTUAL_PATH_NO_MAPPING', url.pathname)

        url.pathname = pathname
      }

      upstreamURL = new URL(ctx.siteConf.origin)
      upstreamURL.pathname = url.pathname
      headers = ctx.siteConf.originHeaders
    } else {
      upstreamURL = new URL(ctx.siteConf.kasha)
      upstreamURL.pathname = '/' + url.origin + url.pathname
      headers = ctx.siteConf.kashaHeaders
    }

    if (!ctx.siteConf.removeQueryString) {
      upstreamURL.search = url.search
    }

    try {
      const res = await request(upstreamURL, headers)
      ctx.status = res.statusCode
      delete res.headers.connection
      ctx.set(res.headers)
      ctx.body = res
    } catch (e) {
      throw new RESTError('SERVER_PROXY_FETCHING_ERROR', e.message)
    }
  }

  function fileMap(pathname, maps) {
    const router = new URLRouter()
    for (const [from, to] of maps) {
      router.get(from, to)
    }

    const matched = router.find('GET', pathname)
    return matched ? matched.handler : null
  }

  function request(url, headers) {
    return new Promise((resolve, reject) => {
      const req = http.request({
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers
      }, res => resolve(res))

      req.on('error', e => reject(e))
      req.end()
    })
  }

  const server = stoppable(app.listen(config.port))

  // graceful exit
  let stopping = false
  process.on('SIGINT', async() => {
    if (stopping) return

    stopping = true
    logger.info('Closing the server. Please wait for finishing the pending requests.')

    server.stop(async() => {
      await siteStore.close()
    })
  })

  logger.info(`http server started at port ${config.port}`)
})()
