# 🧪 Test Books API

## Quick API Test

Open your browser and test the API directly:

### 1. Test Health Endpoint
```
http://localhost:8080/api/v1/auth/health
```

Should return: `{ "status": "OK" }`

### 2. Test Books Endpoint (requires authentication)

First, login to get a token:

**POST** `http://localhost:8080/api/v1/auth/login`
```json
{
  "email": "admin@bookbrow.com",
  "password": "password123"
}
```

Copy the `token` from the response.

Then test books endpoint with the token:

**GET** `http://localhost:8080/api/v1/books?page=1&limit=20`

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Expected Response Structure

```json
{
  "success": true,
  "data": {
    "books": [
      {
        "id": 1,
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "description": "A classic American novel...",
        "available": true,
        "createdAt": "2025-04-15T...",
        "updatedAt": "2025-04-15T..."
      },
      // ... 9 more books
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "pages": 1
    }
  },
  "timestamp": "2026-04-15T..."
}
```

## Frontend Console Test

Open browser DevTools (F12) → Console tab, and run:

```javascript
// Check localStorage
console.log('User:', JSON.parse(localStorage.getItem('user')));

// Test API call
fetch('http://localhost:8080/api/v1/books?page=1&limit=20', {
  headers: {
    'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('user')).token
  }
})
.then(r => r.json())
.then(data => {
  console.log('Books Response:', data);
  console.log('Books Array:', data.data.books);
  console.log('Number of books:', data.data.books.length);
});
```

## Troubleshooting

### If you see "No books found" in the UI:

1. **Check browser console** (F12) for errors
2. **Check Network tab** - Look for the `/api/v1/books` request
3. **Check the response** - Should have `data.books` array with 10 items

### Common Issues:

**401 Unauthorized:**
- Token expired or invalid
- Solution: Logout and login again

**CORS Error:**
- Backend CORS not configured
- Solution: Check `@CrossOrigin(origins = "*")` in BookController

**Empty array:**
- Books not seeded in database
- Solution: Restart backend to trigger DataInitializer

**Network Error:**
- Backend not running
- Solution: Start backend on port 8080

---

## Quick Fix Commands

### Clear browser cache and login again:
```javascript
localStorage.clear();
window.location.href = '/login';
```

### Force refresh books:
```javascript
window.location.reload();
```
