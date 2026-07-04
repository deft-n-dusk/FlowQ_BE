const express = require("express");

const router = express.Router();

const {
  getMetrics,
} = require("../services/metricsService");

router.get("/", async (req, res) => {
  try {
    const metrics = await getMetrics();

    return res.json({
      success: true,
      ...metrics,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;