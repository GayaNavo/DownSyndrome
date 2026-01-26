import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { getStorageInstance } from '@/lib/firebase/config'

// File type validation
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'text/plain'
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

export interface UploadResult {
  success: boolean
  fileUrl?: string
  error?: string
  fileName?: string
  fileSize?: string
  fileType?: string
}

export class FileUploadUtils {
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`
      }
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not supported. Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG, GIF, TXT'
      }
    }

    return { valid: true }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static getFileTypeFromMimeType(mimeType: string): string {
    const typeMap: Record<string, string> = {
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'text/plain': 'txt'
    }
    return typeMap[mimeType] || 'unknown'
  }

  static async uploadFile(
    file: File,
    childId: string,
    category: string = 'other'
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Create file path: documents/{childId}/{category}/{timestamp}_{filename}
      const timestamp = Date.now()
      const filePath = `documents/${childId}/${category}/${timestamp}_${file.name}`
      const storageRef = ref(getStorageInstance(), filePath)

      // Upload file
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      return {
        success: true,
        fileUrl: downloadURL,
        fileName: file.name,
        fileSize: this.formatFileSize(file.size),
        fileType: this.getFileTypeFromMimeType(file.type)
      }
    } catch (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  static async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // Check if it's a dummy URL (like '#')
      if (!fileUrl || fileUrl === '#' || !fileUrl.startsWith('http')) {
        console.warn('Invalid file URL, skipping deletion:', fileUrl);
        return true; // Return true to continue with Firestore deletion
      }

      // Extract the file path from the download URL
      // Firebase Storage URLs have a specific format that we can parse
      const url = new URL(fileUrl);
      const pathSegments = url.pathname.split('/');
      
      // The path segments should look like: ['', 'o', 'documents%2F...', ...]
      // We need to find the 'o' segment and take everything after it
      const oIndex = pathSegments.indexOf('o');
      if (oIndex === -1) {
        console.error('Could not find "o" segment in URL path');
        return false;
      }
      
      // Get the path after 'o/' and decode it
      const encodedPath = pathSegments.slice(oIndex + 1).join('/');
      const filePath = decodeURIComponent(encodedPath);
      
      console.log('Deleting file at path:', filePath);
      
      const fileRef = ref(getStorageInstance(), filePath);
      await deleteObject(fileRef);
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      // Don't throw the error, just return false so Firestore deletion can still proceed
      return false;
    }
  }

  static async uploadMultipleFiles(
    files: File[],
    childId: string,
    category: string = 'other'
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = []
    
    for (const file of files) {
      const result = await this.uploadFile(file, childId, category)
      results.push(result)
    }
    
    return results
  }
}