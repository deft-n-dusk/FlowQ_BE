const redis = require("../config/redis");

async function getMetrics() {
  const [
    high,
    medium,
    low,
    delayed,
    dlq,
    processed,
    failed,
    throughputRaw,
  ] = await Promise.all([
    redis.zcard("flq:queue:high"),
    redis.zcard("flq:queue:medium"),
    redis.zcard("flq:queue:low"),
    redis.zcard("flq:queue:delayed"),
    redis.zcard("flq:dlq"),
    redis.get("flq:metrics:processed"),
    redis.get("flq:metrics:failed"),
    redis.lrange(
      "flq:metrics:throughput",
      0,
      59
    ),
  ]);

  return {
    queues: {
      high,
      medium,
      low,
      delayed,
      dlq,
    },

    totals: {
      processed: Number(
        processed || 0
      ),

      failed: Number(
        failed || 0
      ),
    },

    throughput: throughputRaw
      .reverse()
      .map(Number),
  };
}

module.exports = {
  getMetrics,
};