# Local Business Appointment Booking System
## Final Project Report and Technical Documentation

Date: February 21, 2026

## 1. Executive Summary
This project delivers a full-stack appointment booking system for local businesses such as clinics, salons, and consultants.  
The system replaces manual booking through calls/WhatsApp with structured online booking, role-based access, availability rules, and admin analytics.

The final build includes:
- Customer authentication and booking flow
- Admin authentication and management dashboard
- Availability and slot rules
- Double-booking prevention (per service/consultant resource)
- Appointment history and lifecycle updates
- Daily/monthly analytics for admin

## 2. Problem Statement
Manual appointment handling caused:
- Double bookings
- Missed appointments
- No visibility of available slots
- Poor user experience
- No reporting for business owners

## 3. Project Objectives
- Provide online appointment booking
- Show real-time valid booking slots
- Support customer and admin roles
- Prevent invalid/conflicting bookings
- Provide admin controls and analytics

## 4. Scope
### In scope
- Customer signup/login
- Admin signup/login
- Service management
- Availability management
- Appointment create/fetch/update/cancel
- Admin reporting dashboard

### Out of scope
- Payment processing
- Notification gateways (SMS/Email/WhatsApp)
- Multi-branch business separation
- Calendar provider integration

## 5. Technology Stack
- Frontend: React.js
- Backend: Node.js + Express.js
- Database: MongoDB (Atlas/local)
- Authentication: JWT
- Password hashing: bcryptjs
- Form validation: Formik + Yup

## 6. System Architecture
### High-level flow
1. React frontend sends HTTP requests to Express backend under `/api/*`.
2. Express validates payloads, auth tokens, and roles.
3. Business logic runs in controllers (auth, services, availability, appointments, reports).
4. Data is persisted in MongoDB through Mongoose models.
5. Response is returned to frontend and rendered in customer/admin interfaces.

### Security boundary
- Protected routes require `Authorization: Bearer <token>`.
- Role checks enforce admin-only endpoints.

## 7. Repository Structure
```text
backend/
  app/
    config/db.js
    controllers/
    middleware/auth.js
    models/
    routes/
    utils/scheduling.js
  package.json
frontend/
  public/index.html
  src/
    App.js
    AdminDashboard.js
    App.css
    index.js
    index.css
  package.json
README.md
```

## 8. Data Model Documentation
### User (`backend/app/models/user.js`)
- `name` (required)
- `email` (required, unique, lowercase)
- `phone`
- `passwordHash` (required)
- `role` (`customer` | `admin`, default `customer`)
- `isActive` (default `true`)
- timestamps

### Service (`backend/app/models/service.js`)
- `name` (required)
- `description`
- `durationMinutes` (required, min 5)
- `price` (min 0)
- `isActive` (default `true`)
- `createdBy` (User ref)
- timestamps

### Availability (`backend/app/models/availability.js`)
- Singleton settings document with key `default`
- `startTime`, `endTime` (`HH:mm`)
- `slotDurationMinutes` (min 15)
- `workingDays` (`0..6`)
- `breakStartTime`, `breakEndTime`
- timestamps

### Appointment (`backend/app/models/appointment.js`)
- `customer` (User ref, required)
- `service` (Service ref, required)
- `appointmentDate` (Date, required)
- `startTime`, `endTime` (`hh:mm AM/PM`)
- `status` (`pending`, `approved`, `rescheduled`, `cancelled`, `completed`)
- `notes`
- timestamps
- indexes for customer/date, service/date, date/start/status

## 9. Authentication and RBAC
Implemented in:
- `backend/app/controllers/authController.js`
- `backend/app/middleware/auth.js`

Behavior:
- Signup/login returns JWT token and user data
- Middleware verifies token and loads user
- `requireRole("admin")` blocks non-admin access to admin routes

## 10. Scheduling and Validation Rules
Implemented in:
- `backend/app/utils/scheduling.js`
- `backend/app/controllers/appointmentController.js`
- `backend/app/controllers/availabilityController.js`

Rules enforced:
- Valid time formats required
- `endTime` must be after `startTime`
- Booking must fall inside working hours
- Booking cannot overlap business break
- Booking day must be inside configured working days
- Start time must exist in generated slots
- Double-booking conflict prevention is scoped per `service` at the same date/time overlap
- Cancelled appointments do not block slots

## 11. API Documentation
Base URL: `http://localhost:5000/api`

### Auth routes
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/admin/signup`
- `POST /auth/admin/login`

### Public routes
- `GET /services`
- `GET /availability`

### Customer protected routes
- `POST /appointments`
- `GET /appointments`
- `GET /appointments/:id`
- `PATCH /appointments/:id`

### Admin protected routes
- `GET /admin/ping`
- `GET /admin/services`
- `POST /admin/services`
- `PATCH /admin/services/:id`
- `GET /admin/availability`
- `PATCH /admin/availability`
- `GET /admin/appointments`
- `PATCH /admin/appointments/:id`
- `GET /admin/reports`

### Common response behavior
- `200`: success
- `201`: resource created
- `400`: validation/input error
- `401`: auth missing/invalid
- `403`: forbidden by role
- `404`: not found
- `409`: conflict (slot already booked / duplicate service name)
- `500`: server error

## 12. Frontend Module Documentation
### Customer app (`frontend/src/App.js`)
- Handles route mode (`/` customer, `/admin` admin page container)
- Manages customer auth form and session storage
- Loads services, availability, and customer appointments
- Renders:
  - service selection
  - date and slot picker
  - booking summary
  - details form
  - appointment history
- Handles booking/cancel requests and displays messages
- Includes slot disable behavior for:
  - booked slots for selected service/date
  - conflict-blocked slots
  - non-working days

### Admin dashboard (`frontend/src/AdminDashboard.js`)
- Loads services, appointments, availability, reports in parallel
- Supports:
  - create/update service
  - update availability
  - update appointment status
- Renders analytics:
  - daily/monthly/all-time totals
  - completion rate
  - 7-day trend
  - 6-month trend
  - status breakdown
  - service performance

### Styling (`frontend/src/App.css`, `frontend/src/index.css`)
- Global typography and layout
- Customer and admin dashboard components
- Responsive behavior for medium/small screens

## 13. Reports and Analytics Logic
Implemented in `backend/app/controllers/reportController.js`:
- Totals:
  - today
  - current month
  - all-time
- Trends:
  - last 7 days
  - last 6 months
- Grouping:
  - status breakdown
  - service performance (`total`, `completed`, `cancelled`)

Frontend normalization in `frontend/src/AdminDashboard.js` ensures safe defaults if payload fields are missing.

## 14. Setup and Run Guide
## Prerequisites
- Node.js 18+
- npm
- MongoDB Atlas or local MongoDB

## Environment file
Create `backend/.env` from `backend/.env.example`:
```env
PORT=5000
MONGO_URI=...
MONGO_URI_FALLBACK=...
JWT_SECRET=...
```

## Run backend
```bash
cd backend
npm install
npm run dev
```

## Run frontend
```bash
cd frontend
npm install
npm start
```

## 15. Testing Checklist (Manual)
### Authentication
- Customer signup/login works
- Admin signup/login works
- Non-admin blocked from `/api/admin/*`

### Booking
- Appointment can be created with valid slot
- Invalid slot/time/day blocked
- Same service + overlapping slot blocked
- Different service + same slot allowed

### Admin
- Service create/update works
- Availability updates affect slot generation
- Appointment status updates reflect in customer history
- Reports load and show counts/trends

## 16. Known Limitations
- No payment workflow
- No reminder notifications
- No automated test suite committed
- No multi-consultant entity model separate from service resource (service currently acts as consultant/resource)

## 17. Future Improvements
- Add dedicated consultant model and mapping
- Add reminders and notifications
- Add payments and invoices
- Add CI tests (unit + integration + e2e)
- Add deployment pipelines and monitoring

## 18. Conclusion
The project satisfies the original business objective:
- structured online booking
- reduced scheduling conflicts
- role-based customer/admin operation
- practical business analytics

The system is in a functional final state and ready for submission/demo deployment.
