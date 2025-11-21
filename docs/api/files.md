# Files API Documentation

Complete API reference for file upload, download, and management operations.

---

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
- [Request/Response Examples](#requestresponse-examples)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Overview

The Files API handles all file operations within projects, including:
- Uploading files to projects
- Downloading files with signed URLs
- Listing files for a project
- Deleting files

**Base URL:** `/api/projects/{projectId}/files`

**Authentication:** Required for all endpoints

---

## Authentication

All endpoints require a valid Supabase session cookie. The session is validated via:

```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**Headers Required:**
- `Cookie`: Supabase session cookie (automatically sent by browser)

---

## Endpoints

### 1. List Project Files

Get all files for a specific project.

**Endpoint:** `GET /api/projects/{projectId}/files`

**Parameters:**
| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| projectId | UUID | Path | Yes | Project identifier |

**Authorization:**
- User must be the project client OR assigned freelancer

**Response:**
```json
{
  "files": [
    {
      "id": "file-uuid",
      "project_id": "project-uuid",
      "uploaded_by": "user-uuid",
      "file_name": "design.psd",
      "file_path": "project-uuid/1234567890-design.psd",
      "file_size": 2048000,
      "file_type": "image/vnd.adobe.photoshop",
      "created_at": "2024-12-01T10:30:00Z",
      "uploader": {
        "id": "user-uuid",
        "full_name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (not project participant)
- `404`: Project not found
- `500`: Server error

---

### 2. Upload File

Upload a new file to a project.

**Endpoint:** `POST /api/projects/{projectId}/files`

**Parameters:**
| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| projectId | UUID | Path | Yes | Project identifier |
| file | File | FormData | Yes | File to upload |

**Authorization:**
- User must be the project client OR assigned freelancer

**Request:**
```typescript
const formData = new FormData()
formData.append('file', fileObject)

fetch('/api/projects/project-uuid/files', {
  method: 'POST',
  body: formData
})
```

**File Constraints:**
- **Maximum Size:** 25MB (26,214,400 bytes)
- **Allowed Types:** See [File Types](#allowed-file-types)

**Response:**
```json
{
  "file": {
    "id": "file-uuid",
    "project_id": "project-uuid",
    "uploaded_by": "user-uuid",
    "file_name": "document.pdf",
    "file_path": "project-uuid/1234567890-document.pdf",
    "file_size": 1024000,
    "file_type": "application/pdf",
    "created_at": "2024-12-01T10:30:00Z"
  }
}
```

**Status Codes:**
- `201`: Created
- `400`: Bad request (file missing, invalid type, or too large)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Project not found
- `500`: Server error

**Error Examples:**
```json
// No file provided
{
  "error": "No file provided"
}

// File too large
{
  "error": "File size exceeds 25MB limit"
}

// Invalid file type
{
  "error": "File type application/x-exe is not allowed. Please upload a supported file format."
}
```

---

### 3. Get File Download URL

Generate a signed URL for file download.

**Endpoint:** `GET /api/projects/{projectId}/files/{fileId}`

**Parameters:**
| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| projectId | UUID | Path | Yes | Project identifier |
| fileId | UUID | Path | Yes | File identifier |

**Authorization:**
- User must be the project client OR assigned freelancer

**Response:**
```json
{
  "downloadUrl": "https://supabase-storage.co/object/sign/project-files/project-uuid/1234567890-file.pdf?token=xyz"
}
```

**URL Expiration:** 1 hour

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden
- `404`: File not found
- `500`: Server error

**Usage:**
```typescript
const response = await fetch(`/api/projects/${projectId}/files/${fileId}`)
const { downloadUrl } = await response.json()

// Open in new tab to download
window.open(downloadUrl, '_blank')
```

---

### 4. Delete File

Delete a file from the project.

**Endpoint:** `DELETE /api/projects/{projectId}/files/{fileId}`

**Parameters:**
| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| projectId | UUID | Path | Yes | Project identifier |
| fileId | UUID | Path | Yes | File identifier |

**Authorization:**
- User must be the file uploader (uploaded_by = user.id)

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden (not file owner)
- `404`: File not found
- `500`: Server error

---

## Allowed File Types

### Documents
```
application/pdf                                                    (.pdf)
application/msword                                                 (.doc)
application/vnd.openxmlformats-officedocument.wordprocessingml.document (.docx)
text/plain                                                         (.txt)
application/rtf                                                    (.rtf)
application/vnd.oasis.opendocument.text                           (.odt)
```

### Spreadsheets
```
application/vnd.ms-excel                                          (.xls)
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (.xlsx)
text/csv                                                          (.csv)
```

### Presentations
```
application/vnd.ms-powerpoint                                     (.ppt)
application/vnd.openxmlformats-officedocument.presentationml.presentation (.pptx)
```

### Images
```
image/jpeg                                                        (.jpg, .jpeg)
image/png                                                         (.png)
image/gif                                                         (.gif)
image/svg+xml                                                     (.svg)
image/webp                                                        (.webp)
```

### Design Files
```
image/vnd.adobe.photoshop                                         (.psd)
application/postscript                                            (.ai)
application/x-xd                                                  (.xd)
application/x-sketch                                              (.sketch)
application/x-figma                                               (.fig)
```

### Archives
```
application/zip                                                   (.zip)
application/x-rar-compressed                                      (.rar)
application/x-7z-compressed                                       (.7z)
application/x-tar                                                 (.tar)
application/gzip                                                  (.gz)
```

### Code Files
```
text/javascript                                                   (.js)
text/typescript                                                   (.ts)
application/json                                                  (.json)
text/html                                                         (.html)
text/css                                                          (.css)
text/x-python                                                     (.py)
text/x-java                                                       (.java)
text/x-c                                                          (.c)
text/x-c++                                                        (.cpp)
text/x-php                                                        (.php)
text/x-ruby                                                       (.rb)
text/x-go                                                         (.go)
text/x-rust                                                       (.rs)
text/x-swift                                                      (.swift)
text/x-kotlin                                                     (.kt)
text/markdown                                                     (.md)
text/xml, application/xml                                         (.xml)
```

---

## Request/Response Examples

### Example 1: Upload a File

```typescript
// Client-side code
async function uploadFile(projectId: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`/api/projects/${projectId}/files`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }

  const data = await response.json()
  return data.file
}

// Usage
try {
  const uploadedFile = await uploadFile('project-123', myFile)
  console.log('File uploaded:', uploadedFile)
} catch (error) {
  console.error('Upload failed:', error.message)
}
```

### Example 2: Download a File

```typescript
async function downloadFile(projectId: string, fileId: string) {
  const response = await fetch(`/api/projects/${projectId}/files/${fileId}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }

  const { downloadUrl } = await response.json()

  // Open in new tab
  window.open(downloadUrl, '_blank')
}
```

### Example 3: List All Project Files

```typescript
async function getProjectFiles(projectId: string) {
  const response = await fetch(`/api/projects/${projectId}/files`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }

  const { files } = await response.json()
  return files
}

// Usage
const files = await getProjectFiles('project-123')
files.forEach(file => {
  console.log(`${file.file_name} (${file.file_size} bytes)`)
})
```

### Example 4: Delete a File

```typescript
async function deleteFile(projectId: string, fileId: string) {
  const response = await fetch(`/api/projects/${projectId}/files/${fileId}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }

  return true
}

// Usage with confirmation
if (confirm('Are you sure you want to delete this file?')) {
  await deleteFile('project-123', 'file-456')
  console.log('File deleted')
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "error": "Error message here"
}
```

### Common Errors

#### 1. Unauthorized (401)
```json
{
  "error": "Unauthorized"
}
```
**Cause:** No valid session cookie
**Solution:** User needs to log in

#### 2. Forbidden (403)
```json
{
  "error": "You are not authorized to upload files to this project"
}
```
**Cause:** User not project participant
**Solution:** Verify user has project access

#### 3. Project Not Found (404)
```json
{
  "error": "Project not found"
}
```
**Cause:** Invalid project ID or project doesn't exist
**Solution:** Verify project ID is correct

#### 4. File Too Large (400)
```json
{
  "error": "File size exceeds 25MB limit"
}
```
**Cause:** File size > 25MB
**Solution:** Compress file or split into smaller files

#### 5. Invalid File Type (400)
```json
{
  "error": "File type application/x-exe is not allowed. Please upload a supported file format."
}
```
**Cause:** File MIME type not in allowed list
**Solution:** Convert to supported format or contact support

#### 6. Storage Error (500)
```json
{
  "error": "Failed to upload file"
}
```
**Cause:** Supabase Storage error or network issue
**Solution:** Retry upload, check server logs

---

## Rate Limiting

**Current Status:** Not implemented

**Recommended Limits (Future):**
- **Upload:** 50 files per hour per user
- **Download:** 200 requests per hour per user
- **List:** 100 requests per hour per user

**Implementation:** TODO - Add rate limiting middleware

---

## Storage Information

### Storage Bucket
- **Name:** `project-files`
- **Access:** Private (requires signed URLs)
- **Location:** Configured in Supabase dashboard

### File Path Structure
```
project-files/
└── {projectId}/
    └── {timestamp}-{filename}
```

**Example:**
```
project-files/abc-123-def/1701234567890-design.psd
```

### Signed URLs
- **Expiration:** 1 hour (3600 seconds)
- **Generation:** `createSignedUrl(filePath, 60 * 60)`
- **Security:** URLs expire and cannot be reused

---

## Database Integration

### Utility Functions

All file operations use utility functions from `utils/database/files.ts`:

```typescript
// Get all files for a project
const files = await getProjectFiles(projectId)

// Upload a file
const file = await uploadProjectFile(projectId, userId, fileObject)

// Get download URL
const url = await getFileDownloadUrl(filePath)

// Delete a file
await deleteProjectFile(fileId, filePath)
```

### Direct Database Queries

**Not Recommended:** Use utility functions instead

If needed for custom queries:
```typescript
const { data, error } = await supabase
  .from('project_files')
  .select('*')
  .eq('project_id', projectId)
```

---

## Security Considerations

### Access Control
1. **Authentication:** All endpoints require valid session
2. **Authorization:** Project membership verified for all operations
3. **Ownership:** Only file owner can delete files
4. **RLS Policies:** Database-level security enforced

### File Validation
1. **Type Checking:** MIME type validated server-side
2. **Size Limits:** Hard limit at 25MB
3. **Extension Validation:** Cross-checked with MIME type (TODO)
4. **Malware Scanning:** Not implemented (TODO)

### Download Security
1. **Signed URLs:** Temporary, expiring URLs
2. **No Direct Access:** Files not publicly accessible
3. **Project Verification:** Download only if project participant
4. **Audit Trail:** File access logged (TODO)

---

## Performance Optimization

### Current Optimizations
- Files served via Supabase CDN
- Signed URLs cached for 1 hour
- Database queries select only needed fields
- Indexes on project_id and uploaded_by

### Recommended Improvements
- [ ] Implement file compression
- [ ] Generate thumbnails for images
- [ ] Add pagination for file lists
- [ ] Cache file metadata
- [ ] Implement lazy loading

---

## Testing

### Manual Testing

```bash
# Upload a file
curl -X POST \
  -H "Cookie: session_cookie_here" \
  -F "file=@/path/to/file.pdf" \
  http://localhost:3000/api/projects/project-id/files

# Get download URL
curl -X GET \
  -H "Cookie: session_cookie_here" \
  http://localhost:3000/api/projects/project-id/files/file-id

# Delete file
curl -X DELETE \
  -H "Cookie: session_cookie_here" \
  http://localhost:3000/api/projects/project-id/files/file-id
```

### Integration Tests (TODO)

```typescript
describe('Files API', () => {
  it('should upload file', async () => {
    // Test implementation
  })

  it('should reject large files', async () => {
    // Test implementation
  })

  it('should require authentication', async () => {
    // Test implementation
  })
})
```

---

## Migration Guide

### From Old API (if applicable)

Not applicable - this is the initial implementation.

### Breaking Changes

None - initial version.

---

**Last Updated:** December 2024
**API Version:** 1.0
**Related Documentation:**
- [Comments API](./comments.md)
- [Database Schema](../database/schema.md)
- [Workspace Files Feature](../features/workspace-files.md)
