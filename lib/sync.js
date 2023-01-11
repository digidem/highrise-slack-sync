import ky from 'ky-universal'
import { simpleParser } from 'mailparser'
import makeDebug from 'debug'

import Highrise from './highrise.js'

const debug = makeDebug('highrise-slack:sync')

const recordingTypes = {
  email: 'an email',
  note: 'a note',
  comment: 'a comment'
}

export default async function sync ({
  highriseToken,
  highriseUrl,
  slackUrl,
  groups,
  showEveryone,
  since
}) {
  const client = new Highrise(highriseUrl, highriseToken)
  const data = await client.get('recordings.xml', { since })

  debug('Found %d new recordings in Highrise', data.length)
  let msg =
    'Filtering recordings of type ' + Object.keys(recordingTypes).join(', ')
  if (showEveryone) msg += ' that are visible to everyone'
  if (groups.length) msg += ' and visible to groups ' + groups.join(', ')
  debug(msg)

  if (!data.length) {
    debug('No new activity in Highrise since ' + since)
    return since
  }

  const checkDatetime = data.sort(cmp('updatedAt'))[data.length - 1].updatedAt
  const filteredData = data.filter(filterRecord).sort(cmp('createdAt'))

  if (!filteredData.length) {
    debug('No matching recordings found')
    return checkDatetime
  }

  debug(`Found ${filteredData.length} filtered recordings`)

  for (const rec of filteredData) {
    rec.author = await client.get('users/' + rec.authorId + '.xml')
    rec.subject = await getSubject(rec.subjectId, rec.subjectType)
    await sendWebhook(rec)
  }

  debug('Sent ' + filteredData.length + ' new recordings to Slack')
  return checkDatetime

  function filterRecord (record) {
    // only post emails or notes or comments
    return (
      Object.keys(recordingTypes).includes(record.type) &&
      // if visible to everyone & should show everyone
      ((record.visibleTo === 'Everyone' && showEveryone) ||
        // or visible to a group in HIGHRISE_GROUPS
        groups.indexOf(record.groupId) > -1) &&
      // only items creates since last check - edited record will not get re-posted
      record.createdAt > since
    )
  }

  /**
   * @param {string} subjectId
   * @param {'Party' | 'Deal' | 'Kase' | 'Company'} subjectType
   */
  async function getSubject (subjectId, subjectType) {
    const subjectPath = getSubjectPath(subjectType)
    try {
      return client.get(subjectPath + '/' + subjectId + '.xml')
    } catch (e) {
      if (subjectPath === 'people') {
        // 'Party' could be either a person or company
        return getSubject(subjectId, 'companies')
      }
      throw new Error(
        `Error getting ${recording.subjectType} id: ${recording.subjectId}`
      )
    }
  }

  async function sendWebhook (recording) {
    const authorFirstName = recording.author.name.split(' ')[0]
    const recordingType = recordingTypes[recording.type] || 'a note'
    const body = await parseBody(recording)
      const truncatedBody = truncate(body)
      const recordingLink =
        highriseUrl + recording.type + 's/' + recording.id
      const subjectLink =
        highriseUrl +
        getSubjectPath(recording.subjectType) +
        '/' +
        recording.subject.id
      if (truncatedBody !== body) {
        body = truncatedBody + ` <${recordingLink}|Read more…>`
      }
      const payload = {
        text:
          `${authorFirstName} shared <${recordingLink}|${recordingType}> ` +
          `about <${subjectLink}|${recording.subjectName}>`,
        username: 'highrise',
        icon_url: 'http://68.media.tumblr.com/avatar_079aaa3d2066_128.png',
        attachments: [
          {
            fallback: recording.body,
            text: body,
            ts: +recording.createdAt / 1000,
            mrkdwn_in: ['text', 'pretext']
          }
        ]
      }
      if (recording.title) {
        payload.attachments[0].title = recording.title
        payload.attachments[0].title_link = `${highriseUrl}${recording.type}s/${recording.id}`
      }
      await ky.post(slackUrl, { json: payload })
  }
}



async function parseBody (recording) {
  if (recording.type === 'note') return recording.body
  const body = 'Content-Type: text/plain; charset=UTF-8\n\n' + recording.body
  const mail = await simpleParser(body)
  return mail.text || recording.body || ''
}

function truncate (text) {
  return text
  // if (text.length < 700 && text.split('\n').length < 5) return text
  // return text.split('\n').slice(0, 5).join('\n').slice(0, 700)
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

function cmp (prop) {
  return function (a, b) {
    return a[prop] > b[prop] ? 1 : a[prop] < b[prop] ? -1 : 0
  }
}
