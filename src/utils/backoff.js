function getBackoffDelay(attempt) {
  // exponential backoff
  const delay = Math.pow(2, attempt) * 1000; // ms
  return Math.min(delay, 60000); // cap 60s
}

module.exports = { getBackoffDelay };