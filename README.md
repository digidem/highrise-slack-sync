# highrise-slack-sync

> Send notifications to a Slack webhook for Highrise notes, emails and comments

Sync new recordings (notes, emails, comments) in Highrise to a Slack channel
webhook, with a preview of the email/note.

## CLI

### Environment variables

- `HIGHRISE_TOKEN` -- Highrise API token
- `HIGHRISE_URL` -- Base URL for Highrise API requests
- `SLACK_URL` -- URL for Slack channel webhook
- `HIGHRISE_GROUPS` -- comma-separated list of Highrise group IDs. Only
  recordings visible to these groups will be synced
- `EVERYONE` -- set to `TRUE` to also sync recordings visible to "everyone" in
  Highrise.

### Usage

Sync all recordings since `2022-05-25T15:13:19.000Z`:

```
npx highrise-slack-sync 2022-05-25T15:13:19.000Z
```

You can also pass a Unix timestamp.

## API

### Installation

```
npm install highrise-slack-sync
```

### Usage

```js
import { syncRecordings } from 'highrise-slack-sync`

const syncFromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

const lastCheckedDate = await syncRecordings(syncFromDate, {
  highriseToken: 'xxxxx',
  highriseUrl: 'https://MY_WORKSPACE.highrisehq.com',
  slackUrl: 'https://hooks.slack.com/services/XXXX',
  groups: [555555],
  showEveryone: true
})
```

## Contribute

PRs accepted.

## License

MIT © Digital Democracy
