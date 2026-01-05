# Firebase Setup Instructions

## Step 1: Enable Email/Password Authentication

The `auth/operation-not-allowed` error occurs when Email/Password authentication is not enabled in Firebase Console.

### How to Enable:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **downsyndrome-ecf0f**
3. Navigate to **Authentication** in the left sidebar
4. Click on **Sign-in method** tab
5. Find **Email/Password** in the list
6. Click on it and toggle **Enable** to ON
7. Click **Save**

## Step 2: Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development) or **Start in production mode** (for production)
4. Select a location for your database (choose the closest to your users)
5. Click **Enable**

## Step 3: Set Up Firestore Security Rules

Go to **Firestore Database** → **Rules** and add these rules:

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

## Step 4: Set Up Storage (Optional - for file uploads)

1. Go to **Storage** in Firebase Console
2. Click **Get started**
3. Choose **Start in test mode** or set up custom rules
4. Select a location
5. Click **Done**

## Firestore Collections Structure

The application uses the following collections:

### 1. `users`
- Stores user profile information
- Document ID: User UID
- Fields: `uid`, `email`, `displayName`, `phone`, `role`, `createdAt`, `updatedAt`

### 2. `children`
- Stores child/patient information
- Document ID: Auto-generated
- Fields: `parentId`, `name`, `age`, `dateOfBirth`, `developmentalAge`, `lastMilestone`, `createdAt`, `updatedAt`

### 3. `milestones`
- Stores developmental milestones
- Document ID: Auto-generated
- Fields: `childId`, `title`, `description`, `category`, `achievedAt`, `createdAt`

### 4. `progress`
- Stores progress tracking data
- Document ID: Auto-generated
- Fields: `childId`, `category`, `score`, `date`, `notes`, `createdAt`

### 5. `documents`
- Stores uploaded documents (reports, therapy notes, etc.)
- Document ID: Auto-generated
- Fields: `childId`, `title`, `type`, `fileUrl`, `fileName`, `uploadedAt`, `createdAt`

### 6. `appointments`
- Stores appointments and scheduled events
- Document ID: Auto-generated
- Fields: `childId`, `title`, `description`, `date`, `location`, `type`, `createdAt`, `updatedAt`

## Testing

After completing the setup:

1. Try registering a new user at `/register`
2. Check Firebase Console → Authentication → Users to see the new user
3. Check Firestore Database → Data to see the user document created

## Troubleshooting

### Error: `auth/operation-not-allowed`
- **Solution**: Enable Email/Password authentication in Firebase Console (Step 1)

### Error: `permission-denied`
- **Solution**: Check Firestore security rules (Step 3)

### Error: `firestore/unavailable`
- **Solution**: Make sure Firestore Database is created and enabled (Step 2)

