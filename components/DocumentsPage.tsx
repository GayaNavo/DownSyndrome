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
  const [isEditing, setIsEditing] = useState(false)
  const [editingDocument, setEditingDocument] = useState<DocumentData | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    category: 'other' as Category
  })

  const categories = [
    { id: 'all', label: 'All Documents', icon: 'folder' },
    { id: 'medical_reports', label: 'Medical Reports', icon: 'medical' },
    { id: 'therapy_notes', label: 'Therapy Notes', icon: 'therapy' },
    { id: 'genetics', label: 'Genetics', icon: 'dna' },
    { id: 'iep_school', label: 'IEP & School Docs', icon: 'school' },
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
        alert('Document deleted successfully!');
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Error deleting document. Please try again.');
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
      alert('Error fetching document. Please try again.')
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
    } catch (error) {
      console.error('Error updating document:', error)
      alert('Error updating document. Please try again.')
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingDocument(null)
    setEditForm({ title: '', category: 'other' })
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !child) return
    
    setIsUploading(true)
    setUploadError(null)
    setUploadProgress(0)
    
    try {
      // Upload files
      const results = await FileUploadUtils.uploadMultipleFiles(
        Array.from(files),
        child.id || currentUser!.uid,
        selectedCategory === 'all' ? 'other' : selectedCategory
      )
      
      // Process successful uploads
      const successfulUploads: DocumentData[] = []
      
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
          }
        } else {
          setUploadError(result.error || 'Upload failed')
        }
      }
      
      // Update documents state
      if (successfulUploads.length > 0) {
        setDocuments(prev => [...successfulUploads, ...prev])
      }
      
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError('Failed to upload files')
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
    switch (category) {
      case 'medical_reports':
        return (
          <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )
      case 'therapy_notes':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        )
      case 'genetics':
        return (
          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center text-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar activePage="documents" />
        <div className="flex-1 ml-64">
          <main className="p-6">
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Loading documents...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AppHeader />
      <div className="flex flex-1">
        <DashboardSidebar activePage="documents" />

        <div className="flex-1 ml-64 flex flex-col">
          <main className="flex-1 flex overflow-hidden">
          {/* Internal Sidebar */}
          <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
            <div className="flex items-center gap-3 mb-8 px-2">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                <span className="font-bold">L</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{child?.name || 'Child'}'s Library</h3>
                <p className="text-xs text-gray-500">Document Library</p>
              </div>
            </div>

            <nav className="flex-1 space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as Category)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span>{cat.label}</span>
                </button>
              ))}
            </nav>

            <button className="mt-4 flex items-center justify-center gap-2 w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Folder
            </button>
          </div>

          {/* Document Content */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{categories.find(c => c.id === selectedCategory)?.label}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <span>All Documents</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-blue-600">{categories.find(c => c.id === selectedCategory)?.label}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => document.getElementById('fileInput')?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload Document
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
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-blue-800 font-medium">Uploading files...</span>
                </div>
              </div>
            )}
            
            {uploadError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-800">{uploadError}</span>
                </div>
              </div>
            )}

            {/* Drag & Drop Area */}
            <div 
              className={`mb-8 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${
                isUploading ? 'border-gray-300 bg-gray-50 cursor-not-allowed' : 'border-blue-200 bg-blue-50 cursor-pointer hover:border-blue-400'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !isUploading && document.getElementById('fileInput')?.click()}
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                {isUploading ? 'Uploading files...' : 'Drag & drop files here'}
              </h4>
              <p className="text-gray-500 text-sm mb-2">
                {isUploading ? 'Please wait...' : 'or click to browse your files'}
              </p>
              <p className="text-xs text-gray-400">Supports PDF, DOC, DOCX, JPG, JPEG, PNG, GIF, TXT (Max 10MB)</p>
            </div>

            {/* Edit Document Modal */}
            {isEditing && editingDocument && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Edit Document</h3>
                      <button 
                        onClick={handleCancelEdit}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <form onSubmit={handleUpdate}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Document Title</label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({...editForm, category: e.target.value as Category})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {categories.filter(cat => cat.id !== 'all').map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Update
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Document Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 w-10">
                      <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Document Name</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date Uploaded</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">File Size</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {getIcon(doc.category)}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.title}</p>
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
                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Download">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => doc.id && handleEdit(doc.id)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors" 
                              title="View/Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => doc.id && handleDelete(doc.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors" 
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        {searchQuery ? 'No documents found matching your search.' : 'No documents in this category yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-center text-xs text-gray-400 mt-8 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              All documents are securely stored and encrypted.
            </p>
          </div>
        </main>
      </div>
    </div>
  </div>
)
}
