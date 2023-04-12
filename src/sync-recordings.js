// @ts-check

import ky from 'ky-universal'
import { simpleParser } from 'mailparser'
import makeDebug from 'debug'

import Highrise from './highrise.js'

const debug = makeDebug('highrise-slack:sync')

const RECORDING_TYPES = {
  email: 'an email',
  note: 'a note',
  comment: 'a comment'
}

/** @typedef {{ fallback: string, text: string, ts: number, mrkdwn_in: Array<'text' | 'pretext'>, title?: string, title_link?: string }} SlackWebhookAttachment */
/** @typedef {{ text: string, username: string, icon_url: string, attachments: SlackWebhookAttachment[] }} SlackWebhookPayload */

/**
 *
 * @param {Date} since Sync matching highrise records since this date
 * @param {object} options
 * @param {string} options.highriseToken Highrise API token
 * @param {string} options.highriseUrl Base URL for Highrise API requests
 * @param {string} options.slackUrl Slack webhook URL
 * @param {number[]} options.groups Only include records visible to these highrise groups
 * @param {boolean} options.showEveryone If true, then also include records visible to everyone in sync
 * @returns {Promise<Date>} Highrise is now synced up to this date
 */
export default async function syncRecordings (
  since,
  { highriseToken, highriseUrl, slackUrl, groups, showEveryone }
) {
  const client = new Highrise(highriseUrl, highriseToken)
  const data = await client.get('recordings.xml', { since })

  debug('Found %d new recordings in Highrise', data.length)

  let filterMsg = ''
  if (showEveryone) filterMsg += ' that are visible to everyone'
  if (groups.length)
    filterMsg +=
      (filterMsg ? ' and to' : ' that are visible to') +
      ' groups ' +
      groups.join(', ')

  if (!data.length) {
    debug('No new activity in Highrise since ' + since)
    return since
  }

  const checkDatetime = data.sort(cmp('updatedAt'))[data.length - 1].updatedAt
  const filteredData = data.filter(filterRecord).sort(cmp('createdAt'))

  if (!filteredData.length) {
    debug('No matching recordings found' + filterMsg)
    return checkDatetime
  }

  debug(`Found ${filteredData.length} recordings` + filterMsg)

  for (const rec of filteredData) {
    try {
      rec.author = await client.get('users/' + rec.authorId + '.xml')
    } catch (e) {
      // This will happen if the user that added the record is no longer a
      // Highrise user (e.g. we have removed the user because they have left Dd)
    }
    try {
      rec.subject = await getSubject(rec.subjectId, rec.subjectType)
    } catch (e) {
      // This will happen if the subject is a user that is no longer a
      // Highrise user (e.g. we have removed the user because they have left Dd)
    }
    await sendWebhook(rec)
  }

  debug('Sent ' + filteredData.length + ' notifications to Slack')
  return checkDatetime

  /** @param {any} record */
  function filterRecord (record) {
    // only post emails or notes or comments
    return (
      Object.keys(RECORDING_TYPES).includes(record.type) &&
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
   * @return {Promise<any>}
   */
  async function getSubject (subjectId, subjectType) {
    const subjectPath = getSubjectPath(subjectType)
    try {
      return client.get(subjectPath + '/' + subjectId + '.xml')
    } catch (e) {
      if (subjectPath === 'people') {
        // 'Party' could be either a person or company
        return getSubject(subjectId, 'Company')
      }
      throw new Error(`Error getting ${subjectType} id: ${subjectId}`)
    }
  }

  /** @param {any} recording */
  async function sendWebhook (recording) {
    const authorFirstName =
      recording.author?.name.split(' ')[0] || 'Deleted User'
    // @ts-ignore
    const recordingType = RECORDING_TYPES[recording.type] || 'a note'
    let body = await parseBody(recording)
    const truncatedBody = truncate(body)
    const recordingLink = highriseUrl + recording.type + 's/' + recording.id
    const subjectLink =
      recording.subject &&
      highriseUrl +
        getSubjectPath(recording.subjectType) +
        '/' +
        recording.subject.id
    const subjectText = subjectLink
      ? `<${subjectLink}|${recording.subjectName}>`
      : `${recording.subjectName}`
    if (truncatedBody !== body) {
      body = truncatedBody + ` <${recordingLink}|Read more…>`
    }
    /** @type {SlackWebhookPayload} */
    const payload = {
      text:
        `${authorFirstName} shared <${recordingLink}|${recordingType}> ` +
        `about ${subjectText}`,
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
    await ky.post(slackUrl, { json: payload, credentials: undefined })
  }
}

/** @param {any} recording */
async function parseBody (recording) {
  if (recording.type === 'note') return recording.body
  const body = 'Content-Type: text/plain; charset=UTF-8\n\n' + recording.body
  const mail = await simpleParser(body)
  return mail.text || recording.body || ''
}

/** @param {string} text */
function truncate (text) {
  return text
  // if (text.length < 700 && text.split('\n').length < 5) return text
  // return text.split('\n').slice(0, 5).join('\n').slice(0, 700)
}

/**
 *
 * @param {'Party' | 'Deal' | 'Kase' | 'Company'} type
 * @returns {'people' | 'deals' | 'kases' | 'companies'}
 */
function getSubjectPath (type) {
  switch (type) {
    case 'Party':
      return 'people'
    case 'Deal':
      return 'deals'
    case 'Kase':
      return 'kases'
    case 'Company':
      return 'companies'
  }
}

/**
 * @param {string} prop
 * @returns {(a: Record<string, any>, b: Record<string, any>) => 0 | -1 | 1}
 */
function cmp (prop) {
  return function (a, b) {
    return a[prop] > b[prop] ? 1 : a[prop] < b[prop] ? -1 : 0
  }
}
