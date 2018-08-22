#!/usr/bin/env node

(async() => {
  const Koa = require('koa')
  const Router = require('koa-router')
  const { URL } = require('url')
  const path = require('path')
  const http = require('http')
  const URLRouter = require('url-router')
  const config = require('./config')
  const RESTError = require('./RESTError')
  const getSiteConfig = await require('./getSiteConfig')

  const app = new Koa()
  const router = new Router()
  const stoppable = require('stoppable')

  app.on('error', e => {
    logger.error(e)
  })

  app.use(async(ctx, next) => {
    try {
      await next()
      ctx.set('Kasha-Code', 'OK')
    } catch (e) {
      let err = e
      if (!(e instanceof RESTError)) {
        const { timestamp, eventId } = logger.error(e)
        err = new RESTError('SERVER_INTERNAL_ERROR', timestamp, eventId)
      }
      ctx.set('Kasha-Code', err.code)
      ctx.status = err.status
      ctx.body = err.toJSON()
    }
  })

  function robotsTxt(ctx) {

  }

  async function proxy(ctx) {
    const url = new URL(ctx.url)
    const ext = path.extname(url.pathname)
    const isRealFile = ctx.siteConf.realFileExtensions.includes(ext)
    const upstream = isRealFile || ['', '1'].includes(ctx.query._no_prerender) ? 'origin' : 'kasha'

    let upstreamURL, headers
    if (upstream === 'origin') {
      if (!isRealFile) {
        const pathname = fileMap(url.pathname, ctx.siteConf.virtualPathMapping)
        if (!pathname) throw new RESTError('CLIENT_PROXY_VIRTUAL_PATH_NO_MAPPING',url.pathname)

        url.pathname = pathname
      }

      upstreamURL = new URL(ctx.siteConf.origin)
      upstreamURL.pathname = url.pathname
      upstreamURL.search = url.search
      headers = ctx.siteConf.originHeaders
    } else {
      upstreamURL = new URL(config.siteConf.kasha)
      upstreamURL.pathname = url.href
      headers = ctx.siteConf.kashaHeaders
    }

    try {
      const { req, res } = await request(upstreamURL, headers)
      ctx.status = res.statusCode
      ctx.set(res.headers)
      ctx.body = res
    } catch (e) {
      throw new RESTError('CLIENT_PROXY_FETCHING_ERROR', e.message)
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
        protocal: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers: headers
      }, res => resolve(res))

      req.on('error', e => reject(e))
      req.end()
    })
  }

  app.use(async ctx => {
    logger.debug(`${ctx.method} ${ctx.url}`)

    const host = ctx.host
    if (!host) throw new RESTError('CLIENT_PROXY_INVALID_HOST_HEADER')

    const siteConf = await getSiteConfig(host)
    if (!siteConf) throw new RESTError('CLIENT_PROXY_HOST_CONFIG_NOT_EXIST')

    ctx.siteConf = siteConf
  })

  router.get('/robots.txt', robotsTxt)
  router.get('*', proxy)


  // graceful exit
  let stopping = false
  process.on('SIGINT', async() => {
    if (stopping) return

    stopping = true
    logger.info('Closing the server. Please wait for finishing the pending requests.')

    server.stop(async() => {
      clearInterval(workerResponse.interval)
      workerResponse.reader.close()
      nsqWriter.close()
      await mongodb.close()
    })
  })

  logger.info(`http server started at port ${config.port}`)
})()
