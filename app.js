const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FlowQ API Running",
  });
});

app.use("/api/jobs", require("./src/routes/jobs"));
app.use("/api/dlq", require("./src/routes/dlq"));
app.use("/api/metrics", require("./src/routes/metrics"));
app.use("/api/workers", require("./src/routes/workers"));

module.exports = app;