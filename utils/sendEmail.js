
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html) => {
  try {
    if (!to) {
      throw new Error("Student email address is required");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"TAiM AI Mentors" <${process.env.EMAIL_USER}>`,
      to,
      replyTo: process.env.EMAIL_USER,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Welcome email sent successfully:", info.messageId);
    console.log("Recipient:", to);

    return info;

  } catch (error) {
    console.error("Gmail sending failed:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
