var request = require('request')
var simpleParser = require('mailparser').simpleParser
var run = require('run-series')

require('dotenv').config()

var Highrise = require('./highrise')

var config = {
  highriseToken: process.env.HIGHRISE_TOKEN,
  highriseUrl: process.env.HIGHRISE_URL.replace(/\/?$/, '/'),
  slackUrl: process.env.SLACK_URL
}

var client = new Highrise(config.highriseUrl, config.highriseToken)

module.exports = function sync (lastCheck, cb) {
  client.get('recordings.xml', {since: lastCheck}, function (err, data) {
    if (err) return cb(err)

    data = data
      .filter(r => r.type !== 'comment' && r.visibleTo === 'Everyone')
      .sort(dateCmp)

    if (!data.length) return cb(null, lastCheck)

    run(data.map(r => cb => sendWebhook(r, cb)), done)

    function done (err, results) {
      if (err) return cb(err)
      cb(null, data[data.length - 1].updatedAt)
    }
  })
}

function sendWebhook (recording, cb) {
  var pending = 2
  var error
  client.get('users/' + recording.authorId + '.xml', function (err, user) {
    if (err) return (error = err)
    recording.author = user
    done()
  })
  client.get('people/' + recording.subjectId + '.xml', function (err, contact) {
    if (err) return (error = err)
    recording.subject = contact
    done()
  })
  function done () {
    if (--pending > 0) return
    if (error) return cb(error)
    formatWebhook(recording, function (err, payload) {
      if (err) return cb(err)
      request({
        url: config.slackUrl,
        method: 'POST',
        json: true,
        body: payload
      }, cb)
    })
  }
}

function formatWebhook (recording, cb) {
  var authorFirstName = recording.author.name.split(' ')[0]
  var recordingType = recording.type === 'email' ? 'an email' : 'a note'
  parseBody(recording, function (err, body) {
    if (err) return cb(err)
    var truncatedBody = truncate(body)
    if (truncatedBody !== body) {
      body = truncatedBody + ` <${config.highriseUrl}${recording.type}s/${recording.id}|Read more…>`
    }
    var payload = {
      text: `${authorFirstName} shared <${config.highriseUrl}${recording.type}s/${recording.id}|${recordingType}> ` +
        `about <${config.highriseUrl}${getSubjectPath(recording.subjectType)}/${recording.subject.id}|${recording.subjectName}>`,
      username: 'highrise',
      icon_url: 'http://68.media.tumblr.com/avatar_079aaa3d2066_128.png',
      attachments: [{
        fallback: recording.body,
        text: body,
        ts: +recording.createdAt / 1000
      }]
    }
    if (recording.title) {
      payload.attachments[0].title = recording.title
      payload.attachments[0].title_link = `${config.highriseUrl}${recording.type}s/${recording.id}`
    }
    cb(null, payload)
  })
}

function parseBody (recording, cb) {
  if (recording.type === 'note') return cb(null, recording.body)
  simpleParser(recording.body, function (err, mail) {
    if (err) return cb(err)
    cb(null, mail.text)
  })
}

function truncate (text) {
  if (text.length < 700 && text.split('\n').length < 5) return text
  return text.split('\n').slice(0, 5).join('\n').slice(0, 700)
}

function getSubjectPath (type) {
  switch (type) {
    case 'Party':
      return 'people'
    case 'Deal':
      return 'deals'
    case 'Kase':
      return 'kases'
    default:
      return 'people'
  }
}

function dateCmp (a, b) {
  return a.updatedAt > b.updatedAt ? 1 : a.updatedAt < b.updatedAt ? -1 : 0
}
