import request from 'request'
import xml2js from 'xml2js'
import url from 'url'
import camelCase from 'camelcase'
import meta from '../package.json'
import log from "debug')('highrise-slack:highrise"

const repoUrl = meta.repository && meta.repository.url
const USER_AGENT = meta.name + (repoUrl ? ' (' + repoUrl + ')' : '')

const parser = new xml2js.Parser({
  explicitArray: false
})

export default class Highrise {
  constructor (url, token) {
    if (!(this instanceof Highrise)) return new Highrise(url, token)
    this.url = url.replace(/\/?$/, '/')
    this.auth = { user: token, pass: 'X' }
  }

  get (path, params, cb) {
    if (arguments.length === 2 && typeof params === 'function') {
      cb = params
      params = {}
    }
    params = params || {}
    const result = []
    const self = this
    const reqOpts = {
      auth: self.auth,
      headers: {
        'User-Agent': USER_AGENT
      }
    }
    if (params.since && params.since instanceof Date) {
      params.since = dateToString(params.since)
    }
    get(path, params)

    function get (path, params) {
      log('get:', path, JSON.stringify(params))
      const urlObj = url.parse(self.url)
      urlObj.query = params || {}
      urlObj.pathname = path
      const urlStr = url.format(urlObj)
      request(urlStr, reqOpts, function (err, res, xml) {
        if (err) return cb(err)
        if (res.statusCode === 404) return cb(new Error('Not Found: ' + path))
        if (res.statusCode === 503) {
          const retry = (res.headers['retry-after'] || 1) * 1000
          return setTimeout(get.bind(null, path, params), retry)
        }
        if (res.statusCode !== 200) return cb(new Error('Request error'))
        parseXml(xml, function (err, data) {
          if (err) return cb(err)
          if (!Array.isArray(data)) return cb(null, data)
          if (data.length === 0) return cb(null, result)
          Array.prototype.push.apply(result, data)
          if (data.length < 25) return cb(null, result)
          const n = (params.n || 0) + 25
          get(path, Object.assign({}, params, { n: n }))
        })
      })
    }
  }
}

function parseXml (xml, cb) {
  parser.parseString(xml, function (err, data) {
    if (err) return cb(err)
    const keys = Object.keys(data)
    if (!keys.length) return cb(null, null)
    if (data[keys[0]].$ && data[keys[0]].$.type === 'array') {
      const childKey = Object.keys(data[keys[0]]).filter(k => k !== '$')[0]
      const records = toArray(data[keys[0]][childKey])
      cb(
        null,
        records.map(r => parseRecord(r, childKey))
      )
    } else {
      cb(null, parseRecord(data[keys[0]], keys[0]))
    }
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
