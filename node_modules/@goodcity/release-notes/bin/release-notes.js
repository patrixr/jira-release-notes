#!/usr/bin/env node

process.env.DEBUG = process.env.DEBUG  || '*,-follow-redirects';

const { execute }   = require('..');
const { program }   = require('commander');
const {
  version,
  name
} = require('../package.json');

program
  .name(name)
  .version(version)
  .option('-p, --pdf', 'ouputs to pdf')
  .option('-c, --clipboard', 'copies the markdown to your clipboard')
  .option('-h, --head <head>', 'The head ref or source branch', 'origin/master')
  .option('-b, --base <base>', 'The base ref or target branch', 'origin/live')
  .option('--email-to <email>', 'Recipients for the release notes')
  .option('--email-subject <subject>', 'Subject of the email')
  .option('--app-name <name>', 'Name of the app')
  .option('--unshallow', 'Unshallows a shallow repository to read the commites')
  .option('--jira-code <code>', 'Jira ticket code', 'GCW')
  .option('--jira-host <host>', 'Jira host', process.env.JIRA_HOST || 'jira.crossroads.org.hk')
  .option('--jira-username <username>', 'Jira username', process.env.JIRA_USERNAME)
  .option('--jira-password <code>', 'Jira password', process.env.JIRA_PASSWORD)
  .option('--sendgrid-api-key <key>', 'Sendgrid api key', process.env.SENDGRID_API_KEY)

program.parse(process.argv);

(async function () {
  try {
    await execute(program);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();