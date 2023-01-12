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
export default function sync(since: Date, { highriseToken, highriseUrl, slackUrl, groups, showEveryone }: {
    highriseToken: string;
    highriseUrl: string;
    slackUrl: string;
    groups: number[];
    showEveryone: boolean;
}): Promise<Date>;
export type SlackWebhookAttachment = {
    fallback: string;
    text: string;
    ts: number;
    mrkdwn_in: Array<'text' | 'pretext'>;
    title?: string;
    title_link?: string;
};
export type SlackWebhookPayload = {
    text: string;
    username: string;
    icon_url: string;
    attachments: SlackWebhookAttachment[];
};
