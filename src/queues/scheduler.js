const redis = require("../config/redis");

const Job = require("../models/Job");

async function runScheduler() {
  console.log("⏰ Scheduler started...");

  while (true) {
    try {
      const now = Date.now();

      const jobs =
        await redis.zrangebyscore(
          "flq:queue:delayed",
          0,
          now
        );

      for (const jobId of jobs) {
        const removed = await redis.zrem(
          "flq:queue:delayed",
          jobId
        );

        if (!removed) continue;

        const job = await Job.findOne({
          jobId,
        });

        if (!job) continue;

        const queueKey = `flq:queue:${job.priority}`;

        await redis.zadd(
          queueKey,
          Date.now(),
          jobId
        );

        await Job.updateOne(
          { jobId },
          {
            status: "pending",
            nextRetryAt: null,
          }
        );

        console.log(
          `🔁 Moved back: ${jobId}`
        );
      }
    } catch (err) {
      console.log(
        "Scheduler error:",
        err.message
      );
    }

    await sleep(1000);
  }
}

function sleep(ms) {
  return new Promise((r) =>
    setTimeout(r, ms)
  );
}

module.exports = { runScheduler };