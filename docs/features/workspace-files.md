# Workspace Files Feature

A comprehensive project-based file sharing system with commenting capabilities, similar to Upwork's workspace files feature.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [User Flows](#user-flows)
- [Technical Implementation](#technical-implementation)
- [Components](#components)
- [API Integration](#api-integration)
- [Security](#security)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)

---

## Overview

The Workspace Files feature allows freelancers and clients to share files within a project context. Each project has its own workspace where authorized users can upload, download, comment on, and manage files.

### Key Characteristics
- **Project-Scoped:** Files belong to specific projects
- **Access Control:** Only project participants (client + assigned freelancer) can access
- **Commenting:** Thread-based discussions on each file
- **File Types:** Support for documents, images, design files, code, and archives
- **Download Protection:** Signed URLs with 1-hour expiry
- **Real-time Updates:** Changes reflected immediately via router refresh

---

## Features

### 1. File Upload
- **Drag-and-Drop:** Intuitive file upload interface
- **Browse Selection:** Traditional file picker
- **Progress Indicator:** Visual upload progress
- **Validation:** Type and size checking before upload
- **Maximum Size:** 25MB per file

### 2. File Management
- **List View:** Grid layout showing all project files
- **File Metadata:** Name, size, type, uploader, timestamp
- **Category Badges:** Visual indicators for file types
- **Download:** Secure download with signed URLs
- **Delete:** File owner can remove their uploads

### 3. File Comments
- **Thread System:** Discussion on each file
- **Add Comments:** Text-based comments
- **Edit Comments:** Update your own comments
- **Delete Comments:** Remove your own comments
- **User Attribution:** Avatar, name, and timestamp
- **Edit Indicator:** Shows when comment was edited

### 4. File Types Support

#### Documents
- PDF, DOC, DOCX, TXT, RTF, ODT
- XLS, XLSX, CSV (Spreadsheets)
- PPT, PPTX (Presentations)

#### Images
- JPG, JPEG, PNG, GIF, SVG, WebP

#### Design Files
- PSD (Photoshop)
- AI (Illustrator)
- XD (Adobe XD)
- Sketch
- Figma files

#### Code Files
- JS, TS, JSON, HTML, CSS
- Python, Java, C, C++
- PHP, Ruby, Go, Rust
- Swift, Kotlin
- Markdown, XML

#### Archives
- ZIP, RAR, 7Z, TAR, GZ

---

## User Flows

### Upload Flow (Freelancer/Client)

```
1. Navigate to Project → Files tab
   └─ URL: /dashboard/{role}/projects/{projectId}/files

2. See FileUploader component
   └─ Drag file OR click "Browse Files"

3. File selected
   ├─ Validation runs (type, size)
   ├─ If invalid: Error message shown
   └─ If valid: File details displayed

4. Click "Upload File"
   ├─ Progress bar shown
   ├─ File uploaded to Supabase Storage
   ├─ Database record created
   └─ Success: File appears in grid

5. Page refreshes → New file visible to all project participants
```

### Download Flow

```
1. User clicks download icon on FileCard
   └─ Triggers handleDownload()

2. API call: GET /api/projects/{projectId}/files/{fileId}
   ├─ Verifies user access
   ├─ Generates signed URL (1-hour expiry)
   └─ Returns download URL

3. Browser opens download URL in new tab
   └─ File downloads from Supabase Storage
```

### Comment Flow

```
1. User clicks "Comment" button on FileCard
   └─ Opens FileComments modal

2. User types comment and submits
   ├─ POST /api/files/{fileId}/comments
   ├─ Comment saved to database
   └─ Page refreshes

3. Comment appears in thread
   ├─ Shows user avatar, name, timestamp
   └─ Owner sees edit/delete buttons

4. Edit comment (optional)
   ├─ Click edit icon
   ├─ Textarea appears with current text
   ├─ PATCH /api/files/comments/{commentId}
   └─ Updated comment shown with "(edited)" indicator

5. Delete comment (optional)
   ├─ Click delete icon
   ├─ Confirmation dialog
   ├─ DELETE /api/files/comments/{commentId}
   └─ Comment removed from thread
```

---

## Technical Implementation

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ FileUploader │  │   FileCard   │  │FileComments  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              WorkspaceFilesClient (State)                │
│  - Manages file list                                     │
│  - Handles upload/download/comment actions               │
│  - Triggers router.refresh()                             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    API Routes                            │
│  POST   /api/projects/{id}/files                        │
│  GET    /api/projects/{id}/files/{fileId}               │
│  DELETE /api/projects/{id}/files/{fileId}               │
│  POST   /api/files/{fileId}/comments                    │
│  PATCH  /api/files/comments/{commentId}                 │
│  DELETE /api/files/comments/{commentId}                 │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Database Utilities                          │
│  utils/database/files.ts                                │
│  - getProjectFiles()                                    │
│  - uploadProjectFile()                                  │
│  - getFileDownloadUrl()                                 │
│  - getFileComments()                                    │
│  - addFileComment()                                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 Supabase Backend                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ project_   │  │  Storage   │  │   file_    │        │
│  │   files    │◄─┤  Bucket    │  │ comments   │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### Database Schema

#### project_files Table
```sql
CREATE TABLE project_files (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  uploaded_by UUID REFERENCES profiles(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,  -- Storage path
  file_size INTEGER,
  file_type TEXT,            -- MIME type
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### file_comments Table
```sql
CREATE TABLE file_comments (
  id UUID PRIMARY KEY,
  file_id UUID REFERENCES project_files(id),
  user_id UUID REFERENCES profiles(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Storage Structure
```
Supabase Storage: project-files/
└── {projectId}/
    ├── {timestamp}-filename1.pdf
    ├── {timestamp}-filename2.png
    └── {timestamp}-filename3.zip
```

---

## Components

### 1. FileUploader
**Location:** `components/dashboard/FileUploader.tsx`

**Purpose:** Handle file selection and upload

**Props:**
```typescript
interface FileUploaderProps {
  onUpload: (file: File) => Promise<void>
  projectId: string
  className?: string
}
```

**Features:**
- Drag-and-drop zone
- Click-to-browse
- File validation
- Upload progress
- Error handling

**Usage:**
```typescript
<FileUploader
  projectId={projectId}
  onUpload={handleUpload}
/>
```

---

### 2. FileCard
**Location:** `components/dashboard/FileCard.tsx`

**Purpose:** Display file metadata and actions

**Props:**
```typescript
interface FileCardProps {
  file: ProjectFileWithDetails
  onDownload: (file: ProjectFileWithDetails) => void
  onViewComments?: (file: ProjectFileWithDetails) => void
  showComments?: boolean
}
```

**Features:**
- File icon based on type
- Category badge
- Size display
- Uploader info
- Download button
- Comment count/button

**Usage:**
```typescript
<FileCard
  file={fileData}
  onDownload={handleDownload}
  onViewComments={handleViewComments}
/>
```

---

### 3. FileComments
**Location:** `components/dashboard/FileComments.tsx`

**Purpose:** Manage file comment threads

**Props:**
```typescript
interface FileCommentsProps {
  fileId: string
  fileName: string
  comments: FileCommentWithUser[]
  currentUserId?: string
  onAddComment: (comment: string) => Promise<void>
  onUpdateComment?: (commentId: string, comment: string) => Promise<void>
  onDeleteComment?: (commentId: string) => Promise<void>
}
```

**Features:**
- Comment list with avatars
- Add comment form
- Edit own comments
- Delete own comments
- Edit indicator
- Keyboard shortcut (Ctrl+Enter to submit)

**Usage:**
```typescript
<FileComments
  fileId={file.id}
  fileName={file.file_name}
  comments={file.comments}
  currentUserId={userId}
  onAddComment={handleAddComment}
  onUpdateComment={handleUpdateComment}
  onDeleteComment={handleDeleteComment}
/>
```

---

### 4. WorkspaceFilesClient
**Location:** `components/dashboard/WorkspaceFilesClient.tsx`

**Purpose:** Main workspace files interface (Client Component)

**Props:**
```typescript
interface WorkspaceFilesClientProps {
  projectId: string
  projectTitle: string
  initialFiles: ProjectFileWithDetails[]
  currentUserId: string
}
```

**State Management:**
- Files list
- Selected file for comments
- Modal open/close state
- Upload status

**Usage:**
```typescript
<WorkspaceFilesClient
  projectId={projectId}
  projectTitle={project.title}
  initialFiles={files}
  currentUserId={user.id}
/>
```

---

## API Integration

### Upload File
```typescript
// POST /api/projects/{projectId}/files

const formData = new FormData()
formData.append('file', file)

const response = await fetch(`/api/projects/${projectId}/files`, {
  method: 'POST',
  body: formData
})

const { file: uploadedFile } = await response.json()
```

### Get Download URL
```typescript
// GET /api/projects/{projectId}/files/{fileId}

const response = await fetch(`/api/projects/${projectId}/files/${fileId}`)
const { downloadUrl } = await response.json()

window.open(downloadUrl, '_blank')
```

### Add Comment
```typescript
// POST /api/files/{fileId}/comments

const response = await fetch(`/api/files/${fileId}/comments`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ comment: 'Great work!' })
})

const { comment: newComment } = await response.json()
```

### Update Comment
```typescript
// PATCH /api/files/comments/{commentId}

const response = await fetch(`/api/files/comments/${commentId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ comment: 'Updated comment' })
})
```

### Delete Comment
```typescript
// DELETE /api/files/comments/{commentId}

const response = await fetch(`/api/files/comments/${commentId}`, {
  method: 'DELETE'
})
```

---

## Security

### File Upload Security
- **Type Validation:** Only allowed MIME types
- **Size Limit:** 25MB maximum
- **Project Access:** Only project participants can upload
- **Malware Scanning:** (TODO: Implement)

### File Download Security
- **Signed URLs:** 1-hour expiration
- **Access Control:** Project membership verified
- **No Direct Access:** Storage files not publicly accessible

### Comment Security
- **RLS Policies:** Database-level access control
- **Ownership Verification:** Edit/delete only own comments
- **XSS Prevention:** Comment text sanitized (via Textarea component)
- **Project Access:** Only participants see comments

### RLS Policies

**project_files table:**
```sql
-- View files: Only project participants
CREATE POLICY "Project participants can view files"
  ON project_files FOR SELECT
  USING (
    auth.uid() IN (
      SELECT client_id FROM projects WHERE id = project_id
      UNION
      SELECT freelancer_id FROM projects WHERE id = project_id
    )
  );

-- Upload files: Only project participants
CREATE POLICY "Project participants can upload files"
  ON project_files FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT client_id FROM projects WHERE id = project_id
      UNION
      SELECT freelancer_id FROM projects WHERE id = project_id
    )
  );

-- Delete files: Only uploader
CREATE POLICY "Users can delete own files"
  ON project_files FOR DELETE
  USING (auth.uid() = uploaded_by);
```

**file_comments table:**
```sql
-- View comments: Only project participants
CREATE POLICY "Project participants can view file comments"
  ON file_comments FOR SELECT
  USING (
    auth.uid() IN (
      SELECT client_id FROM projects
      WHERE id = (SELECT project_id FROM project_files WHERE id = file_id)
      UNION
      SELECT freelancer_id FROM projects
      WHERE id = (SELECT project_id FROM project_files WHERE id = file_id)
    )
  );

-- Add comments: Only project participants
CREATE POLICY "Project participants can add file comments"
  ON file_comments FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT client_id FROM projects
      WHERE id = (SELECT project_id FROM project_files WHERE id = file_id)
      UNION
      SELECT freelancer_id FROM projects
      WHERE id = (SELECT project_id FROM project_files WHERE id = file_id)
    )
  );

-- Update comments: Only owner
CREATE POLICY "Users can update own file comments"
  ON file_comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Delete comments: Only owner
CREATE POLICY "Users can delete own file comments"
  ON file_comments FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Usage Examples

### Example 1: Basic File Upload
```typescript
// In your page or component
const handleUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch(`/api/projects/${projectId}/files`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }

    router.refresh() // Refresh server component
  } catch (error) {
    console.error('Upload failed:', error)
    alert('Failed to upload file')
  }
}

return <FileUploader projectId={projectId} onUpload={handleUpload} />
```

### Example 2: File List with Comments
```typescript
// Server Component (page.tsx)
export default async function ProjectFilesPage({ params }) {
  const files = await getProjectFilesWithComments(params.projectId)

  return (
    <WorkspaceFilesClient
      projectId={params.projectId}
      projectTitle="My Project"
      initialFiles={files}
      currentUserId={user.id}
    />
  )
}
```

### Example 3: Adding File Type Support
```typescript
// lib/constants/file-types.ts

// Add new file type
export const ALLOWED_FILE_TYPES = {
  // ... existing types

  // New type
  'application/x-new-format': {
    ext: '.new',
    category: 'custom',
    icon: '📋'
  }
}
```

---

## Troubleshooting

### Issue: File Upload Fails with "File type not allowed"

**Cause:** MIME type not in allowed list

**Solution:**
1. Check file's actual MIME type
2. Add to `ALLOWED_FILE_TYPES` in `lib/constants/file-types.ts`
3. Update API validation in `/api/projects/[projectId]/files/route.ts`

---

### Issue: Download Returns 404

**Cause:** File not found in storage or RLS policy blocking access

**Solution:**
1. Verify file exists in Supabase Storage dashboard
2. Check RLS policies on `project_files` table
3. Verify user is project participant
4. Check file path matches storage path

---

### Issue: Comments Not Showing

**Cause:** RLS policy blocking access or fetch not including relations

**Solution:**
1. Check `getProjectFilesWithComments()` includes comment relation
2. Verify RLS policy on `file_comments` table
3. Check console for fetch errors
4. Verify user is authenticated

---

### Issue: Upload Progress Stuck at 90%

**Cause:** Backend processing taking time or error occurred

**Solution:**
1. Check network tab for actual upload status
2. Check server logs for errors
3. Verify Supabase Storage bucket exists
4. Check file size within limits

---

## Future Enhancements

### Short-term
- [ ] File preview (images, PDFs)
- [ ] Bulk file upload
- [ ] File search/filter
- [ ] Sort by name, date, size, type
- [ ] File versioning
- [ ] Download all files (ZIP)

### Medium-term
- [ ] Folder organization
- [ ] File tagging
- [ ] Advanced permissions (view-only, edit)
- [ ] File activity log
- [ ] Email notifications for new files/comments
- [ ] In-app notifications

### Long-term
- [ ] Real-time collaboration (live cursors, presence)
- [ ] Document editing (Google Docs-like)
- [ ] Video/audio preview
- [ ] File compression before upload
- [ ] OCR for scanned documents
- [ ] Integration with cloud storage (Google Drive, Dropbox)

---

## Performance Considerations

### Current Optimizations
- Signed URLs prevent bandwidth overuse
- File list paginated (TODO: Implement)
- Images lazy-loaded
- Comments fetched only when modal opened

### Recommended Improvements
- Implement infinite scroll for large file lists
- Add thumbnail generation for images
- Cache file metadata
- Compress images on upload
- Implement CDN for file delivery

---

## Analytics & Monitoring

### Metrics to Track
- Total files uploaded
- Average file size
- Most common file types
- Upload success/failure rate
- Comment engagement rate
- Download frequency

### Error Monitoring
- Track upload failures
- Monitor RLS policy violations
- Log storage errors
- Track API response times

---

**Last Updated:** December 2024
**Feature Owner:** Development Team
**Related Docs:**
- [API Reference](../api/files.md)
- [Components](../components/file-components.md)
- [Database Schema](../database/schema.md)
