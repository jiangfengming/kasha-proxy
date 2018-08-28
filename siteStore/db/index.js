const { sitesStore: { url, database, options } } = require('../../config')
const db = require('./db')

module.exports = db.connect(url, database, options).then(db => {
  const collection = db.collection('sites')
  return {
    getConfig(host) {
      return collection.findOne({ host })
    },

    close() {
      return db.close()
    }
  }
})
