#!/usr/bin/env node

(async() => {
  const Koa = require('koa')
  const Router = require('koa-router')
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
      if (!(e instanceof CustomError)) {
        const { timestamp, eventId } = logger.error(e)
        err = new CustomError('SERVER_INTERNAL_ERROR', timestamp, eventId)
      }
      ctx.set('Kasha-Code', err.code)
      ctx.status = err.status
      ctx.body = err.toJSON()
    }
  })

  function robotsTxt(ctx) {

  }

  function proxy(ctx) {
    if (['', '1'].includes(ctx.query._no_prerender)) {

    }
  }

  app.use(async ctx => {
    const host = ctx.host
    if (!host) throw new CustomError('CLIENT_PROXY_INVALID_HOST_HEADER')

    const siteConf = await getSiteConfig(host)
    if (!siteConf) throw new CustomError('CLIENT_PROXY_HOST_CONFIG_NOT_EXIST')

    ctx.siteConf = siteConf
  })

  router.get('/robots.txt', robotsTxt)
  router.get('/sitemaps/*', proxy)


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
