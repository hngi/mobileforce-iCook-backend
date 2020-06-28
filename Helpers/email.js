const Mailgun = require('mailgun-js');

const apiKey = process.env.MAILGUN_API_KEY;
const domain = process.env.MAILGUN_DOMAIN;
const mailgun = new Mailgun({ apiKey: apiKey, domain: domain });

exports.sendEmail = async (recipient, message) => {
  const data = {
    from: 'iCook <info@mg.iCook.live>',
    to: recipient,
    subject: message.subject,
    text: message.text
  };

  await mailgun.messages().send(data);
};
