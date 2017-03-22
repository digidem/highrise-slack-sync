var redis = require('redis').createClient(process.env.REDIS_URL)
var debug = require('debug')('highrise-slack-cmd')

var sync = require('./lib/sync')

var ONE_WEEK = 1000 * 60 * 60 * 24 * 7

redis.get('lastCheck', function (err, reply) {
  if (err) return onError(err)
  var since = reply ? new Date(reply) : new Date(Date.now() - ONE_WEEK)
  debug('last checked:', since)
  sync(since, function (err, lastCheck) {
    if (err) return onError(err)
    redis.set('lastCheck', lastCheck, onError)
  })
})

function onError (err) {
  redis.quit()
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    process.exit()
  }
}
