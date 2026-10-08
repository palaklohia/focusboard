# FocusBoard API Documentation

Base URL (production): `https://focusboard-api.onrender.com/api`
Base URL (local): `http://localhost:4000/api`

All request and response bodies are JSON. Dates are `YYYY-MM-DD`.

## Authentication

Protected endpoints need this header:

    Authorization: Bearer <token>

Tokens are JWTs (HS256) returned by register and login. They expire after `JWT_EXPIRES_IN` (default 1 hour).

## Error format

Every error uses the same shape:

    { "error": { "message": "Human readable text", "code": "MACHINE_CODE", "details": [ { "field": "email", "message": "Invalid email address" } ] } }

`details` appears only on validation errors.

| Status | Meaning | Common codes |
|---|---|---|
| 400 | Validation failed or bad JSON | `VALIDATION_ERROR` |
| 401 | Missing, invalid or expired token, or wrong credentials | `NO_TOKEN`, `INVALID_TOKEN`, `TOKEN_EXPIRED`, `INVALID_CREDENTIALS` |
| 404 | Not found, or belongs to another user | `NOT_FOUND` |
| 409 | Email already registered | `EMAIL_TAKEN` |
| 429 | Too many login or register attempts | `RATE_LIMITED` |
| 500 | Unexpected server error (details are never exposed) | none |

## Auth endpoints

Register and login are rate limited: 10 failed attempts per 15 minutes per IP.

### POST /auth/register

Body:

    { "fullName": "Alex Morgan", "email": "alex@example.com", "password": "Password123" }

Rules: full name 2 to 100 characters, valid email (stored lowercase), password 8 to 72 characters with at least one letter and one number.

Response `201`:

    { "user": { "id": "uuid", "fullName": "Alex Morgan", "email": "alex@example.com", "createdAt": "..." }, "token": "<jwt>" }

### POST /auth/login

Body: `{ "email": "...", "password": "..." }`
Response `200`: same shape as register.

### POST /auth/logout

Requires auth. Tokens are stateless, so the client deletes its token. Response `200`: `{ "message": "Logged out successfully" }`

### GET /auth/me

Requires auth. Response `200`: `{ "user": { "id", "fullName", "email" } }`

## Projects

All project endpoints require auth and only return the caller's own projects.

| Method | Path | Description |
|---|---|---|
| GET | /projects | List projects |
| GET | /projects/:id | Get one project |
| POST | /projects | Create a project |
| PUT | /projects/:id | Update (send only changed fields) |
| DELETE | /projects/:id | Delete a project and its tasks (204) |

Project fields: `name` (required, max 120), `description` (optional, max 2000), `status` (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`), `startDate`, `endDate` (end must not be before start).

List query parameters:

| Param | Description |
|---|---|
| search | Case-insensitive match on name |
| status | Filter by project status |
| sortBy | `createdAt` (default), `name`, `startDate`, `endDate` |
| order | `asc` or `desc` (default) |
| page, limit | Pagination (limit max 100, default 20) |

Project responses include computed fields: `taskCount`, `completedTaskCount`, `progress` (0 to 100) and `health` (`ON_TRACK`, `AT_RISK`, `OVERDUE`, `COMPLETED`).

List response:

    { "data": [ { "id": "...", "name": "...", "progress": 50, "health": "ON_TRACK" } ], "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 } }

## Tasks

All task endpoints require auth. A task belongs to a project, and ownership is checked through that project.

| Method | Path | Description |
|---|---|---|
| GET | /tasks | List tasks across all projects |
| GET | /tasks/:id | Get one task |
| POST | /tasks | Create a task (needs `projectId`) |
| PUT | /tasks/:id | Update (also used to mark completed) |
| DELETE | /tasks/:id | Delete a task (204) |

Task fields: `name` (required, max 150), `description` (optional), `priority` (`LOW`, `MEDIUM`, `HIGH`), `status` (`PENDING`, `IN_PROGRESS`, `COMPLETED`), `dueDate`. Setting status to `COMPLETED` records `completedAt`.

To mark a task completed: `PUT /tasks/:id` with `{ "status": "COMPLETED" }`.

List query parameters: `search`, `status`, `priority`, `projectId`, `sortBy` (`createdAt`, `dueDate`, `priority`, `name`, `status`), `order`, `page`, `limit`.

## Dashboard

### GET /dashboard

Requires auth. Response `200`:

    {
      "stats": { "totalProjects": 2, "totalTasks": 9, "completedTasks": 4, "pendingTasks": 3, "inProgressTasks": 2, "projectsInProgress": 1, "overdueTasks": 1 },
      "upNext": [ { "id": "...", "name": "...", "priority": "HIGH", "focus": { "score": 131, "reason": "Overdue by 1 day" } } ],
      "recentActivity": [ { "id": "...", "message": "Completed task \"Design homepage\"", "createdAt": "..." } ]
    }

`upNext` is the top 5 open tasks ranked by priority weight plus deadline urgency.

## Health check

### GET /health

No auth. Response `200`: `{ "status": "ok" }`
