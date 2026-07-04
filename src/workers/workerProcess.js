require("dotenv").config();

const redis = require("../config/redis");

const {
  getNextJob,
  processJob,
} = require("../queues/consumer");

const WORKER_ID = `worker-${process.pid}`;

async function runWorker() {
  console.log(
    `👷 Worker started: ${WORKER_ID}`
  );

setInterval(async () => {
  await redis.hset(
    `flq:worker:${WORKER_ID}`,
    {
      status: "active",
      lastHeartbeat: Date.now(),
    }
  );
}, 5000);

  while (true) {
    try {
      const next = await getNextJob();

      if (!next) {
        await sleep(1000);
        continue;
      }

      await redis.hset(
        `flq:worker:${WORKER_ID}`,
        {
          currentJob: next.jobId,
        }
      );

      await processJob(
        next.jobId,
        WORKER_ID
      );

      await redis.hincrby(
        `flq:worker:${WORKER_ID}`,
        "jobsProcessed",
        1
      );

      await redis.hset(
        `flq:worker:${WORKER_ID}`,
        {
          currentJob: "",
        }
      );
    } catch (err) {
      console.log(
        "Worker error:",
        err.message
      );

      await sleep(2000);
    }
  }
}

function sleep(ms) {
  return new Promise((r) =>
    setTimeout(r, ms)
  );
}

module.exports = {
  runWorker,
};