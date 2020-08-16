const sgMail    = require('@sendgrid/mail');

module.exports = function mailer(apiKey = process.env.SENDGRID_API_KEY) {
  /**
   * Sends markdown as an email
   *
   * @param {Markdown} md
   * @param {object} params
   * @returns
   */
  function sendMarkdown(md, params) {
    if (!apiKey) {
      throw 'Sendgrid api key is missing';
    }

    sgMail.setApiKey(apiKey);
    
    const msg = {
      to: params.to.split(','),
      from: params.from || 'deployer@goodcity.hk',
      subject: params.subject || 'Release Notes',
      html: md.toHTML()
    };

    return sgMail.send(msg);
  }

  return { sendMarkdown };
}