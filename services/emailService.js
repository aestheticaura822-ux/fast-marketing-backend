const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendContactEmail = async (formData) => {
  const { name, email, phone, service, message } = formData;

  const transporter = createTransporter();

  // Email to Admin
  const adminMailOptions = {
    from: `"Fast Marketing" <${process.env.EMAIL_USER}>`,
    to: process.env.RECIPIENT_EMAIL,
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
          .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #dc2626; }
          .value { margin-top: 5px; padding: 10px; background: #f9f9f9; border-radius: 5px; }
          .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📬 New Contact Form Submission</h2>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">👤 Name:</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">📧 Email:</div>
              <div class="value">${email}</div>
            </div>
            <div class="field">
              <div class="label">📞 Phone:</div>
              <div class="value">${phone || 'Not provided'}</div>
            </div>
            <div class="field">
              <div class="label">🎯 Service Required:</div>
              <div class="value">${service}</div>
            </div>
            <div class="field">
              <div class="label">💬 Message:</div>
              <div class="value">${message}</div>
            </div>
          </div>
          <div class="footer">
            <p>Fast Marketing & Advertising International</p>
            <p>This message was sent from your website contact form.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  // Auto-reply to User
  const userMailOptions = {
    from: `"Fast Marketing" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Thank you for contacting Fast Marketing, ${name}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
          .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 20px; }
          .btn { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 50px; margin-top: 20px; }
          .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>⚡ Thank You for Reaching Out!</h2>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for contacting <strong>Fast Marketing & Advertising International</strong>. We have received your inquiry and our team will get back to you within <strong>24 hours</strong>.</p>
            <p>Here's what you submitted:</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 10px; margin: 15px 0;">
              <p><strong>Service:</strong> ${service}</p>
              <p><strong>Message:</strong> ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}</p>
            </div>
            <p>In the meantime, feel free to:</p>
            <ul>
              <li>📞 Call us at <strong>+92 321 0846667</strong></li>
              <li>💬 WhatsApp us at <strong>+92 325 2467463</strong></li>
              <li>🌐 Visit our website for more information</li>
            </ul>
            <a href="https://your-website.com" class="btn">Visit Our Website</a>
          </div>
          <div class="footer">
            <p>© 2025 Fast Marketing & Advertising International</p>
            <p>101A, J1 Block, Valencia Town, Defence Road, Lahore, Pakistan</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(adminMailOptions);
  await transporter.sendMail(userMailOptions);

  return { success: true };
};

module.exports = { sendContactEmail };