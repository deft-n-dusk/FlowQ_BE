require("dotenv").config();

const http = require("http");

const app = require("./app");

const connectDB = require("./src/config/db");

const {
  startThroughputAggregator,
} = require(
  "./src/services/throughputAggregator"
);

const {
  runWorker,
} = require("./src/workers/workerProcess");

const {
  runScheduler,
} = require("./src/queues/scheduler");

const {
  setupWebSocket,
} = require("./src/websocket/wsServer");

connectDB();

const server = http.createServer(app);

setupWebSocket(server);

server.listen(process.env.PORT, () => {
  console.log(
    `🚀 FlowQ running on port ${process.env.PORT}`
  );
});

runWorker();

runScheduler();

startThroughputAggregator();