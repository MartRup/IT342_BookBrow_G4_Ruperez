# BookBrow Library Management System

## 📚 Project Overview

BookBrow is a comprehensive library management system built with Spring Boot backend following **Vertical Slicing Architecture**. The system supports multiple user roles (User, Librarian, Admin) with complete book borrowing and management capabilities.

## 🏗️ Architecture

### Vertical Slicing Architecture

This project follows **vertical slicing architecture** where each feature contains all necessary layers:

```
feature/
├── controller/     # REST API endpoints
├── service/        # Business logic
├── repository/     # Data access
├── entity/         # Domain models
└── dto/           # Data transfer objects
```

**Benefits:**
- ✅ Better modularity and maintainability
- ✅ Team members can work on different features independently
- ✅ Easy to test individual features
- ✅ Changes are localized to specific slices
- ✅ Scalable architecture for adding new features

## 🎯 Features Implemented

### 1. **Librarian Dashboard** ✨ NEW
- Real-time statistics (borrowed, due soon, returned books)
- Quick overview of library operations
- Timestamp tracking for data freshness

### 2. **User Management** ✨ NEW
- View all users with pagination and search
- Detailed user profiles with borrowing history
- Update user information (name, email, phone, role)
- Activate/deactivate user accounts
- Role management (USER, LIBRARIAN, ADMIN)
- Email uniqueness validation

### 3. **Borrow Record Management** ✨ NEW
- View all borrow records with filtering
- Filter by status: active, overdue, returned, pending, rejected
- Detailed record information
- Integration with existing approve/reject/return workflows

### 4. **Book Management**
- CRUD operations for books
- Search and filter books
- Google Books API integration for external search
- Featured books display
- Availability tracking

### 5. **Borrowing System**
- User book borrowing requests
- Librarian approval/rejection workflow
- Book return processing
- Overdue tracking
- Status management (PENDING, APPROVED, RETURNED, REJECTED)

### 6. **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (RBAC)
- Secure password hashing
- User registration and login
- Librarian account creation (Admin only)

### 7. **User Profile Management**
- Update personal information
- Change password
- Account deletion
- Profile customization

### 8. **Admin Dashboard**
- System-wide statistics
- User role management
- System logs
- Complete administrative control

## 🚀 Technology Stack

### Backend
- **Framework:** Spring Boot 3.x
- **Language:** Java 19
- **Security:** Spring Security + JWT
- **Database:** MySQL (via JPA/Hibernate)
- **Build Tool:** Maven
- **Architecture:** Vertical Slicing

### Key Dependencies
- Spring Web
- Spring Security
- Spring Data JPA
- Lombok
- MySQL Connector
- JWT (JSON Web Tokens)

## 📁 Project Structure

```
backend/bookbrow/
├── src/main/java/com/example/bookbrow/
│   ├── feature/
│   │   ├── admin/          # Admin dashboard & logs
│   │   ├── auth/           # Authentication & registration
│   │   ├── books/          # Book management
│   │   ├── borrow/         # Borrowing system
│   │   ├── dashboard/      # User dashboard
│   │   ├── librarian/      # ✨ Librarian feature (NEW)
│   │   │   ├── controller/
│   │   │   │   └── LibrarianController.java
│   │   │   ├── service/
│   │   │   │   ├── LibrarianDashboardService.java
│   │   │   │   ├── LibrarianUserService.java
│   │   │   │   └── LibrarianRecordService.java
│   │   │   └── dto/
│   │   │       ├── UserListDto.java
│   │   │       ├── UserDetailsDto.java
│   │   │       └── UpdateUserRequest.java
│   │   └── users/          # User management
│   ├── shared/             # Shared utilities
│   │   ├── dto/           # Response builders
│   │   ├── event/         # Application events
│   │   └── security/      # Security configuration
│   └── BookbrowApplication.java
├── LIBRARIAN_FEATURE.md    # ✨ Detailed librarian documentation
├── API_ENDPOINTS.md        # ✨ Complete API reference
└── pom.xml
```

## 🔐 User Roles & Permissions

| Feature | USER | LIBRARIAN | ADMIN |
|---------|------|-----------|-------|
| Browse Books | ✅ | ✅ | ✅ |
| Borrow Books | ✅ | ❌ | ❌ |
| View Own Records | ✅ | ❌ | ❌ |
| Manage Books | ❌ | ✅ | ✅ |
| Approve/Reject Borrows | ❌ | ✅ | ✅ |
| View All Users | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ✅ | ✅ |
| Change User Roles | ❌ | ❌ | ✅ |
| View System Logs | ❌ | ❌ | ✅ |
| System Administration | ❌ | ❌ | ✅ |

## 🛠️ Setup & Installation

### Prerequisites
- Java 19 or higher
- Maven 3.8+
- MySQL 8.0+

### Database Setup

1. Create database:
```sql
CREATE DATABASE bookbrow;
```

2. Update `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bookbrow
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Running the Application

```bash
# Navigate to backend directory
cd backend/bookbrow

# Build the project
./mvnw clean install

# Run the application
./mvnw spring-boot:run
```

The API will be available at: `http://localhost:8080`

## 📖 API Documentation

### Quick Start

1. **Register a user:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

2. **Login:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

3. **Access protected endpoints:**
```bash
curl -X GET http://localhost:8080/api/v1/librarian/stats \
  -H "Authorization: Bearer <your_token>"
```

### Complete API Reference

See [API_ENDPOINTS.md](backend/bookbrow/API_ENDPOINTS.md) for complete API documentation.

## 📚 Librarian Feature Documentation

The librarian feature is fully documented in [LIBRARIAN_FEATURE.md](backend/bookbrow/LIBRARIAN_FEATURE.md), including:

- Architecture overview
- All endpoints with examples
- Request/response formats
- Error handling
- Database schema
- Testing guide
- Future enhancements

### Key Librarian Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/librarian/stats` | GET | Dashboard statistics |
| `/api/v1/librarian/users` | GET | List all users |
| `/api/v1/librarian/users/{id}` | GET | User details |
| `/api/v1/librarian/users/{id}` | PUT | Update user |
| `/api/v1/librarian/users/{id}/deactivate` | PUT | Deactivate user |
| `/api/v1/librarian/users/{id}/activate` | PUT | Activate user |
| `/api/v1/librarian/records` | GET | List borrow records |
| `/api/v1/librarian/records/{id}` | GET | Record details |

## 🧪 Testing

### Build & Compile
```bash
./mvnw clean compile
```

### Run Tests
```bash
./mvnw test
```

### Test Coverage
- Unit tests for services
- Integration tests for controllers
- Repository tests for data access

## 🔒 Security Features

- **JWT Authentication:** Secure token-based authentication
- **Password Hashing:** BCrypt password encoding
- **Role-Based Access Control:** Fine-grained permissions
- **CORS Configuration:** Configurable cross-origin requests
- **Input Validation:** Request validation and sanitization
- **Error Handling:** Standardized error responses

## 📊 Database Schema

### Core Tables
- `users` - User accounts and profiles
- `books` - Book inventory
- `borrow_records` - Borrowing transactions
- `system_logs` - Audit trail

### Relationships
- User → BorrowRecord (One-to-Many)
- Book → BorrowRecord (One-to-Many)
- User (Librarian) → BorrowRecord (processed_by)

## 🎨 Frontend Integration

The backend is designed to work with any frontend framework. Key integration points:

1. **Authentication:** JWT tokens in Authorization header
2. **CORS:** Configured for cross-origin requests
3. **REST API:** Standard HTTP methods and status codes
4. **JSON:** All requests/responses in JSON format

### Example Frontend Flow

```javascript
// 1. Login
const response = await fetch('http://localhost:8080/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { data } = await response.json();
const token = data.token;

// 2. Access protected endpoint
const users = await fetch('http://localhost:8080/api/v1/librarian/users', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 📱 Mobile Application

A React Native mobile app is now available for end users!

### Quick Start

```bash
cd mobile
npm install
npm start
```

See [mobile/QUICKSTART.md](mobile/QUICKSTART.md) for 5-minute setup guide.

### Features
- ✅ User authentication (login/register)
- ✅ Browse and search books
- ✅ Borrow books
- ✅ View borrowed books and history
- ✅ Profile management
- ✅ Dark mode support

### Documentation
- [Mobile README](mobile/README.md) - Complete documentation
- [Setup Guide](mobile/SETUP.md) - Detailed setup instructions
- [Quick Start](mobile/QUICKSTART.md) - Get running in 5 minutes

## 🚧 Future Enhancements

### Phase 1 (Current) ✅
- ✅ User authentication
- ✅ Book management
- ✅ Borrowing system
- ✅ Librarian dashboard
- ✅ User management
- ✅ Mobile app for users

### Phase 2 (Planned)
- [ ] Email notifications
- [ ] Advanced search filters
- [ ] Book recommendations
- [ ] Reading history analytics
- [ ] Fine calculation for overdue books
- [ ] Push notifications (mobile)

### Phase 3 (Future)
- [ ] QR code scanning (mobile)
- [ ] Multi-library support
- [ ] Book reservation system
- [ ] Integration with external library systems
- [ ] Offline mode (mobile)

## 🤝 Contributing

### Development Workflow

1. Create a new feature branch
2. Implement feature following vertical slicing architecture
3. Write tests for new functionality
4. Update documentation
5. Submit pull request

### Code Style Guidelines

- Use Lombok annotations (`@Data`, `@Builder`, etc.)
- Follow RESTful conventions
- Use `ResponseBuilder` for consistent responses
- Add logging with `@Slf4j`
- Write descriptive error messages
- Document all public APIs

## 📝 License

Internal project for BookBrow Library Management System

## 👥 Team

- **Backend Development:** Spring Boot Team
- **Architecture:** Vertical Slicing Pattern
- **Security:** Spring Security Implementation
- **Database:** MySQL Design

## 📞 Support

For questions or issues:
- Check [API_ENDPOINTS.md](backend/bookbrow/API_ENDPOINTS.md) for API documentation
- Review [LIBRARIAN_FEATURE.md](backend/bookbrow/LIBRARIAN_FEATURE.md) for librarian features
- Contact the development team

---

**Built with ❤️ using Spring Boot and Vertical Slicing Architecture**
