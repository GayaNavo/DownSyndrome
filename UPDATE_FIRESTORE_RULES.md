# Firestore Security Rules Update

The application now includes a new `health_data` collection that needs to be added to your Firestore security rules. Follow these steps to update your rules:

## Updated Firestore Security Rules

Go to **Firestore Database** → **Rules** in your Firebase Console and update your rules to include the new health_data collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own children
    match /children/{childId} {
      allow read, write: if request.auth != null && 
        resource.data.parentId == request.auth.uid;
    }
    
    // Users can read/write milestones for their children
    match /milestones/{milestoneId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/children/$(resource.data.childId)).data.parentId == request.auth.uid;
    }
    
    // Users can read/write progress for their children
    match /progress/{progressId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/children/$(resource.data.childId)).data.parentId == request.auth.uid;
    }
    
    // Users can read/write health data for their children
    match /health_data/{healthDataId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/children/$(resource.data.childId)).data.parentId == request.auth.uid;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/children/$(request.resource.data.childId)).data.parentId == request.auth.uid;
    }
    
    // Users can read/write documents for their children
    match /documents/{documentId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/children/$(resource.data.childId)).data.parentId == request.auth.uid;
    }
    
    // Users can read/write appointments for their children
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/children/$(resource.data.childId)).data.parentId == request.auth.uid;
    }
  }
}
```

## Steps to Update:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **downsyndrome-ecf0f**
3. Navigate to **Firestore Database** → **Rules**
4. Replace the existing rules with the updated rules above
5. Click **Publish** to save the changes

## Important Notes:

- The new `health_data` collection follows the same security pattern as other child-related collections
- Users can only read/write health data for children they own (where the child's parentId matches the user's UID)
- This allows proper data isolation between different users

After updating these rules, the "Missing or insufficient permissions" error should be resolved.