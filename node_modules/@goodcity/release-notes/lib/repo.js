const _             = require('lodash');
const { execSync }  = require('child_process');
const fs            = require('fs');
const path          = require('path');

const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');

function getRepoName() {
  if (fs.existsSync(PACKAGE_JSON_PATH)) {
    const { name } = require(PACKAGE_JSON_PATH);
    return _.capitalize(name);
  }

  const gitUrl = execSync('git config --get remote.origin.url');
  const name = gitUrl.toString().match(/\/(.+)\.git/)[1];

  return name;
}

function getRepoVersion() {
  if (fs.existsSync(PACKAGE_JSON_PATH)) {
    const { version } = require(PACKAGE_JSON_PATH);
    return version;
  }

  return '?';
}

module.exports = { getRepoName, getRepoVersion };