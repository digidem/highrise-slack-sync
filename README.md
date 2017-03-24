# highrise-slack-webhook

> Send notifications to Slack when a Highrise note or email is added

Will periodically check highrise for any new notes or emails and send notifications to a Slack channel with a preview of the email/note.

## Installation

The easiest way to use this is to deploy to Heroku, you can run this on the Heroku Free Tier. Click the button below and enter the relevant details:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

Once the app is deployed visit the 'Resources' page for your app on the Heroku dashboard, and configure the scheduler to run the export command `node index.js` at the schedule of your preference.

The first time that this script is run it will send notifications to Slack for all emails and notes from the past week. After that it will only send notifications of notes/emails created since the last check. Updating an email/note in Highrise currently does not cause a new notification in Slack.

## Contribute

PRs accepted.

## License

MIT © Digital Democracy
