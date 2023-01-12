#!/usr/bin/env node
// @ts-check

import { syncRecordings, parseEnv } from '../'
import * as dotenv from 'dotenv'

dotenv.config()

const config = parseEnv(process.env)

const since = new Date(process.argv[2])

const lastCheck = await syncRecordings(since, config)
console.log('synced highrise from %s to %s', since, lastCheck)
