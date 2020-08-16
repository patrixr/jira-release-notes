process.env.DEBUG = process.env.DEBUG  || '*,-follow-redirects';

const core          = require('@actions/core');
const github        = require('@actions/github');
const { execute }   = require('@goodcity/release-notes');

/**
 * @typedef GenerationOptions
 * @type {object}
 * @property {boolean} [pdf]
 * @property {boolean} [clipboard]
 * @property {boolean} [unshallow]
 * @property {string} [head]
 * @property {string} [base]
 * @property {string} [emailTo]
 * @property {string} [emailSubject]
 * @property {string} [appName]
 * @property {string} [jiraCode]
 * @property {string} [jiraHost]
 * @property {string} [jiraUsername]
 * @property {string} [jiraPassword]
 * @property {string} [sendgridApiKey]
 */

function readString(key) {
  return core.getInput(key);
}

function readBoolean(key) {
  const val = readString(key);
  return key === true || key === 'true';
}

/** @type {GenerationOptions} */
const options = {
  head: readString('head'),
  base: readString('base'),
  jiraCode: readString('jira-code'),
  jiraHost: readString('jira-host'),
  jiraUsername: readString('jira-username'),
  jiraPassword: readString('jira-password'),
  unshallow: readBoolean('unshallow'),
  emailTo: readString('email-to'),
  emailSubject: readString('email-subject'),
  sendgridApiKey: readString('sendgrid-api-key'),
  appName: readString('app-name')
};

async function runAction() {
  try {
    const { pdf } = await execute(options);

    core.setOutput("pdf", pdf);
    console.log("Generated pdf " + pdf);
  } catch (e) {
    const message = e && e.message || 'Something went wrong';
    core.setFailed(message);
  }
}

if (options.emailTo && !options.sendgridApiKey) {
  core.setFailed('The sendgrid-api-key option is required for sending emails');
} else {
  runAction();
}