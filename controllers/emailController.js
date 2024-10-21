require("dotenv").config();
const formData = require("form-data");
const Mailgun = require("mailgun.js");

// Set up Mailgun client
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

console.log("Mailgun API Key: ", process.env.MAILGUN_API_KEY);
console.log("Mailgun Domain: ", process.env.MAILGUN_DOMAIN);

// Function to send email using Mailgun
exports.sendEmail = async (req, res) => {
  const { to, subject, text, html } = req.body;

  console.log("Mailgun API Key: ", process.env.MAILGUN_API_KEY);
  console.log("Mailgun Domain: ", process.env.MAILGUN_DOMAIN);

  console.log("To: ", to);
  console.log("Subject: ", subject);
  console.log("Text: ", text);
  console.log("HTML: ", html);

  try {
    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: "Excited User <mailgun@sandbox19d82d73144e4d36b073baf52274c86c.mailgun.org>",
      to: [to],
      subject: subject || "Hello",
      text: text || "Testing some Mailgun awesomness!",
      html: html || "<h1>Testing some Mailgun awesomness!</h1>",
    });

    console.log("Email sent successfully: ", response);

    res.status(200).json({
      message: "Email sent successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send email",
      error: error.message,
    });
  }
};
