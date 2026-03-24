# Document Upload Guide

## 📁 Document Categories

Your application supports the following document categories:

| Category | ID | Emoji | Description | Example Files |
|----------|-----|-------|-------------|---------------|
| 🏥 Medical Reports | `medical_reports` | 🏥 | Hospital and medical facility documents | Cardiologist reports, X-rays, blood test results |
| 📝 Therapy Notes | `therapy_notes` | 📝 | Therapy session notes and progress | Speech therapy notes, Occupational therapy reports |
| 🧬 Genetics | `genetics` | 🧬 | Genetic testing and analysis | Karyotype reports, Genetic screening results |
| 🎓 IEP & School Docs | `iep_school` | 🎓 | Educational documents | IEP plans, Report cards, Teacher notes |
| 📄 Other | `other` | 📄 | Miscellaneous documents | Any other relevant documents |

---

## 📤 How to Upload Documents

### **Option 1: Using the UI (Recommended)**

1. Navigate to **Dashboard → Documents**
2. Select a category from the left sidebar:
   - Click on "Medical Reports", "Therapy Notes", etc.
3. Upload files using one of these methods:
   - **Click "Upload" button** → Select files from your computer
   - **Drag & drop** files directly onto the dashed upload area
4. Files are automatically categorized and stored

### **File Organization Structure**

Files are stored in Firebase Storage with this structure:
```
documents/
└── {childId}/
    ├── medical_reports/
    │   ├── 1774336281459_blood_test.pdf
    │   └── 1774336281460_xray.jpg
    ├── therapy_notes/
    │   └── 1774336281461_speech_therapy.docx
    ├── genetics/
    │   └── 1774336281462_karyotype.pdf
    ├── iep_school/
    │   └── 1774336281463_iep_plan.pdf
    └── other/
        └── 1774336281464_misc.pdf
```

---

## 💻 Option 2: Programmatic Upload

### **Example Code for Each Category**

```typescript
import { FileUploadUtils } from '@/utils/fileUploadUtils'

// 1. Upload Medical Reports
const uploadMedicalReport = async (file: File, childId: string) => {
  const result = await FileUploadUtils.uploadFile(
    file,
    childId,
    'medical_reports' // Category
  )
  
  if (result.success) {
    console.log('✅ Medical report uploaded:', result.fileUrl)
    console.log('File size:', result.fileSize)
    console.log('File type:', result.fileType)
  } else {
    console.error('❌ Upload failed:', result.error)
  }
}

// 2. Upload Therapy Notes
const uploadTherapyNote = async (file: File, childId: string) => {
  const result = await FileUploadUtils.uploadFile(
    file,
    childId,
    'therapy_notes'
  )
  // Handle result...
}

// 3. Upload Genetics Documents
const uploadGeneticsDocument = async (file: File, childId: string) => {
  const result = await FileUploadUtils.uploadFile(
    file,
    childId,
    'genetics'
  )
  // Handle result...
}

// 4. Upload IEP & School Documents
const uploadIEPDocument = async (file: File, childId: string) => {
  const result = await FileUploadUtils.uploadFile(
    file,
    childId,
    'iep_school'
  )
  // Handle result...
}

// 5. Upload Multiple Files at Once
const uploadMultipleDocuments = async (files: File[], childId: string) => {
  const results = await FileUploadUtils.uploadMultipleFiles(
    files,
    childId,
    'medical_reports' // All files go to same category
  )
  
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`✅ File ${index + 1} uploaded:`, result.fileName)
    }
  })
}
```

---

## 📋 Supported File Types

The system accepts the following file formats:

- **PDF** (.pdf) - Medical reports, test results
- **Word Documents** (.doc, .docx) - Therapy notes, IEP plans
- **Images** (.jpg, .jpeg, .png, .gif) - X-rays, scans, photos
- **Text Files** (.txt) - Notes, transcripts

**Maximum File Size:** 10MB per file

---

## 🔐 Security & Access Control

Your Firebase Storage rules ensure:

✅ **Only authenticated users** can upload/download files  
✅ **Parents can only access** their own children's documents  
✅ **Secure storage** with Firebase authentication  
✅ **Automatic categorization** by document type  

---

## 📊 Firestore Integration

When you upload a document through the UI, the system:

1. **Uploads file** to Firebase Storage
2. **Creates Firestore entry** with metadata:
   ```typescript
   {
     childId: "23oE7Rylm4SLSDrk2JpmEiw9HHl2",
     title: "Cardiologist Report.pdf",
     fileName: "Cardiologist_Report.pdf",
     type: "pdf",
     category: "medical_reports",
     fileUrl: "https://firebasestorage.googleapis.com/...",
     fileSize: "2.5 MB",
     uploadedAt: Timestamp,
     createdAt: Timestamp
   }
   ```
3. **Displays document** in the table immediately

---

## 🎯 Best Practices

### **File Naming**
- Use descriptive names: `cardiologist_report_2024.pdf` instead of `scan1.pdf`
- Include dates when relevant: `iep_plan_fall_2024.docx`
- Be consistent with naming conventions

### **Organization Tips**
1. **Regular uploads** - Add documents soon after appointments
2. **Categorize properly** - Select the right category before uploading
3. **Search-friendly titles** - Use clear, descriptive titles
4. **Regular cleanup** - Remove outdated documents periodically

### **Backup Strategy**
- Download important documents periodically
- Keep physical copies of critical medical records
- Use the "Download" button to save local backups

---

## 🧪 Testing Uploads

To test the upload functionality:

```typescript
// Test file upload with validation
const testUpload = async () => {
  const testFile = new File(['test content'], 'test_report.pdf', {
    type: 'application/pdf'
  })
  
  const result = await FileUploadUtils.uploadFile(
    testFile,
    'test_child_id_123',
    'medical_reports'
  )
  
  console.log('Upload result:', result)
  // Expected: { success: true, fileUrl: '...', fileName: 'test_report.pdf', ... }
}
```

---

## ⚠️ Troubleshooting

### Common Issues:

1. **"User does not have permission" error**
   - ✅ Ensure user is logged in
   - ✅ Verify Firebase Storage rules are deployed
   - ✅ Check that child document exists in Firestore

2. **"File size exceeds limit" error**
   - ✅ Compress large PDFs using online tools
   - ✅ Resize images before upload
   - ✅ Split large documents into smaller files

3. **"File type not supported" error**
   - ✅ Convert files to supported formats (PDF, DOC, JPG, etc.)
   - ✅ Use file conversion tools if needed

---

## 📱 Mobile Upload

The upload interface is responsive and works on mobile devices:

1. Open the app on your phone/tablet
2. Navigate to Documents page
3. Tap "Upload" button
4. Select from photo library or file manager
5. Choose the appropriate category

---

## 🚀 Future Enhancements

Potential features to add:

- [ ] Progress bar showing upload percentage
- [ ] Image preview before upload
- [ ] Batch categorization (select multiple files → assign different categories)
- [ ] OCR for scanned documents
- [ ] Automatic file naming based on content
- [ ] Document sharing with secure links
- [ ] Version history for updated documents

---

**Need Help?** 

Refer to [`STORAGE_SETUP.md`](./STORAGE_SETUP.md) for Firebase Storage configuration details.
