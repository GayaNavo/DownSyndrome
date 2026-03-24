# Firebase Storage Quota Exceeded - Solutions

## ⚠️ Problem

**Error:** `storage/quota-exceeded`

Your Firebase Storage bucket has reached the 5GB limit on the **free Spark plan**.

---

## 🔍 Check Your Current Usage

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **downsyndrome-ecf0f**
3. Navigate to **Storage** → **Files**
4. Check the storage usage at the top

---

## ✅ Immediate Solutions

### Option 1: Delete Files via Firebase Console (Easiest)

1. **Go to Firebase Console** → Storage → Files
2. **Select files/folders** to delete:
   - Click the checkbox next to files
   - Or select entire folders (e.g., `documents/`)
3. **Click Delete** button at the top
4. **Confirm deletion**

**Recommended cleanup order:**
1. Old test uploads
2. Duplicate files
3. Large files you don't need
4. Entire `documents/` folder if this is just development/testing

---

### Option 2: Programmatic Cleanup (Advanced)

Use the new utility I created: `utils/storageCleanupUtils.ts`

#### Add a cleanup page temporarily:

Create `app/cleanup-storage/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { StorageCleanupUtils } from '@/utils/storageCleanupUtils'

export default function CleanupStoragePage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleGetStats = async () => {
    setLoading(true)
    try {
      const result = await StorageCleanupUtils.getStorageStats()
      setStats(result)
      setMessage(`Found ${result.totalFiles} files`)
    } catch (error) {
      setMessage('Error getting stats: ' + error)
    }
    setLoading(false)
  }

  const handleDeleteAllDocuments = async () => {
    if (!confirm('⚠️ This will delete ALL documents! Are you sure?')) return
    
    setLoading(true)
    try {
      const result = await StorageCleanupUtils.deleteFilesByCategory('documents')
      setMessage(`✅ Deleted ${result.deleted} files (${result.errors} errors)`)
    } catch (error) {
      setMessage('❌ Error: ' + error)
    }
    setLoading(false)
  }

  const handleCleanupOldFiles = async () => {
    if (!confirm('This will delete files older than 30 days')) return
    
    setLoading(true)
    try {
      const result = await StorageCleanupUtils.cleanupOldFiles(30)
      setMessage(`✅ Deleted ${result.deleted} old files, kept ${result.kept}`)
    } catch (error) {
      setMessage('❌ Error: ' + error)
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧹 Storage Cleanup Tool</h1>
      
      {message && (
        <div className={`p-4 mb-4 rounded ${message.includes('✅') ? 'bg-green-100' : 'bg-red-100'}`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleGetStats}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          📊 Get Storage Stats
        </button>

        <button
          onClick={handleDeleteAllDocuments}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          🔥 Delete All Documents
        </button>

        <button
          onClick={handleCleanupOldFiles}
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          🗑️ Cleanup Files Older Than 30 Days
        </button>
      </div>

      {stats && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Storage Statistics:</h2>
          <p>Total Files: {stats.totalFiles}</p>
          <p>Documents: {stats.breakdown.documents}</p>
          <p>Profile Pictures: {stats.breakdown.profilePictures}</p>
          <p>Other: {stats.breakdown.other}</p>
          <p className="text-sm text-gray-600 mt-2">
            Note: File size not available via client API. 
            Check Firebase Console for size info.
          </p>
        </div>
      )}
    </div>
  )
}
```

Then visit: `http://localhost:3000/cleanup-storage`

---

### Option 3: Upgrade Firebase Plan (If Needed)

If you actually need more storage:

#### Firebase Pricing:
- **Spark (Free)**: 5 GB storage
- **Blaze (Pay as you go)**: 
  - First 5 GB: Free
  - Next 95 GB: $0.026/GB/month
  - Network egress charges apply

#### To Upgrade:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project
3. Click **Upgrade** (bottom left menu)
4. Choose **Blaze - Pay as you go**
5. Add payment method

⚠️ **Warning**: This will incur real costs! Only do this for production.

---

### Option 4: Use Different Storage for Development

For development/testing, consider:

1. **Local development**: Don't upload to Firebase at all
2. **Separate Firebase project**: Create a free dev project
3. **Mock storage**: Use dummy URLs during development

---

## 🎯 Recommended Approach for Development

Since this appears to be a development project:

### Quick Fix (5 minutes):
1. **Go to Firebase Console** → Storage
2. **Delete the entire `documents/` folder**
3. **Try uploading again**

### Long-term Solution:
- Keep storage clean during development
- Delete test uploads regularly
- Consider using a separate dev Firebase project
- Implement automatic cleanup of old files

---

## 📊 Monitor Your Storage

Set up alerts:
1. Firebase Console → Project Settings → Billing
2. Set budget alerts
3. Get notified when approaching limits

---

## ✅ After Cleaning Up

Once you've freed up space:

1. **Try uploading again**
2. The error should be resolved
3. Uploads should work normally

If you still see errors:
- Wait 1-2 minutes for quota to refresh
- Clear browser cache
- Try again

---

## 🆘 Need Help?

- **Firebase Support**: https://firebase.google.com/support
- **Community Forum**: https://stackoverflow.com/questions/tagged/firebase-storage
- **Status Page**: https://status.firebase.google.com/
