# BookBrow - Library Borrowing System

A comprehensive library management system that enables users to browse and borrow books through an Android mobile application, while administrators manage the library through a React web application. All components communicate with a Spring Boot backend providing RESTful APIs.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Development Timeline](#development-timeline)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

**BookBrow** is a modern library borrowing system designed to digitize and streamline library operations. The system consists of three main components:

- **Android Mobile App (Kotlin)**: For library users to browse and borrow books
- **React Web Application**: For administrators and librarians to manage books, users, and borrowing records
- **Spring Boot Backend**: RESTful API server handling business logic and data management

### Problem Statement
Manual library borrowing processes are inefficient and difficult to track.

### Solution
BookBrow digitizes library borrowing through a Kotlin-based Android app for users and a React-based web system for administrators, powered by a Spring Boot backend.

## ✨ Features

### Must Have Features
- ✅ User authentication (register, login, logout)
- ✅ Book catalog (list and view)
- ✅ Book borrowing functionality
- ✅ Borrow history tracking
- ✅ Admin panel for management

### Should Have Features
- 🔍 Search books by title
- 👤 User profile view
- ✔️ Input validation feedback
- 📱 Responsive web design

### Could Have Features
- 📚 Book categories
- 📅 Due date display

### Excluded Features
- ❌ Online payment system
- ❌ E-book reader
- ❌ Email notifications
- ❌ Push notifications
- ❌ Advanced reporting and analytics

## 🛠 Technology Stack

### Backend
- **Language**: Java 17
- **Framework**: Spring Boot 3.0.3
- **Security**: Spring Security with JWT Authentication
- **ORM**: Spring Data JPA / Hibernate
- **Build Tool**: Maven
- **Database**: PostgreSQL 15 (Supabase)

### Web Frontend
- **Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: npm/yarn
- **Deployment**: Vercel/Render

### Mobile Application
- **Language**: Kotlin
- **UI Framework**: Jetpack Compose
- **HTTP Client**: Retrofit
- **Local Storage**: Room
- **Build Tool**: Gradle
- **Minimum SDK**: Android 7.0 (API Level 24+)

### Database
- **Provider**: Supabase
- **Engine**: PostgreSQL 15
- **Features**: Row Level Security (RLS), Real-time subscriptions

## 🏗 System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  WEB CLIENT (React)    │    MOBILE CLIENT (Android)          │
│  • TypeScript          │    • Kotlin                          │
│  • Tailwind CSS        │    • Jetpack Compose                 │
│  • Admin Dashboard     │    • User Interface                  │
└──────────────────────────────────────────────────────────────┘
                          │
                          │ (HTTPS / JSON / JWT)
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND API (Spring Boot)                  │
│  • Java 17                                                    │
│  • Spring Security                                            │
│  • JWT Authentication                                         │
│  • JPA / Hibernate                                            │
│  • REST Controllers                                           │
│  • Business Logic                                             │
└──────────────────────────────────────────────────────────────┘
                          │
                          │ (Secure DB Connection)
                          ▼
┌──────────────────────────────────────────────────────────────┐
│              DATABASE (Supabase PostgreSQL)                   │
│  • users table                                                │
│  • books table                                                │
│  • borrow_records table                                       │
│  • Foreign Key Constraints                                    │
│  • Row-Level Security (RLS)                                   │
└──────────────────────────────────────────────────────────────┘
```

### Architecture Pattern
The system follows a **3-tier architecture**:
1. **Presentation Layer**: React Web App & Android Mobile App
2. **Business Logic Layer**: Spring Boot REST API
3. **Data Layer**: Supabase PostgreSQL Database

## 🚀 Getting Started

### Prerequisites

#### Backend
- Java 17 or higher
- Maven 3.6+
- PostgreSQL (or Supabase account)

#### Web Frontend
- Node.js 16+
- npm or yarn

#### Mobile App
- Android Studio Arctic Fox or later
- Android SDK (API Level 24+)
- Kotlin 1.8+

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/bookbrow.git
cd bookbrow
```

#### 2. Backend Setup
```bash
cd backend/bookbrow
# Configure database connection in application.properties
# Update the following properties:
# spring.datasource.url=jdbc:postgresql://your-supabase-url/postgres
# spring.datasource.username=your-username
# spring.datasource.password=your-password

# Build and run
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

#### 3. Web Frontend Setup
```bash
cd frontend/web
npm install
# Configure API base URL in .env
# REACT_APP_API_URL=http://localhost:8080/api/v1

npm start
```

The web app will start on `http://localhost:3000`

#### 4. Mobile App Setup
```bash
cd mobile/android
# Open the project in Android Studio
# Update the API base URL in Constants.kt or build.gradle
# BASE_URL = "http://your-backend-url/api/v1"

# Build and run on emulator or device
```

## 📡 API Documentation

### Base URL
```
https://api.bookbrow.com/api/v1
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

### Response Structure
```json
{
  "success": boolean,
  "data": object|null,
  "error": {
    "code": "string",
    "message": "string",
    "details": object|null
  },
  "timestamp": "string"
}
```

### Key Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

#### Books
- `GET /books` - List all books (with pagination)
- `GET /books/{id}` - Get book details
- `POST /books` - Add new book (Admin only)
- `PUT /books/{id}` - Update book (Admin only)
- `DELETE /books/{id}` - Delete book (Admin only)

#### Borrowing
- `GET /borrow/all` - Get all borrow records (Librarian/Admin)
- `GET /borrow/user` - Get user's borrow history
- `POST /borrow` - Borrow a book
- `PUT /borrow/{id}/return` - Return a book (Librarian/Admin)

#### User Management
- `GET /users` - List all users (Admin only)
- `POST /users/librarian` - Create librarian account (Admin only)
- `PUT /users/{id}/role` - Update user role (Admin only)
- `DELETE /users/{id}` - Delete user (Admin only)

### HTTP Status Codes
- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required/failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Duplicate resource
- `500 Internal Server Error` - Server error

For detailed API documentation, see [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)

## 🗄 Database Schema

### Tables

#### auth.users (Supabase-managed)
- `id` (UUID, PK)
- `email`
- `encrypted_password`
- `created_at`

#### profiles
- `id` (UUID, PK, FK → auth.users.id)
- `full_name`
- `role` (USER, LIBRARIAN, ADMIN)
- `created_at`
- `updated_at`

#### books
- `id` (UUID, PK)
- `title`
- `author`
- `description`
- `available` (BOOLEAN)
- `created_at`
- `updated_at`

#### borrow_records
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `book_id` (UUID, FK → books.id)
- `borrow_date`
- `return_date`
- `processed_by` (UUID, FK → profiles.id, nullable)
- `created_at`

### Relationships
- **One-to-One**: auth.users ↔ profiles
- **One-to-Many**: profiles → borrow_records
- **One-to-Many**: books → borrow_records
- **Many-to-One**: borrow_records → profiles (processed_by)

## 📁 Project Structure

```
bookbrow/
├── backend/
│   └── bookbrow/
│       ├── src/
│       │   └── main/
│       │       ├── java/com/example/bookbrow/
│       │       │   ├── config/          # Configuration classes
│       │       │   ├── controller/      # REST controllers
│       │       │   ├── dto/             # Data Transfer Objects
│       │       │   ├── entity/          # JPA entities
│       │       │   ├── repository/      # Data repositories
│       │       │   ├── security/        # Security & JWT
│       │       │   ├── service/         # Business logic
│       │       │   └── exception/       # Exception handling
│       │       └── resources/
│       │           └── application.properties
│       └── pom.xml
├── frontend/
│   └── web/
│       ├── src/
│       │   ├── components/      # React components
│       │   ├── pages/           # Page components
│       │   ├── services/        # API services
│       │   ├── utils/           # Utility functions
│       │   └── App.tsx
│       └── package.json
├── mobile/
│   └── android/
│       ├── app/
│       │   └── src/
│       │       └── main/
│       │           ├── java/com/example/bookbrow/
│       │           │   ├── ui/          # UI components
│       │           │   ├── viewmodel/   # ViewModels
│       │           │   ├── repository/  # Data repositories
│       │           │   ├── api/         # API services
│       │           │   └── model/       # Data models
│       │           └── res/             # Resources
│       └── build.gradle
├── docs/
│   ├── SDD_BookBrow_Ruperez.md
│   └── API_DOCUMENTATION.md
└── README.md
```

## 📅 Development Timeline

### Phase 1: Planning & Design (Week 1-2)
- Requirements gathering and documentation
- System architecture design
- Database schema design
- UI/UX wireframes

### Phase 2: Backend Development (Week 3-4)
- Spring Boot setup and configuration
- Entity and repository creation
- JWT authentication implementation
- REST API endpoints development
- API testing

### Phase 3: Web Application (Week 5-6)
- React setup with TypeScript
- Authentication pages
- Book management interface
- Admin dashboard
- Responsive UI implementation

### Phase 4: Mobile Application (Week 7-8)
- Android Studio setup
- MVVM architecture implementation
- Authentication screens
- Book browsing and borrowing features
- APK generation

### Phase 5: Integration & Deployment (Week 9-10)
- End-to-end testing
- Bug fixing and optimization
- Security review
- Production deployment
- Final documentation

### Milestones
- **M1** (End Week 2): All design documents complete
- **M2** (End Week 4): Backend API fully functional
- **M3** (End Week 6): Web application complete
- **M4** (End Week 8): Mobile application complete
- **M5** (End Week 10): Full system deployed and integrated

## 🔒 Security

- All communication uses HTTPS
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Protection against SQL Injection, XSS
- Token expiration (1 hour default)
- Row-Level Security in Supabase

## 📊 Non-Functional Requirements

### Performance
- API response time: < 2 seconds for 95% of requests
- Support for 100+ concurrent users
- Database query completion: < 500ms

### Reliability
- 99% uptime during operational hours
- Graceful error handling
- Data integrity protection

### Compatibility
- **Web**: Chrome, Firefox, Edge (latest 2 versions)
- **Mobile**: Android 7.0+ (API Level 24+)
- **Responsive**: Mobile (360px+), Tablet (768px+), Desktop (1024px+)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Raymart N. Ruperez** - *Initial work and System Design*

## 📞 Contact

For questions or support, please contact:
- Email: your.email@example.com
- Project Link: [https://github.com/yourusername/bookbrow](https://github.com/yourusername/bookbrow)

## 🙏 Acknowledgments

- Spring Boot Documentation
- React Documentation
- Android Kotlin Documentation
- Supabase Documentation
- All contributors and testers

---

**Version**: 2.0  
**Last Updated**: March 3, 2026  
**Status**: Final
