const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    // Identity
    jobId: {
      type: String,
      required: true,
      unique: true,
    },

    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
    },

    // Type
    type: {
      type: String,
      required: true,
      enum: [
        "SEND_EMAIL",
        "GENERATE_PDF",
        "SEND_WEBHOOK",
        "PROCESS_PAYMENT",
      ],
    },

    payload: {
      type: Object,
      default: {},
    },

    // Priority
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },

    // Status
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "delayed",
        "dead",
        "replayed",
        "discarded",
      ],
      default: "pending",
    },

    // Retry
    attempts: {
      type: Number,
      default: 0,
    },

    maxAttempts: {
      type: Number,
      default: 5,
    },

    lastError: {
      type: String,
      default: null,
    },

    nextRetryAt: {
      type: Date,
      default: null,
    },

    // Worker
    processedBy: {
      type: String,
      default: null,
    },

    // Timing
    startedAt: Date,

    completedAt: Date,

    failedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Job",
  jobSchema
);