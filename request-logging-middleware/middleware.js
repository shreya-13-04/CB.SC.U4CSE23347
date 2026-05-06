const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, 'requests.log');


function formatLogEntry(data) {
  return JSON.stringify(data) + '\n';
}


function writeLog(entry) {
  const formatted = formatLogEntry(entry);
  // Write to console
  console.log(formatted.trim());
  // Append to log file
  fs.appendFileSync(logFilePath, formatted, 'utf8');
}


function loggingMiddleware(req, res, next) {
  const requestId = uuidv4();
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Capture request body
  let requestBody = '';
  req.on('data', (chunk) => {
    requestBody += chunk.toString();
  });

  // Attach request ID to request object for downstream use
  req.requestId = requestId;

  // Log incoming request
  const requestLog = {
    type: 'REQUEST',
    requestId,
    timestamp,
    method: req.method,
    url: req.originalUrl || req.url,
    headers: req.headers,
    body: (() => {
      try {
        return JSON.parse(requestBody || '{}');
      } catch {
        return requestBody || null;
      }
    })(),
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'] || null,
  };

  writeLog(requestLog);

  // Intercept response to log it
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  let responseBody = null;

  res.json = function (body) {
    responseBody = body;
    return originalJson(body);
  };

  res.send = function (body) {
    if (responseBody === null) {
      try {
        responseBody = JSON.parse(body);
      } catch {
        responseBody = body;
      }
    }
    return originalSend(body);
  };

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const responseLog = {
      type: 'RESPONSE',
      requestId,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseBody,
      duration: `${duration}ms`,
    };
    writeLog(responseLog);
  });

  next();
}

module.exports = loggingMiddleware;
