const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "atm.zmn95@gmail.com",
    subject: "We're going to miss you...",
    text: `Proshai, pirozhok. ${name}, what can we make to keep you?`,
  });
};

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "atm.zmn95@gmail.com",
    subject: "Thanks for joining in!",
    text: `Welcome to the app, ${name}. Let me know how you get along with the app`,
  });
};

module.exports = {
  sendCancelationEmail,
  sendWelcomeEmail,
};
