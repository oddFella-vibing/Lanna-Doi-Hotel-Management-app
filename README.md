Lanna Doi Hotel Management System - Backend API
A robust, 3NF-compliant hotel management system backend built with Node.js, Express, TypeScript, and MySQL. This application follows a clean MVC (Model-View-Controller) architectural pattern to handle full CRUD operations, EER employee specialization subtypes, many-to-many room reservations, and immutable financial records.
----Tech Stack
Runtime: Node.js
Framework: Express (v5)
Language: TypeScript (v5.5+)
Database: MySQL (via mysql2/promise connection pools)
Utilities: CORS, Dotenv, Nodemon, ts-node
-----Getting Started & Setup-----

1. Clone the Repository
   git clone
   cd lanna-doi-hotel-management-app
2. Install Dependencies
   npm install
3. Configure Environment Variables
   Create a .env file in the root directory of the project and define your local database and server configuration:
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=your_database_name
4. Run the Development Server
   npm run dev
   The server will start at http://localhost:3000. You can verify the database connection using the health check endpoint:
   GET http://localhost:3000/api/health
   API Endpoints Reference
   Base URL for all routes: http://localhost:3000/api
   ------routes------
   API Endpoint Reference & Postman Test Guide

Request body notes:

- Send JSON request bodies with the `Content-Type: application/json` header.
- IDs must be positive integers. Values such as `12abc` are rejected.
- Update requests reject unknown fields instead of silently changing database columns.
- Database and booking totals are calculated by the server; do not rely on client-provided totals.

1. Guests
   GET /api/guests
   Description: List all registered guests.
   POST /api/guests
   Description: Register a new guest.
   Request Body (JSON):
   JSON
   {
   "first_name": "Somchai",
   "last_name": " ใจดี",
   "phone_number": "+66812345678",
   "email": "somchai@example.com",
   "preferred_room_type": "Deluxe",
   "house_number": "123/4",
   "street": "Nimman Road",
   "district": "Mueang Chiang Mai",
   "sub_district": "Suthep",
   "province": "Chiang Mai"
   }
   GET /api/guests/:id
   Description: Get specific guest record by ID.
   PUT /api/guests/:id
   Description: Update guest details.
   Request Body (JSON):
   JSON
   {
   "phone_number": "+66898765432",
   "preferred_room_type": "Suite"
   }
   DELETE /api/guests/:id
   Description: Remove a guest record.
2. Rooms
   GET /api/rooms
   Description: List all inventory rooms.
   POST /api/rooms
   Description: Add a new room to the inventory.
   Request Body (JSON):
   JSON
   {
   "room_number": "101",
   "price_per_night": 1500.00,
   "room_type": "Deluxe",
   "room_status": "Available"
   }
   GET /api/rooms/:id
   Description: Get specific room details.
   PUT /api/rooms/:id
   Description: Update room details or status (e.g., changing status to Maintenance).
   Request Body (JSON):
   JSON
   {
   "room_status": "Maintenance",
   "price_per_night": 1600.00
   }
   DELETE /api/rooms/:id
   Description: Remove a room record.
3. Employees
   GET /api/employees
   Description: List all staff members with their respective roles/subtypes.
   POST /api/employees
   Description: Hire a new employee and assign a role. Use either `title` (as shown below) or `role`.
   Request Body (JSON):
   JSON
   {
   "first_name": "Anong",
   "last_name": "Sriwanna",
   "phone_number": "+66887654321",
   "email": "anong@lannadoihotel.com",
   "house_number": "45",
   "street": "Huay Kaew Road",
   "district": "Mueang Chiang Mai",
   "sub_district": "Chang Phueak",
   "province": "Chiang Mai",
   "title": "Receptionist"
   }
   GET /api/employees/:id
   Description: Get specific employee profile.
   PUT /api/employees/:id
   Description: Update employee contact profile or role.
   Request Body (JSON):
   JSON
   {
   "phone_number": "+66811112222",
   "title": "Manager"
   }
   Valid roles are `Manager`, `Receptionist`, and `Housekeeper`. Send one of `title` or `role`; if both are sent, `role` takes precedence.
   DELETE /api/employees/:id
   Description: Terminate/remove a staff record.
4. Services
   GET /api/services?booking_id=1
   Description: List extra service charges (optionally filtered by query parameter booking_id).
   POST /api/services
   Description: Add an extra service charge to a booking.
   Request Body (JSON):
   JSON
   {
   "description": "Late Checkout",
   "charged_amount": 300.00,
   "booking_id": 1
   }
   GET /api/services/:id
   Description: Get a specific service entry.
   PUT /api/services/:id
   Description: Update a service entry description or charge amount. The booking assignment cannot be changed.
   Request Body (JSON):
   JSON
   {
   "charged_amount": 350.00
   }
   DELETE /api/services/:id
   Description: Remove a service entry.
   Service create, update, and delete operations recalculate the related booking total.
5. Bookings
   GET /api/bookings
   Description: List all reservations with joined guest names, employee names, associated rooms, and services.
   POST /api/bookings
   Description: Create a reservation with automatic date validations, overlap checks, nightly calculations, and server-side total verification.
   Request Body (JSON):
   JSON
   {
   "check_in_date": "2026-10-01",
   "check_out_date": "2026-10-05",
   "status": "Confirmed",
   "guest_id": 1,
   "employee_id": 2,
   "room_ids": [4],
   "services": [
   {
   "description": "Airport Transfer - Pickup",
   "charged_amount": 500.00
   },
   {
   "description": "Breakfast Buffet - 2 Persons",
   "charged_amount": 500.00
   }
   ]
   }
   `total_amount` is calculated from room rates and services. Any client-provided `total_amount` is ignored.
   GET /api/bookings/:id
   Description: Get specific reservation details including associated rooms and services.
   PUT /api/bookings/:id
   Description: Update reservation details/status (validates dates and overlaps and recalculates billing totals if dates change).
   Request Body (JSON):
   JSON
   {
   "check_in_date": "2026-10-02",
   "check_out_date": "2026-10-06",
   "status": "Confirmed"
   }
   Allowed update fields are `check_in_date`, `check_out_date`, `status`, `guest_id`, and `employee_id`.
   DELETE /api/bookings/:id
   Description: Remove a reservation record (cascades or cleans up junction and service relations safely).
   POST /api/bookings/:id/rooms
   Description: Assign an additional room to an active booking with date overlap validation and automated total recalculation.
   Request Body (JSON):
   JSON
   {
   "room_id": 3
   }
   DELETE /api/bookings/:id/rooms/:roomId
   Description: Remove a room assignment from a booking and recalculate the final total.
6. Payments
   GET /api/payments?booking_id=1
   Description: View payment history (supports optional booking_id query filter).
   POST /api/payments
   Description: Record a payment transaction against a booking.
   Request Body (JSON):
   JSON
   {
   "payment_date": "2026-10-01 14:30:00",
   "payment_method": "Credit Card",
   "amount": 2500.00,
   "booking_id": 1
   }
   `amount` must be a non-negative number. Valid payment methods are `Credit Card`, `Cash`, `Bank Transfer`, and `PromptPay`.
   GET /api/payments/:id
   Description: View specific payment transaction record details.
7. Housekeeping
   GET /api/housekeepinglogs?room_id=1
   Description: View cleaning logs (supports optional room_id query filter).
   POST /api/housekeepinglogs
   Description: Assign a cleaning task.
   Request Body (JSON):
   JSON
   {
   "date": "2026-10-05",
   "status": "Pending",
   "room_id": 4,
   "employee_id": 3
   }
   `employee_id` identifies the housekeeper assigned to the task. Valid statuses are `Pending`, `In Progress`, `Completed`, and `Inspected`.
   GET /api/housekeepinglogs/:id
   Description: Get specific housekeeping log entry.
   PUT /api/housekeepinglogs/:id
   Description: Update housekeeping task status.
   Request Body (JSON):
   JSON
   {
   "status": "Completed"
   }
   DELETE /api/housekeepinglogs/:id
   Description: Remove a housekeeping log entry.
8. Billing
   GET /api/billings?booking_id=1
   Description: View invoices (supports optional booking_id query filter).
   POST /api/billings
   Description: Generate a final billing snapshot invoice referencing the auto-calculated booking amount.
   Request Body (JSON):
   JSON
   {
   "booking_id": 1
   }
   `invoice_date` is optional. `total_amount` is always read from the booking and cannot be supplied by the client.
   GET /api/billings/:id
   Description: View specific invoice details.
