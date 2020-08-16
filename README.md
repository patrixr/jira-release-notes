# Jira Release Notes

This action generates release notes based on JIRA ticket numbers found in commits, and creates a PDF file. It can also email you the notes.

Built as part of the [#ActionsHackathon](https://dev.to/devteam/announcing-the-github-actions-hackathon-on-dev-3ljn)

# How it works

You need to provide 2 refs to the action, `head` and `base`. The action steps are as followed:

1. Fetch all the commits between the `head` and `base` refs
2. Find any reference to JIRA ticket numbers, based on the `jira-code` you provide
3. Will fetch the ticket titles using the `jira-host`, `jira-username` and `jira-password` you provide
4. Will generate a pdf with the list of changed tickets, and output the file path under the `pdf` variable
5. (OPTIONAL) If the `email-to` and `sendgrid-api-key` are provided, and email will be sent with the notes

## Intended usage

This action can compare any 2 refs (head and base). For example you could compare 2 branches together.

But the action was designed to work with github pull requests.

For example, when merging into your 'live' branch, you can push out emails to the team.

Github actions, when triggered on pull requests, provide the two SHAs needed to make the comparison:

- `github.event.pull_request.head.sha`
- `github.event.pull_request.head.sha`

You can find an example below on how to use those.

More information can be found [here](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#pull_request)

## Important

`actions/checkout@v2` creates a shallow clone of the repository by default. Which might not contain all the refs required to generate the notes. Make sure to clone a full repo, or set the `unshallow` property to true as shown below

## Inputs

### head

**Required** The head ref or source branch

### base

**Required** The base ref or source branch

### jira-code

**Required** Jira ticket code e.g ABC

### jira-host

**Required** Jira host e.g jira.mycompany.com

### jira-username

**Required** Jira username

### jira-password

**Required** Jira password

### email-to

Recipients for the release notes

### sendgrid-api-key

Sendgrid API key (required for emails)

### email-subject

Subject of the release email

### app-name

Name of the app or service

### unshallow

If set to true, will unshallow the repository before fetching the commits, default: false

## Outputs

### `pdf`

The path of the generated pdf

## Example usage

```yaml
name: Forward release notes

on:
  pull_request:
    types: [closed]
    branches:
      - live

jobs:
  release-notes:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    steps:
    - uses: actions/checkout@v2
    - name: Generate and email notes
      uses: actions/jira-release-notes@v1.0.1
      id: pdf_generator
      with:
        head: ${{github.event.pull_request.head.sha}}
        base: ${{github.event.pull_request.base.sha}}
        jira-code: 'ABC'
        jira-host: jira.mycompany.org
        jira-username: ${{secrets.jira_username}}
        jira-password: ${{secrets.jira_password}}
        email-to: 'john@mycompany.org,jane@mycompany.org'
        sendgrid-api-key: ${{secrets.sendgrid_api_key}}
        app-name: 'My Awesome Service'
        unshallow: true
    - name: Process the pdf
      run: echo "The generated pdf was ${{ steps.pdf_generator.outputs.pdf }}"
        
```