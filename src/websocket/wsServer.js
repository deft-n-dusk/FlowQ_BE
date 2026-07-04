const { WebSocketServer } = require("ws");

const {
  getMetrics,
} = require("../services/metricsService");

function setupWebSocket(server) {
  const wss = new WebSocketServer({
    server,
  });

  wss.on("connection", (ws) => {
    const interval = setInterval(
      async () => {
        if (ws.readyState === ws.OPEN) {
          const metrics =
            await getMetrics();

          ws.send(
            JSON.stringify({
              type: "METRICS_UPDATE",
              data: metrics,
            })
          );
        }
      },
      2000
    );

    ws.on("close", () => {
      clearInterval(interval);
    });
  });
}

module.exports = { setupWebSocket };