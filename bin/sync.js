#!/usr/bin/env node
import sync from '../lib/sync.js'
import * as dotenv from 'dotenv'

dotenv.config()

const config = {
  highriseToken: process.env.HIGHRISE_TOKEN,
  highriseUrl: process.env.HIGHRISE_URL.replace(/\/?$/, '/'),
  slackUrl: process.env.SLACK_URL,
  groups: (process.env.HIGHRISE_GROUPS || '').split(',').map(Number),
  showEveryone: (process.env.EVERYONE || '').toLowerCase() === 'true'
}

const since = new Date(process.argv[2])

const lastCheck = await sync({ ...config, since })
console.log('synced highrise from %s to %s', since, lastCheck)
