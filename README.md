# Library Student Management System - Vercel + MongoDB

A comprehensive library management system for tracking students, payments, and seat allocations.

## Features

- Student management with subscription tracking
- Payment processing and tracking
- 100-seat allocation system with half-day sharing
- WhatsApp notifications (simulated)
- Subscription expiry alerts
- Multi-currency support

## Deployment on Vercel with MongoDB Atlas

### 1. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Create a database user
4. Get your connection string
5. Whitelist your IP (or use 0.0.0.0/0 for all IPs)

### 2. Vercel Deployment
1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library_management
   JWT_SECRET=your_random_secret_key
   VITE_API_URL=https://your-app.vercel.app/api
   ```
5. Deploy!

### 3. Local Development
1. **Clone and install**
   ```bash
   git clone your-repo-url
   cd student-management-system
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Add your MongoDB URI and other variables
   ```

3. **Run locally**
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET/POST /api/students` - Student management
- `GET/POST /api/payments` - Payment tracking  
- `GET /api/seats` - Seat allocation

## Database Collections

- `students` - Student information and subscriptions
- `payments` - Payment tracking
- `seats` - Seat allocation (auto-generated 100 seats)

## Features Overview

- **Dashboard**: Overview statistics and charts
- **Students**: Add, edit, and manage student subscriptions
- **Payments**: Track and manage payments
- **Seats**: Visual seat map with allocation management
- **Notifications**: Automated reminders and alerts

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- MongoDB Atlas
- Vercel (hosting)
- Mongoose (ODM)
- Lucide React (icons)