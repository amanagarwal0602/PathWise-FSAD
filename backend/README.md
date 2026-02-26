# PathWise Java Spring Boot Backend

## Prerequisites
- Java 17 or higher
- Maven 3.6+ (or use included Maven wrapper)

## Database Configuration
The application connects to MySQL database:
- Host: sql12.freesqldatabase.com
- Port: 3306
- Database: sql12818196
- Configuration is in `src/main/resources/application.properties`

## Running the Backend

### Option 1: Using Maven (if installed)
```bash
cd backend
mvn spring-boot:run
```

### Option 2: Using IDE
1. Open the `backend` folder in IntelliJ IDEA or Eclipse
2. Run the `PathWiseApplication.java` main class

### Option 3: Build JAR and Run
```bash
cd backend
mvn clean package -DskipTests
java -jar target/pathwise-backend-1.0.0.jar
```

## API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### Authentication
- `POST /api/auth/login` - Login with email/username and password
- `POST /api/auth/register` - Register new user
- `GET /api/auth/check-email?email=xxx` - Check if email exists
- `GET /api/auth/check-username?username=xxx` - Check if username exists

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/role/{role}` - Get users by role (STUDENT, COUNSELLOR, ADMIN, etc.)
- `GET /api/users/pending-verification` - Get users pending verification
- `PUT /api/users/{id}` - Update user
- `POST /api/users/{id}/verify` - Verify a user
- `POST /api/users/{id}/reject` - Reject a user
- `POST /api/users/{id}/promote` - Promote user to new role
- `DELETE /api/users/{id}` - Delete user

### Chat
- `GET /api/chat/conversation/{userId}/{otherUserId}` - Get conversation
- `POST /api/chat/send` - Send message
- `GET /api/chat/unread/{userId}` - Get unread messages
- `GET /api/chat/unread-count/{userId}` - Get unread count

### Meetings
- `GET /api/meetings/student/{studentId}` - Get student meetings
- `GET /api/meetings/counsellor/{counsellorId}` - Get counsellor meetings
- `POST /api/meetings` - Schedule meeting
- `PUT /api/meetings/{id}/status` - Update meeting status
- `DELETE /api/meetings/{id}` - Cancel meeting

### Tests
- `GET /api/tests/student/{studentId}` - Get student test results
- `POST /api/tests` - Save test result

### Assessments
- `GET /api/assessments/student/{studentId}` - Get student assessment
- `POST /api/assessments` - Save assessment

## Master Password
For development/testing, password "1111" works for any account.

## Frontend Integration
The frontend API service is at `src/utils/api.js`.
Set environment variable `VITE_API_URL` to point to backend URL (default: http://localhost:8080/api)

## CORS
CORS is configured to allow requests from:
- http://localhost:* (any port)
- https://*.vercel.app
