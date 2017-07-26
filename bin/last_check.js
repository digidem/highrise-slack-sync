#!/usr/bin/env node

var redis = require('redis').createClient(process.env.REDIS_URL)

var lastCheck = new Date(process.argv[2])

redis.set('lastCheck', lastCheck, function (err) {
  if (err) return console.error(err)
  console.log('updated REDIS lastCheck to', lastCheck)
})
