# YahooMail Backend API

Complete Node.js/Express backend with Supabase integration for user authentication and session management.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and update with your Supabase credentials:
```bash
cp .env.example .env
```

Edit `.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
JWT_SECRET=your-secret-key
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

### 3. Start the Server
```bash
npm run dev
```

Server runs on `http://localhost:5000`

---

## 📚 API Endpoints

### Authentication Routes

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "token": "jwt-token"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "token": "jwt-token"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2026-04-30T20:00:00Z"
  }
}
```

#### Logout
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

#### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "token": "new-jwt-token",
  "message": "Token refreshed"
}
```

---

### User Routes

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2026-04-30T20:00:00Z",
    "updated_at": "2026-04-30T20:00:00Z"
  }
}
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "new_username",
  "email": "newemail@example.com"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "username": "new_username",
    "email": "newemail@example.com"
  }
}
```

#### Change Password
```http
PUT /api/users/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "OldSecurePass123",
  "newPassword": "NewSecurePass456",
  "confirmPassword": "NewSecurePass456"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

#### Get All Sessions
```http
GET /api/users/sessions
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "user_agent": "Mozilla/5.0...",
      "ip_address": "192.168.1.1",
      "created_at": "2026-04-30T20:00:00Z",
      "expires_at": "2026-05-07T20:00:00Z",
      "is_current": true
    }
  ]
}
```

#### Delete Session (Logout from Device)
```http
DELETE /api/users/sessions/{sessionId}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Session deleted successfully"
}
```

---

## 🔒 Security Features

✅ **Password Hashing** - Bcrypt with salt rounds  
✅ **JWT Tokens** - Secure token-based authentication  
✅ **HTTPOnly Cookies** - Protected cookie storage  
✅ **CORS Protection** - Configurable origins  
✅ **Helmet.js** - Security headers  
✅ **Input Validation** - Email, password strength checks  
✅ **Session Tracking** - User agent & IP logging  
✅ **Multi-device Support** - Manage multiple sessions  

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  user_agent VARCHAR(500),
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);
```

---

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123",
    "confirmPassword": "TestPass123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123"
  }'
```

### Get Current User (requires token)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🛠️ Project Structure

```
yahoomail/
├── src/
│   ├── config/
│   │   ├── supabase.js
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── users.js
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `JWT_SECRET` | Secret key for JWT signing |
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | Environment (development/production) |
| `CORS_ORIGIN` | Allowed CORS origin |

---

## 🔄 Authentication Flow

1. **Register**: User creates account → Password hashed → User stored in DB → Token issued
2. **Login**: User submits credentials → Password verified → Session created → Token + Cookie sent
3. **API Request**: Client sends token in header or cookie → Middleware verifies → Request processed
4. **Logout**: Token invalidated → Session deleted → Cookie cleared
5. **Refresh**: Old token exchanged for new token → Session updated

---

## 🚨 Error Handling

All errors return standardized JSON response:
```json
{
  "error": "Error message",
  "status": 400,
  "timestamp": "2026-04-30T20:00:00Z"
}
```

Common Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

---

## 📦 Dependencies

- **express** - Web framework
- **@supabase/supabase-js** - Supabase client
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT generation
- **cookie-parser** - Cookie parsing
- **cors** - CORS middleware
- **helmet** - Security headers
- **validator** - Input validation
- **dotenv** - Environment variables

---

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

## 📄 License

ISC
