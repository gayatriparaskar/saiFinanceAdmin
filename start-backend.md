# Backend Server Setup Guide

## Issue: Cannot Get Expenses

The expense management system is showing demo data because the backend server is not running. Here's how to fix it:

## Quick Fix

### 1. Start the Backend Server

Navigate to the backend directory and start the server:

```bash
cd SaiFinanceBackend
npm install
npm start
```

The backend should run on `http://localhost:3001`

### 2. Alternative: Use Production Backend

If you can't start the local backend, the system will automatically try to connect to the production backend at `https://saifinancebackend.onrender.com/api/`

## What You'll See

### When Backend is Running:
- ✅ Green "Connected" badge
- Real expense data from your database
- Full functionality (create, edit, delete expenses)

### When Backend is Not Running:
- ⚠️ Yellow "Demo Mode" badge
- Demo expense data for testing
- Limited functionality (view only)

## Backend Requirements

Make sure you have:
1. Node.js installed
2. MongoDB running (if using local database)
3. All dependencies installed (`npm install`)

## Troubleshooting

If you're still having issues:

1. **Check if port 3001 is available:**
   ```bash
   netstat -an | grep 3001
   ```

2. **Check backend logs:**
   ```bash
   cd SaiFinanceBackend
   npm start
   ```

3. **Verify database connection:**
   - Check MongoDB is running
   - Verify database credentials in backend config

## Current Status

The expense management system is now working with:
- ✅ List and Card view toggle
- ✅ Advanced filtering and search
- ✅ Demo data when backend is offline
- ✅ Real data when backend is connected
- ✅ Connection status indicators
- ✅ Error handling and user feedback
