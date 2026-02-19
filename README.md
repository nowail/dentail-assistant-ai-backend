# Sensei Travel App - Backend API

Express.js RESTful API for the Sensei Travel App with PostgreSQL database, JWT authentication, and AI service integration.

## 🌐 Overview

This is the **backend repository** for the Sensei Travel App. Provides RESTful APIs for authentication, patient management, chat functionality, and integrates with the AI service.

## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │─────▶│  Express.js API │─────▶│   PostgreSQL    │
│   (React)       │      │   (This Repo)   │      │   (Database)    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  AI Service     │
                         │  (FastAPI)      │
                         └─────────────────┘
```

### Tech Stack

- **Express.js** - Fast, unopinionated web framework
- **PostgreSQL** - Robust relational database
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **node-pg** - PostgreSQL client for Node.js
- **express-validator** - Input validation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration
```

### Database Setup

```bash
# Create database
createdb sensei_travel

# Or using psql
psql -U postgres
CREATE DATABASE sensei_travel;
\q

# Run migrations
npm run migrate
```

### Development

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start
```

## 📋 Environment Variables

Create a `.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sensei_travel

# JWT
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRY=7d

# AI Service
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_ENABLED=true

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Production Configuration

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@neon-host.aws.neon.tech/sensei_travel
JWT_SECRET=<generate-secure-secret>
AI_SERVICE_URL=https://your-ai-service.railway.app
CORS_ORIGIN=https://your-frontend.vercel.app
```

**Generate secure JWT secret:**
```bash
openssl rand -base64 32
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   └── database.js      # PostgreSQL connection pool
│   ├── controllers/         # Request handlers
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   └── chatController.js
│   ├── middleware/          # Express middleware
│   │   ├── auth.js          # JWT verification
│   │   └── errorHandler.js  # Global error handling
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── patientRoutes.js
│   │   └── chatRoutes.js
│   ├── db/                  # Database utilities
│   │   └── migrate.js       # Migration script
│   └── server.js            # Express app entry point
├── Dockerfile               # Docker configuration
└── package.json
```

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login and get JWT token
GET    /api/auth/profile     - Get current user profile (protected)
```

### Patients

```
GET    /api/patients         - List patients with pagination & search
GET    /api/patients/:id     - Get patient details
POST   /api/patients         - Create new patient
PUT    /api/patients/:id     - Update patient
DELETE /api/patients/:id     - Delete patient
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by name or email

### Chat

```
GET    /api/chat/:patientId  - Get chat history
POST   /api/chat             - Send message and get AI response
DELETE /api/chat/:patientId  - Clear chat history
```

### Health Check

```
GET    /health               - API health status
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Patients Table
```sql
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  date_of_birth DATE,
  medical_notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Chat Messages Table
```sql
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  message TEXT NOT NULL,
  role VARCHAR(20) NOT NULL,  -- 'user' or 'assistant'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes
```sql
CREATE INDEX idx_patients_created_at ON patients(created_at DESC);
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_chat_messages_patient_id ON chat_messages(patient_id, created_at DESC);
CREATE INDEX idx_users_email ON users(email);
```

## 🔒 Security Features

- **Password Security:** bcrypt hashing with 10 salt rounds
- **Authentication:** JWT token-based authentication
- **SQL Injection Prevention:** Parameterized queries
- **Input Validation:** express-validator on all endpoints
- **CORS Protection:** Configurable allowed origins
- **Error Handling:** No sensitive data in error responses
- **Environment Secrets:** All credentials in environment variables

## 🌐 Deployment

### Railway (Recommended)

1. **Connect GitHub repository**
2. **Set Root Directory:** `.` (or backend folder if in monorepo)
3. **Add Environment Variables** (see above)
4. **Deploy**
5. **Run migrations:**
   ```bash
   # In Railway Shell
   npm run migrate
   ```

### Render

1. **Create Web Service**
2. **Connect repository**
3. **Configure:**
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Add Environment Variables**
5. **Deploy**
6. **Run migrations in Shell**

### Docker

```bash
# Build image
docker build -t sensei-backend .

# Run container
docker run -p 5000:5000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  sensei-backend
```

## 🧪 Testing

### Manual API Testing

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Create patient (use token from login)
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"Jane Smith","email":"jane@example.com","phone":"555-1234"}'
```

### Automated Testing

```bash
# Run tests (if configured)
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Database Compatibility

This backend works with **any PostgreSQL 13+ database:**

- ✅ **Neon** - Serverless PostgreSQL
- ✅ **Supabase** - PostgreSQL + Additional Services
- ✅ **AWS RDS** - Managed PostgreSQL
- ✅ **Railway** - Built-in PostgreSQL
- ✅ **Render** - Managed PostgreSQL
- ✅ **Local Docker** - Development setup

**Auto SSL Detection:**
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});
```

## 🐛 Common Issues

### Issue: Database connection fails
**Solution:** 
- Check DATABASE_URL format
- Verify database is accessible
- Check SSL requirements for production databases

### Issue: JWT verification fails
**Solution:**
- Ensure JWT_SECRET is set
- Check token expiry time
- Verify Authorization header format: `Bearer <token>`

### Issue: Migrations fail
**Solution:**
```bash
# Drop and recreate database
dropdb sensei_travel
createdb sensei_travel
npm run migrate
```

## 🔗 Related Repositories

- **Frontend:** [sensei-frontend-repo](../sensei-frontend-repo)
- **AI Service:** [sensei-ai-service-repo](../sensei-ai-service-repo)




