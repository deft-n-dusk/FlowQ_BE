module.exports = async function paymentHandler(payload) {
  await new Promise((r) => setTimeout(r, 700));

  if (Math.random() < 0.25) {
    throw new Error("Payment failed");
  }

  console.log("💳 Payment processed");

  return true;
};