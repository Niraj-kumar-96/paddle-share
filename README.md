# 🚗 PaddleShare

PaddleShare is a modern, premium carpooling and ridesharing platform built to connect travelers heading in the same direction, allowing them to share the journey and split the costs.

![PaddleShare UI Preview](/public/manifest.json) <!-- Update with actual screenshot later -->

## ✨ Features
* **Offer Rides:** Drivers can quickly post trips, configure pricing, pick available seats, and list their route.
* **Find Rides:** Passengers can seamlessly search for available drivers using customized date and exact-time picker UI components.
* **Smart UI/UX:** Built with a stunning dark-mode aesthetic utilizing glassmorphism, fluid animations (Framer Motion), and Shadcn UI.
* **Secure Authentication:** JWT-based user authentication.
* **Automated Email Receipts:** Automatically sends professional booking confirmations (HTML Emails) utilizing NodeMailer and Gmail SMTP.

## 🛠️ Technology Stack
### Frontend
* **React 18** + **Vite**
* **Tailwind CSS** + **Framer Motion** (Animations)
* **Shadcn UI** & **Radix UI** (Accessible components, Pickers, Modals)
* **React Router DOM** (Client-side routing)

### Backend
* **Node.js** + **Express.js**
* **MongoDB** (Persisted database storage)
* **Nodemailer** (Automated email delivery)

## 🚀 Getting Started Locally

### Prerequisites
Make sure you have Node.js and MongoDB installed on your system.

### 1. Clone the Repository
```bash
git clone https://github.com/Niraj-kumar-96/paddle-share.git
cd paddle-share
```

### 2. Frontend Setup
Install frontend dependencies and start the Vite development server:
```bash
npm install
npm run dev
```

### 3. Backend Setup
Open a second terminal window, navigate into the backend folder, configure environments, and spin up the Express server:
```bash
cd backend
npm install
```

**Environment Variables**
Create a `.env` file inside the `/backend` folder combining standard credentials:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/paddleshare
JWT_SECRET=your_super_secret_key_here
PORT=5000

# Nodemailer setup for Gmail notifications
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
```

Start the backend:
```bash
npm run dev
```

## 🌐 Production Deployment Guide
Ready to host the service publicly? Check out the project deployment documentation.
* **Frontend:** Deploy to [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/) (React Router redirects pre-configured). Be sure to set your `VITE_API_URL` to point to the live backend server.
* **Backend:** Deploy to robust server hosts like [Render](https://render.com/), [Railway](https://railway.app/), or [Heroku].

---
*Built for conscious travelers. Join the journey!* 🚙
