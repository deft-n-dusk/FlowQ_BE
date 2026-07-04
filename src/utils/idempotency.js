const redis = require("../config/redis");

async function isAlreadyProcessed(idempotencyKey) {
  const val = await redis.get(
    `flq:idempotency:${idempotencyKey}`
  );

  return val !== null;
}

async function markProcessed(idempotencyKey) {
  await redis.set(
    `flq:idempotency:${idempotencyKey}`,
    "processed",
    "EX",
    86400
  );
}

module.exports = {
  isAlreadyProcessed,
  markProcessed,
};