const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const logFilePath = path.join(logsDir, 'requests.log');

function writeLog(entry) {
  const line = JSON.stringify(entry) + '\n';
  console.log(line.trim());
  fs.appendFileSync(logFilePath, line, 'utf8');
}

function loggingMiddleware(req, res, next) {
  const requestId = uuidv4();
  const startTime = Date.now();
  req.requestId = requestId;

  writeLog({
    type: 'REQUEST',
    requestId,
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    body: req.body || null,
    ip: req.ip,
  });

  const originalJson = res.json.bind(res);
  let responseBody = null;

  res.json = function (body) {
    responseBody = body;
    return originalJson(body);
  };

  res.on('finish', () => {
    writeLog({
      type: 'RESPONSE',
      requestId,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseBody,
      duration: `${Date.now() - startTime}ms`,
    });
  });

  next();
}

module.exports = loggingMiddleware;
