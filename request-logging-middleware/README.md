# Logging Middleware

An Express.js HTTP request/response logging middleware that captures and persists structured logs for every API call.

## Features

-  Unique `requestId` (UUID v4) per request for tracing
-  ISO timestamp for each request and response
-  Logs HTTP method, URL, headers, body, and client IP
-  Logs response status code, body, and duration (ms)
-  Persists logs to `./logs/requests.log` (JSON lines format)
-  Simultaneously prints to console

## Installation

```bash
npm install
```

## Usage

```bash
# Start demo server
npm start

# Development with auto-reload
npm run dev
```

## Using the Middleware in Your App

```js
const loggingMiddleware = require('./middleware');
const express = require('express');

const app = express();
app.use(express.json());
app.use(loggingMiddleware);  // ← plug in here

// your routes ...
```

## Log Format

Each log entry is a JSON line written to `logs/requests.log`:

### Request Log
```json
{
  "type": "REQUEST",
  "requestId": "uuid-v4",
  "timestamp": "2026-05-06T08:30:00.000Z",
  "method": "POST",
  "url": "/api/notify",
  "headers": { "content-type": "application/json" },
  "body": { "userId": "123" },
  "ip": "::1",
  "userAgent": "Mozilla/5.0"
}
```

### Response Log
```json
{
  "type": "RESPONSE",
  "requestId": "uuid-v4",
  "timestamp": "2026-05-06T08:30:00.050Z",
  "method": "POST",
  "url": "/api/notify",
  "statusCode": 200,
  "responseBody": { "success": true },
  "duration": "50ms"
}
```

## Demo Endpoints

| Method | Route        | Description              |
|--------|--------------|--------------------------|
| GET    | `/`          | Health + requestId echo  |
| GET    | `/health`    | Server uptime            |
| POST   | `/echo`      | Echoes request body      |
| GET    | `/error-demo`| Simulates a 500 error    |
