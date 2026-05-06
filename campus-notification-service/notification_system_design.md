# Stage 1

## Notification System Design – REST API Contract

---

## Overview

The Campus Notification Platform delivers real-time updates to students regarding **Placements**, **Events**, and **Results**. This document defines the complete REST API contract, JSON schemas, and real-time notification mechanism.

---

## Base URL

```
http://localhost:5000/api/v1
```

---

## Authentication

All protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

---

## API Endpoints

### 1. Get All Notifications

**GET** `/notifications`

Retrieves all notifications for the authenticated user.

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid-v4",
        "type": "placement",
        "title": "Campus Drive – Google",
        "message": "Google is visiting campus on 10th May 2026.",
        "category": "Placements",
        "isRead": false,
        "createdAt": "2026-05-06T08:00:00.000Z",
        "userId": "user-uuid"
      }
    ],
    "unreadCount": 3,
    "total": 10
  }
}
```

---

### 2. Get Notification by ID

**GET** `/notifications/:id`

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "type": "event",
    "title": "Hackathon 2026",
    "message": "Register for Hackathon 2026 by 8th May.",
    "category": "Events",
    "isRead": false,
    "createdAt": "2026-05-06T08:00:00.000Z",
    "userId": "user-uuid"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Notification not found"
}
```

---

### 3. Create Notification (Admin)

**POST** `/notifications`

**Request Headers:**
```json
{
  "Authorization": "Bearer <admin_token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "type": "result",
  "title": "Semester Results Published",
  "message": "Your semester 4 results are now available.",
  "category": "Results",
  "targetUserIds": ["user-uuid-1", "user-uuid-2"]
}
```

**JSON Schema (Request):**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["type", "title", "message", "category"],
  "properties": {
    "type": {
      "type": "string",
      "enum": ["placement", "event", "result", "general"]
    },
    "title": {
      "type": "string",
      "minLength": 3,
      "maxLength": 200
    },
    "message": {
      "type": "string",
      "minLength": 5,
      "maxLength": 1000
    },
    "category": {
      "type": "string",
      "enum": ["Placements", "Events", "Results", "General"]
    },
    "targetUserIds": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "type": "result",
    "title": "Semester Results Published",
    "message": "Your semester 4 results are now available.",
    "category": "Results",
    "isRead": false,
    "createdAt": "2026-05-06T08:30:00.000Z"
  }
}
```

---

### 4. Mark Notification as Read

**PATCH** `/notifications/:id/read`

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "isRead": true,
    "updatedAt": "2026-05-06T09:00:00.000Z"
  }
}
```

---

### 5. Mark All Notifications as Read

**PATCH** `/notifications/read-all`

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "updatedCount": 5
}
```

---

### 6. Delete Notification

**DELETE** `/notifications/:id`

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

### 7. User Login

**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "student@campus.edu",
  "password": "securepassword"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "expiresIn": "24h",
    "user": {
      "id": "user-uuid",
      "name": "Shreya",
      "email": "student@campus.edu",
      "role": "student"
    }
  }
}
```

---

### 8. User Register

**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "Shreya",
  "email": "student@campus.edu",
  "password": "securepassword",
  "role": "student"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user-uuid",
    "name": "Shreya",
    "email": "student@campus.edu",
    "role": "student"
  }
}
```

---

## Notification Data Model (JSON Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Notification",
  "type": "object",
  "required": ["id", "type", "title", "message", "category", "isRead", "createdAt", "userId"],
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique identifier (UUID v4)"
    },
    "type": {
      "type": "string",
      "enum": ["placement", "event", "result", "general"],
      "description": "Category type of the notification"
    },
    "title": {
      "type": "string",
      "minLength": 3,
      "maxLength": 200
    },
    "message": {
      "type": "string",
      "minLength": 5,
      "maxLength": 1000
    },
    "category": {
      "type": "string",
      "enum": ["Placements", "Events", "Results", "General"]
    },
    "isRead": {
      "type": "boolean",
      "default": false
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time"
    },
    "userId": {
      "type": "string",
      "format": "uuid"
    }
  }
}
```

---

## Real-Time Notification Mechanism

Real-time delivery is implemented using **WebSockets (Socket.IO)**:

### Connection

```
ws://localhost:5000
```

### Client Connection (with Auth)

```js
const socket = io('http://localhost:5000', {
  auth: { token: 'Bearer <jwt_token>' }
});
```

### Events

| Event              | Direction        | Description                        |
|--------------------|------------------|------------------------------------|
| `connect`          | Client ← Server  | Connection established             |
| `notification:new` | Client ← Server  | New notification pushed            |
| `notification:read`| Client → Server  | Mark a notification as read        |
| `disconnect`       | Client ← Server  | Connection closed                  |

### Incoming Notification Payload (`notification:new`)

```json
{
  "id": "uuid-v4",
  "type": "placement",
  "title": "New Drive Posted",
  "message": "Amazon is hiring for SDE roles.",
  "category": "Placements",
  "isRead": false,
  "createdAt": "2026-05-06T10:00:00.000Z"
}
```

### Server Emit (Node.js / Socket.IO)

```js
// Emit to specific user room
io.to(`user:${userId}`).emit('notification:new', notificationPayload);
```

---

## Error Response Format

All error responses follow this consistent schema:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

| HTTP Status | Meaning                    |
|-------------|----------------------------|
| 200         | Success                    |
| 201         | Resource created           |
| 400         | Bad request / validation   |
| 401         | Unauthorized               |
| 403         | Forbidden                  |
| 404         | Resource not found         |
| 500         | Internal server error      |

---

## API Summary Table

| Method | Endpoint                        | Auth Required | Description                    |
|--------|---------------------------------|---------------|--------------------------------|
| POST   | `/auth/register`                | No            | Register a new user            |
| POST   | `/auth/login`                   | No            | Login and get JWT token        |
| GET    | `/notifications`                | Yes           | Get all notifications          |
| GET    | `/notifications/:id`            | Yes           | Get notification by ID         |
| POST   | `/notifications`                | Yes (Admin)   | Create a new notification      |
| PATCH  | `/notifications/:id/read`       | Yes           | Mark one as read               |
| PATCH  | `/notifications/read-all`       | Yes           | Mark all as read               |
| DELETE | `/notifications/:id`            | Yes           | Delete a notification          |

---

*Roll Number: CB.SC.U4CSE23347*

---

# Stage 2: Data Persistence & Challenges

## Choice of Database
For the Campus Notification Platform, a **Relational Database (PostgreSQL)** is recommended for the following reasons:
- **ACID Compliance**: Ensures that notification delivery and read status updates are atomic and consistent.
- **Relational Integrity**: Managing relationships between Users and Notifications (and Read Status) is straightforward.
- **Structured Schema**: The notification contract is well-defined and unlikely to change frequently.

## Challenges with Data Volume
As the system grows to 50,000 students and millions of notifications:
1.  **Read Latency**: Fetching "unread" notifications for a specific student will become slow without proper indexing.
2.  **Write Throughput**: Simultaneous "Notify All" events (e.g., placement results) can overwhelm the database.
3.  **Storage Costs**: Maintaining history for years will require archival strategies.

---

# Stage 3: Query Optimization

## Problematic Query
```sql
SELECT * FROM notifications 
WHERE studentID = 1042 AND isRead = false 
ORDER BY createdAt DESC;
```

## Why is it slow?
- **Full Table Scan**: Without an index on `studentID`, the database must scan all 5,000,000 rows.
- **Sorting Overhead**: Sorting 5 million rows by `createdAt` is resource-intensive.

## Solution: Composite Index
I suggest adding a composite index on `(studentID, isRead, createdAt)`:
```sql
CREATE INDEX idx_student_unread ON notifications (studentID, isRead, createdAt DESC);
```
**Why?** This allows the database to instantly filter by student and read status, and retrieve the results in the correct order without a manual sort.

---

# Stage 4: Scaling & Performance

## The Issue
Fetching all notifications on every page load is inefficient. As the DB grows, the computation cost and network payload increase.

## Recommendations
1.  **Pagination**: Implement `limit` and `offset` (e.g., fetch 20 at a time).
2.  **Caching**: Use **Redis** to store the "unread count" for each user. Update the cache only when a new notification is sent or one is read.
3.  **Incremental Loading**: Only fetch new notifications since the last `timestamp` known to the client.

---

# Stage 5: "Notify All" Shortcomings

## Pseudocode Analysis
The proposed `notify_all` function iterates through 50,000 students sequentially.

### Shortcomings:
1.  **Lack of Atomicity**: If the server crashes at student 25,000, half the students get the notification and the other half don't.
2.  **Sequential Bottleneck**: Sending 50,000 emails sequentially could take hours, making the "real-time" aspect irrelevant.
3.  **Failure Handling**: If the Email API fails for 200 students, there is no retry mechanism or logging of "who missed out."

### Redesign: Queue-Based Processing
1.  **Task Queue**: Push a "Broadcast Job" to a message broker (like **RabbitMQ** or **Redis Bull**).
2.  **Worker Processes**: Multiple workers pick up chunks of students and process them in parallel.
3.  **Idempotency**: Use a `delivery_log` table to track which students have successfully received the notification, allowing for safe retries.

---

# Stage 6: Priority Inbox Implementation

## Priority Logic
The Priority Inbox displays the top `n` notifications based on:
1.  **Weight**: Placement (30) > Result (20) > Event (10) > General (0).
2.  **Recency**: Newer notifications appear first within the same weight category.

## Implementation Details
- **Filtering**: Done in-memory for this microservice (as per instructions).
- **Sorting**: `notifications.sort((a,b) => weightB - weightA || recencyB - recencyA)`.
- **Dynamic Limit**: The API accepts a `limit` query parameter (default 10) to support user preference.

## API Integration Mapping
The system automatically maps fields from the **Evaluation API** to our internal model:
- `ID` → `id`
- `Type` → `type` (normalized to lowercase)
- `Message` → `message` (and used as `title`)
- `Timestamp` → `createdAt`

---

*Roll Number: CB.SC.U4CSE23347*

