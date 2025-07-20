# Library Student Management System

A comprehensive library management system for tracking students, payments, and seat allocations.

## Features

- Student management with subscription tracking
- Payment processing and tracking
- 100-seat allocation system with half-day sharing
- WhatsApp notifications (simulated)
- Subscription expiry alerts
- Multi-currency support

## Local Development Setup

### 1. Prerequisites
- Node.js 18+ installed
- MongoDB installed locally OR MongoDB Atlas account
- Git

### 2. Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd student-management-system

# Install dependencies
npm install

# Install Vercel CLI globally
npm install -g vercel
```

### 3. Environment Setup
1. Copy the environment file:
   ```bash
   cp .env.local .env
   ```

2. Update `.env` with your MongoDB URI:
   ```
   MONGODB_URI=mongodb://localhost:27017/library_management
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library_management
   ```

### 4. Database Setup

**Option A: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service
3. Database will be created automatically

**Option B: MongoDB Atlas**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update MONGODB_URI in .env

### 5. Running the Application

**Method 1: Using Vercel Dev (Recommended)**
```bash
# Start the development server with API functions
npm run dev:api
```
This runs both the frontend and API functions locally.

**Method 2: Frontend Only**
```bash
# Start only the frontend (API calls will fail)
npm run dev
```

### 6. Access the Application
- Frontend: http://localhost:3000
- API: http://localhost:3000/api/students

### 7. Testing
1. Open http://localhost:3000
2. Navigate to Students page
3. Add a new student
4. Check if data persists in MongoDB

## Production Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

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