## Quick Auth Debug Test Guide

### 🚀 Quick Start Test

**Time Required:** 5 minutes

---

## Setup (Do Once)

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Backend
cd backend
npm install
npm start

# Terminal 3: Start Frontend
cd frontend
npm install
npm start
```

**Expected:**
- ✅ Backend: "Backend server running on port 5000"
- ✅ Frontend: Opens http://localhost:3000

---

## Test 1: Student Registration

### Step 1: Open Browser
- URL: http://localhost:3000
- Press F12 to open Developer Tools
- Go to **Console** tab

### Step 2: Register
1. Click "Register"
2. Select "Student"
3. Fill exactly:
   ```
   Name: Test Student
   Email: test.student@example.com
   Password: Test@12345
   College: Test University
   CGPA: 3.5
   Skills: React, Node.js
   ```
4. Click "Register"

### Step 3: Check Console Logs

**You should see:**
```
✅ "📝 REGISTER STUDENT - Request received:"
✅ "💾 Saving student to database..."
✅ "✅ Student saved successfully:"
✅ "✅ Student Registration Response:"
```

**Success:** Browser shows "Registration successful! Please login."

---

## Test 2: Student Login

### Step 1: Already on Login Page
1. Keep page on Login
2. Select "Student"
3. Enter:
   ```
   Email: test.student@example.com
   Password: Test@12345
   ```
4. Click "Login"

### Step 2: Check Console Logs

**You should see:**
```
✅ "🔐 LOGIN STUDENT - Request received:"
✅ "✅ Student found:"
✅ "🔐 Password match result: true"
✅ "✅ Password matches!"
✅ "✅ Login Response: {message: 'Login successful'..."
```

**Success:** Browser navigates to Student Dashboard

---

## Test 3: Company Registration

### Step 1: Register
1. Go back to http://localhost:3000
2. Click "Register"
3. Select "Company"
4. Fill:
   ```
   Name: Admin Name
   Email: company@example.com
   Password: Company@12345
   Company Name: Tech Company Inc
   Industry: Software Development
   Location: San Francisco, CA
   Website: www.techcompany.com
   ```
5. Click "Register"

### Step 2: Check Console

**You should see:**
```
✅ "📝 REGISTER COMPANY - Request received:"
✅ "✅ Company saved successfully:"
```

---

## Test 4: Company Login

### Step 1: Login
1. Go to http://localhost:3000/login
2. Select "Company"
3. Enter:
   ```
   Email: company@example.com
   Password: Company@12345
   ```
4. Click "Login"

### Step 2: Check Console

**You should see:**
```
✅ "🔐 LOGIN COMPANY - Request received:"
✅ "✅ Company found:"
✅ "🔐 Password match result: true"
✅ "✅ Login Response: {message: 'Login successful'..."
```

**Success:** Browser navigates to Company Dashboard

---

## Backend Console Should Show

```
📨 2024-01-XX - POST /api/auth/student/register
Body: {name: 'Test Student', email: 'test.student@example.com', ...}

📝 REGISTER STUDENT - Request received
📝 Normalized Email: test.student@example.com
🔐 [Student Model] Hashing password...
🔐 [Student Model] Password hashed successfully
💾 Saving student to database...
✅ Student saved successfully

[After 10-20 seconds]

📨 2024-01-XX - POST /api/auth/student/login
🔐 LOGIN STUDENT - Request received
🔐 Normalized Email: test.student@example.com
🔍 Querying database for student
✅ Student found: 65f1a2b3c4d5e6f7...
🔐 [Student Model] Comparing passwords...
🔐 [Student Model] bcrypt.compare result: true
✅ Password matches!
🔑 JWT Token generated
```

---

## If Something Fails

### "Invalid email or password" on Login

**Check Backend Console:**
```
❌ No student found with email: test.student@example.com
```
**Fix:** Email wasn't saved. Check if registration succeeded.

---

### "Invalid email or password" but student exists

**Check Backend Console:**
```
✅ Student found: 65f1a2b3c4d5e6f7...
🔐 [Student Model] bcrypt.compare result: false
```
**Fix:** Password hash issue. Check:
1. Was password hashed during registration? (Should see "🔐 Password hashed successfully")
2. Is hash stored correctly in database?

**Verify in MongoDB:**
```bash
# Open MongoDB shell
mongo

# Run these commands:
use internconnect
db.students.findOne({email: "test.student@example.com"})

# You should see:
{
  _id: ObjectId("..."),
  name: "Test Student",
  email: "test.student@example.com",
  password: "$2b$10$XYZ...",  // Should start with $2b
  ...
}
```

---

### "Cannot POST /api/auth/student/register"

**Check:**
1. Backend running? (Should see "Backend server running on port 5000")
2. Frontend API URL correct? (Check Frontend Console for `🌐 API Base URL: http://localhost:5000/api`)

---

### Frontend Console Shows No Logs

**Fix:**
1. Clear cache: Ctrl+Shift+Delete
2. Refresh page: Ctrl+R
3. Try again

---

## Database Reset (If Needed)

```bash
# Stop backend (Ctrl+C)

# Open MongoDB shell:
mongo

# Delete old data:
use internconnect
db.students.deleteMany({})
db.companies.deleteMany({})

# Restart backend:
npm start
```

---

## Expected Test Results

| Test | Expected Result | Check |
|------|-----------------|-------|
| Student Registration | ✅ "Registration successful!" | Console logs show "Student saved successfully" |
| Student Login | ✅ Navigate to `/student-dashboard` | Console logs show "Password matches: true" |
| Company Registration | ✅ "Registration successful!" | Console logs show "Company saved successfully" |
| Company Login | ✅ Navigate to `/company-dashboard` | Console logs show "Password matches: true" |

---

## Console Log Checklist

### Registration Should Show:
- [ ] `📝 REGISTER [ROLE] - Request received:`
- [ ] `📝 Normalized Email:`
- [ ] `🔐 [Model] Hashing password...`
- [ ] `🔐 [Model] Password hashed successfully`
- [ ] `💾 Saving to database...`
- [ ] `✅ [ROLE] saved successfully:`
- [ ] `🔑 JWT Token generated`
- [ ] `✅ Registration Response:`

### Login Should Show:
- [ ] `🔐 LOGIN [ROLE] - Request received:`
- [ ] `🔍 Querying database for [ROLE]`
- [ ] `✅ [ROLE] found:`
- [ ] `🔐 [Model] Comparing passwords...`
- [ ] `🔐 [Model] bcrypt.compare result: true`
- [ ] `✅ Password matches!`
- [ ] `🔑 JWT Token generated`
- [ ] `✅ Login Response:`

---

## Success Indicator

When you see this sequence in console:

**Frontend:**
```
🔐 Login Attempt: {email: 'test.student@example.com', userType: 'student', password: '***'}
✅ Login Response: {message: 'Login successful', token: 'eyJ...', student: {...}}
```

**Backend:**
```
✅ Student found: 65f1a2b3c4d5e6f7...
🔐 [Student Model] bcrypt.compare result: true
✅ Password matches!
🔑 JWT Token generated
```

**Browser:**
```
✓ Page navigates to /student-dashboard
✓ Navbar shows username
✓ No error messages
```

**That means authentication is working correctly! ✅**

---

Done! Run the tests and share the console output if you encounter any issues.
