const emailHandler = require("./emailHandler");
const pdfHandler = require("./pdfHandler");
const webhookHandler = require("./webhookHandler");
const paymentHandler = require("./paymentHandler");

module.exports = {
  SEND_EMAIL: emailHandler,
  GENERATE_PDF: pdfHandler,
  SEND_WEBHOOK: webhookHandler,
  PROCESS_PAYMENT: paymentHandler,
};