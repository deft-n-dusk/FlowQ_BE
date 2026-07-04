function info(message, meta = {}) {
  console.log(
    JSON.stringify({
      level: "info",
      message,
      ...meta,
      timestamp: new Date().toISOString(),
    })
  );
}

function error(message, meta = {}) {
  console.log(
    JSON.stringify({
      level: "error",
      message,
      ...meta,
      timestamp: new Date().toISOString(),
    })
  );
}

module.exports = {
  info,
  error,
};