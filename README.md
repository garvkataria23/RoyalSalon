# Royal Salon — CRM & Appointment Management System

A full-stack salon management system with appointment booking, staff scheduling, client management, billing/invoicing, and SMS campaigns. Built with **Angular 19** + **Node.js/Express** + **MongoDB**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 19, TypeScript, HTML5, CSS3, RxJS, jsPDF |
| Backend | Node.js, Express.js, JWT, bcryptjs |
| Database | MongoDB, Mongoose |
| Hosting | Vercel (Frontend), Render (Backend) |

## Features

### Appointment Management
- Weekly calendar with staff-hour grid and conflict detection
- Book, edit, reschedule, cancel appointments
- Status tracking: Booked → Completed → Cancelled
- Client autocomplete, staff/service dropdowns with auto-fill
- Time slot picker with availability checking

### Client Management
- Full CRUD with duplicate phone detection
- Loyalty tiers (Royal Patron, Gold, Silver, First Visit)
- Client appointment history modal
- SMS campaign to individual clients

### Billing & Invoicing
- Per-appointment invoice with configurable tax rate
- Discount editing before finalizing
- Mark as paid with auto invoice number (`INV-YYYYMMDD-NNN`)
- PDF invoice generation via jsPDF
- Print, WhatsApp, Email sharing

### Staff & Services
- Staff CRUD with specialization tracking
- Weekly schedule view per staff member
- Service portfolio with categories (Hair, Skin, Nails, Massage)

### Discounts & Offers
- Percentage and flat discount types
- Promo codes with expiry date tracking
- Min purchase requirements, active/inactive toggle

### Other Features
- Global search across clients, staff, services, appointments
- Dashboard with revenue and appointment stats
- Appointment history with revenue tracking
- Settings: salon name, tax rate, password change
- Luxury animated UI with gold/charcoal theme
- Toast notifications and confirmation dialogs

## Project Structure

```
salon-crm/
├── backend/                    # Node.js + Express API
│   ├── models/                 # Mongoose schemas (6 collections)
│   ├── routes/                 # API route handlers (6 modules)
│   ├── middleware/              # JWT auth middleware
│   ├── server.js               # Entry point
│   └── .env                    # Environment variables
│
├── frontend/                   # Angular 19 standalone app
│   ├── src/app/
│   │   ├── components/         # 15 standalone components
│   │   ├── services/           # 10 services (API + offline)
│   │   ├── guards/             # Auth guard
│   │   ├── interceptors/       # Auth interceptor
│   │   ├── pipes/              # Custom pipes
│   │   ├── app.routes.ts       # Route definitions
│   │   └── app.config.ts       # App providers
│   ├── angular.json
│   └── package.json
│
└── README.md
```

## Offline Mode

Every service has a localStorage fallback. When the backend is unreachable:
- CRUD operations read/write from localStorage
- Login falls back to a stored admin password
- Mock JWT tokens enable full app functionality
- First login seeds 50+ demo records across all entities

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Angular CLI: `npm install -g @angular/cli`

### Backend
```bash
cd salon-crm/backend
npm install
# Edit .env with your MongoDB URI
npm start
# Server runs on http://localhost:5000
```

### Frontend
```bash
cd salon-crm/frontend
npm install
ng serve
# App runs on http://localhost:4200
```

### Seed Data
```bash
curl -X POST http://localhost:5000/api/auth/seed
```

Default login: **admin** / **aurashineinfotech**

## Deployment

- **Frontend**: Build with `ng build`, deploy to Vercel
- **Backend**: Push to Render with `MONGODB_URI` and `JWT_SECRET` set as environment variables
- Update `apiUrl` in frontend services to point to the Render backend URL

## License

MIT
