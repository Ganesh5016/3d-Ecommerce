const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'LUXE Store <noreply@luxe.com>',
    to,
    subject,
    html,
    text: text || html?.replace(/<[^>]*>/g, ''),
  });
};

module.exports = sendEmail;
