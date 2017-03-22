var debug = require('debug')('highrise-slack-cmd')

var sync = require('./lib/sync')

var ONE_WEEK = 1000 * 60 * 60 * 24 * 7

var since = new Date(Date.now() - ONE_WEEK)
debug('last checked:', since)
sync(since, function (err, lastCheck) {
  if (err) return onError(err)
})

function onError (err) {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    process.exit()
  }
}
