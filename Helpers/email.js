const nodemailer = require('nodemailer');

//credentials for gmail
const email = process.env.EMAIL;
const password = process.env.PASSWORD;

exports.sendEmail = async (recipient, message) => {
  const data = {
    from: `iCook <${email}>`,
    to: recipient,
    subject: message.subject,
    text: message.text
  };
  //configuring nodemailer transport service using gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: email ,
        pass: password
    }
    });

   // send email
transporter.sendMail(data, (error, response) => {
    if (error) {
        new Error("An error occured! Please try again");
    }
});

};
