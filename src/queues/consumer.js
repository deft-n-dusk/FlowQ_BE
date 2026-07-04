const redis = require("../config/redis");
const Job = require("../models/Job");

const HANDLERS = require("../handlers");

const {
  isAlreadyProcessed,
  markProcessed,
} = require("../utils/idempotency");

const { getBackoffDelay } = require("../utils/backoff");

const QUEUES = [
  "flq:queue:high",
  "flq:queue:medium",
  "flq:queue:low",
];

async function getNextJob() {
  for (const queue of QUEUES) {
    const result = await redis.zpopmin(queue, 1);

    if (result.length > 0) {
      return {
        jobId: result[0],
        queue,
      };
    }
  }

  return null;
}

async function processJob(jobId, workerId) {
  const job = await Job.findOne({ jobId });

  if (!job) return;

  // IDEMPOTENCY
  const alreadyDone = await isAlreadyProcessed(
    job.idempotencyKey
  );

  if (alreadyDone) {
    await Job.updateOne(
      { jobId },
      {
        status: "completed",
        completedAt: new Date(),
        lastError: null,
        nextRetryAt: null,
        failedAt: null,
        processedBy: workerId,
      }
    );

    return;
  }

  // MARK PROCESSING
  await Job.updateOne(
    { jobId },
    {
      status: "processing",
      startedAt: new Date(),
      processedBy: workerId,
    }
  );

  const handler = HANDLERS[job.type];

  if (!handler) {
    throw new Error(`No handler for ${job.type}`);
  }

  try {
    await handler(job.payload);

    await markProcessed(job.idempotencyKey);

    await Job.updateOne(
      { jobId },
      {
        status: "completed",
        completedAt: new Date(),
        lastError: null,
        nextRetryAt: null,
        failedAt: null,
        processedBy: workerId,
      }
    );

    await redis.incr("flq:metrics:processed");

    await redis.incr(
      "flq:metrics:processed:currentSecond"
    );

    console.log(`✅ Completed: ${jobId}`);
  } catch (err) {

    const attempts = (job.attempts || 0) + 1;

    // DLQ
    if (attempts >= job.maxAttempts) {
      await Job.updateOne(
        { jobId },
        {
          status: "dead",
          attempts,
          lastError: err.message,
          failedAt: new Date(),
        }
      );

      await redis.zadd(
        "flq:dlq",
        Date.now(),
        jobId
      );

      // METRICS
      await redis.incr("flq:metrics:failed");

      console.log(`💀 DLQ: ${jobId}`);

      return;
    }

    // RETRY
    const delay = getBackoffDelay(attempts);

    const retryAt = Date.now() + delay;

    await Job.updateOne(
      { jobId },
      {
        status: "delayed",
        attempts,
        lastError: err.message,
        nextRetryAt: new Date(retryAt),
      }
    );

    await redis.zadd(
      "flq:queue:delayed",
      retryAt,
      jobId
    );

    console.log(
      `🔄 Retry scheduled: ${jobId}`
    );
  }
}

module.exports = {
  getNextJob,
  processJob,
};