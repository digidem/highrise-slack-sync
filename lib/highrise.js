var request = require('request')
var xml2js = require('xml2js')
var url = require('url')
var camelCase = require('camelcase')
var meta = require('../package.json')

var repoUrl = meta.repository && meta.repository.url
var USER_AGENT = meta.name + (repoUrl ? ' (' + repoUrl + ')' : '')

var parser = new xml2js.Parser({
  explicitArray: false
})

module.exports = Highrise

function Highrise (url, token) {
  if (!(this instanceof Highrise)) return new Highrise(url, token)
  this.url = url.replace(/\/?$/, '/')
  this.auth = {user: token, pass: 'X'}
}

Highrise.prototype.get = function (path, params, cb) {
  if (arguments.length === 2 && typeof params === 'function') {
    cb = params
    params = {}
  }
  params = params || {}
  var result = []
  var self = this
  var reqOpts = {
    auth: self.auth,
    headers: {
      'User-Agent': USER_AGENT
    }
  }
  if (params.since && params.since instanceof Date) {
    params.since = dateToString(params.since)
  }
  get(path, params, cb)

  function get (path, params, cb) {
    var urlObj = url.parse(self.url)
    urlObj.query = params || {}
    urlObj.pathname = path
    var urlStr = url.format(urlObj)
    request(urlStr, reqOpts, function (err, res, xml) {
      if (err) return cb(err)
      if (res.statusCode === 404) return cb(new Error('Not Found: ' + path))
      if (res.statusCode === 503) {
        var retry = (res.getHeader('Retry-After') || 1) * 1000
        return setTimeout(get.bind(null, path, params, cb), retry)
      }
      if (res.statusCode !== 200) return cb(new Error('Request error'))
      parseXml(xml, function (err, data) {
        if (err) return cb(err)
        if (!Array.isArray(data)) return cb(null, data)
        if (data.length === 0) return cb(null, result)
        Array.prototype.push.apply(result, data)
        if (data.length < 25) return cb(null, result)
        var n = (params.n || 0) + 25
        get(path, Object.assign({}, params, {n: n}), cb)
      })
    })
  }
}

function parseXml (xml, cb) {
  parser.parseString(xml, function (err, data) {
    if (err) return cb(err)
    var keys = Object.keys(data)
    if (!keys.length) return cb(null, null)
    if (data[keys[0]].$ && data[keys[0]].$.type === 'array') {
      var childKey = Object.keys(data[keys[0]]).filter(k => k !== '$')[0]
      var records = toArray(data[keys[0]][childKey])
      cb(null, records.map(r => parseRecord(r, childKey)))
    } else {
      cb(null, parseRecord(data[keys[0]], keys[0]))
    }
  })
}

function parseRecord (record, type) {
  var result = {type: type}
  for (var prop in record) {
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
      var childKey = Object.keys(value).filter(k => k !== '$')[0]
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
