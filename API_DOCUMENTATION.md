# 📚 Kitchen of Tech API Documentation

Complete REST API documentation for the Kitchen of Tech platform.

## 🔗 Quick Links

- **Interactive Documentation**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **OpenAPI Spec**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 🔐 Authentication

### JWT Authentication

Most endpoints require JWT authentication. Include the JWT token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Getting a JWT Token

**Endpoint**: `POST /api/auth/login`

```json
{
  "username": "your_username",
  "password": "your_password"
}
```

**Response**:
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username"
  }
}
```

### CSRF Protection

POST, PATCH, PUT, and DELETE requests require CSRF tokens. Include the token in the header:

```bash
x-csrf-token: <csrf_token>
```

Get CSRF token from cookies after any GET request or from the response headers.

---

## 📊 Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|---------|
| Authentication | 5 requests | 5 minutes |
| Mutations (POST/PATCH/PUT/DELETE) | 10 requests | 1 minute |
| Queries (GET) | 30 requests | 1 minute |
| File Uploads | 3 requests | 5 minutes |

Rate limit exceeded responses return HTTP `429` with `Retry-After` header.

---

## 📡 API Endpoints

### Authentication

#### Login
- **POST** `/api/auth/login`
- **Body**: `{ username, password }`
- **Rate Limit**: 5 per 5 minutes
- **Returns**: JWT token in cookie

#### Logout
- **POST** `/api/auth/logout`
- **Auth**: Required
- **Returns**: Success message

---

### Users

#### Get All Users
- **GET** `/api/users`
- **Auth**: Required (Admin only)
- **Query Params**: 
  - `page` (default: 1)
  - `limit` (default: 10)
- **Returns**: Paginated list of users

#### Create User
- **POST** `/api/users`
- **Auth**: Not required (registration)
- **CSRF**: Required
- **Body**: 
```json
{
  "username": "string",
  "email": "string",
  "password": "string (min 8 chars)",
  "full_name": "string",
  "role_id": "uuid"
}
```

#### Get User by ID
- **GET** `/api/users/[id]`
- **Auth**: Required
- **Returns**: User details

#### Update User
- **PATCH** `/api/users/[id]`
- **Auth**: Required (Own account or Admin)
- **CSRF**: Required
- **Body**: Partial user object

#### Delete User
- **DELETE** `/api/users/[id]`
- **Auth**: Required (Admin only)
- **CSRF**: Required

#### Update Password
- **PATCH** `/api/users/[id]/password`
- **Auth**: Required (Own account)
- **CSRF**: Required
- **Body**: 
```json
{
  "currentPassword": "string",
  "newPassword": "string (min 8 chars)"
}
```

---

### Payments

#### Submit Payment
- **POST** `/api/payment/submit`
- **Auth**: Required
- **CSRF**: Required
- **Body**: 
```json
{
  "amount": "number (min 0.01)",
  "currency": "USD | EUR | GBP",
  "payment_method": "bkash | nagad | rocket | bank_transfer | credit_card",
  "description": "string (min 10 chars)"
}
```

#### Approve Payment
- **POST** `/api/payment/approve`
- **Auth**: Required (Admin only)
- **CSRF**: Required
- **Body**: 
```json
{
  "payment_id": "uuid",
  "admin_notes": "string (optional)"
}
```

#### Reject Payment
- **POST** `/api/payment/reject`
- **Auth**: Required (Admin only)
- **CSRF**: Required
- **Body**: 
```json
{
  "payment_id": "uuid",
  "admin_notes": "string (required)"
}
```

#### Get Payment Transactions
- **GET** `/api/payment/transactions`
- **Auth**: Required (Admin sees all, users see own)
- **Query Params**: `page`, `limit`, `status`

#### Get Payment Methods
- **GET** `/api/payment/methods`
- **Auth**: Required
- **Returns**: List of available payment methods

#### Create Payment Link
- **POST** `/api/payment/links`
- **Auth**: Required (Admin only)
- **CSRF**: Required
- **Body**: 
```json
{
  "amount": "number",
  "description": "string",
  "expires_at": "ISO 8601 date"
}
```

---

### Testimonials

#### Get All Testimonials
- **GET** `/api/testimonials`
- **Auth**: Not required (public endpoint)
- **Query Params**: `status=approved` (default)
- **Returns**: List of approved testimonials

#### Submit Testimonial
- **POST** `/api/testimonials`
- **Auth**: Not required (via link)
- **CSRF**: Required
- **Body**: 
```json
{
  "name": "string",
  "email": "string",
  "company": "string (optional)",
  "position": "string (optional)",
  "rating": "number (1-5)",
  "message": "string"
}
```

#### Update Testimonial Status
- **PATCH** `/api/testimonials/[id]`
- **Auth**: Required (Admin only)
- **CSRF**: Required
- **Body**: 
```json
{
  "status": "approved | rejected",
  "admin_notes": "string (optional)"
}
```

#### Create Testimonial Link
- **POST** `/api/testimonials/links`
- **Auth**: Required (Admin only)
- **CSRF**: Required
- **Body**: 
```json
{
  "client_email": "string",
  "client_name": "string",
  "project_name": "string"
}
```

---

### Service Categories

#### Get Service Categories
- **GET** `/api/service-categories`
- **Auth**: Not required
- **Cache**: 24 hours (static content)
- **Returns**: List of service categories with colors and order

---

### Education

#### Enroll in Course
- **POST** `/api/education/enroll`
- **Auth**: Required
- **CSRF**: Required
- **Body**: 
```json
{
  "course_id": "string",
  "coupon_code": "string (optional)"
}
```

#### Get Enrollments
- **GET** `/api/education/enrollments`
- **Auth**: Required
- **Returns**: User's course enrollments

#### Update Progress
- **POST** `/api/education/progress`
- **Auth**: Required
- **CSRF**: Required
- **Body**: 
```json
{
  "enrollment_id": "uuid",
  "lesson_id": "string",
  "completed": "boolean"
}
```

#### Submit Assignment
- **POST** `/api/education/assignment/submit`
- **Auth**: Required
- **CSRF**: Required
- **Body**: 
```json
{
  "assignment_id": "string",
  "submission_url": "string",
  "notes": "string (optional)"
}
```

#### Submit Quiz
- **POST** `/api/education/quiz/submit`
- **Auth**: Required
- **CSRF**: Required
- **Body**: 
```json
{
  "quiz_id": "string",
  "answers": "object"
}
```

#### Generate Certificate
- **POST** `/api/education/certificate/generate`
- **Auth**: Required
- **Body**: 
```json
{
  "enrollment_id": "uuid"
}
```

---

### Projects

#### Get All Projects
- **GET** `/api/projects`
- **Auth**: Required
- **Query Params**: `page`, `limit`, `team_id`

#### Create Project
- **POST** `/api/projects`
- **Auth**: Required (Admin or Team Lead)
- **CSRF**: Required
- **Body**: 
```json
{
  "name": "string",
  "description": "string",
  "team_id": "uuid",
  "start_date": "ISO 8601 date",
  "end_date": "ISO 8601 date (optional)",
  "status": "active | completed | on_hold"
}
```

#### Update Project
- **PATCH** `/api/projects/[id]`
- **Auth**: Required (Admin or Team Lead)
- **CSRF**: Required

#### Delete Project
- **DELETE** `/api/projects/[id]`
- **Auth**: Required (Admin only)
- **CSRF**: Required

---

### Tasks

#### Get All Tasks
- **GET** `/api/tasks`
- **Auth**: Required
- **Query Params**: `project_id`, `assigned_to`, `status`

#### Create Task
- **POST** `/api/tasks`
- **Auth**: Required
- **CSRF**: Required
- **Body**: 
```json
{
  "title": "string",
  "description": "string",
  "project_id": "uuid",
  "assigned_to": "uuid",
  "priority": "low | medium | high",
  "due_date": "ISO 8601 date"
}
```

#### Update Task
- **PATCH** `/api/tasks/[id]`
- **Auth**: Required (Assigned user or Admin)
- **CSRF**: Required

---

### Teams

#### Get All Teams
- **GET** `/api/teams`
- **Auth**: Required

#### Create Team
- **POST** `/api/teams`
- **Auth**: Required (Admin only)
- **CSRF**: Required
- **Body**: 
```json
{
  "name": "string",
  "description": "string"
}
```

#### Get Team Members
- **GET** `/api/teams/[id]/members`
- **Auth**: Required

#### Add Team Member
- **POST** `/api/teams/[id]/members`
- **Auth**: Required (Admin or Team Lead)
- **CSRF**: Required
- **Body**: 
```json
{
  "user_id": "uuid",
  "role": "member | lead"
}
```

---

## 📋 Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": { ... }
}
```

### Paginated Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 🔧 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid JWT |
| 403 | Forbidden - Insufficient permissions or missing CSRF token |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## 📝 Example Requests

### cURL Example
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","password":"SecurePassword123!"}'

# Get service categories
curl http://localhost:3000/api/service-categories

# Submit payment (with auth)
curl -X POST http://localhost:3000/api/payment/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "x-csrf-token: <csrf_token>" \
  -d '{"amount":100,"currency":"USD","payment_method":"credit_card","description":"Service payment"}'
```

### JavaScript/Fetch Example
```javascript
// Using the CSRF client utility
import { api } from '@/lib/csrf-client';

// Login
const login = async () => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'johndoe', password: 'password' })
  });
  return response.json();
};

// Submit payment with CSRF protection
const submitPayment = async (paymentData) => {
  return await api.post('/api/payment/submit', paymentData);
};
```

---

## 🎯 Best Practices

1. **Always handle rate limits**: Check for 429 responses and implement exponential backoff
2. **Store JWT securely**: Use httpOnly cookies (automatically handled by our auth system)
3. **Validate input**: All requests are validated with Zod schemas
4. **Use CSRF tokens**: Required for all mutation operations
5. **Handle errors gracefully**: Always check response status and handle error objects
6. **Cache when possible**: GET endpoints have appropriate cache headers
7. **Test with Postman**: Import the OpenAPI spec into Postman for easy testing

---

## 🧪 Testing

Run the E2E tests to verify API functionality:

```bash
npm run test:e2e
```

Run unit tests for validation schemas:

```bash
npm test
```

---

## 📞 Support

For API support, contact:
- **Email**: support@kitchenoftech.org
- **Documentation Issues**: Create an issue on GitHub

---

**Last Updated**: January 29, 2026  
**API Version**: 1.0.0
