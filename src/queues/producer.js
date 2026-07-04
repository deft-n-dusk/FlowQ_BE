const redis = require("../config/redis");
const Job = require("../models/Job");
const crypto = require("crypto");

const QUEUE = {
  high: "flq:queue:high",
  medium: "flq:queue:medium",
  low: "flq:queue:low",
};

async function createJob({ type, payload, priority = "medium", idempotencyKey }) {
  const jobId = crypto.randomUUID();

  //  ensure idempotency key exists
  const finalKey = idempotencyKey || crypto.randomUUID();

  // CHECK DUPLICATE 
  const existing = await Job.findOne({ idempotencyKey: finalKey });
  if (existing) {
    console.log("♻️ Duplicate job skipped via idempotencyKey");
    return existing;
  }

  if (!QUEUE[priority]) {
  throw new Error("Invalid priority");
}

  const job = await Job.create({
    jobId,
    idempotencyKey: finalKey,
    type,
    payload,
    priority,
    status: "pending",
  });

  const score = Date.now();

  await redis.zadd(QUEUE[priority], score, jobId);

  console.log(`📥 Job pushed: ${jobId}`);

  return job;
}

module.exports = { createJob };