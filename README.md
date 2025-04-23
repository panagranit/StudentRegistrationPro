# CT America Student Registration System

A comprehensive web application for managing student registrations, admin approvals, and student access to course materials.

## Features

- **Student Registration**: Students can register for courses by providing personal information
- **Admin Dashboard**: Administrators can review, approve, or reject student registrations
- **Credential Generation**: Automatic generation of secure usernames and passwords upon approval
- **Student Access**: Approved students can log in to access their course materials
- **External API**: Secure API endpoint for verifying student credentials from other systems

## Tech Stack

- **Frontend**: React, TailwindCSS, shadcn/ui components
- **Backend**: Express.js REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with Passport.js

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd ct-america-registration
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   ```
   npm run db:push
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open http://localhost:5000 in your browser

## API Documentation

### External Authentication API

The system provides a secure API endpoint for external services to verify student credentials:

**Endpoint**: `POST /api/check_user`

**Headers**:
- `Content-Type: application/json`
- `x-api-key: YOUR_API_KEY` (Contact administrator for API key)

**Request Body**:
```json
{
  "email": "student@example.com",
  "password": "studentPassword"
}
```

**Response (Successful Authentication)**:
```json
{
  "status": "approved",
  "studentId": "ST123456",
  "fullName": "Student Name",
  "course": "cs101"
}
```

**Response (Failed Authentication)**:
```json
{
  "status": "denied"
}
```

## Admin Login

- Default admin credentials:
  - Username: `admin`
  - Password: `password`

*Note: Change the default admin password in production.*

## License

[MIT License](LICENSE)

## Contact

For support or inquiries, contact CT America administration.