# CT America API Usage Examples

This file contains code examples for integrating with the CT America student registration system API.

## API Authentication

All API requests require authentication using an API key in the request headers.

**API Key**: `ct_america_api_key_2025`

## Check User Credentials API

Endpoint: `POST /api/check_user`

This endpoint verifies if student credentials are valid and returns the student's information if approved.

### JavaScript/Fetch Example

```javascript
fetch('https://your-app-url.com/api/check_user', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'ct_america_api_key_2025'  // API key for authentication
  },
  body: JSON.stringify({
    email: 'student@example.com',  // Student email
    password: 'studentPassword'    // Student password
  })
})
.then(response => response.json())
.then(data => {
  // Handle the response data
  console.log(data);
  
  if (data.status === 'approved') {
    // Student is approved - grant access
    console.log('Student verified:', data.fullName);
    console.log('Student ID:', data.studentId);
    console.log('Course:', data.course);
  } else {
    // Authentication failed
    console.log('Authentication failed');
  }
})
.catch(error => {
  console.error('Error:', error);
});
```

### Axios Example

```javascript
axios.post('https://your-app-url.com/api/check_user', 
  {
    email: 'student@example.com',  // Student email
    password: 'studentPassword'    // Student password
  },
  {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'ct_america_api_key_2025'  // API key for authentication
    }
  }
)
.then(response => {
  const data = response.data;
  
  // Handle the response data
  if (data.status === 'approved') {
    // Student is approved - grant access
    console.log('Student verified:', data.fullName);
    console.log('Student ID:', data.studentId);
    console.log('Course:', data.course);
  } else {
    // Authentication failed
    console.log('Authentication failed');
  }
})
.catch(error => {
  console.error('Error:', error);
});
```

## Response Format

### Successful Authentication

```json
{
  "status": "approved",
  "studentId": "ST123456",
  "fullName": "Student Name",
  "course": "cs101"
}
```

### Failed Authentication

```json
{
  "status": "denied"
}
```

## Implementation Notes

1. Replace `https://your-app-url.com` with the actual URL of your deployed application
2. For security in production environments:
   - Store the API key securely (not in client-side code)
   - Consider implementing server-side proxies for API calls
   - Use HTTPS for all requests
3. Handle network errors and timeout scenarios appropriately