const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: "ef3a044b4df3f5367a41556268e20c31-784975b6-cc2e9a64",
});

mg.messages
  .create("sandbox-123.mailgun.org", {
    from: "Excited User <mailgun@sandbox19d82d73144e4d36b073baf52274c86c.mailgun.org>",
    to: ["test@example.com"],
    subject: "Hello",
    text: "Testing some Mailgun awesomeness!",
    html: "<h1>Testing some Mailgun awesomeness!</h1>",
  })
  .then((msg) => console.log(msg)) // logs response data
  .catch((err) => console.log(err)); // logs any error
