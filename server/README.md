# Backend Documentation

## Overview
This repository contains the backend for the Brutee exam management system.
The backend is built with Node.js, Express, MongoDB, and Mongoose.
It supports role-based staff authentication, student registration and login, subject and exam management, question banking, faculty assignment, exam session pairing, and security validation for a desktop/mobile exam client.

## Tech Stack
- Node.js
- Express
- MongoDB / Mongoose
- JSON Web Tokens (JWT)
- bcryptjs for password hashing
- CORS
- dotenv

## Project Structure
- `server.js` — main Express server entrypoint
- `src/controllers/` — route handler logic
- `src/routes/` — route definitions
- `src/models/` — Mongoose schemas and models
- `src/middleware/` — authentication and authorization middleware
- `src/config/` — environment config placeholder
- `src/utils/` — helper utilities

## Setup
1. Navigate to the backend folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `server/` with the following values:
   ```env
   MONGO_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   PORT=5000
   OFFICIAL_CLIENT_HASH=<secure_client_hash>
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   or
   ```bash
   npm start
   ```

## Environment Variables
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret used to sign JWT tokens
- `PORT` — port the server listens on (default: `5000`)
- `OFFICIAL_CLIENT_HASH` — expected client hash used by the security verification endpoint

## Available API Routes
### Base URL
`http://localhost:5000/api`

### Health Check
`GET /`
- Response: `{ "message": "Backend Working!" }`

### Authentication & Users
#### Staff
- `POST /api/auth/login`
  - Body: `{ "email": "...", "password": "..." }`
  - Response: `{ _id, name, email, role, token }`
  - Roles: `SUPER_ADMIN`, `PROFESSOR`, `FACULTY`

#### Students
- `POST /api/students/register`
  - Body: `{ "name", "email", "password", "rollNumber" }`
  - Response: `{ success, token, user }`
- `POST /api/students/login`
  - Body: `{ "email", "password" }`
  - Response: `{ success, token, user }`
- `GET /api/students/profile`
  - Headers: `Authorization: Bearer <token>`
  - Response: student profile with enrolled subjects

### Subject Management
- `POST /api/subjects/create`
  - Protected: `SUPER_ADMIN`
  - Body: `{ "name", "subjectCode" }`
  - Response: created subject
- `GET /api/subjects`
  - Protected: `SUPER_ADMIN`, `PROFESSOR`
  - Response: `SUPER_ADMIN` receives all subjects; `PROFESSOR` receives only their assigned subject

### Admin Management
- `POST /api/admin/seed`
  - Public route for initial Super Admin bootstrapping
  - Creates `admin@exam.com` with password `admin123`
- `POST /api/admin/create-professor`
  - Protected: `SUPER_ADMIN`
  - Body: `{ "name", "email", "password", "subjectId" }`
  - Response: created Professor assigned to a subject

### Faculty Management
- `POST /api/faculty/create`
  - Protected: `PROFESSOR`
  - Body: `{ "name", "email", "password", "permissions" }`
  - Response: created Faculty member assigned to the professor's subject
- `GET /api/faculty`
  - Protected: `PROFESSOR`
  - Response: list of faculty that report to the professor

### Question Bank
- `POST /api/questions/create`
  - Protected: `PROFESSOR`, `FACULTY`
  - Body: `{ "questionText", "options", "correctAnswer", "marks" }`
  - `PROFESSOR` creates questions for their assigned subject
  - `FACULTY` requires `permissions.canCreateQuestion` to be true
- `GET /api/questions`
  - Protected: `PROFESSOR`, `FACULTY`
  - Response: list of questions for the assigned subject

### Exam Management
- `POST /api/exams/create`
  - Protected: `PROFESSOR`
  - Body: `{ "title", "questionIds", "durationMinutes", "startTime" }`
  - Response: created exam paper
- `GET /api/exams`
  - Protected: `PROFESSOR`
  - Response: exams for the professor's assigned subject

### Exam Session Flow
- `POST /api/sessions/initialize`
  - Called by the desktop exam client
  - Body: `{ "examId", "candidateId" }`
  - Response: session details, pairing token, and QR data
- `POST /api/sessions/pair`
  - Called by the mobile app after scanning the QR
  - Body: `{ "pairingToken", "mobileDeviceInfo" }`
  - Response: pairing confirmation
- `GET /api/sessions/exam/:examId/questions`
  - Protected: `Bearer <student_token>`
  - Response: exam questions for the specified exam
- `POST /api/sessions/answer/submit`
  - Protected: `Bearer <student_token>`
  - Body: `{ "examSessionId", "questionId", "selectedAnswer" }`
  - Response: answer submission status
- `POST /api/sessions/:examSessionId/submit`
  - Protected: `Bearer <student_token>`
  - Response: final exam submission and evaluation
- `GET /api/sessions/:examSessionId/status`
  - Protected: `Bearer <token>`
  - Response: current exam session status
- `GET /api/sessions/:examSessionId/result`
  - Protected: `Bearer <token>`
  - Response: exam result details

### Security Verification
- `POST /api/security/verify-integrity`
  - Body: `{ "sessionId", "clientHash" }`
  - Response: `{ verified, message }`
  - Used to validate the desktop/mobile exam client integrity

## Authentication & Authorization
- `protectRoute` accepts a valid JWT issued by staff or students.
- Staff tokens are issued from `/api/auth/login`.
- Student tokens are issued from `/api/students/login` and `/api/students/register`.
- `authorizeRoles(...)` guards routes by user role.
- Student users are assigned role `STUDENT` at token generation.

## Main Models
### User
- `name`, `email`, `password`, `role`
- Discriminator roles: `SUPER_ADMIN`, `PROFESSOR`, `FACULTY`
- `FACULTY` adds: `assignedSubject`, `createdBy`, `permissions`

### Student
- `name`, `email`, `password`, `rollNumber`, `department`
- `enrolledSubjects`, `examsSessions`
- Passwords hashed on save

### Subject
- `name`, `subjectCode`, `createdBy`, `assignedProfessor`

### Question
- `subjectId`, `createdBy`, `questionText`, `options`, `correctAnswer`, `marks`

### Exam
- `title`, `subjectId`, `createdBy`, `questions`, `durationMinutes`, `totalMarks`, `startTime`, `isActive`

### ExamSession
- `examId`, `candidateId`, `pairingToken`, `isMobilePaired`, `mobileDeviceInfo`, `status`, `currentRiskScore`

### StudentResponse
- `examSession`, `question`, `selectedAnswer`, `isCorrect`, `marksObtained`

### Result
- `examSession`, `exam`, `student`, `totalMarks`, `obtainedMarks`, `percentage`, `status`, `responses`, `submittedAt`

## Notes
- A student profile may store `enrolledSubjects` and `examsSessions`.
- `seedSuperAdmin` is provided for initial setup but should be removed or protected in production.
- `OFFICIAL_CLIENT_HASH` must match the desktop/mobile app hash for integrity verification.
- The backend is configured to use CORS and JSON payload parsing.

## Run Commands
- Development: `npm run dev`
- Production: `npm start`

## Useful Links
- Server entrypoint: `server/server.js`
- Authentication middleware: `server/src/middleware/authMiddleware.js`
- Main route mount points: `server/src/routes/*.js`
- Core business logic: `server/src/controllers/*.js`
 