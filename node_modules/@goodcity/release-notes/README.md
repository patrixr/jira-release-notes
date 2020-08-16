# Release Note Generator

This command line utility will generate release notes based on the commit messages

## How it works

It will

- Compare the live and master branches
- Find JIRA ticket references in the commits
- Fetch the JIRA ticket titles from JIRA
- Generate a Markdown list of all the tickets that have been affected

The generator will try it's best to determine the name of the project based on any `package.json` file or the git repo url. That can be overriden using the `--app-name <name>` option

## Advanced features

### Generating a PDF

The `--pdf` option can be used to generate a pdf file with all the release notes in it

### Copying to the clipboard

If the `--clipboard` option is present, the markdown will be copied to your clipboard

### Emailing the release notes

If the `--email-to` option is present, it will email the notes using sendgrid. _An api key is required_

e.g `--email-to "email@host.com,email2@host.com"`

The subject of the mail can be overriden using `--email-subject "Mail Subject"`

### Speficiying the commits to compare

By default, the generator will try to compare the `origin/master` branch to the `origin/live` branch.

That can be overriden to point to another branch or commit sha using the `--head <head>` and `--base <base>` options.

This is useful when hooking it up to github actions, the `pull_request` type provides variables such as `${{github.event.pull_request.head.sha}}` which can be used.


## Running the utility

`npx @goodcity/release-notes`

## Configuring

The tool can be run without any configurations, but specific JIRA and SENDGRID integrations can be configured via the following environment variables :

| Name             | Default value          | Description                     |
|------------------|------------------------|---------------------------------|
| SENDGRID_API_KEY | null                   | API Key used for mailing        |
| JIRA_HOST        | jira.crossroads.org.hk | The JIRA endpoint to connect to |
| JIRA_USERNAME    | _input request_        | The JIRA username               |
| JIRA_PASSWORD    | _input request_        | The JIRA passworld              |

### Options Overview

```bash
$> npx @goodcity/release-notes --help

Usage: @goodcity/release-notes [options]

Options:
  -V, --version              output the version number
  -p, --pdf                  ouputs to pdf
  -c, --clipboard            copies the markdown to your clipboard
  -h, --head <head>          The head ref or source branch (default: "origin/master")
  -b, --base <base>          The base ref or target branch (default: "origin/live")
  --email-to <email>         Recipients for the release notes
  --email-subject <subject>  Subject of the email
  --app-name <name>          Name of the app
  --jira-code <code>         Jira ticket code (default: "GCW")
  --unshallow                Unshallows a shallow repository before reading the commites
  --help                     display help for command
```

## Github action sample

Example: This will trigger a release email when a branch is merged into the `live` branch

```yaml
# This workflow will do a clean install of node dependencies, build the source code and run tests across different versions of node
# For more information see: https://help.github.com/actions/language-and-framework-guides/using-nodejs-with-github-actions

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
    - name: Use Node.js 12.x
      uses: actions/setup-node@v1
      with:
        node-version: 12.x
    - name: Generate and email notes
      run: npx @goodcity/release-notes --email-to "some@email.com" --head ${{github.event.pull_request.head.sha}} --base ${{github.event.pull_request.base.sha}} --email-subject "🚀 My App Release 🚀" --app-name "My App"
      env:
        JIRA_USERNAME: ${{secrets.jira_username}}
        JIRA_PASSWORD: ${{secrets.jira_password}}
        SENDGRID_API_KEY: ${{secrets.sendgrid_api_key}}

```
