const express = require("express");

const router = express.Router();

const redis = require("../config/redis");

router.get("/", async (req, res) => {
  try {
    const keys = await redis.keys("flq:worker:*");

    const workers = await Promise.all(
      keys.map(async (key) => {
        const data = await redis.hgetall(key);

        const workerId = key.replace(
          "flq:worker:",
          ""
        );

        const lastHeartbeat = Number(
          data.lastHeartbeat || 0
        );

        return {
          workerId,
          status: data.status,
          currentJob: data.currentJob || null,
          jobsProcessed: Number(
            data.jobsProcessed || 0
          ),
          lastHeartbeat,
          isAlive:
            Date.now() - lastHeartbeat < 10000,
        };
      })
    );

    return res.json({
      success: true,
      workers,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;