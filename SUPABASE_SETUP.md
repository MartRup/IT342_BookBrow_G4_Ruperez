# Supabase Integration Setup

## Overview
This project has been successfully integrated with Supabase for authentication and database operations.

## ✅ Completed Setup

### Frontend (React)
- ✅ Added `@supabase/supabase-js` dependency
- ✅ Created Supabase client configuration (`src/supabase.js`)
- ✅ Updated Login component to use Supabase Auth
- ✅ Updated Register component to use Supabase Auth
- ✅ Created AuthContext for session management
- ✅ Environment variables configured in `.env`

### Backend (Spring Boot)
- ✅ Database connection configured to Supabase PostgreSQL
- ✅ Created Supabase configuration classes
- ✅ Updated User entity for Supabase compatibility
- ✅ Created user management services and controllers
- ✅ Added SQL script for user_profiles table

## 🚀 How to Run

### 1. Database Setup
Run the following SQL script in your Supabase SQL Editor:
```sql
-- File: backend/bookbrow/src/main/resources/create_user_profiles_table.sql
-- This script creates the user_profiles table and sets up RLS policies
```

### 2. Frontend Setup
```bash
cd web
npm install
npm start
```

### 3. Backend Setup
```bash
cd backend/bookbrow
./mvnw spring-boot:run
```

## 🔧 Configuration Files

### Frontend Environment Variables (`.env`)
```
VITE_SUPABASE_URL=https://fjkuckbkygyamsahgyru.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_rQVuM8bDN7JEyXkuwCU5uw_Vx308KjD
```

### Backend Configuration (`application.properties`)
- Database connection to Supabase PostgreSQL
- Supabase service role key configured
- CORS enabled for frontend

## 📊 Database Schema

### auth.users (Supabase built-in)
- User authentication data
- Email/password management
- Session handling

### public.user_profiles (Custom table)
- Extended user information
- User roles (USER, LIBRARIAN, ADMIN)
- Additional profile fields

## 🔐 Authentication Flow

1. **Registration**: 
   - User signs up via Supabase Auth
   - User profile created in backend database
   - Redirect to login

2. **Login**:
   - Authenticate via Supabase Auth
   - Session stored in localStorage
   - Redirect to home

3. **Session Management**:
   - AuthContext manages user state
   - Automatic session restoration
   - Logout functionality

## 🛠 API Endpoints

### User Management
- `POST /api/users/profile` - Create user profile
- `GET /api/users/profile/{userId}` - Get user profile
- `PUT /api/users/profile/{userId}` - Update user profile
- `DELETE /api/users/profile/{userId}` - Deactivate user

## 🔍 Testing

1. Test registration flow
2. Test login/logout functionality
3. Verify user profiles are created
4. Check database tables in Supabase

## 📝 Notes

- Frontend uses Supabase client for authentication
- Backend connects directly to Supabase PostgreSQL
- Row Level Security (RLS) enabled on user_profiles table
- Service role key used for backend operations
- Environment variables keep secrets secure
