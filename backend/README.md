# Backend API Documentation

## Overview

The InternConnect backend is built with Node.js and Express, providing RESTful APIs for the complete internship platform.

## Environment Variables

Create a `.env` file in the backend directory:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/internconnect
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

## Running the Backend

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm install --production
npm start
```

## API Endpoints Overview

### Authentication Routes (`/api/auth`)
- Student & Company registration and login
- Admin login
- JWT token generation

### Student Routes (`/api/students`)
- Profile management
- Search by skills
- View applications
- Update profile

### Company Routes (`/api/companies`)
- Company profile management
- View posted internships
- Update company details
- Verify status check

### Internship Routes (`/api/internships`)
- List internships with filters
- Get internship details
- Create/Update internships (company only)
- Close internships

### Application Routes (`/api/applications`)
- Submit applications
- View applications
- Accept/Reject applications
- Manage application status

### Task Routes (`/api/tasks`)
- Create recovery tasks
- List and filter tasks
- Submit task solutions
- Review submissions

### Team Routes (`/api/teams`)
- Create teams with automatic skill matching
- List teams
- Accept/Reject team proposals
- Calculate match scores

### Rating Routes (`/api/ratings`)
- Submit ratings and reviews
- Get ratings for users
- Calculate average ratings

### Admin Routes (`/api/admin`)
- Dashboard statistics
- Manage students
- Manage companies
- View application stats

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Error Handling

All errors return JSON in the following format:

```json
{
  "message": "Error description",
  "error": "detailed error message"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Database Schema

### Collections
- `students` - Student accounts and profiles
- `companies` - Company accounts and profiles
- `admins` - Admin accounts
- `internships` - Internship postings
- `applications` - Student applications
- `tasks` - Recovery tasks
- `teams` - Student teams
- `ratings` - Ratings and reviews

## Password Hashing

Passwords are hashed using bcryptjs with 10 salt rounds before storage. Never store or transmit plain text passwords.

## JWT Configuration

- Algorithm: HS256
- Expiration: 30 days
- Payload: `{ userId, role }`

## Rate Limiting

Currently not implemented but recommended for production deployment.

## CORS Configuration

CORS is enabled for all origins. Configure in production by modifying the cors middleware in server.js.

## File Uploads

Currently using URL-based resume storage. For production, implement:
- AWS S3 integration
- Cloud storage (Google Cloud Storage, Azure Blob)
- Local file storage with proper security

## Testing with cURL

```bash
# Student Registration
curl -X POST http://localhost:5000/api/auth/student/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "college": "MIT",
    "cgpa": 8.5,
    "skills": ["Python", "React"]
  }'

# Login
curl -X POST http://localhost:5000/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get Profile (with token)
curl -X GET http://localhost:5000/api/students/profile \
  -H "Authorization: Bearer <token>"
```

## Deployment

### Using Docker
```bash
docker build -t internconnect-backend .
docker run -p 5000:5000 -e MONGODB_URI=<uri> internconnect-backend
```

### Using Heroku
```bash
heroku create your-app-name
heroku config:set MONGODB_URI=<mongodb_uri>
heroku config:set JWT_SECRET=<secret_key>
git push heroku main
```

## Performance Optimization

1. Add database indexing on frequently queried fields
2. Implement caching with Redis
3. Use pagination for list endpoints
4. Add request compression with gzip

## Security Best Practices

1. Use HTTPS in production
2. Implement rate limiting
3. Validate all inputs
4. Use environment variables for secrets
5. Implement CSRF protection
6. Add helmet.js for security headers

## Monitoring & Logging

Recommended tools:
- Winston/Morgan for logging
- Sentry for error tracking
- New Relic for performance monitoring
- DataDog for comprehensive monitoring
