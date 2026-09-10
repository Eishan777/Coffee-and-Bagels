# ☕ Coffee & Bagels — Full-Stack Web Application

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-v4.18-black?logo=express)
![SQLite3](https://img.shields.io/badge/Database-SQLite3-blue?logo=sqlite)
![Authentication](https://img.shields.io/badge/Auth-JWT%20%2B%20bcryptjs-red)
![License](https://img.shields.io/badge/License-ISC-purple)

A full-stack, backend-specialized web application for café management and online table reservations, featuring a dynamic **Server-Side OTP Engine**, **Customer Authentication (Google Sign-In + Email Verification Code)**, **System Activity Audit Logging**, **REST API architecture**, **JWT Authentication**, and an interactive **Admin Management Portal**.

Designed and Developed by **Eishan Nangia**.

---

## 🚀 Key Features

### 🌐 Customer Portal (`/index.html`, `/customer-login.html`, `/reservations.html`)
- **Customer Authentication**: Support for **Google Sign-In (OAuth 2.0)** and dynamic **Email Verification Code dispatches**.
- **Dynamic REST API Menu**: Fetches categorized menu items, prices, and tags live from SQLite via `GET /api/menu`.
- **Server-Side Dynamic OTP Engine**: Generates a random 4-digit verification code on the server (`POST /api/otp/send`), stores it with a 5-minute expiration timestamp, and validates customer submissions via `POST /api/otp/verify`.
- **API Rate Limiting**: Protects OTP generation endpoints against brute-force attacks (maximum 3 requests per phone number within 10 minutes).
- **Direct WhatsApp Confirmation**: Generates a pre-filled WhatsApp table reservation link targeting the customer's mobile number.
- **Interactive Review Streaming**: Stream customer feedback live from the database (`GET /api/reviews`) and submit new reviews directly (`POST /api/reviews`).
- **Media Gallery Lightbox & Carousel**: Smooth UI transitions, image overlays, and scroll progress tracking.

### 🔐 Admin Management Dashboard (`/admin.html`)
- **JWT-Protected Access**: Secure authentication flow via `POST /api/auth/login` using `bcryptjs` encrypted passwords and JSON Web Tokens.
- **Real-Time Analytics Counters**: Instant counters for Pending Bookings, Today's Bookings, Total Reservations, and Menu Items.
- **Reservation Processing**: Approve (`confirmed`) or Cancel (`cancelled`) customer bookings with real-time status updates in SQLite.
- **Full Menu CRUD**: Add new items, update prices/descriptions, or remove items dynamically from the live database.
- **System Activity Audit Logs**: View real-time timestamped audit logs (`activity_logs` table) tracking server dispatches, OTP verifications, reservation creations, customer logins, and admin actions.

---

## 🛠️ Tech Stack & Architecture

- **Backend**: Node.js & Express.js (RESTful API architecture)
- **Database**: Embedded SQLite3 (`database.sqlite`) with parameterized queries protecting against SQL Injection
- **Authentication & Security**: JWT (JSON Web Tokens), `bcryptjs` password hashing, API Rate Limiting middleware
- **Frontend**: HTML5, Vanilla JavaScript (`fetch` API), CSS3 (Modular design system)
- **API Testing**: Pre-configured Postman Collection (`postman_collection.json`)

---

## 📁 Repository Structure

```
.
├── assets/                  # High-res logos & media assets
├── css/
│   ├── style.css            # Customer homepage design system & styles
│   ├── reservations.css     # Stepper progress & booking form styles
│   └── admin.css            # Admin dashboard, tables, & login styles
├── js/
│   ├── main.js              # Dynamic menu loading, reviews, carousel, lightbox, customer session
│   ├── customer-login.js    # Customer Google Sign-In and Email Verification Code script
│   ├── reservations.js      # Booking stepper, server OTP API call, WhatsApp link
│   ├── login.js             # Admin login & JWT token storage
│   └── admin.js             # Admin stats, booking status, menu CRUD & audit logs
├── server/
│   ├── db.js                # SQLite database setup, table schemas, and seeder
│   ├── routes/
│   │   ├── api.js           # Public REST API (Customer Auth, OTP engine, Menu, Reservations, Reviews)
│   │   └── admin.js         # Protected Admin REST API (Stats, Reservations, CRUD, Logs)
│   └── services/
│       ├── smsService.js    # SMS Gateway Dispatcher Service (Fast2SMS / Twilio)
│       └── emailService.js  # Email Verification Dispatcher Service (Resend / Nodemailer)
├── index.html               # Main Customer Homepage
├── customer-login.html      # Customer Login & Sign Up Portal
├── reservations.html        # Table Booking & Verification Page
├── login.html               # Admin Login Portal
├── admin.html               # Admin Dashboard & Audit Logs Portal
├── server.js                # Main Express server entry point
├── database.sqlite          # SQLite database storage file
├── postman_collection.json  # Exported Postman REST API Collection
├── sample_dataset.json      # Structured dataset JSON file
└── package.json             # Node.js dependencies & scripts
```

---

## 🚦 Local Setup & Installation

### Prerequisites
- Node.js (v16.0.0 or higher) installed on your machine.

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/coffee-and-bagels-fullstack.git
   cd coffee-and-bagels-fullstack
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Application Server**
   ```bash
   npm start
   ```

4. **Access in Browser**
   - 🌐 Customer Site: `http://localhost:8080/index.html`
   - 🔑 Customer Auth: `http://localhost:8080/customer-login.html`
   - 📑 Table Reservations: `http://localhost:8080/reservations.html`
   - 🔐 Admin Login (Footer Link): `http://localhost:8080/login.html`
   - 📊 Admin Portal: `http://localhost:8080/admin.html`

---

## 🔑 Demo Credentials

- **Admin Username**: `admin`
- **Admin Password**: `admin123`

---

## 📡 REST API Documentation

### Public API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/menu` | Fetch all available menu items (filtered by `?category=`) |
| `POST` | `/api/auth/customer/send-code` | Generates 4-digit Email verification code & dispatches via email service |
| `POST` | `/api/auth/customer/verify-code` | Validates email code & authenticates customer session |
| `POST` | `/api/auth/customer/google` | Authenticates customer via Google Sign-In |
| `POST` | `/api/otp/send` | Generates a 4-digit random OTP, saves in SQLite with 5-min expiry, dispatches via SMS service |
| `POST` | `/api/otp/verify` | Validates customer OTP code against SQLite records |
| `POST` | `/api/reservations` | Submit a new table booking |
| `GET` | `/api/reviews` | Stream latest customer reviews |
| `POST` | `/api/reviews` | Submit a new customer review |
| `POST` | `/api/auth/login` | Authenticate admin credentials & receive JWT token |

### Protected Admin API Endpoints (`Authorization: Bearer <token>`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Fetch real-time dashboard analytics counters |
| `GET` | `/api/admin/reservations` | List all customer table bookings |
| `PATCH` | `/api/admin/reservations/:id` | Update booking status (`confirmed` or `cancelled`) |
| `GET` | `/api/admin/menu` | List all menu items for management |
| `POST` | `/api/admin/menu` | Create a new menu item |
| `PUT` | `/api/admin/menu/:id` | Update an existing menu item |
| `DELETE` | `/api/admin/menu/:id` | Delete a menu item |
| `GET` | `/api/admin/logs` | Fetch real-time system audit logs |

---

## 🧪 Testing APIs in Postman

This repository includes a ready-to-import Postman Collection file: `postman_collection.json`.

1. Open **Postman**.
2. Click **Import** -> Select `postman_collection.json`.
3. Test all pre-configured endpoints (`/api/menu`, `/api/otp/send`, `/api/otp/verify`, `/api/auth/login`, etc.).

---

## 👤 Author

**Eishan, Gagan, Ansh, Harkirat**
3rd-Year Computer Science Students
