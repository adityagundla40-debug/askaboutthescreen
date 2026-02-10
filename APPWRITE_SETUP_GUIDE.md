# Appwrite Integration Setup Guide 🔐

**Version**: 1.2.0  
**Status**: ✅ Implemented  

---

## 🎯 Overview

The extension now includes Appwrite integration for:
- **User Authentication** (Login/Signup)
- **Activity History** (Last 20 activities)
- **Persistent Sessions** (Stay logged in)
- **User-Specific Data** (Each user has their own history)

---

## 📋 Prerequisites

1. **Appwrite Account**
   - Sign up at https://cloud.appwrite.io
   - Or self-host Appwrite

2. **Node.js & npm**
   - Already installed for the extension

3. **Extension Files**
   - All files updated with Appwrite integration

---

## 🚀 Setup Steps

### Step 1: Create Appwrite Project

1. **Go to Appwrite Console**
   - Visit https://cloud.appwrite.io/console
   - Login or create account

2. **Create New Project**
   - Click "Create Project"
   - Name: "Ask About Screen" (or your choice)
   - Click "Create"

3. **Get Project ID**
   - Copy the Project ID from project settings
   - You'll need this for `.env` file

### Step 2: Configure Platform

1. **Add Web Platform**
   - Go to Project → Settings → Platforms
   - Click "Add Platform" → "Web"
   - Name: "Chrome Extension"
   
2. **Set Hostname**
   
   **IMPORTANT**: You need your extension ID first!
   
   **Option A: Get Extension ID** (if already loaded):
   - Go to `chrome://extensions`
   - Enable "Developer mode"
   - Find your extension
   - Copy the ID (e.g., `lnnoopflfoagdlfifncmjbjicohhcjlk`)
   - Hostname: `chrome-extension://YOUR_EXTENSION_ID`
   
   **Option B: Use Wildcard** (for development):
   - Hostname: `chrome-extension://*`
   - This allows any extension ID
   - ⚠️ For production, use specific ID
   
3. **Create Platform**
   - Click "Next" or "Create"
   - Verify status is "Active"

**Example**:
```
Name: Chrome Extension
Hostname: chrome-extension://lnnoopflfoagdlfifncmjbjicohhcjlk
```

Or for development:
```
Name: Chrome Extension (Dev)
Hostname: chrome-extension://*
```

### Step 3: Create Database

1. **Create Database**
   - Go to "Databases" in left sidebar
   - Click "Create Database"
   - Name: "user_history"
   - Click "Create"
   - Copy the Database ID

2. **Create Collection**
   - Click "Create Collection"
   - Name: "activities"
   - Click "Create"
   - Copy the Collection ID

3. **Add Attributes**
   Click "Attributes" tab, then add these attributes:

   **Attribute 1: userId**
   - Type: String
   - Size: 255
   - Required: Yes
   - Array: No

   **Attribute 2: action**
   - Type: String
   - Size: 100
   - Required: Yes
   - Array: No

   **Attribute 3: data**
   - Type: String
   - Size: 10000
   - Required: Yes
   - Array: No

   **Attribute 4: timestamp**
   - Type: String
   - Size: 50
   - Required: Yes
   - Array: No

4. **Set Permissions**
   - Go to "Settings" tab
   - Under "Permissions":
     - Add Role: "Users"
     - Permissions: Create, Read, Update, Delete
   - This allows authenticated users to manage their own data

5. **Create Index** (Optional but recommended)
   - Go to "Indexes" tab
   - Click "Create Index"
   - Key: "userId_timestamp"
   - Type: Key
   - Attributes: userId (ASC), timestamp (DESC)
   - This speeds up history queries

### Step 4: Configure Environment Variables

1. **Copy Example File**
   ```bash
   cd AskAboutTheScreen
   copy .env.example .env
   ```

2. **Edit .env File**
   ```env
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your_project_id_here
   VITE_APPWRITE_DATABASE_ID=your_database_id_here
   VITE_APPWRITE_COLLECTION_ID=your_collection_id_here
   ```

3. **Replace Values**
   - `VITE_APPWRITE_PROJECT_ID`: From Step 1
   - `VITE_APPWRITE_DATABASE_ID`: From Step 3.1
   - `VITE_APPWRITE_COLLECTION_ID`: From Step 3.2

### Step 5: Rebuild Extension

```bash
npm run build
```

### Step 6: Reload Extension

1. Go to `chrome://extensions`
2. Find "Ask About This Screen"
3. Click "Reload" button

---

## 🎮 Usage

### First Time Setup

1. **Open Extension**
   - Click extension icon
   - You'll see the login screen

2. **Create Account**
   - Click "Don't have an account? Sign up"
   - Enter name, email, password
   - Click "Create Account"
   - You'll be automatically logged in

3. **Start Using**
   - Extension opens to Command Mode
   - All activities are now logged

### Login

1. **Open Extension**
   - Enter email and password
   - Click "Login"
   - You'll be logged in

2. **Stay Logged In**
   - Session persists across browser restarts
   - No need to login again

### View History

1. **Click History Icon** (📜)
   - Shows last 20 activities
   - Sorted by most recent first

2. **Activity Types**
   - 📸 Screenshot captures
   - 🎮 Command executions
   - 🤖 Screen analysis
   - 🎙️ Voice commands
   - ⚙️ Settings changes

3. **Manage History**
   - Click × to delete individual activity
   - Click "Clear All" to delete all history
   - Click "Refresh" to reload

### Logout

1. **Click Logout Icon** (🚪)
   - Logs you out
   - Returns to login screen
   - Session cleared

---

## 📊 Activity Logging

### What Gets Logged

**Screenshot Capture**:
```json
{
  "action": "capture_screenshot",
  "data": {
    "url": "https://example.com",
    "title": "Page Title",
    "mode": "single"
  }
}
```

**Command Execution**:
```json
{
  "action": "execute_command",
  "data": {
    "command": "Open YouTube",
    "function": "open_new_tab",
    "args": {"url": "https://youtube.com"},
    "result": "✅ Opened: https://youtube.com"
  }
}
```

**Screen Analysis**:
```json
{
  "action": "analyze_screen",
  "data": {
    "prompt": "What's on this screen?",
    "imageCount": 1,
    "response": "This screen shows..."
  }
}
```

### Privacy

- ✅ Only logged-in users can see their own history
- ✅ Screenshots are NOT uploaded (only metadata)
- ✅ Data is tied to your user ID
- ✅ You can delete your history anytime

---

## 🔧 Troubleshooting

### Issue: "Failed to connect to Appwrite"

**Solution**:
1. Check `.env` file has correct values
2. Verify Appwrite project is active
3. Check internet connection
4. Rebuild extension: `npm run build`

### Issue: "Authentication failed"

**Solution**:
1. Check email/password are correct
2. Verify account exists (try signup)
3. Check Appwrite console for user
4. Try logout and login again

### Issue: "Failed to log activity"

**Solution**:
1. Check database and collection exist
2. Verify permissions are set correctly
3. Check collection attributes match schema
4. Look at browser console for errors

### Issue: "History not loading"

**Solution**:
1. Check you're logged in
2. Verify collection permissions
3. Check database ID in `.env`
4. Try refreshing history

### Issue: "Session not persisting"

**Solution**:
1. Check browser allows cookies
2. Verify Appwrite session settings
3. Try logout and login again
4. Check browser console for errors

---

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` file to git
- ✅ Use `.env.example` for documentation
- ✅ Keep credentials secure

### 2. Permissions
- ✅ Set collection permissions to "Users" only
- ✅ Don't allow public read/write
- ✅ Use role-based access control

### 3. Data Privacy
- ✅ Don't log sensitive information
- ✅ Truncate long responses
- ✅ Allow users to delete history

### 4. Password Security
- ✅ Minimum 8 characters enforced
- ✅ Appwrite handles password hashing
- ✅ Use strong passwords

---

## 📚 API Reference

### Authentication

**Create Account**:
```javascript
authService.createAccount(email, password, name)
```

**Login**:
```javascript
authService.login(email, password)
```

**Get Current User**:
```javascript
authService.getCurrentUser()
```

**Logout**:
```javascript
authService.logout()
```

**Check Login Status**:
```javascript
authService.isLoggedIn()
```

### Database

**Log Activity**:
```javascript
databaseService.logActivity(userId, action, data)
```

**Get History**:
```javascript
databaseService.getUserHistory(userId, limit)
```

**Delete Activity**:
```javascript
databaseService.deleteActivity(documentId)
```

**Clear History**:
```javascript
databaseService.clearUserHistory(userId)
```

---

## 🎨 UI Components

### Auth Component
- Login/Signup form
- Email and password fields
- Name field for signup
- Error messages
- Loading states
- Toggle between login/signup

### History Component
- List of last 20 activities
- Activity icons and timestamps
- Delete individual activities
- Clear all history
- Refresh button
- Empty state message

### Main App Updates
- Authentication check on load
- Logout button in header
- History button in header
- Activity logging on actions
- User-specific data

---

## 🚀 Advanced Configuration

### Custom Endpoint

If self-hosting Appwrite:

```env
VITE_APPWRITE_ENDPOINT=https://your-appwrite-server.com/v1
```

### Custom Collection Schema

Add more attributes:

1. Go to Collection → Attributes
2. Click "Create Attribute"
3. Add custom fields
4. Update `logActivity()` calls

### Custom Permissions

Fine-tune access control:

1. Go to Collection → Settings
2. Modify permissions
3. Add custom roles
4. Set read/write rules

---

## 📊 Database Schema

### Collection: activities

| Attribute | Type | Size | Required | Description |
|-----------|------|------|----------|-------------|
| userId | String | 255 | Yes | User's unique ID |
| action | String | 100 | Yes | Action type |
| data | String | 10000 | Yes | JSON data |
| timestamp | String | 50 | Yes | ISO timestamp |

### Indexes

| Name | Type | Attributes |
|------|------|------------|
| userId_timestamp | Key | userId (ASC), timestamp (DESC) |

---

## 🎉 Summary

Appwrite integration complete with:

✅ **User Authentication** (Login/Signup)  
✅ **Activity History** (Last 20 activities)  
✅ **Persistent Sessions** (Stay logged in)  
✅ **User-Specific Data** (Privacy)  
✅ **Activity Logging** (All interactions)  
✅ **History Management** (View/Delete)  
✅ **Secure Storage** (Appwrite cloud)  
✅ **Easy Setup** (5-minute configuration)  

**Start using authenticated features now!** 🔐

---

## 📞 Quick Reference

### Setup Checklist
- [ ] Create Appwrite project
- [ ] Add web platform
- [ ] Create database "user_history"
- [ ] Create collection "activities"
- [ ] Add 4 attributes (userId, action, data, timestamp)
- [ ] Set permissions to "Users"
- [ ] Copy IDs to `.env` file
- [ ] Rebuild extension
- [ ] Reload in Chrome
- [ ] Create account
- [ ] Test features

### Environment Variables
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COLLECTION_ID=your_collection_id
```

### Useful Links
- Appwrite Console: https://cloud.appwrite.io/console
- Appwrite Docs: https://appwrite.io/docs
- Extension Repo: Your GitHub repo

---

**Appwrite integration is ready! Create your account and start tracking your activities!** 🚀
