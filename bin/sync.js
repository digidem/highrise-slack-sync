#!/usr/bin/env node

var sync = require('../lib/sync')

var since = new Date(process.argv[2])

sync(since, function (err, lastCheck) {
  if (err) return console.error(err)
  console.log('synced highrise from:', since)
})
