#!/usr/bin/env node

var redis = require('redis').createClient(process.env.REDIS_URL)

var lastCheck = new Date(process.argv[2])

redis.set('lastCheck', lastCheck, function (err) {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    console.log('updated REDIS lastCheck to', lastCheck)
    process.exit()
  }
})
