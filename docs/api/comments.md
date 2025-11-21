# File Comments API Documentation

API reference for managing comments on project files.

---

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
- [Request/Response Examples](#requestresponse-examples)
- [Error Handling](#error-handling)

---

## Overview

The File Comments API allows project participants to discuss and provide feedback on uploaded files.

**Base URLs:**
- `/api/files/{fileId}/comments` - Comments for a specific file
- `/api/files/comments/{commentId}` - Individual comment operations

**Authentication:** Required for all endpoints

---

## Authentication

All endpoints require valid Supabase session. Authorization is enforced via:

1. **Session validation:** User must be logged in
2. **Project membership:** User must be participant in the file's project
3. **Ownership:** Edit/delete requires comment ownership

---

## Endpoints

### 1. Get File Comments

Retrieve all comments for a specific file.

**Endpoint:** `GET /api/files/{fileId}/comments`

**Parameters:**
| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| fileId | UUID | Path | Yes | File identifier |

**Authorization:**
- User must be participant in the file's project

**Response:**
```json
{
  "comments": [
    {
      "id": "comment-uuid",
      "file_id": "file-uuid",
      "user_id": "user-uuid",
      "comment": "This looks great! Just one small change needed.",
      "created_at": "2024-12-01T10:30:00Z",
      "updated_at": "2024-12-01T10:30:00Z",
      "user": {
        "id": "user-uuid",
        "full_name": "Jane Smith",
        "email": "jane@example.com"
      }
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden (not project participant)
- `404`: File not found
- `500`: Server error

---

### 2. Add Comment

Add a new comment to a file.

**Endpoint:** `POST /api/files/{fileId}/comments`

**Parameters:**
| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| fileId | UUID | Path | Yes | File identifier |
| comment | string | Body | Yes | Comment text |

**Authorization:**
- User must be participant in the file's project

**Request:**
```json
{
  "comment": "This looks great! Just one small change needed."
}
```

**Validation:**
- Comment must not be empty
- Comment must be trimmed of whitespace

**Response:**
```json
{
  "comment": {
    "id": "comment-uuid",
    "file_id": "file-uuid",
    "user_id": "user-uuid",
    "comment": "This looks great! Just one small change needed.",
    "created_at": "2024-12-01T10:30:00Z",
    "updated_at": "2024-12-01T10:30:00Z",
    "user": {
      "id": "user-uuid",
      "full_name": "Jane Smith",
      "email": "jane@example.com"
    }
  }
}
```

**Status Codes:**
- `201`: Created
- `400`: Bad request (empty comment)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: File not found
- `500`: Server error

---

### 3. Update Comment

Edit an existing comment.

**Endpoint:** `PATCH /api/files/comments/{commentId}`

**Parameters:**
| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| commentId | UUID | Path | Yes | Comment identifier |
| comment | string | Body | Yes | Updated comment text |

**Authorization:**
- User must be the comment owner (user_id = auth.uid())

**Request:**
```json
{
  "comment": "Updated: This looks perfect now!"
}
```

**Response:**
```json
{
  "comment": {
    "id": "comment-uuid",
    "file_id": "file-uuid",
    "user_id": "user-uuid",
    "comment": "Updated: This looks perfect now!",
    "created_at": "2024-12-01T10:30:00Z",
    "updated_at": "2024-12-01T11:45:00Z",
    "user": {
      "id": "user-uuid",
      "full_name": "Jane Smith",
      "email": "jane@example.com"
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `400`: Bad request (empty comment)
- `401`: Unauthorized
- `403`: Forbidden (not comment owner)
- `404`: Comment not found
- `500`: Server error

---

### 4. Delete Comment

Remove a comment.

**Endpoint:** `DELETE /api/files/comments/{commentId}`

**Parameters:**
| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| commentId | UUID | Path | Yes | Comment identifier |

**Authorization:**
- User must be the comment owner

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden (not comment owner)
- `404`: Comment not found
- `500`: Server error

---

## Request/Response Examples

### Example 1: Get All Comments for a File

```typescript
async function getFileComments(fileId: string) {
  const response = await fetch(`/api/files/${fileId}/comments`)

  if (!response.ok) {
    throw new Error('Failed to fetch comments')
  }

  const { comments } = await response.json()
  return comments
}

// Usage
const comments = await getFileComments('file-123')
console.log(`${comments.length} comments found`)
```

### Example 2: Add a Comment

```typescript
async function addComment(fileId: string, commentText: string) {
  const response = await fetch(`/api/files/${fileId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ comment: commentText })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }

  const { comment } = await response.json()
  return comment
}

// Usage
const newComment = await addComment('file-123', 'Great work on this design!')
console.log('Comment added:', newComment.id)
```

### Example 3: Update a Comment

```typescript
async function updateComment(commentId: string, newText: string) {
  const response = await fetch(`/api/files/comments/${commentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ comment: newText })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }

  const { comment } = await response.json()
  return comment
}

// Usage
const updated = await updateComment('comment-456', 'Updated feedback here')
console.log('Comment updated at:', updated.updated_at)
```

### Example 4: Delete a Comment

```typescript
async function deleteComment(commentId: string) {
  const response = await fetch(`/api/files/comments/${commentId}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }

  return true
}

// Usage with confirmation
if (confirm('Delete this comment?')) {
  await deleteComment('comment-456')
  console.log('Comment deleted')
}
```

### Example 5: Real-time Comment Updates

```typescript
// In a React component
function FileCommentsSection({ fileId }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadComments()
  }, [fileId])

  async function loadComments() {
    const data = await getFileComments(fileId)
    setComments(data)
  }

  async function handleSubmit() {
    await addComment(fileId, newComment)
    setNewComment('')
    router.refresh() // Refresh server component
  }

  return (
    <div>
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
      />
      <button onClick={handleSubmit}>Add Comment</button>
    </div>
  )
}
```

---

## Error Handling

### Common Errors

#### 1. Empty Comment (400)
```json
{
  "error": "Comment cannot be empty"
}
```
**Cause:** Comment text is empty or only whitespace
**Solution:** Ensure comment has actual content

#### 2. Unauthorized (401)
```json
{
  "error": "Unauthorized"
}
```
**Cause:** No valid session
**Solution:** User needs to log in

#### 3. Not Comment Owner (403)
```json
{
  "error": "You can only edit your own comments"
}
```
**Cause:** Trying to edit/delete another user's comment
**Solution:** Only comment owner can modify

#### 4. Not Project Participant (403)
```json
{
  "error": "You are not authorized to comment on this file"
}
```
**Cause:** User not part of the file's project
**Solution:** Verify project access

#### 5. Comment Not Found (404)
```json
{
  "error": "Comment not found"
}
```
**Cause:** Invalid comment ID
**Solution:** Verify comment exists

---

## Database Integration

### Utility Functions

Comments use utility functions from `utils/database/files.ts`:

```typescript
// Get all comments for a file
const comments = await getFileComments(fileId)

// Add a comment
const comment = await addFileComment(fileId, userId, commentText)

// Update a comment
const updated = await updateFileComment(commentId, newText)

// Delete a comment
await deleteFileComment(commentId)
```

### Database Schema

```sql
CREATE TABLE file_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID REFERENCES project_files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX file_comments_file_id_idx ON file_comments(file_id);
CREATE INDEX file_comments_user_id_idx ON file_comments(user_id);
CREATE INDEX file_comments_created_at_idx ON file_comments(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER set_file_comment_updated_at
  BEFORE UPDATE ON file_comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
```

---

## Security

### Row-Level Security Policies

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

### Security Considerations

1. **XSS Prevention:** Comment text sanitized by React/HeroUI
2. **SQL Injection:** Prevented by Supabase parameterized queries
3. **Authorization:** Multi-level checks (session + project + ownership)
4. **Audit Trail:** created_at and updated_at tracked

---

## Comment Features

### Edit Indicator

Comments show when they've been edited:

```typescript
// In UI
{comment.updated_at !== comment.created_at && ' (edited)'}
```

### Keyboard Shortcuts

The FileComments component supports:
- **Ctrl+Enter** (Windows/Linux) or **Cmd+Enter** (Mac): Submit comment

```typescript
onKeyDown={(e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    handleSubmit()
  }
}}
```

### Comment Ordering

Comments are ordered chronologically (oldest first):

```sql
ORDER BY created_at ASC
```

This creates a natural conversation flow.

---

## Performance Considerations

### Current Optimizations
- Comments fetched with file data (single query)
- Indexes on file_id for fast lookup
- Only load comments when modal opened
- User data included in comment query (no N+1)

### Recommended Improvements
- [ ] Implement comment pagination
- [ ] Add comment count caching
- [ ] Real-time updates via Supabase Realtime
- [ ] Implement @ mentions
- [ ] Add reaction emojis

---

## Future Enhancements

### Short-term
- [ ] Comment reactions (👍, ❤️, etc.)
- [ ] @ mentions with notifications
- [ ] Rich text formatting
- [ ] Comment threading (replies)
- [ ] Comment search

### Long-term
- [ ] Voice comments
- [ ] Video comments
- [ ] Drawing/annotation tools
- [ ] Comment analytics
- [ ] AI-powered comment suggestions

---

## Testing

### Manual Testing

```bash
# Get comments
curl -X GET \
  -H "Cookie: session_cookie" \
  http://localhost:3000/api/files/file-id/comments

# Add comment
curl -X POST \
  -H "Cookie: session_cookie" \
  -H "Content-Type: application/json" \
  -d '{"comment":"Great work!"}' \
  http://localhost:3000/api/files/file-id/comments

# Update comment
curl -X PATCH \
  -H "Cookie: session_cookie" \
  -H "Content-Type: application/json" \
  -d '{"comment":"Updated comment"}' \
  http://localhost:3000/api/files/comments/comment-id

# Delete comment
curl -X DELETE \
  -H "Cookie: session_cookie" \
  http://localhost:3000/api/files/comments/comment-id
```

### Integration Tests (TODO)

```typescript
describe('Comments API', () => {
  it('should add comment', async () => {})
  it('should reject empty comment', async () => {})
  it('should prevent non-owner edit', async () => {})
  it('should track updated_at on edit', async () => {})
})
```

---

## Analytics

### Metrics to Track
- Total comments per file
- Average comments per project
- Comment response time
- Most active commenters
- Edit frequency
- Delete rate

### Implementation (TODO)

```typescript
// Track comment creation
await trackEvent('comment_created', {
  fileId,
  projectId,
  userId,
  commentLength: comment.length
})
```

---

**Last Updated:** December 2024
**API Version:** 1.0
**Related Documentation:**
- [Files API](./files.md)
- [Database Schema](../database/schema.md)
- [FileComments Component](../components/file-components.md#filecomments)
