import { createClient } from 'redis'
import makeDebug from 'debug'
import sync from './lib/sync.js'

const debug = makeDebug('highrise-slack:cmd')
const redis = createClient(process.env.REDIS_URL)
const ONE_WEEK = 1000 * 60 * 60 * 24 * 7

redis.get('lastCheck', function (err, reply) {
  if (err) return onError(err)
  const since = reply ? new Date(reply) : new Date(Date.now() - ONE_WEEK)
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
