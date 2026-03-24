/**
 * Storage Cleanup Utility
 * Helps delete files from Firebase Storage to free up quota
 */

import { ref, listAll, deleteObject } from 'firebase/storage'
import { getStorageInstance } from '@/lib/firebase/config'

export interface StorageStats {
  totalFiles: number
  totalSize: string
  breakdown: {
    documents: number
    profilePictures: number
    other: number
  }
}

export class StorageCleanupUtils {
  /**
   * Get storage usage statistics
   * Note: Firebase Storage doesn't provide size info directly in client SDK
   * This counts files only. For size, check Firebase Console.
   */
  static async getStorageStats(): Promise<StorageStats> {
    const storage = getStorageInstance()
    const stats: StorageStats = {
      totalFiles: 0,
      totalSize: 'Unknown (check Firebase Console)',
      breakdown: {
        documents: 0,
        profilePictures: 0,
        other: 0
      }
    }

    try {
      // List all files in root
      const rootRef = ref(storage, '/')
      const result = await listAll(rootRef)

      stats.totalFiles = result.items.length

      // Count by category
      for (const item of result.items) {
        if (item.fullPath.startsWith('documents/')) {
          stats.breakdown.documents++
        } else if (item.fullPath.startsWith('profile_pictures/')) {
          stats.breakdown.profilePictures++
        } else {
          stats.breakdown.other++
        }
      }

      return stats
    } catch (error) {
      console.error('Error getting storage stats:', error)
      throw error
    }
  }

  /**
   * Delete all files in a specific category
   */
  static async deleteFilesByCategory(
    category: 'documents' | 'profile_pictures' | 'all',
    childId?: string
  ): Promise<{ deleted: number; errors: number }> {
    const storage = getStorageInstance()
    let deleted = 0
    let errors = 0

    try {
      let parentRef
      if (category === 'all') {
        parentRef = ref(storage, '/')
      } else if (childId) {
        parentRef = ref(storage, `${category}/${childId}`)
      } else {
        parentRef = ref(storage, category)
      }

      const result = await listAll(parentRef)

      for (const item of result.items) {
        try {
          await deleteObject(item)
          deleted++
          console.log(`✅ Deleted: ${item.fullPath}`)
        } catch (error) {
          console.error(`❌ Failed to delete: ${item.fullPath}`, error)
          errors++
        }
      }

      // Handle subdirectories (for documents with childId/category structure)
      for (const prefix of result.prefixes) {
        const subResult = await listAll(prefix)
        for (const item of subResult.items) {
          try {
            await deleteObject(item)
            deleted++
            console.log(`✅ Deleted: ${item.fullPath}`)
          } catch (error) {
            console.error(`❌ Failed to delete: ${item.fullPath}`, error)
            errors++
          }
        }
      }

      return { deleted, errors }
    } catch (error) {
      console.error('Error deleting files:', error)
      throw error
    }
  }

  /**
   * Delete specific file by path
   */
  static async deleteFileByPath(filePath: string): Promise<boolean> {
    try {
      const storage = getStorageInstance()
      const fileRef = ref(storage, filePath)
      await deleteObject(fileRef)
      console.log(`✅ Deleted: ${filePath}`)
      return true
    } catch (error) {
      console.error(`❌ Failed to delete ${filePath}:`, error)
      return false
    }
  }

  /**
   * Clean up old files (by listing and filtering)
   */
  static async cleanupOldFiles(daysOld: number = 30): Promise<{ deleted: number; kept: number }> {
    const storage = getStorageInstance()
    const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000)
    let deleted = 0
    let kept = 0

    try {
      const rootRef = ref(storage, '/')
      const result = await listAll(rootRef)

      for (const item of result.items) {
        // Extract timestamp from filename if it exists
        const fileName = item.name
        const timestampMatch = fileName.match(/^(\d+)_/)
        
        if (timestampMatch) {
          const fileTimestamp = parseInt(timestampMatch[1])
          if (fileTimestamp < cutoffDate) {
            try {
              await deleteObject(item)
              deleted++
              console.log(`✅ Deleted old file: ${item.fullPath}`)
            } catch (error) {
              console.error(`❌ Failed to delete old file: ${item.fullPath}`, error)
            }
          } else {
            kept++
          }
        } else {
          kept++
        }
      }

      return { deleted, kept }
    } catch (error) {
      console.error('Error cleaning up old files:', error)
      throw error
    }
  }
}

