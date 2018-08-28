const { sitesStore: { url, database, options } } = require('../../config')
const mongo = require('./mongo')

module.exports = mongo.connect(url, database, options).then(db => {
  const collection = db.collection('sites')
  return {
    getConfig(host) {
      return collection.findOne({ host })
    },

    close() {
      return mongo.close()
    }
  }
})
