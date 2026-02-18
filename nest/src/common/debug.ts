const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "debug.log");

function debugLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.log(message);
}

module.exports = { debugLog };
