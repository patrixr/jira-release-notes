const _             = require('lodash');
const JiraClient    = require('jira-client');
const { execSync }  = require('child_process');
const info          = require('debug')('goodcity');
const error         = require('debug')('error');
const clipboardy    = require('clipboardy');
const repo          = require('./lib/repo');
const mailer        = require('./lib/mailer');
const { question }  = require('./lib/input');
const Markdown      = require('./lib/markdown');
const path          = require('path');

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

function mandatory(opts, key) {
  if (!opts[key]) {
    error(`Options '${key}' is required`);
    process.exit(1);
  }
}

/**
 *
 *
 * @param {GenerationOptions} [opts={}]
 * @returns
 */
async function execute(opts = {}) {

  const APP_VERSION = repo.getRepoVersion();
  const APP_NAME    = opts.appName || repo.getRepoName();
  const REPO_NAME   = `${APP_NAME} v${APP_VERSION}`
  const OUTPUT_PDF  = `./release-${REPO_NAME.replace(/ /g, '-')}.pdf`

  mandatory(opts, 'jiraHost');
  mandatory(opts, 'jiraCode');

  if (opts.emailTo) {
    mandatory(opts, 'sendgridApiKey')
  }

  // -------------------------------
  // -- Markdown Generation
  // -------------------------------

  async function generateMarkdown() {
    info('Reading repo');

    const repoUrl = execSync('git config --get remote.origin.url').toString();

    const fetchArgs = opts.unshallow ? '--unshallow' : '';

    info(`Running git fetch ${fetchArgs}`)

    execSync(`git fetch ${fetchArgs}`);

    info('Reading unreleased commits');

    const logs = execSync(`
      git --no-pager log \
        --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr)%Creset' \
        --abbrev-commit \
        --date=relative \
        ${opts.base}..${opts.head}
    `);

    // Extract the Ticket numbers from the text

    const ticketRegex = new RegExp(`(${opts.jiraCode}-\\d+)`);

    const tickets = _.chain(logs)
      .split('\n')
      .filter(str => ticketRegex.test(str))
      .map(str => ticketRegex.exec(str)[1])
      .uniq()
      .value();

    if (!tickets.length) {
      info('No JIRA ticket information found');
      process.exit(0);
    } else {
      info(`${tickets.length} tickets found`);
    }

    // Log on to JIRA

    const jiraUsername = opts.jiraUsername || await question('JIRA Username: ');
    const jiraPassword = opts.jiraPassword ||  await question('JIRA Password:', '', { muted: true })

    const jira = new JiraClient({
      protocol: 'https',
      host: opts.jiraHost,
      username: jiraUsername,
      password: jiraPassword,
      apiVersion: '2',
      strictSSL: false
    });

    // Extract the titles of each ticket

    const summaries = {};

    for (const ticket of tickets) {
      info('Fetching ticket ' + ticket)
      try {
        const issue = await jira.findIssue(ticket);
        summaries[ticket] = _.trim(_.get(issue, 'fields.summary', ''));
      } catch (e) {
        if (e.statusCode !== 404) {
          throw e;
        } else {
          summaries[ticket] = '_Ticket information unavailable_'
        }
      }
    }

    // Output a markdown list

    info('generating markdown');

    const ticketList = _.map(tickets, ticket => `- [${ticket}](https://${opts.jiraHost}/browse/${ticket}) ${summaries[ticket]}`).join('\n');
    return new Markdown([
      `# Release notes ${REPO_NAME}`,
      `**Generated on:** ${new Date().toLocaleString()}`,
      `**Repository:** \`${repoUrl.trim()}\``,
      `## Tickets affected by this release`,
      `${ticketList}`
    ].join('\n\n'));
  }


  // -------------------------------
  // -- Trigger the generation
  // -------------------------------

  const markdown = await generateMarkdown();
  
  let results = { markdown };

  if (opts.pdf) {
    info('generating pdf');
    await markdown.toPDF(OUTPUT_PDF);
    results.pdf = path.resolve(OUTPUT_PDF);
    info(`File ${OUTPUT_PDF} generated`);
  } else {
    markdown.dump();
  }

  if (opts.clipboard) {
    clipboardy.writeSync(markdown);
    info(`Output copied to the clipboard`);
  }

  if (opts.emailTo) {
    info(`Emailing the release notes`);
    await (mailer(opts.sendgridApiKey).sendMarkdown(markdown, {
      to: opts.emailTo,
      subject: `[${REPO_NAME}] ${opts.emailSubject || 'Release notes'}`
    }));
  }

  return results;
}

module.exports = { execute }