# File Components Documentation

Documentation for all file-related components in the workspace files feature.

---

## Table of Contents
- [Overview](#overview)
- [FileUploader](#fileuploader)
- [FileCard](#filecard)
- [FileComments](#filecomments)
- [WorkspaceFilesClient](#workspacefilesclient)
- [Usage Examples](#usage-examples)
- [Customization](#customization)

---

## Overview

The file components provide a complete file management system for projects, including upload, display, download, and commenting functionality.

**Component Hierarchy:**
```
WorkspaceFilesClient (Container)
├── FileUploader
├── FileCard (multiple)
└── FileComments (modal)
```

---

## FileUploader

**Location:** `components/dashboard/FileUploader.tsx`

**Purpose:** Drag-and-drop file upload component with validation and progress tracking.

### Props

```typescript
interface FileUploaderProps {
  onUpload: (file: File) => Promise<void>
  projectId: string
  className?: string
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| onUpload | Function | Yes | Async function called when file is ready to upload |
| projectId | string | Yes | Project ID for the upload |
| className | string | No | Additional CSS classes |

### State Management

```typescript
const [isDragging, setIsDragging] = useState(false)          // Drag state
const [selectedFile, setSelectedFile] = useState<File | null>(null)  // Selected file
const [isUploading, setIsUploading] = useState(false)         // Upload in progress
const [uploadProgress, setUploadProgress] = useState(0)       // Progress 0-100
const [error, setError] = useState<string | null>(null)       // Error message
```

### Features

1. **Drag-and-Drop Zone**
   - Visual feedback when dragging over
   - Drop to select file
   - Validates file on drop

2. **File Browser**
   - Click "Browse Files" button
   - Standard file picker dialog
   - Pre-filtered by allowed extensions

3. **File Validation**
   - Type checking (MIME type)
   - Size limit (25MB)
   - Immediate feedback on errors

4. **Upload Progress**
   - Visual progress bar
   - Percentage display
   - Disable UI during upload

5. **Error Handling**
   - Clear error messages
   - Validation errors
   - Upload failures

### Usage Example

```typescript
import FileUploader from '@/components/dashboard/FileUploader'

function MyPage() {
  const handleUpload = async (file: File) => {
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

    router.refresh()
  }

  return (
    <FileUploader
      projectId="project-123"
      onUpload={handleUpload}
    />
  )
}
```

### Validation Logic

```typescript
const validateFile = (file: File): string | null => {
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
  }
  return null
}
```

### Styling

- **Drag State:** Blue border and background
- **Default:** Gray dashed border
- **Upload Progress:** Primary color progress bar
- **Error:** Red text

### Future Enhancements

- [ ] Multiple file upload
- [ ] File preview before upload
- [ ] Resume failed uploads
- [ ] Actual progress tracking (not simulated)
- [ ] Compression before upload

---

## FileCard

**Location:** `components/dashboard/FileCard.tsx`

**Purpose:** Display file metadata and provide download/comment actions.

### Props

```typescript
interface FileCardProps {
  file: ProjectFileWithDetails
  onDownload: (file: ProjectFileWithDetails) => void
  onViewComments?: (file: ProjectFileWithDetails) => void
  showComments?: boolean
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| file | ProjectFileWithDetails | Yes | File data with uploader and comments |
| onDownload | Function | Yes | Called when download button clicked |
| onViewComments | Function | No | Called when comment button clicked |
| showComments | boolean | No | Show/hide comment button (default: true) |

### Data Structure

```typescript
interface ProjectFileWithDetails extends ProjectFile {
  uploader?: Profile
  comments?: (FileComment & { user?: Profile })[]
}
```

### Features

1. **File Icon**
   - Dynamic based on file type
   - Icons: 📄 (doc), 🖼️ (image), 🎨 (design), 💻 (code), 📦 (archive)

2. **Category Badge**
   - Color-coded by category
   - Categories: document, image, design, code, archive

3. **File Metadata**
   - File name (truncated if long)
   - File size (formatted: KB, MB, GB)
   - Category badge

4. **Uploader Info**
   - Avatar
   - Full name or email
   - Upload timestamp (relative: "2 hours ago")

5. **Actions**
   - Download button (icon only)
   - Comment button with count

### Usage Example

```typescript
import FileCard from '@/components/dashboard/FileCard'

function FileList({ files }) {
  const handleDownload = async (file) => {
    const response = await fetch(`/api/projects/${projectId}/files/${file.id}`)
    const { downloadUrl } = await response.json()
    window.open(downloadUrl, '_blank')
  }

  const handleViewComments = (file) => {
    setSelectedFile(file)
    setCommentsModalOpen(true)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          onDownload={handleDownload}
          onViewComments={handleViewComments}
        />
      ))}
    </div>
  )
}
```

### Category Colors

```typescript
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'document': return 'primary'
    case 'image': return 'secondary'
    case 'design': return 'warning'
    case 'code': return 'success'
    case 'archive': return 'default'
    default: return 'default'
  }
}
```

### Styling

- Hover effect: Shadow increases
- Responsive: Stacks on mobile, grid on desktop
- Truncation: Long filenames don't break layout

---

## FileComments

**Location:** `components/dashboard/FileComments.tsx`

**Purpose:** Thread-based comment system for files.

### Props

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

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| fileId | string | Yes | File identifier |
| fileName | string | Yes | File name for display |
| comments | FileCommentWithUser[] | Yes | Array of comments with user data |
| currentUserId | string | No | Current user's ID (for edit/delete permissions) |
| onAddComment | Function | Yes | Called when adding comment |
| onUpdateComment | Function | No | Called when editing comment |
| onDeleteComment | Function | No | Called when deleting comment |

### State Management

```typescript
const [newComment, setNewComment] = useState('')             // New comment text
const [editingId, setEditingId] = useState<string | null>(null)  // ID of comment being edited
const [editText, setEditText] = useState('')                 // Edit text
const [isSubmitting, setIsSubmitting] = useState(false)      // Submission in progress
```

### Features

1. **Comment List**
   - Scrollable container (max-height: 400px)
   - Chronological order (oldest first)
   - User avatars and names
   - Relative timestamps
   - Edit indicator

2. **Add Comment**
   - Textarea input
   - Submit button
   - Keyboard shortcut (Ctrl+Enter)
   - Disabled when submitting

3. **Edit Comment**
   - Inline editing
   - Save/Cancel buttons
   - Only for own comments
   - Shows edit indicator after save

4. **Delete Comment**
   - Confirmation dialog
   - Only for own comments
   - Immediate removal

5. **Empty State**
   - Icon and message when no comments
   - Encourages first comment

### Usage Example

```typescript
import FileComments from '@/components/dashboard/FileComments'
import { Modal, ModalContent, ModalBody } from '@heroui/react'

function FileCommentsModal({ file, isOpen, onClose, currentUserId }) {
  const handleAddComment = async (comment: string) => {
    await fetch(`/api/files/${file.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment })
    })
    router.refresh()
  }

  const handleUpdateComment = async (commentId: string, comment: string) => {
    await fetch(`/api/files/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment })
    })
    router.refresh()
  }

  const handleDeleteComment = async (commentId: string) => {
    await fetch(`/api/files/comments/${commentId}`, {
      method: 'DELETE'
    })
    router.refresh()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalBody>
          <FileComments
            fileId={file.id}
            fileName={file.file_name}
            comments={file.comments || []}
            currentUserId={currentUserId}
            onAddComment={handleAddComment}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
```

### Keyboard Shortcuts

- **Ctrl+Enter** (Windows/Linux): Submit comment
- **Cmd+Enter** (Mac): Submit comment

### Comment Display

```typescript
{comment.user?.full_name || comment.user?.email || 'Unknown User'}

{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
{comment.updated_at !== comment.created_at && ' (edited)'}
```

---

## WorkspaceFilesClient

**Location:** `components/dashboard/WorkspaceFilesClient.tsx`

**Purpose:** Main container component managing file workspace state.

### Props

```typescript
interface WorkspaceFilesClientProps {
  projectId: string
  projectTitle: string
  initialFiles: ProjectFileWithDetails[]
  currentUserId: string
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| projectId | string | Yes | Project identifier |
| projectTitle | string | Yes | Project name for display |
| initialFiles | ProjectFileWithDetails[] | Yes | Initial file list from server |
| currentUserId | string | Yes | Current user's ID |

### State Management

```typescript
const [files, setFiles] = useState<ProjectFileWithDetails[]>(initialFiles)
const [selectedFile, setSelectedFile] = useState<ProjectFileWithDetails | null>(null)
const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
const [isUploading, setIsUploading] = useState(false)
```

### Features

1. **File Grid**
   - Responsive layout
   - Empty state when no files
   - FileCard for each file

2. **Upload Section**
   - FileUploader component
   - Handles upload API calls
   - Refreshes after upload

3. **Comments Modal**
   - FileComments component
   - Opens on "Comment" button click
   - Full CRUD operations

4. **Back Navigation**
   - "Back to Project" button
   - Uses router.back()

### Usage Example

```typescript
// Server Component (page.tsx)
import { createClient } from '@/lib/supabase/server'
import { getProjectFilesWithComments } from '@/utils/database/files'
import WorkspaceFilesClient from '@/components/dashboard/WorkspaceFilesClient'

export default async function ProjectFilesPage({ params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, client_id, freelancer_id')
    .eq('id', params.projectId)
    .single()

  // Verify access
  if (project.client_id !== user.id && project.freelancer_id !== user.id) {
    redirect('/dashboard')
  }

  const files = await getProjectFilesWithComments(params.projectId)

  return (
    <WorkspaceFilesClient
      projectId={params.projectId}
      projectTitle={project.title}
      initialFiles={files}
      currentUserId={user.id}
    />
  )
}
```

### API Integration

```typescript
// Upload
const formData = new FormData()
formData.append('file', file)
await fetch(`/api/projects/${projectId}/files`, {
  method: 'POST',
  body: formData
})
router.refresh()

// Download
const response = await fetch(`/api/projects/${projectId}/files/${file.id}`)
const { downloadUrl } = await response.json()
window.open(downloadUrl, '_blank')

// Add Comment
await fetch(`/api/files/${fileId}/comments`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ comment })
})
router.refresh()
```

### Layout Structure

```
WorkspaceFilesClient
├── Header
│   ├── Back Button
│   ├── Title (Workspace Files)
│   └── Project Title
├── Tabs
│   └── "All Files" Tab
│       ├── FileUploader
│       └── File Grid
│           └── FileCard (multiple)
└── Comments Modal
    └── FileComments
```

---

## Usage Examples

### Example 1: Simple File Upload

```typescript
import FileUploader from '@/components/dashboard/FileUploader'

function SimpleUpload() {
  const handleUpload = async (file: File) => {
    console.log('Uploading:', file.name)
    // Upload logic here
  }

  return <FileUploader projectId="123" onUpload={handleUpload} />
}
```

### Example 2: Custom File List

```typescript
import FileCard from '@/components/dashboard/FileCard'

function CustomFileList({ files }) {
  return (
    <div className="space-y-4">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          onDownload={(f) => console.log('Download', f.file_name)}
          showComments={false}
        />
      ))}
    </div>
  )
}
```

### Example 3: Standalone Comments

```typescript
import FileComments from '@/components/dashboard/FileComments'

function StandaloneComments({ fileId, comments }) {
  return (
    <div className="max-w-2xl mx-auto">
      <FileComments
        fileId={fileId}
        fileName="design.psd"
        comments={comments}
        currentUserId="user-123"
        onAddComment={async (text) => console.log('Add:', text)}
      />
    </div>
  )
}
```

---

## Customization

### Styling

All components use Tailwind CSS and can be customized:

```typescript
<FileUploader
  className="border-2 border-dashed border-primary"
  projectId={projectId}
  onUpload={handleUpload}
/>
```

### Icons

Icons are from Heroicons and can be swapped:

```typescript
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'

// In component
<CloudArrowUpIcon className="w-16 h-16 text-primary" />
```

### File Type Icons

Customize in `lib/constants/file-types.ts`:

```typescript
export const ALLOWED_FILE_TYPES = {
  'application/pdf': {
    ext: '.pdf',
    category: 'document',
    icon: '📄'  // Change this
  }
}
```

### Translations

For internationalization, wrap text in translation function:

```typescript
import { useTranslation } from 'next-i18next'

function FileCard({ file }) {
  const { t } = useTranslation()

  return (
    <div>
      <button>{t('download')}</button>
    </div>
  )
}
```

---

## Performance Considerations

### Current Optimizations
- Components use React.memo where appropriate
- File list renders only on router.refresh()
- Comments loaded only when modal opened
- Images lazy-loaded

### Recommendations
- [ ] Virtualize long file lists
- [ ] Debounce comment input
- [ ] Cache download URLs
- [ ] Implement optimistic UI updates

---

## Testing

### Component Testing (TODO)

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import FileCard from '@/components/dashboard/FileCard'

describe('FileCard', () => {
  it('renders file name', () => {
    render(<FileCard file={mockFile} onDownload={jest.fn()} />)
    expect(screen.getByText('design.psd')).toBeInTheDocument()
  })

  it('calls onDownload when button clicked', () => {
    const handleDownload = jest.fn()
    render(<FileCard file={mockFile} onDownload={handleDownload} />)

    fireEvent.click(screen.getByLabelText('Download file'))
    expect(handleDownload).toHaveBeenCalledWith(mockFile)
  })
})
```

---

## Accessibility

### Current Features
- Semantic HTML
- ARIA labels on buttons
- Keyboard navigation
- Screen reader support

### Improvements Needed
- [ ] Better focus management
- [ ] Announce upload progress to screen readers
- [ ] Keyboard shortcuts documentation
- [ ] High contrast mode support

---

**Last Updated:** December 2024
**Component Version:** 1.0
**Related Documentation:**
- [Workspace Files Feature](../features/workspace-files.md)
- [Files API](../api/files.md)
- [Comments API](../api/comments.md)
