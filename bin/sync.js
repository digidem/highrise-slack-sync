#!/usr/bin/env node

var sync = require('../lib/sync')

var since = new Date(process.argv[2])

sync(since, function (err, lastCheck) {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    console.log('synced highrise from:', since)
    process.exit()
  }
})
