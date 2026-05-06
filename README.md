# Campus Hiring Evaluation - Backend Assessment

This repository contains the backend solutions for the Campus Hiring Evaluation assessment. The project is organized into distinct microservices, each addressing specific logistical and notification challenges.

**Roll Number:** CB.SC.U4CSE23347

---

##  Project Structure

The repository is divided into three main components:

1.  **[Vehicle Maintenance Scheduler](./vehicle-maintenance-scheduler/)**
    *   **Goal:** Optimize vehicle maintenance scheduling across multiple depots.
    *   **Algorithm:** 0/1 Knapsack (Dynamic Programming) to maximize impact within mechanic-hour constraints.
    *   **Status:** Fully functional with Evaluation API integration.

2.  **[Campus Notification Microservice](./campus-notification-service/)**
    *   **Goal:** A real-time notification platform for students (Placements, Results, Events).
    *   **Key Features:** Priority Inbox (Weight + Recency), JWT Auth, WebSockets (Socket.IO), and Evaluation API seeding.
    *   **Documentation:** Complete [Stage 1-6 Design Document](./campus-notification-service/notification_system_design.md).

3.  **[Request Logging Middleware](./request-logging-middleware/)**
    *   **Goal:** Mandatory auditing middleware used across services.
    *   **Features:** Unique RequestID tracking, automated logging of every request and response.

---

##  Global Setup

To run any of the services, ensure you have **Node.js** installed.

### 1. Installation
Run `npm install` inside each project directory:
```bash
cd vehicle-maintenance-scheduler && npm install
cd ../campus-notification-service && npm install
cd ../request-logging-middleware && npm install
```

### 2. Environment Configuration
Each service contains a `.env` file for configuration. Key variables include:
*   `AUTH_TOKEN`: access code.
*   `EVALUATION_API_BASE`: The base URL for the external evaluation server.
*   `JWT_SECRET`: Used for the notification service authentication.

---

##  Execution

### Vehicle Maintenance Scheduler
```bash
cd vehicle-maintenance-scheduler
npm start
```
*Outputs optimization results to the console and `output.json`.*

### Campus Notification Microservice
```bash
cd campus-notification-service
npm start
```
*Server runs on `http://localhost:5000`. Includes real-time WebSocket support.*

---


