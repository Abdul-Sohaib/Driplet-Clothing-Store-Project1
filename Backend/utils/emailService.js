const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send verification email
const sendVerificationEmail = async (to, code) => {
  const mailOptions = {
    from: `"Driplet Auth" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Verification Code",
    html: `
      <div style="font-family: sans-serif; font-size: 16px;">
        <h2>Hello 👋</h2>
        <p>Here is your verification code to reset your password:</p>
        <h1 style="color: #6B46C1;">${code}</h1>
        <p>This code will expire in 10 minutes.</p>
        <br/>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p>— The Driplet Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Export function
module.exports = { sendVerificationEmail };
