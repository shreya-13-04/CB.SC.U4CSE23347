# Campus Notification Microservice – Backend

A full-featured Node.js/Express backend for the Affordmed Campus Notification Platform.

## Features

- ✅ **JWT Authentication** – Register & Login with BCrypt password hashing
- ✅ **Full CRUD Notifications API** – GET, POST, PATCH, DELETE
- ✅ **Real-time WebSocket** – Socket.IO pushes live notification events
- ✅ **Role-based Access** – Admin-only notification creation
- ✅ **Evaluation API Integration** – Seeds notifications from external service
- ✅ **Logging Middleware** – Every request/response logged with unique requestId

## Project Structure

```
notification_app_be/
├── src/
│   ├── index.js               # Entry point (Express + Socket.IO)
│   ├── middleware/
│   │   ├── auth.js            # JWT auth + socket auth
│   │   └── logger.js          # Request/response logging
│   ├── models/
│   │   ├── user.js            # In-memory user store
│   │   └── notification.js    # In-memory notification store
│   └── routes/
│       ├── auth.js            # /auth/register, /auth/login
│       └── notifications.js   # /notifications CRUD
├── .env
├── package.json
└── README.md
```

## Setup & Run

```bash
npm install
# Edit .env → set AUTH_TOKEN if needed
npm start       # Production
npm run dev     # Development (nodemon)
```

## API Endpoints

| Method | Endpoint                          | Auth     | Description              |
|--------|-----------------------------------|----------|--------------------------|
| POST   | `/api/v1/auth/register`           | No       | Register new user        |
| POST   | `/api/v1/auth/login`              | No       | Login → get JWT token    |
| GET    | `/api/v1/notifications`           | Bearer   | Get all notifications    |
| GET    | `/api/v1/notifications/:id`       | Bearer   | Get one by ID            |
| POST   | `/api/v1/notifications`           | Admin    | Create notification      |
| PATCH  | `/api/v1/notifications/read-all`  | Bearer   | Mark all as read         |
| PATCH  | `/api/v1/notifications/:id/read`  | Bearer   | Mark one as read         |
| DELETE | `/api/v1/notifications/:id`       | Bearer   | Delete notification      |
| GET    | `/health`                         | No       | Health check             |

## WebSocket Events

```
Connection: ws://localhost:5000
Auth: { token: "Bearer <jwt>" }

Events:
  notification:new   ← Server pushes new notification
  notification:read  → Client marks as read
```

## Example Usage

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Shreya","email":"shreya@campus.edu","password":"pass123","role":"admin"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"shreya@campus.edu","password":"pass123"}'

# Get Notifications
curl http://localhost:5000/api/v1/notifications \
  -H "Authorization: Bearer <token>"
```
