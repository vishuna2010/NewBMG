const nodemailer = require('nodemailer');

// Function to create a transporter.
// For development, it can generate test credentials from Ethereal.email
// or use pre-configured Ethereal/Mailtrap/Gmail credentials from .env
const createTransporter = async () => {
  let transporter;

  // Option 1: Use pre-configured Ethereal/Mailtrap/Gmail from .env (Recommended for consistent testing inbox)
  // You would set these in your .env file
  // Example for Mailtrap:
  // EMAIL_HOST=smtp.mailtrap.io
  // EMAIL_PORT=2525 (or 587, 465)
  // EMAIL_USER=your_mailtrap_user
  // EMAIL_PASS=your_mailtrap_pass
  // EMAIL_FROM='"Your App Name" <from@example.com>'

  // Example for Gmail (less secure, needs "less secure app access" or app password):
  // EMAIL_SERVICE=gmail
  // EMAIL_USER=your_gmail_address@gmail.com
  // EMAIL_PASS=your_gmail_app_password
  // EMAIL_FROM='"Your App Name" <your_gmail_address@gmail.com>'


  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10), // Default to 587 if not specified
      secure: (process.env.EMAIL_PORT === '465'), // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // tls: {
      //   // do not fail on invalid certs (for some local dev setups or self-signed certs)
      //   rejectUnauthorized: process.env.NODE_ENV === 'production'
      // }
    });
  } else if (process.env.EMAIL_SERVICE === 'gmail' && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
  } else {
    // Option 2: Generate test account from Ethereal.email on the fly if no config found
    // This is good for quick tests but inbox URL changes each time server restarts
    console.log('No pre-configured email transport found in .env. Generating Ethereal test account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log('Ethereal test account created.');
      console.log('------------------------------------');
      console.log('Ethereal User:', testAccount.user);
      console.log('Ethereal Pass:', testAccount.pass);
      console.log('------------------------------------');
      // Preview URL will be shown in console when an email is actually sent using this account

      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
    } catch (err) {
      console.error('Failed to create Ethereal test account:', err);
      // Fallback to a simple console log if Ethereal fails
      return {
        sendMail: async (mailOptions) => {
          console.log("--- CONSOLE EMAIL (Ethereal failed) ---");
          console.log("To:", mailOptions.to);
          console.log("From:", mailOptions.from);
          console.log("Subject:", mailOptions.subject);
          console.log("Text:", mailOptions.text);
          if(mailOptions.html) console.log("HTML:", mailOptions.html);
          console.log("-------------------------------------");
          return { messageId: `console-${Date.now()}`};
        }
      };
    }
  }
  return transporter;
};

// Function to send an email
// options: { to: String, subject: String, text: String, html: String }
const sendEmail = async (options) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Insurance Platform" <noreply@insuranceplatform.example>', // Sender address
      to: options.to, // List of receivers
      subject: options.subject, // Subject line
      text: options.text, // Plain text body
      html: options.html, // HTML body
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account generated on the fly
    if (transporter.options && transporter.options.host === 'smtp.ethereal.email' && nodemailer.getTestMessageUrl(info)) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Re-throw to be handled by caller
  }
};

module.exports = sendEmail;
