# Local Business Appointment Booking System

## Overview
This project is a full-stack appointment booking system for local businesses (clinics, salons, consultants). It replaces manual phone/WhatsApp scheduling with role-based login, live slot visibility, and admin controls.

## Current Build Scope (Day 1 to Day 13)
### Customer side
- Signup/login
- Service selection (loaded from backend)
- Date/time selection from availability slots
- Appointment booking with validation feedback
- Appointment history display
- Cancel appointment from history

### Admin side
- Separate `/admin` login page
- Manage services (create/update/activate)
- Manage business availability settings
- Manage appointment statuses
- Daily/monthly analytics and service performance

### Scheduling rules
- Role-based access control (customer/admin)
- Slot must be valid against configured availability
- Outside-hours and break-time booking blocked
- Double booking blocked for overlapping time ranges

## Tech Stack
- Frontend: React.js
- Backend: Node.js + Express.js
- Database: MongoDB (Atlas or local)

## Project Structure
```text
backend/
  app/
    config/        # DB connection
    controllers/   # API logic
    middleware/    # auth + RBAC
    models/        # Mongoose schemas
    routes/        # Express routes
    utils/         # scheduling helpers
frontend/
  src/
    App.js              # customer app flow
    AdminDashboard.js   # admin dashboard
```

## Environment Variables
Create `backend/.env` from `backend/.env.example`.

```env
PORT=5000
MONGO_URI=your_primary_mongodb_uri
MONGO_URI_FALLBACK=your_fallback_non_srv_uri
JWT_SECRET=your_long_random_secret
```

## Local Setup
### 1) Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:5000`.

### 2) Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs on `http://localhost:3000`.

## API Summary
### Public/customer auth
- `POST /api/auth/signup`
- `POST /api/auth/login`

### Admin auth
- `POST /api/auth/admin/signup`
- `POST /api/auth/admin/login`

### Customer booking flow
- `GET /api/services`
- `GET /api/availability`
- `POST /api/appointments` (auth)
- `GET /api/appointments` (auth)
- `PATCH /api/appointments/:id` (auth)

### Admin management + reports
- `GET /api/admin/services` (admin)
- `POST /api/admin/services` (admin)
- `PATCH /api/admin/services/:id` (admin)
- `GET /api/admin/availability` (admin)
- `PATCH /api/admin/availability` (admin)
- `GET /api/admin/appointments` (admin)
- `PATCH /api/admin/appointments/:id` (admin)
- `GET /api/admin/reports` (admin)

## 14-Day Plan
1. Requirements, feature finalization, GitHub repo
2. Dev environment (React + Node/Express)
3. DB schema (users, services, appointments)
4. Customer auth
5. Admin auth + RBAC
6. Customer UI
7. Appointment APIs
8. Frontend/backend integration
9. Admin dashboard
10. Double booking prevention
11. Customer appointment history
12. Admin reports
13. Cleanup + docs + push
14. Testing + demo + presentation
