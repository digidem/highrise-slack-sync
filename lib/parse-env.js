// @ts-check

/**
 * @param {Record<string, unknown>} env
 * @returns {{ highriseToken: string, highriseUrl: string, slackUrl: string, groups: number[], showEveryone: boolean }}
 **/
export default function parseEnv (env) {
  if (typeof env.HIGHRISE_TOKEN !== 'string') throw new Error('missing `HIGHRISE_TOKEN` in env')
  if (typeof env.HIGHRISE_URL !== 'string') throw new Error('missing `HIGHRISE_URL` in env')
  if (typeof env.SLACK_URL !== 'string') throw new Error('missing `SLACK_URL` in env')
  return {
    highriseToken: env.HIGHRISE_TOKEN,
    highriseUrl: env.HIGHRISE_URL.replace(/\/?$/, '/'),
    slackUrl: env.SLACK_URL,
    // @ts-ignore
    groups: (env.HIGHRISE_GROUPS || '').split(',').map(Number),
    // @ts-ignore
    showEveryone: (env.EVERYONE || '').toLowerCase() === 'true'
  }
}
