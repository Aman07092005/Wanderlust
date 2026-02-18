const nodemailer = require("nodemailer");

async function sendEmail(to, subject, message){

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: message
  });

  console.log("Email sent");
}

module.exports = sendEmail;
