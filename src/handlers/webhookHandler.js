module.exports = async function webhookHandler(payload) {
  await new Promise((r) => setTimeout(r, 300));

  if (Math.random() < 0.2) {
    throw new Error("Webhook failed");
  }

  console.log("🔗 Webhook sent");

  return true;
};