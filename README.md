
# AeroFund 💰✈️  
A full-stack budget allocation & utilization management system for stations.

---

## 📁 Project Structure

```
AeroFund/
│
├── backend/        # Node.js + Express + MongoDB API
├── frontend/       # Admin dashboard (React + Vite)
├── stations/       # Station dashboard (React + Vite)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm
- MongoDB Atlas (or local MongoDB)

---

## 🔧 Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Environment Variables (`backend/.env`)

```env
MONGO_URI=write your mongo DB url

ACCESS_TOKEN_SECRET=write any random word
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=write any random word
REFRESH_TOKEN_EXPIRY=5d

PORT=4000

CLOUD_NAME=From cloudinary
API_KEY=From cloudinary
API_SECRET=From cloudinary
```

Backend runs on:
```
http://localhost:4000
```

---

## 🖥️ Frontend (Admin Panel)

```bash
cd frontend
npm install
npm run dev
```

Runs on:
```
http://localhost:3000
```

---

## 🏢 Station Panel

```bash
cd stations
npm install
npm run dev
```

Runs on:
```
http://localhost:5173
```

---

## 🔐 Authentication
- Admin: Email + Password
- Station: Station Code + Email + Password
- JWT-based authentication

---

## 📊 Features
- Admin yearly budget management
- Station-wise allocation & utilization
- Financial year filters
- Receipt uploads
- PDF budget reports
- Secure authentication

---

## 🛠 Tech Stack
- React, Vite, Tailwind CSS
- Node.js, Express, MongoDB
- JWT, Cloudinary, jsPDF

---


