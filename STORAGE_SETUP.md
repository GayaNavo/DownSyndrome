# Firebase Storage Setup Guide

## 📋 Overview

This guide will help you properly configure Firebase Storage security rules for your application.

## 🔧 Current Issue

You're getting this error because Firebase Storage rules are blocking access:
```
Firebase Storage: User does not have permission to access 'documents/...'
```

## ✅ Solution

### Step 1: Storage Rules Created

I've created `storage.rules` file with proper security configuration that:

- ✅ Allows authenticated users to upload files to their children's folders
- ✅ Restricts access so parents can only access their own children's documents
- ✅ Supports multiple storage paths (documents, profile pictures, medical reports)
- ✅ Validates parent-child relationships using Firestore data

### Step 2: Deploy Storage Rules

To apply the new storage rules, run this command in your terminal:

```bash
cd "e:\SLIIT\Year 3\FYP\Code\DownSyndrome"
firebase login
firebase deploy --only storage
```

**If you don't have Firebase CLI installed:**

```bash
npm install -g firebase-tools
firebase login
firebase init
# Select "Storage" when prompted
firebase deploy --only storage
```

### Step 3: Verify Deployment

After deployment:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **downsyndrome-ecf0f**
3. Navigate to **Storage** → **Rules**
4. Verify the rules match your `storage.rules` file

## 📁 File Structure

Your storage is organized as follows:

```
documents/
└── {childId}/
    └── {category}/
        └── {timestamp}_{filename}
            ├── medical_reports/
            ├── therapy_notes/
            ├── genetics/
            ├── iep_school/
            └── other/

profile_pictures/
└── {userId}/
    └── {filename}

medical_reports/
└── {childId}/
    └── {filename}
```

## 🔐 Security Rules Explained

### Key Functions:

1. **`isSignedIn()`** - Checks if user is authenticated
2. **`getUserId()`** - Gets the current user's UID
3. **`isParentOfChild(childId)`** - Verifies user has parental rights to child's data

### Access Control:

- **Write (Upload)**: Only parents can upload to their children's folders
- **Read (Download)**: Only parents can view their children's documents
- **Delete**: Only parents can delete their children's documents

## 🧪 Testing

After deploying rules, test the upload functionality:

1. Login to your application
2. Navigate to Documents page
3. Try uploading a file
4. The upload should now succeed! ✅

## ⚠️ Important Notes

1. **Firestore Integration**: The rules check Firestore `children` collection to verify parent-child relationships
2. **Child Document Required**: Make sure each child has a document in Firestore with `parentId` field
3. **Security**: Rules prevent users from accessing other users' children's documents

## 🔍 Troubleshooting

### Still Getting Permission Errors?

Check these items:

1. ✅ User is logged in (authenticated)
2. ✅ Child document exists in Firestore with correct `parentId`
3. ✅ Storage bucket name matches: `downsyndrome-ecf0f.firebasestorage.app`
4. ✅ Rules are deployed (check Firebase Console)

### Check Child Document Structure

In Firestore, verify the child document looks like:

```javascript
children/{childId}: {
  parentId: "23oE7Rylm4SLSDrk2JpmEiw9HHl2", // Should match user's UID
  name: "Child Name",
  // ... other fields
}
```

## 📚 Additional Resources

- [Firebase Storage Security Rules Documentation](https://firebase.google.com/docs/storage/security)
- [Firebase Storage Rules Testing](https://firebase.google.com/docs/storage/security/test-rules-emulator)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

## 🚀 Next Steps

After storage is working, you can:

1. Add progress tracking during uploads
2. Implement file preview functionality
3. Add image compression before upload
4. Create shared folder functionality
5. Add file version history

---

**Need Help?** 

Check your Firebase Console logs or review the browser console for detailed error messages.
