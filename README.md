# ☕ Coffee & Bagels — Full-Stack Web Application

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-v4.18-black?logo=express)
![SQLite3](https://img.shields.io/badge/Database-SQLite3-blue?logo=sqlite)
![Authentication](https://img.shields.io/badge/Auth-JWT%20%2B%20bcryptjs-red)
![License](https://img.shields.io/badge/License-ISC-purple)

A full-stack, backend-specialized web application for café management and online table reservations, featuring a dynamic **Server-Side OTP Engine**, **System Activity Audit Logging**, **REST API architecture**, **JWT Authentication**, and an interactive **Admin Management Portal**.

Designed and Developed by **Eishan Nangia**.

---

## 🚀 Key Features

### 🌐 Customer Portal (`/index.html` & `/reservations.html`)
- **Dynamic REST API Menu**: Fetches categorized menu items, prices, and tags live from SQLite via `GET /api/menu`.
- **Server-Side Dynamic OTP Engine**: Generates a random 4-digit verification code on the server (`POST /api/otp/send`), stores it with a 5-minute expiration timestamp, and validates customer submissions via `POST /api/otp/verify`.
- **API Rate Limiting**: Protects OTP generation endpoints against brute-force attacks (maximum 3 requests per phone number within 10 minutes).
- **Direct WhatsApp Confirmation**: Generates a pre-filled WhatsApp table reservation link targeting **`+91 8708123306`**.
- **Interactive Review Streaming**: Stream customer feedback live from the database (`GET /api/reviews`) and submit new reviews directly (`POST /api/reviews`).
- **Media Gallery Lightbox & Carousel**: Smooth UI transitions, image overlays, and scroll progress tracking.

### 🔐 Admin Management Dashboard (`/admin.html`)
- **JWT-Protected Access**: Secure authentication flow via `POST /api/auth/login` using `bcryptjs` encrypted passwords and JSON Web Tokens.
- **Real-Time Analytics Counters**: Instant counters for Pending Bookings, Today's Bookings, Total Reservations, and Menu Items.
- **Reservation Processing**: Approve (`confirmed`) or Cancel (`cancelled`) customer bookings with real-time status updates in SQLite.
- **Full Menu CRUD**: Add new items, update prices/descriptions, or remove items dynamically from the live database.
- **System Activity Audit Logs**: View real-time timestamped audit logs (`activity_logs` table) tracking server dispatches, OTP verifications, reservation creations, and admin logins.

---

## 🛠️ Tech Stack & Architecture

- **Backend**: Node.js & Express.js (RESTful API architecture)
- **Database**: Embedded SQLite3 (`database.sqlite`) with parameterized queries protecting against SQL Injection
- **Authentication & Security**: JWT (JSON Web Tokens), `bcryptjs` password hashing, API Rate Limiting middleware
- **Frontend**: HTML5, Vanilla JavaScript (`fetch` API), CSS3 (Modular design system)
- **API Testing**: Pre-configured Postman Collection (`postman_collection.json`)

---

## 📁 Repository Structure
