# Firebase Online Mentors Troubleshooting Guide

## Quick Steps to Fix Issues:

### 1. Update Firestore Security Rules
Go to Firebase Console → Firestore Database → Rules and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Temporary - Allow all authenticated users to read/write onlineMentors
    match /onlineMentors/{mentorEmail} {
      allow read, write: if request.auth != null;
    }
    
    // Your existing rules...
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.token.email == userId;
    }
    
    match /mentors/{mentorId} {
      allow read, write: if request.auth != null && request.auth.token.email == mentorId;
    }
    
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
  }
}
```

### 2. Test the Implementation

1. **Open the Mentor Dashboard** as a mentor
2. **Check the browser console** for logs:
   - Look for "Setting mentor online:" messages
   - Check for any error messages
   - Look for "Snapshot received" messages

3. **Open the Chat page** (`/chat/daily-reflection`)
   - Check the debug section at the bottom
   - Look for mentor count and data

4. **Use the manual test buttons** on the Mentor page
   - Click "Test Set Online" and "Test Set Offline"
   - Check console for success/error messages

### 3. Common Issues and Solutions:

**Issue: "Missing or insufficient permissions"**
- Solution: Update Firestore rules as shown above

**Issue: "Collection not found" or empty data**
- Solution: The collection is created automatically when first document is added

**Issue: Real-time updates not working**
- Solution: Check that you're using a mentor account (has role: 'mentor')

**Issue: Network or connection errors**
- Solution: Check internet connection and Firebase project settings

### 4. Manual Testing Steps:

1. Go to Firebase Console → Firestore Database
2. Look for "onlineMentors" collection
3. When you open mentor dashboard, you should see a document appear
4. When you close/logout, the document should disappear

### 5. Debug Information:

Check browser console for these log messages:
- ✅ "Setting up online mentors listener..."
- ✅ "Setting mentor online: {email, displayName...}"
- ✅ "Mentor set as online successfully: email@example.com"
- ✅ "Snapshot received, docs count: X"

If you see ❌ error messages, that indicates the specific issue.