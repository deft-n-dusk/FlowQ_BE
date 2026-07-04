const redis = require("../config/redis");

function startThroughputAggregator() {
  setInterval(async () => {
    try {
      const count = Number(
        await redis.get(
          "flq:metrics:processed:currentSecond"
        ) || 0
      );

      await redis.lpush(
        "flq:metrics:throughput", 
        count
      );

      await redis.ltrim(
        "flq:metrics:throughput",
        0,
        59
      );

      await redis.set(
        "flq:metrics:processed:currentSecond",
        0
      );
    } catch (err) {
      console.log(
        "Throughput Aggregator Error:",
        err.message
      );
    }
  }, 1000);
}

module.exports = {
  startThroughputAggregator,
};