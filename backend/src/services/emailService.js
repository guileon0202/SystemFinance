const nodemailer = require('nodemailer');

// Cria o "transportador" de e-mail usando as credenciais do .env e o Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

module.exports = transporter;