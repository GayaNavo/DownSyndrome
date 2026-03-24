'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardSidebar from './DashboardSidebar'
import AppHeader from './AppHeader'
import { 
  getChildDocument, 
  ChildData, 
  getDocumentsByChild, 
  getDocumentById,
  DocumentData, 
  deleteDocumentEntry, 
  createDocumentEntry,
  updateDocumentEntry
} from '@/lib/firebase/firestore'
import { FileUploadUtils, UploadResult } from '@/utils/fileUploadUtils'
import { Timestamp } from 'firebase/firestore'

type Category = 'all' | 'medical_reports' | 'therapy_notes' | 'genetics' | 'iep_school' | 'other'

const categoryEmojis: Record<string, string> = {
  all: '📁',
  medical_reports: '🏥',
  therapy_notes: '📝',
  genetics: '🧬',
  iep_school: '🎓',
  other: '📄'
}

export default function DocumentsPage() {
  const { currentUser } = useAuth()
  const [child, setChild] = useState<ChildData | null>(null)
  const [documents, setDocuments] = useState<DocumentData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('all')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingDocument, setEditingDocument] = useState<DocumentData | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    category: 'other' as Category
  })

  const categories = [
    { id: 'all', label: 'All Documents', emoji: '📁' },
    { id: 'medical_reports', label: 'Medical Reports', emoji: '🏥' },
    { id: 'therapy_notes', label: 'Therapy Notes', emoji: '📝' },
    { id: 'genetics', label: 'Genetics', emoji: '🧬' },
    { id: 'iep_school', label: 'IEP & School Docs', emoji: '🎓' },
  ]

  useEffect(() => {
    if (currentUser) {
      setLoading(true)
      getChildDocument(currentUser.uid).then((childData) => {
        if (childData) {
          setChild(childData)
          getDocumentsByChild(childData.id || currentUser.uid).then((docs) => {
            if (docs.length === 0) {
              // Add dummy data if none exists to match the image
              const dummyDocs: DocumentData[] = [
                {
                  id: '1',
                  childId: childData.id || currentUser.uid,
                  title: 'Echocardiogram Results.pdf',
                  fileName: 'Echocardiogram_Results.pdf',
                  type: 'pdf',
                  category: 'medical_reports',
                  fileUrl: '#',
                  fileSize: '2.5 MB',
                  uploadedAt: { toDate: () => new Date('2023-10-15') } as any,
                  createdAt: { toDate: () => new Date() } as any
                },
                {
                  id: '2',
                  childId: childData.id || currentUser.uid,
                  title: 'Cardiologist Consult Notes.docx',
                  fileName: 'Cardiologist_Consult_Notes.docx',
                  type: 'docx',
                  category: 'therapy_notes',
                  fileUrl: '#',
                  fileSize: '128 KB',
                  uploadedAt: { toDate: () => new Date('2023-09-28') } as any,
                  createdAt: { toDate: () => new Date() } as any
                },
                {
                  id: '3',
                  childId: childData.id || currentUser.uid,
                  title: 'Heart Ultrasound Scan.jpg',
                  fileName: 'Heart_Ultrasound_Scan.jpg',
                  type: 'jpg',
                  category: 'medical_reports',
                  fileUrl: '#',
                  fileSize: '4.1 MB',
                  uploadedAt: { toDate: () => new Date('2023-08-05') } as any,
                  createdAt: { toDate: () => new Date() } as any
                }
              ]
              setDocuments(dummyDocs)
            } else {
              setDocuments(docs)
            }
            setLoading(false)
          })
        } else {
          setLoading(false)
        }
      })
    }
  }, [currentUser])

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this document? This will also delete the file from storage.')) {
      try {
        // Get the document to get the file URL
        const docToDelete = documents.find(doc => doc.id === id);
        if (docToDelete) {
          // Delete file from storage first
          if (docToDelete.fileUrl && docToDelete.fileUrl !== '#') {
            const storageDeleteSuccess = await FileUploadUtils.deleteFile(docToDelete.fileUrl);
            if (!storageDeleteSuccess) {
              console.warn('Failed to delete file from storage, but continuing with Firestore deletion');
            }
          }
        }
        
        // Delete document from Firestore
        await deleteDocumentEntry(id);
        setDocuments(documents.filter(doc => doc.id !== id));
        setUploadSuccess('🗑️ Document deleted successfully!');
        setUploadError(null);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setUploadSuccess(null);
        }, 3000);
      } catch (error) {
        console.error('Error deleting document:', error);
        setUploadError('❌ Failed to delete document. Please try again.');
        setUploadSuccess(null);
      }
    }
  }

  const handleEdit = async (id: string) => {
    try {
      const doc = await getDocumentById(id)
      if (doc) {
        setEditingDocument(doc)
        setEditForm({
          title: doc.title,
          category: doc.category as Category
        })
        setIsEditing(true)
      }
    } catch (error) {
      console.error('Error fetching document:', error)
      setUploadError('❌ Error fetching document. Please try again.')
      setUploadSuccess(null)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDocument) return

    try {
      await updateDocumentEntry(editingDocument.id!, {
        title: editForm.title,
        category: editForm.category === 'all' ? 'other' : editForm.category
      })
      
      // Update local state
      setDocuments(documents.map(doc => 
        doc.id === editingDocument.id 
          ? { ...doc, title: editForm.title, category: editForm.category === 'all' ? 'other' : editForm.category }
          : doc
      ))
      
      setIsEditing(false)
      setEditingDocument(null)
      setEditForm({ title: '', category: 'other' })
      setUploadSuccess('✏️ Document updated successfully! ✨')
      setUploadError(null)
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(null)
      }, 3000)
    } catch (error) {
      console.error('Error updating document:', error)
      setUploadError('❌ Failed to update document. Please try again.')
      setUploadSuccess(null)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingDocument(null)
    setEditForm({ title: '', category: 'other' })
  }

  const handleDownload = async (doc: DocumentData) => {
    try {
      // Check if fileUrl exists and is not a dummy URL
      if (!doc.fileUrl || doc.fileUrl === '#') {
        setUploadError('❌ This document is not available for download.')
        setUploadSuccess(null)
        return
      }

      // Create a temporary link element to trigger download
      const link = document.createElement('a')
      link.href = doc.fileUrl
      link.download = doc.fileName || doc.title
      link.target = '_blank'
      
      // Append to body, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Show success message
      setUploadSuccess(`⬇️ Downloading ${doc.fileName || doc.title}...`)
      setTimeout(() => {
        setUploadSuccess(null)
      }, 3000)
    } catch (error) {
      console.error('Download error:', error)
      setUploadError('❌ Failed to download document. Please try again.')
      setUploadSuccess(null)
    }
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !child) return
    
    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(null)
    setUploadProgress(0)
    
    try {
      // Upload files
      const results = await FileUploadUtils.uploadMultipleFiles(
        Array.from(files),
        child.id || currentUser!.uid,
        selectedCategory === 'all' ? 'other' : selectedCategory
      )
      
      // Track successful and failed uploads
      const successfulUploads: DocumentData[] = []
      const failedUploads: string[] = []
      const validationErrors: string[] = []
      
      for (const result of results) {
        if (result.success && result.fileUrl) {
          const documentData: Omit<DocumentData, 'id' | 'createdAt'> = {
            childId: child.id || currentUser!.uid,
            title: result.fileName || 'Untitled Document',
            type: result.fileType || 'unknown',
            category: selectedCategory === 'all' ? 'other' : selectedCategory,
            fileUrl: result.fileUrl,
            fileName: result.fileName || '',
            fileSize: result.fileSize,
            uploadedAt: Timestamp.now()
          }
          
          try {
            const docId = await createDocumentEntry(documentData)
            successfulUploads.push({
              ...documentData,
              id: docId,
              createdAt: Timestamp.now()
            } as DocumentData)
          } catch (error) {
            console.error('Error creating document entry:', error)
            failedUploads.push(`${result.fileName}: Failed to save to database`)
          }
        } else {
          const errorMsg = result.error || 'Upload failed'
          failedUploads.push(`${result.fileName || 'Unknown file'}: ${errorMsg}`)
          
          // Track validation errors separately
          if (errorMsg.includes('size exceeds') || errorMsg.includes('type not supported')) {
            validationErrors.push(`${result.fileName || 'File'}: ${errorMsg}`)
          }
        }
      }
      
      // Update documents state
      if (successfulUploads.length > 0) {
        setDocuments(prev => [...successfulUploads, ...prev])
        
        // Show success message
        const categoryLabel = categories.find(c => c.id === (selectedCategory === 'all' ? 'other' : selectedCategory))?.label || 'documents'
        if (successfulUploads.length === 1) {
          setUploadSuccess(` Successfully uploaded 1 document to ${categoryLabel}! 🎉`)
        } else {
          setUploadSuccess(` Successfully uploaded ${successfulUploads.length} documents to ${categoryLabel}! 🎉`)
        }
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setUploadSuccess(null)
        }, 5000)
      }
      
      // Show error message if there were failures
      if (failedUploads.length > 0) {
        const errorMessage = validationErrors.length > 0
          ? `⚠️ ${validationErrors.join('. ')}${failedUploads.length > validationErrors.length ? '. Other uploads failed.' : ''}`
          : `❌ ${failedUploads.length} upload(s) failed. Please try again.`
        setUploadError(errorMessage)
      }
      
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError('❌ Failed to upload files. Please check your connection and try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFileUpload(e.dataTransfer.files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files)
    // Reset input value to allow uploading the same file again
    e.target.value = ''
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getIcon = (category: string) => {
    const emoji = categoryEmojis[category] || '📄'
    const bgColors: Record<string, string> = {
      medical_reports: 'bg-red-100 text-red-600',
      therapy_notes: 'bg-blue-100 text-blue-600',
      genetics: 'bg-green-100 text-green-600',
      iep_school: 'bg-purple-100 text-purple-600',
      other: 'bg-gray-100 text-gray-600'
    }
    return (
      <div className={`w-12 h-12 ${bgColors[category] || 'bg-gray-100 text-gray-600'} rounded-2xl flex items-center justify-center text-2xl shadow-sm`}>
        {emoji}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-sky-50 via-white to-mint-50">
        <DashboardSidebar activePage="documents" />
        <div className="flex-1 ml-64">
          <main className="p-6">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <span className="text-5xl animate-bounce inline-block">📂</span>
                <p className="text-gray-500 mt-4 text-lg">Loading your documents...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-sky-50 via-white to-mint-50">
      <AppHeader />
      <div className="flex flex-1">
        <DashboardSidebar activePage="documents" />

        <div className="flex-1 ml-64 flex flex-col">
          <main className="flex-1 flex overflow-hidden">
          {/* Internal Sidebar */}
          <div className="w-72 bg-white/80 backdrop-blur-sm border-r border-gray-200 p-4 flex flex-col">
            <div className="flex items-center gap-3 mb-8 px-2">
              <div className="w-14 h-14 bg-gradient-to-br from-sunshine-200 to-coral-200 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                📚
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{child?.name || 'Child'}&apos;s Library</h3>
                <p className="text-xs text-gray-500">Document Collection 📁</p>
              </div>
            </div>

            <nav className="flex-1 space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as Category)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-sky-100 to-mint-100 text-sky-700 font-bold shadow-md border-2 border-sky-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-8 mb-4 rounded-2xl overflow-hidden relative group cursor-pointer shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1586769852044-692d6e392410?auto=format&fit=crop&q=80&w=600" 
                alt="Document Storage" 
                className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-900/70 to-transparent flex items-end justify-center p-4">
                <p className="text-white text-xs text-center font-medium">Keep your medical records organized and secure 🔒</p>
              </div>
            </div>

            <button className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-sky-300 text-sky-600 rounded-2xl hover:bg-sky-50 transition-all font-bold">
              <span className="text-xl">📂</span>
              New Folder
            </button>
          </div>

          {/* Document Content */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <span>{categoryEmojis[selectedCategory]}</span>
                  {categories.find(c => c.id === selectedCategory)?.label}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <span>📁 All Documents</span>
                  <span className="text-sky-400">→</span>
                  <span className="text-sky-600 font-medium">{categories.find(c => c.id === selectedCategory)?.label}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder=" Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400 w-64 text-lg"
                  />
                  <span className="absolute left-4 top-3.5 text-xl">🔍</span>
                </div>
                <button 
                  className="bg-gradient-to-r from-sky-400 to-mint-400 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => document.getElementById('fileInput')?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <span className="animate-spin text-xl">⏳</span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <span className="text-xl">📤</span>
                      Upload
                    </>
                  )}
                </button>
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Upload Status */}
            {isUploading && (
              <div className="mb-4 p-4 bg-gradient-to-r from-sky-100 to-mint-100 border-2 border-sky-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl animate-spin">⏳</span>
                  <span className="text-sky-800 font-bold">Uploading your files... Please wait! 🚀</span>
                </div>
              </div>
            )}
            
            {/* Success Message */}
            {uploadSuccess && (
              <div className="mb-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-200 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <span className="text-green-800 font-bold">{uploadSuccess}</span>
                  </div>
                  <button
                    onClick={() => setUploadSuccess(null)}
                    className="text-green-600 hover:text-green-800 text-xl font-bold px-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
            
            {/* Error Message */}
            {uploadError && (
              <div className="mb-4 p-4 bg-gradient-to-r from-red-100 to-coral-100 border-2 border-red-200 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">❌</span>
                    <span className="text-red-800 font-bold">{uploadError}</span>
                  </div>
                  <button
                    onClick={() => setUploadError(null)}
                    className="text-red-600 hover:text-red-800 text-xl font-bold px-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Drag & Drop Area */}
            <div 
              className={`mb-8 border-3 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all ${
                isUploading ? 'border-gray-300 bg-gray-50 cursor-not-allowed' : 'border-sky-300 bg-gradient-to-br from-sky-50 to-mint-50 cursor-pointer hover:border-sky-400 hover:shadow-lg'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !isUploading && document.getElementById('fileInput')?.click()}
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg mb-4 animate-bounce">
                📤
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                {isUploading ? 'Uploading files...' : 'Drop files here!'}
              </h4>
              <p className="text-gray-500 mb-2">
                {isUploading ? 'Please wait...' : 'or click to browse your files'}
              </p>
              <p className="text-sm text-gray-400">Supports PDF, DOC, DOCX, JPG, PNG (Max 10MB) 📄</p>
            </div>

            {/* Edit Document Modal */}
            {isEditing && editingDocument && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span>✏️</span> Edit Document
                      </h3>
                      <button 
                        onClick={handleCancelEdit}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <form onSubmit={handleUpdate}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Document Title</label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400"
                          required
                        />
                      </div>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({...editForm, category: e.target.value as Category})}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400"
                        >
                          {categories.filter(cat => cat.id !== 'all').map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-sky-400 to-mint-400 text-white rounded-2xl hover:from-sky-500 hover:to-mint-500 transition-all font-bold shadow-lg"
                        >
                          Update ✨
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Document Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border-2 border-white overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gradient-to-r from-sky-50 to-mint-50 border-b-2 border-gray-100">
                  <tr>
                    <th className="px-6 py-4 w-10">
                      <input type="checkbox" className="rounded-xl text-sky-500 focus:ring-sky-400 w-5 h-5" />
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase">📄 Document Name</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase">📅 Date</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase">💾 Size</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase text-right">⚙️ Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-sky-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <input type="checkbox" className="rounded-xl text-sky-500 focus:ring-sky-400 w-5 h-5" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {getIcon(doc.category)}
                            <div>
                              <p className="text-sm font-bold text-gray-900">{doc.title}</p>
                              <p className="text-xs text-gray-400 font-mono">{doc.fileName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {doc.uploadedAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {doc.fileSize || '2.5 MB'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleDownload(doc)}
                              className="p-2 text-gray-400 hover:text-sky-500 transition-colors text-xl" 
                              title="View"
                            >
                              👁️
                            </button>
                            <button 
                              onClick={() => doc.id && handleEdit(doc.id)}
                              className="p-2 text-gray-400 hover:text-sky-500 transition-colors text-xl" 
                              title="View/Edit"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => doc.id && handleDelete(doc.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors text-xl" 
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <div className="text-6xl mb-4">📂</div>
                        <p className="text-lg">{searchQuery ? 'No documents found matching your search.' : 'No documents in this category yet.'}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-center text-sm text-gray-400 mt-8 flex items-center justify-center gap-2">
              <span className="text-xl">🔒</span>
              All documents are securely stored and encrypted.
            </p>
          </div>
        </main>
      </div>
    </div>
  </div>
)
}
