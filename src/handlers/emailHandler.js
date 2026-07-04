module.exports = async function emailHandler(payload) {
  await new Promise((r) => setTimeout(r, 500));

  if (Math.random() < 0.3) {
    throw new Error("Email failed (simulated)");
  }

  console.log("📧 Email sent to:", payload.to);

  return true;
};