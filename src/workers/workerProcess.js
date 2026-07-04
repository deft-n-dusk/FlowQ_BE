require("dotenv").config();
const redis = require("../config/redis");

const {
  getNextJob,
  processJob,
} = require("../queues/consumer");

const WORKER_ID = `worker-${process.pid}`;
const CONCURRENCY = 3; 

async function runWorker() {
  console.log(
    `👷 Worker started: ${WORKER_ID} with ${CONCURRENCY} concurrent lanes`
  );

  setInterval(async () => {
    const now = Date.now();
    
    await redis.hset(`flq:worker:${WORKER_ID}`, {
      status: "active",
      lastHeartbeat: now,
    });

    for (let i = 0; i < CONCURRENCY; i++) {
      await redis.hset(`flq:worker:${WORKER_ID}-lane-${i}`, {
        status: "active",
        lastHeartbeat: now,
      });
    }
  }, 5000);

  for (let i = 0; i < CONCURRENCY; i++) {
    startWorkerLane(`${WORKER_ID}-lane-${i}`);
  }
}

async function startWorkerLane(laneId) {
  while (true) {
    try {
      const next = await getNextJob();

      if (!next) {
        await sleep(1000); 
        continue;
      }

      await redis.hset(`flq:worker:${laneId}`, {
        currentJob: next.jobId,
      });

      await processJob(next.jobId, laneId);

      await redis.hincrby(`flq:worker:${WORKER_ID}`, "jobsProcessed", 1);

      await redis.hset(`flq:worker:${laneId}`, {
        currentJob: "",
      });
    } catch (err) {
      console.log(`Worker lane ${laneId} error:`, err.message);
      await sleep(2000);
    }
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = {
  runWorker,
};