const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderStatusEmail = async (email, name, orderId, status) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Your Order ${status} - SketchyArts`,
    html: `
      <h2>Hello ${name},</h2>
      <p>Your order <strong>${orderId}</strong> status is now: <b>${status}</b>.</p>
      <p>Thanks for shopping with SketchyArts!</p>
    `,
  });
};

module.exports = { sendOrderStatusEmail };
