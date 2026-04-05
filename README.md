# 💳 Banking Frontend Application

This repository contains the frontend of a full-stack banking system built using React (Vite). It provides a user-friendly interface for managing banking operations such as authentication, role-based dashboards, and account interactions.

---

## 🚀 Features

- 🔐 User Authentication (Login / Register)
- 👤 Role-based Access (Admin / Customer)
- 📊 Dashboard Views for Different Users
- 🔄 API Integration with Backend (Spring Boot)
- 🔑 Token-based Authentication Handling
- 📱 Responsive UI Design

---

## 🛠️ Tech Stack

- React (Vite)
- JavaScript (ES6+)
- HTML5 / CSS3
- Fetch API

---

## 📁 Project Structure
bank-ui/
├── src/
│ ├── pages/
│ │ ├── AdminDashboard.jsx
│ │ ├── CustomerDashboard.jsx
│ │ ├── Register.jsx
│ │ ├── RoleSelect.jsx
│ │ └── VerifySuccess.jsx
│ ├── api.js
│ ├── router.jsx
│ ├── App.jsx
│ └── main.jsx
├── public/
├── index.html
├── package.json
├── vite.config.js
└── .env


---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:


---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:


This variable defines the backend API base URL.

---

## ▶️ Run Locally

Install dependencies:

npm install

Start development server:

npm rundev


App will run at:

http://localhost:5173


---

## 🌐 Deployment

This frontend is deployed using Vercel.

After backend deployment, update the environment variable:

VITE_API_URL=https://your-backend-url


---

## 🔗 Backend

The backend is built using Spring Boot and will be deployed separately.

It provides REST APIs for:
- Authentication
- Account management
- Transactions

---

## 📌 Future Improvements

- Improved UI/UX design
- Better error handling and validation
- Performance optimization
- Integration with production backend
- Enhanced security handling

---

## 👨‍💻 Author

Mohammad Rashid Ansari

---

## ⭐ Notes

This project is part of a full-stack banking system demonstrating real-world architecture:

Frontend (React) + Backend (Spring Boot) + Database (PostgreSQL)    