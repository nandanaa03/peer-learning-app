# Collaborative Learning Platform

A full-stack web application that connects learners with peer experts for doubt solving, real-time chat, and collaborative learning.

---

## Features

* Authentication (JWT-based register/login)
* Profile management and progress tracking
* Session matching with peer experts
* Real-time chat using Socket.io
* Academic forum for questions and answers
* History tracking and expert badge system

---

## Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* Socket.io

---

## Project Structure

```
peer-learning-app/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│
└── .gitignore
```

---

## Setup Instructions

### 1. Clone the repository

```
git clone https://github.com/nandanaa03/peer-learning-app.git
cd peer-learning-app
```

---

### 2. Backend setup

```
cd backend
npm install
```

Create a `.env` file:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

Run backend:

```
npm run dev
```

---

### 3. Frontend setup

```
cd frontend
npm install
npm run dev
```

---

## Deployment

Frontend: Vercel
Backend: Render / Railway
Database: MongoDB Atlas

---

## Notes

* MongoDB Atlas requires IP whitelisting
* Ensure `.env` is configured correctly
* Network issues may affect local development

---

## Future Improvements

* UI/UX enhancements
* Notification system
* Video call integration
* Recommendation system

---