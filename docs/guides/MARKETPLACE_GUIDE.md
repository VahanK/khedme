# Khedme - Freelance Marketplace Platform Guide

## Overview

Khedme is a secure freelance marketplace platform that connects freelancers with clients. The platform includes:

- **Enhanced Profiles**: Separate profiles for freelancers (with skills, rates, portfolio) and clients (with company info)
- **Project Management**: Projects with file attachments visible only to participants
- **Proposal System**: Freelancers submit proposals, clients accept/reject
- **In-App Messaging**: Secure chat system to prevent contact exchange before payment
- **Review System**: Rating and reviews after project completion and payment
- **Privacy Protection**: Contact info hidden until payment is settled

## Database Schema

### Core Tables

#### 1. Profiles (`public.profiles`)
Base user profile table for both freelancers and clients.

```sql
- id (UUID, references auth.users)
- email (TEXT)
- full_name (TEXT)
- role ('freelancer' | 'client')
- created_at, updated_at
```

#### 2. Freelancer Profiles (`public.freelancer_profiles`)
Extended profile for freelancers.

```sql
- id (UUID, references profiles)
- bio (TEXT)
- skills (TEXT[]) - Array of skills
- hourly_rate (DECIMAL)
- portfolio_url (TEXT)
- avatar_url (TEXT)
- availability ('available' | 'busy' | 'unavailable')
- years_of_experience (INTEGER)
- completed_projects (INTEGER) - Auto-updated
- rating (DECIMAL) - Auto-calculated from reviews
- total_reviews (INTEGER) - Auto-updated
```

**Key Features:**
- Publicly viewable (for browsing)
- No contact information visible
- Only freelancer can update their own profile
- Rating auto-calculated from reviews

#### 3. Client Profiles (`public.client_profiles`)
Extended profile for clients.

```sql
- id (UUID, references profiles)
- company_name (TEXT)
- company_description (TEXT)
- company_website (TEXT)
- avatar_url (TEXT)
- total_projects_posted (INTEGER)
```

#### 4. Projects (`public.projects`)
Project listings and management.

```sql
- id (UUID)
- client_id (UUID, references profiles)
- freelancer_id (UUID, references profiles) - Set when proposal accepted
- title (TEXT)
- description (TEXT)
- budget_min, budget_max (DECIMAL)
- status ('open' | 'in_progress' | 'in_review' | 'completed' | 'cancelled')
- deadline (TIMESTAMP)
- required_skills (TEXT[])
- payment_status ('pending' | 'paid' | 'refunded')
```

**Visibility:**
- Open projects: Everyone can see
- In-progress/completed: Only client and assigned freelancer

#### 5. Proposals (`public.proposals`)
Freelancer proposals for projects.

```sql
- id (UUID)
- project_id (UUID, references projects)
- freelancer_id (UUID, references profiles)
- cover_letter (TEXT)
- proposed_budget (DECIMAL)
- estimated_duration (TEXT)
- status ('pending' | 'accepted' | 'rejected' | 'withdrawn')
```

**Constraints:**
- One proposal per freelancer per project
- Only freelancers can create proposals
- Clients can view all proposals for their projects
- Freelancers can only view their own proposals

#### 6. Project Files (`public.project_files`)
File attachments for projects.

```sql
- id (UUID)
- project_id (UUID, references projects)
- uploaded_by (UUID, references profiles)
- file_name (TEXT)
- file_path (TEXT) - Path in Supabase Storage
- file_size (BIGINT)
- file_type (TEXT) - MIME type
```

**Access Control:**
- Only project participants (client + assigned freelancer) can view/upload
- Users can delete their own uploaded files
- Files stored in Supabase Storage bucket: `project-files`

#### 7. Conversations (`public.conversations`)
Chat conversations between users.

```sql
- id (UUID)
- project_id (UUID, references projects) - Optional, links to project
- participant_1_id (UUID, references profiles)
- participant_2_id (UUID, references profiles)
- last_message_at (TIMESTAMP)
```

**Features:**
- Unique conversation per user pair per project
- Both participants can view
- Auto-updates timestamp on new messages

#### 8. Messages (`public.messages`)
Individual chat messages.

```sql
- id (UUID)
- conversation_id (UUID, references conversations)
- sender_id (UUID, references profiles)
- content (TEXT)
- is_read (BOOLEAN)
- created_at (TIMESTAMP)
```

**Privacy:**
- No contact information can be shared
- Only conversation participants can view messages
- Read status tracking

#### 9. Reviews (`public.reviews`)
Project reviews and ratings.

```sql
- id (UUID)
- project_id (UUID, references projects)
- reviewer_id (UUID, references profiles)
- reviewee_id (UUID, references profiles)
- rating (1-5)
- comment (TEXT)
```

**Constraints:**
- Can only be created after project is completed AND payment is settled
- One review per user per project
- Auto-updates freelancer rating

## API Routes

### File Management

#### Upload File
```
POST /api/projects/[projectId]/files
Content-Type: multipart/form-data

Body:
- file: File (max 10MB)

Response:
{
  "file": {
    "id": "uuid",
    "project_id": "uuid",
    "file_name": "example.pdf",
    "file_size": 12345,
    ...
  }
}
```

#### Get Project Files
```
GET /api/projects/[projectId]/files

Response:
{
  "files": [...]
}
```

#### Download File
```
GET /api/projects/[projectId]/files/[fileId]

Response:
{
  "downloadUrl": "signed-url-valid-for-1-hour"
}
```

#### Delete File
```
DELETE /api/projects/[projectId]/files/[fileId]

Response:
{
  "success": true
}
```

### Messaging

#### Get Conversations
```
GET /api/messages/conversations

Response:
{
  "conversations": [
    {
      "id": "uuid",
      "participant_1": {...},
      "participant_2": {...},
      "project": {...},
      "last_message_at": "timestamp",
      "messages": [latest_message]
    }
  ]
}
```

#### Create Conversation
```
POST /api/messages/conversations

Body:
{
  "otherUserId": "uuid",
  "projectId": "uuid" // optional
}

Response:
{
  "conversation": {...}
}
```

#### Get Messages
```
GET /api/messages/[conversationId]

Response:
{
  "messages": [...]
}
```

#### Send Message
```
POST /api/messages/[conversationId]

Body:
{
  "content": "Hello!"
}

Response:
{
  "message": {...}
}
```

## Utility Functions

All utility functions are located in `utils/database/`:

### Projects (`utils/database/projects.ts`)
- `getOpenProjects()` - Get all open projects
- `getProjectById(projectId)` - Get project with full details
- `getMyProjects(userId, role)` - Get user's projects
- `createProject(project)` - Create new project
- `updateProjectStatus(projectId, status, freelancerId?)` - Update project
- `updatePaymentStatus(projectId, paymentStatus)` - Update payment
- `searchProjects(searchTerm, skills?)` - Search projects

### Proposals (`utils/database/proposals.ts`)
- `getProposalsByProject(projectId)` - Get project proposals
- `getMyProposals(freelancerId)` - Get freelancer's proposals
- `createProposal(proposal)` - Submit proposal
- `updateProposalStatus(proposalId, status)` - Update proposal
- `acceptProposal(proposalId, projectId)` - Accept and assign freelancer

### Messaging (`utils/database/messaging.ts`)
- `getOrCreateConversation(user1, user2, projectId?)` - Get/create conversation
- `getMyConversations(userId)` - Get user's conversations
- `getConversationMessages(conversationId)` - Get messages
- `sendMessage(conversationId, senderId, content)` - Send message
- `markMessagesAsRead(conversationId, userId)` - Mark as read
- `getUnreadMessageCount(userId)` - Get unread count

### Files (`utils/database/files.ts`)
- `getProjectFiles(projectId)` - Get project files
- `uploadProjectFile(projectId, userId, file)` - Upload file
- `getFileDownloadUrl(filePath)` - Get signed download URL
- `deleteProjectFile(fileId, filePath)` - Delete file

### Profiles (`utils/database/profiles.ts`)
- `getFreelancerProfile(userId)` - Get freelancer profile
- `getClientProfile(userId)` - Get client profile
- `updateFreelancerProfile(userId, profile)` - Update freelancer
- `updateClientProfile(userId, profile)` - Update client
- `searchFreelancers(searchParams)` - Search freelancers
- `getFreelancerReviews(freelancerId)` - Get reviews
- `createReview(projectId, reviewerId, revieweeId, rating, comment)` - Create review

## Security Features

### 1. Privacy Protection
- **No Contact Info Before Payment**: Profiles don't expose email, phone, or external contact
- **In-App Messaging Only**: All communication through the platform
- **Payment-Gated Reviews**: Reviews only after payment is settled

### 2. Row Level Security (RLS)
All tables have RLS enabled with policies:

- **Profiles**: Users can only update their own
- **Projects**: Visibility based on status and participation
- **Files**: Only project participants can access
- **Messages**: Only conversation participants can view
- **Proposals**: Clients see all for their projects, freelancers see only their own

### 3. File Security
- Files stored in private Supabase Storage bucket
- Access controlled via storage policies
- Signed URLs with 1-hour expiry for downloads
- File size limit: 10MB

## Workflow Examples

### 1. Client Posts a Project
```typescript
// Client creates project
const project = await createProject({
  client_id: user.id,
  title: "Build a landing page",
  description: "Need a React landing page...",
  budget_min: 500,
  budget_max: 1000,
  required_skills: ["React", "TailwindCSS"],
  deadline: "2025-12-31"
})
// Status: 'open', visible to all
```

### 2. Freelancer Submits Proposal
```typescript
// Freelancer browses open projects
const openProjects = await getOpenProjects()

// Submits proposal
const proposal = await createProposal({
  project_id: projectId,
  freelancer_id: user.id,
  cover_letter: "I have 5 years experience...",
  proposed_budget: 750,
  estimated_duration: "2 weeks"
})
```

### 3. Client Accepts Proposal
```typescript
// Client views proposals
const proposals = await getProposalsByProject(projectId)

// Accepts one proposal
await acceptProposal(proposalId, projectId)
// This will:
// 1. Set proposal status to 'accepted'
// 2. Reject all other proposals
// 3. Assign freelancer to project
// 4. Change project status to 'in_progress'
```

### 4. Work & Communication
```typescript
// Create conversation
const conversation = await getOrCreateConversation(
  clientId,
  freelancerId,
  projectId
)

// Send messages
await sendMessage(conversation.id, userId, "When can you start?")

// Upload files
await uploadProjectFile(projectId, userId, file)
```

### 5. Complete & Review
```typescript
// Client marks project complete and processes payment
await updateProjectStatus(projectId, 'completed')
await updatePaymentStatus(projectId, 'paid')

// Now both parties can leave reviews
await createReview(
  projectId,
  clientId,
  freelancerId,
  5,
  "Great work!"
)
// This auto-updates freelancer's rating
```

## Next Steps

1. **Build UI Components**:
   - Project listing page
   - Freelancer search/browse
   - Project detail page with file upload
   - Messaging interface
   - Profile pages

2. **Payment Integration**:
   - Integrate Stripe/PayPal
   - Escrow system
   - Payment workflows

3. **Real-time Features**:
   - Use Supabase Realtime for live messages
   - Notification system

4. **Additional Features**:
   - Dispute resolution
   - Milestones for large projects
   - Contract templates
   - Time tracking

## Important Notes

- All contact information is hidden from profiles by design
- Messages are the ONLY way to communicate before payment
- Reviews can ONLY be created after payment is settled
- Files are private and only visible to project participants
- Use the utility functions - they handle security and data validation
