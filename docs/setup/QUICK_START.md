# Quick Start Guide

## Setup Checklist

✅ Database schema created and applied to Supabase
✅ TypeScript types defined
✅ Storage bucket configured
✅ Utility functions created
✅ API routes set up

## Common Code Examples

### Setting Up a Freelancer Profile

```typescript
import { updateFreelancerProfile } from '@/utils/database/profiles'

// After user signs up as a freelancer
await updateFreelancerProfile(userId, {
  bio: "Full-stack developer with 5 years of experience",
  skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
  hourly_rate: 75.00,
  portfolio_url: "https://myportfolio.com",
  availability: "available",
  years_of_experience: 5
})
```

### Creating a Project (Client)

```typescript
import { createProject } from '@/utils/database/projects'

const project = await createProject({
  client_id: userId,
  title: "E-commerce Website Development",
  description: "Looking for a developer to build a modern e-commerce platform...",
  budget_min: 2000,
  budget_max: 5000,
  required_skills: ["React", "Next.js", "Stripe"],
  deadline: new Date("2025-12-31").toISOString()
})
```

### Browsing Projects (Freelancer)

```typescript
import { getOpenProjects, searchProjects } from '@/utils/database/projects'

// Get all open projects
const allProjects = await getOpenProjects()

// Search by skills
const reactProjects = await searchProjects("", ["React", "TypeScript"])

// Search by keyword and skills
const ecommerceProjects = await searchProjects("ecommerce", ["Next.js"])
```

### Submitting a Proposal

```typescript
import { createProposal } from '@/utils/database/proposals'

const proposal = await createProposal({
  project_id: projectId,
  freelancer_id: userId,
  cover_letter: `Hi! I'm interested in your project.

  I have 5 years of experience building e-commerce platforms with React and Next.js.
  I've completed similar projects including...

  I'm available to start immediately.`,
  proposed_budget: 3500,
  estimated_duration: "4 weeks"
})
```

### Reviewing Proposals (Client)

```typescript
import { getProposalsByProject, acceptProposal } from '@/utils/database/proposals'

// View all proposals for a project
const proposals = await getProposalsByProject(projectId)

// Accept a proposal
await acceptProposal(proposalId, projectId)
// This automatically:
// - Accepts the chosen proposal
// - Rejects all other proposals
// - Assigns the freelancer to the project
// - Changes project status to 'in_progress'
```

### Starting a Conversation

```typescript
import { getOrCreateConversation, sendMessage } from '@/utils/database/messaging'

// Create or get existing conversation
const conversation = await getOrCreateConversation(
  currentUserId,
  otherUserId,
  projectId // optional, links conversation to project
)

// Send a message
await sendMessage(
  conversation.id,
  currentUserId,
  "Hi! I'd like to discuss the project requirements."
)
```

### Viewing Messages

```typescript
import { getConversationMessages, markMessagesAsRead } from '@/utils/database/messaging'

// Get messages
const messages = await getConversationMessages(conversationId)

// Mark as read when user views them
await markMessagesAsRead(conversationId, currentUserId)
```

### Uploading Project Files

```typescript
// Client-side: Upload via API
const formData = new FormData()
formData.append('file', selectedFile)

const response = await fetch(`/api/projects/${projectId}/files`, {
  method: 'POST',
  body: formData
})

const { file } = await response.json()
```

### Downloading Project Files

```typescript
// Get download URL
const response = await fetch(`/api/projects/${projectId}/files/${fileId}`)
const { downloadUrl } = await response.json()

// Use the signed URL to download
window.open(downloadUrl, '_blank')
```

### Listing Project Files

```typescript
import { getProjectFiles } from '@/utils/database/files'

const files = await getProjectFiles(projectId)

// Display files
files.forEach(file => {
  console.log(`${file.file_name} (${file.file_size} bytes)`)
  console.log(`Uploaded by: ${file.uploaded_by}`)
})
```

### Completing a Project & Leaving Review

```typescript
import { updateProjectStatus, updatePaymentStatus } from '@/utils/database/projects'
import { createReview } from '@/utils/database/profiles'

// Client marks project complete
await updateProjectStatus(projectId, 'completed')

// Process payment (integrate with Stripe/PayPal)
// ... payment processing ...

// Update payment status
await updatePaymentStatus(projectId, 'paid')

// Now client can leave a review
await createReview(
  projectId,
  clientId,
  freelancerId,
  5, // rating 1-5
  "Excellent work! Delivered on time and exceeded expectations."
)

// Freelancer can also review the client
await createReview(
  projectId,
  freelancerId,
  clientId,
  5,
  "Great client, clear requirements and prompt payment."
)
```

### Searching Freelancers

```typescript
import { searchFreelancers } from '@/utils/database/profiles'

// Search by skills and rate
const freelancers = await searchFreelancers({
  skills: ["React", "TypeScript"],
  minRate: 50,
  maxRate: 100,
  availability: "available",
  minRating: 4.0
})
```

### Viewing Freelancer Profile & Reviews

```typescript
import { getFreelancerProfile, getFreelancerReviews } from '@/utils/database/profiles'

const profile = await getFreelancerProfile(freelancerId)
const reviews = await getFreelancerReviews(freelancerId)

console.log(`${profile.full_name}`)
console.log(`Rating: ${profile.freelancer_profile?.rating}/5.00`)
console.log(`${profile.freelancer_profile?.total_reviews} reviews`)
console.log(`Skills: ${profile.freelancer_profile?.skills?.join(', ')}`)
console.log(`Rate: $${profile.freelancer_profile?.hourly_rate}/hr`)
```

## Important Security Rules

### 1. Contact Information
❌ **NEVER** display in profiles:
- Email addresses
- Phone numbers
- External messaging handles (Telegram, WhatsApp, etc.)
- Social media links (except portfolio)

✅ **ONLY** show:
- Name
- Bio
- Skills
- Hourly rate
- Portfolio URL
- Rating/reviews
- Avatar

### 2. Communication
❌ **BLOCK** attempts to share:
- Email addresses in messages
- Phone numbers in messages
- External meeting links

✅ **REQUIRE**:
- All communication through in-app chat
- File sharing through project files only

### 3. Reviews
❌ **PREVENT** reviews before:
- Project status is 'completed'
- Payment status is 'paid'

✅ **ALLOW** reviews only when:
- Project is completed AND paid
- User was a participant in the project

## UI Component Suggestions

### 1. Freelancer Profile Card
```typescript
interface FreelancerCardProps {
  profile: FreelancerWithProfile
}

// Show:
// - Avatar
// - Name (NO EMAIL!)
// - Bio
// - Skills badges
// - Rating stars
// - Hourly rate
// - "Contact" button (opens chat, NOT email)
```

### 2. Project Card
```typescript
interface ProjectCardProps {
  project: ProjectWithDetails
}

// Show:
// - Title
// - Description preview
// - Budget range
// - Required skills
// - Client company name (NOT email)
// - Time posted
// - Number of proposals (for clients)
// - "View Details" / "Submit Proposal" buttons
```

### 3. Message Interface
```typescript
// Features:
// - Message bubbles
// - Timestamp
// - Read/unread indicators
// - Real-time updates (use Supabase Realtime)
// - File attachment preview
// - NO external links allowed
```

### 4. File Upload Component
```typescript
// Features:
// - Drag & drop
// - Progress bar
// - File type restrictions
// - Size limit (10MB)
// - Preview uploaded files
// - Download button with signed URLs
```

## Next Steps for Development

1. **Build UI Pages**:
   - `/projects` - Browse projects
   - `/projects/[id]` - Project details
   - `/freelancers` - Browse freelancers
   - `/dashboard` - User dashboard
   - `/messages` - Messaging interface
   - `/profile/edit` - Edit profile

2. **Implement Real-time**:
   ```typescript
   // Subscribe to new messages
   const supabase = createClient()
   supabase
     .channel('messages')
     .on('postgres_changes', {
       event: 'INSERT',
       schema: 'public',
       table: 'messages',
       filter: `conversation_id=eq.${conversationId}`
     }, (payload) => {
       // Update UI with new message
     })
     .subscribe()
   ```

3. **Add Payment Integration**:
   - Stripe Connect for escrow
   - Payment gateway integration
   - Refund handling

4. **Notifications**:
   - New message notifications
   - Proposal submitted/accepted
   - Project status changes
   - Payment received

5. **Additional Features**:
   - Email notifications (for important events)
   - Project milestones
   - Time tracking
   - Invoice generation
   - Dispute resolution

## Testing Your Setup

Run these queries to verify everything is working:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'project-files';

-- Check RLS policies
SELECT tablename, policyname FROM pg_policies
WHERE schemaname = 'public';
```

## Support

If you encounter issues:
1. Check Supabase dashboard for errors
2. Review RLS policies
3. Check browser console for API errors
4. Verify user authentication
5. Ensure migrations were applied successfully

Good luck building your marketplace! 🚀
