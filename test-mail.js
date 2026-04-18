const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'waseemamber33@gmail.com',
      pass: 'tukfpbsghiirocxz'  // spaces nahi
    }
  });

  try {
    let info = await transporter.sendMail({
      from: '"Fast Marketing" <waseemamber33@gmail.com>',
      to: 'aestheticaura822@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email from Fast Marketing Backend!'
    });
    console.log('✅ Email sent!', info.messageId);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testEmail();