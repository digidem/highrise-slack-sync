import ky from 'ky-universal'
import xml2js from 'xml2js'
import camelCase from 'camelcase'
import makeDebug from 'debug'

const log = makeDebug('highrise-slack:highrise')
const USER_AGENT = 'highrise-slack-webhook'

const parser = new xml2js.Parser({
  explicitArray: false
})

export default class Highrise {
  constructor (url, token) {
    const credentials = btoa(`${token}:X`)
    this.client = ky.create({
      prefixUrl: url.replace(/\/?$/, '/'),
      headers: {
        Authorization: `Basic ${credentials}`,
        'User-Agent': USER_AGENT
      }
    })
  }

  async get (path, params = {}) {
    const result = []
    const self = this
    if (params.since && params.since instanceof Date) {
      params.since = dateToString(params.since)
    }
    return get(path, params)

    async function get (path, searchParams) {
      log('get:', path, searchParams)
      const xml = await self.client
        .get(path, { searchParams, retry: 10 })
        .text()
      const data = await parseXml(xml)
      if (!Array.isArray(data)) return data
      if (data.length === 0) return result
      Array.prototype.push.apply(result, data)
      if (data.length < 25) return result
      const n = (params.n || 0) + 25
      return get(path, { ...params, n })
    }
  }
}

async function parseXml (xml) {
  return new Promise((res, rej) => {
    parser.parseString(xml, function (err, data) {
      if (err) return rej(err)
      const keys = Object.keys(data)
      if (!keys.length) return res(null)
      if (data[keys[0]].$ && data[keys[0]].$.type === 'array') {
        const childKey = Object.keys(data[keys[0]]).filter(k => k !== '$')[0]
        const records = toArray(data[keys[0]][childKey])
        res(records.map(r => parseRecord(r, childKey)))
      } else {
        res(parseRecord(data[keys[0]], keys[0]))
      }
    })
  })
}

function parseRecord (record, type) {
  const result = { type: type }
  for (const prop in record) {
    if (prop === '$') {
      result.type = record.$.type && record.$.type.toLowerCase()
      continue
    }
    result[camelCase(prop)] = parseValue(record[prop])
  }
  return result
}

function parseValue (value) {
  if (typeof value === 'undefined') return value
  if (typeof value === 'string') return value
  if (!value.$) return parseRecord(value)
  if (value.$.nil === 'true') {
    return null
  }
  switch (value.$.type) {
    case 'integer':
      return +value._
    case 'datetime':
      return new Date(value._)
    case 'boolean':
      return value._ === 'true'
    case 'array':
      const childKey = Object.keys(value).filter(k => k !== '$')[0]
      return toArray(value[childKey]).map(r => parseRecord(r, childKey))
    default:
      return parseRecord(value)
  }
}

function toArray (value) {
  return Array.isArray(value) ? value : value ? [value] : []
}

// Formats a date as yyyymmmddhhmmss
function dateToString (d) {
  return d.toISOString().replace(/-|T|:/g, '').slice(0, 14)
}
