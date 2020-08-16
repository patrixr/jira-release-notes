const _             = require('lodash');
const readline      = require('readline');
const { Writable }  = require('stream');
const notify        = require('debug')('input');

// -------------------------------
// -- Input Helpers
// -------------------------------

const mutableStdout = new Writable({
  write(chunk, encoding, callback) {
    if (!this.muted) process.stdout.write(chunk, encoding);
    callback();
  }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: mutableStdout,
  terminal: true
});

const question = (text, defaultAnswer, opts = {}) => new Promise((done) => {
  mutableStdout.muted = _.get(opts, 'muted', false);
  notify(`[please answer] ${text}`);
  rl.question('', (answer) => {
    mutableStdout.muted = false;
    done(answer || defaultAnswer)
  });
});


module.exports = { question };