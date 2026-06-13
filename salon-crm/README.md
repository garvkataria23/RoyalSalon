# Salon CRM Appointment Booking System

A MEAN stack application for managing salon appointments, staff, and billing.

## Prerequisites
- Node.js
- MongoDB (Running on `localhost:27017`)
- Angular CLI (`npm install -g @angular/cli`)

## Setup Instructions

### 1. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd salon-crm/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000`.

### 2. Seeding Data
Once the backend is running, you can seed the initial data (Admin user and Staff) using the following commands:
```bash
# Seed Admin User (admin / password123)
curl -X POST http://localhost:5000/api/auth/seed

# Seed Staff Members
curl -X POST http://localhost:5000/api/staff/seed
```

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd salon-crm/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Angular development server:
   ```bash
   npx ng serve
   ```
4. Open your browser and navigate to `http://localhost:4200`.

## Features
- **Login**: Secure login for salon admins.
- **Calendar**: Interactive booking table showing staff availability.
- **Appointment Booking**: Comprehensive form for client and service details.
- **Management**: Edit, reschedule, or cancel appointments.
- **Billing**: Generate professional invoices with tax and discounts.
- **Sharing**: Share appointment and billing details with staff and clients.
