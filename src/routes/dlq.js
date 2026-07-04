const express = require("express");

const router = express.Router();

const redis = require("../config/redis");

const Job = require("../models/Job");

const { createJob } = require("../queues/producer");

// GET DLQ JOBS
router.get("/", async (req, res) => {
  try {
    const ids = await redis.zrange(
      "flq:dlq",
      0,
      -1
    );

    const jobs = await Job.find({
      jobId: { $in: ids },
    }).sort({
      failedAt: -1,
    });

    return res.json({
      success: true,
      jobs,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

// REPLAY JOB
router.post(
  "/:jobId/replay",
  async (req, res) => {
    try {
      const oldJob =
        await Job.findOne({
          jobId: req.params.jobId,
        });

      if (!oldJob) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      await redis.zrem(
        "flq:dlq",
        oldJob.jobId
      );

      const replayed =
        await createJob({
          type: oldJob.type,
          payload: oldJob.payload,
          priority: oldJob.priority,
          idempotencyKey: `replay-${Date.now()}-${oldJob.jobId}`,
        });

      return res.json({
        success: true,
        replayed,
      });
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      });
    }
  }
);

// DELETE JOB FROM DLQ
router.delete(
  "/:jobId",
  async (req, res) => {
    try {
      await redis.zrem(
        "flq:dlq",
        req.params.jobId
      );

      return res.json({
        success: true,
      });
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      });
    }
  }
);

module.exports = router;