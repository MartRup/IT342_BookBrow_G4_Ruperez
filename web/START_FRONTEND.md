# 🚀 Quick Start - Frontend

## Start the React App

```bash
cd web
npm start
```

The app will automatically open at **http://localhost:3000**

## Login Credentials

**Admin Account:**
```
Email: admin@bookbrow.com
Password: password123
```

## Where to See Books

After logging in, you can view books in these locations:

### For Regular Users:
1. Click **"Browse Library"** in the navigation menu
2. URL: `http://localhost:3000/borrow-items`

### For Admins:
1. Go to **Admin Dashboard**
2. Click **"Manage Books"**
3. URL: `http://localhost:3000/admin/manage-books`

### For Librarians:
1. Go to **Librarian Dashboard**
2. Click **"Manage Books"**
3. URL: `http://localhost:3000/librarian/manage-books`

## Expected Result

You should see **10 books** displayed in a grid:
- 8 books marked as "Available" (green badge)
- 2 books marked as "Borrowed" (red badge)

## Features You Can Test

✅ **Search** - Type book title or author name
✅ **Filter** - Show only Available or Borrowed books
✅ **Borrow** - Click "Borrow Now" on available books
✅ **View Details** - See book title, author, description, and status

---

**Backend must be running on port 8080 for this to work!**
