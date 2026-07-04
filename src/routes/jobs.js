const express = require("express");

const router = express.Router();

const Job = require("../models/Job");

const { createJob } = require("../queues/producer");

// CREATE JOB
router.post("/", async (req, res) => {
  try {
    const {
      type,
      payload,
      priority,
      idempotencyKey,
    } = req.body;

    if (!type) {
      return res.status(400).json({
        message: "Job type required",
      });
    }

    const allowedTypes = [
      "SEND_EMAIL",
      "GENERATE_PDF",
      "SEND_WEBHOOK",
      "PROCESS_PAYMENT",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid job type",
      });
    }

    const job = await createJob({
      type,
      payload,
      priority,
      idempotencyKey,
    });

    return res.status(201).json({
      success: true,
      job,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

// GET ALL JOBS
router.get("/", async (req, res) => {
  try {
    const { status, priority, type } =
      req.query;

    const filter = {};

    if (status) filter.status = status;

    if (priority)
      filter.priority = priority;

    if (type) filter.type = type;

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

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

// GET SINGLE JOB
router.get("/:jobId", async (req, res) => {
  try {
    const job = await Job.findOne({
      jobId: req.params.jobId,
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    return res.json({
      success: true,
      job,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

// DELETE SINGLE JOB
router.delete("/:jobId", async (req, res) => {
  try {
    const deletedJob = await Job.findOneAndDelete({ 
      jobId: req.params.jobId 
    });

    if (!deletedJob) {
      return res.status(404).json({ 
        message: "Job not found" 
      });
    }

    return res.json({ 
      success: true, 
      message: "Job deleted successfully" 
    });
  } catch (err) {
    return res.status(500).json({ 
      message: err.message 
    });
  }
});

module.exports = router;