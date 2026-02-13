# Fix for 401 Unauthorized Error on Assignment Submission

## Problem
When submitting assignments from student side, getting error:
```
Error: Not authorized to access this route
Status: 401 (Unauthorized)
```

## Root Cause
The `protect` middleware is failing to authenticate the user, which means:
1. Token might not be sent correctly from frontend
2. Token might be invalid/expired
3. JWT_SECRET might not match
4. User might not exist in database

## Fixes Applied

### 1. ✅ Improved Authentication Middleware Logging
**File**: `student_dash_ba/project/backend/middleware/auth.js`
- Added detailed console logging for debugging
- Better error messages for different failure scenarios
- Checks for JWT_SECRET existence

### 2. ✅ Fixed Route Middleware Application
**File**: `student_dash_ba/project/backend/routes/assessments.js`
- Changed from individual `protect` on each route to `router.use(protect)`
- This ensures middleware runs before any route handler

**File**: `student_dash_ba/project/backend/server.js`
- Removed duplicate `protect` middleware (was applied twice)

### 3. ✅ Added Frontend Debugging
**File**: `student_dash_ba/project/src/services/api.js`
- Added console logging for token presence
- Logs request details before sending
- Better error handling

### 4. ✅ Added Controller-Level User Check
**File**: `student_dash_ba/project/backend/controllers/assessments.js`
- Added explicit check for `req.user`
- Better error message if user is not authenticated

## Debugging Steps

### Check Backend Logs
When you try to submit, check the backend console for:
1. `🔑 Token found in localStorage` - Frontend has token
2. `📤 POST request to:` - Request is being sent
3. `✅ Token decoded successfully` - Token is valid
4. `✅ User authenticated:` - User found in database
5. `📤 Submit assessment request received` - Controller received request

### Common Issues and Solutions

#### Issue 1: Token Not Found
**Symptoms**: Console shows `⚠️ No token found in localStorage`
**Solution**: 
- User needs to login again
- Check if token is being saved on login
- Clear localStorage and login again

#### Issue 2: Token Invalid/Expired
**Symptoms**: Console shows `❌ Token verification error: ...`
**Solution**:
- Token might be expired (check JWT_EXPIRE in .env)
- Token might be from different backend (check JWT_SECRET matches)
- User needs to login again

#### Issue 3: User Not Found
**Symptoms**: Console shows `❌ User not found for token: ...`
**Solution**:
- User might have been deleted from database
- User ID in token doesn't match database
- Need to recreate user or login again

#### Issue 4: JWT_SECRET Not Set
**Symptoms**: Console shows `❌ JWT_SECRET is not set`
**Solution**:
- Check `.env` file has `JWT_SECRET` set
- Restart backend server after setting JWT_SECRET

## Testing Checklist

1. **Check Token in Browser**:
   ```javascript
   // Open browser console and run:
   localStorage.getItem('token')
   ```
   Should return a JWT token string

2. **Check Backend Logs**:
   - Look for authentication logs when submitting
   - Check for any error messages

3. **Verify Environment Variables**:
   - `JWT_SECRET` is set in `.env`
   - `JWT_EXPIRE` is set (default: 7d)
   - `MONGODB_URI` is correct

4. **Test Login Again**:
   - Logout and login again
   - This will generate a fresh token
   - Try submitting again

## Next Steps

1. **Restart Student Backend**:
   ```bash
   cd student_dash_ba/project/backend
   node server.js
   ```

2. **Check Console Logs**:
   - Open browser console (F12)
   - Try submitting assignment
   - Check for the debug logs I added

3. **Check Backend Logs**:
   - Look at terminal where backend is running
   - Check for authentication logs
   - Look for any error messages

4. **If Still Failing**:
   - Share the console logs (both browser and backend)
   - Check if token exists: `localStorage.getItem('token')`
   - Verify user exists in database
   - Check JWT_SECRET matches between login and verification

## Expected Behavior

After fixes:
1. Frontend logs: `🔑 Token found in localStorage, adding to headers`
2. Frontend logs: `📤 POST request to: http://localhost:5000/api/assessments/...`
3. Backend logs: `✅ Token decoded successfully: { id: ..., email: ... }`
4. Backend logs: `✅ User authenticated: user@email.com`
5. Backend logs: `📤 Submit assessment request received: { user: { id: ..., email: ... } }`
6. Submission succeeds!

If any step fails, the logs will show exactly where it's failing.

