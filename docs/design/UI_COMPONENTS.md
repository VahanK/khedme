# UI Components - Design System

## Design Inspiration

Based on [remotebymodula.framer.website](https://remotebymodula.framer.website/), implementing:
- **Modern, minimal aesthetic** with clean interfaces
- **Lime green accents** (#e0ff82) for primary actions
- **Sophisticated neutral grays** for backgrounds and text
- **Inter font family** for typography
- **Smooth animations** and transitions
- **Dark mode support** (class-based)

## Color Palette

### Primary (Lime Green)
- `primary-100`: #e0ff82 - Main accent color for CTAs
- `primary-500`: #9fee00 - Medium shade
- `primary-900`: #1f6e00 - Dark shade

### Neutrals
- `neutral-50` to `neutral-100`: Light backgrounds
- `neutral-200` to `neutral-400`: Borders and dividers
- `neutral-500` to `neutral-700`: Secondary text
- `neutral-800` to `neutral-950`: Dark backgrounds and primary text

### Accents
- `accent-cyan`: #25c5fa - Secondary accent
- `accent-red`: #ee4444 - Errors and warnings

## Typography Scale

- **Display XL**: 4.5rem - Hero headlines
- **Display LG**: 3.75rem - Large headlines
- **Display MD**: 3rem - Section headlines
- **Display SM**: 2.25rem - Subsection headlines
- **Standard sizes**: xs through 2xl for body text

## Components Created

### 1. Base UI Components (`components/ui/`)

#### Button.tsx
```typescript
<Button variant="primary" size="lg">Get Started</Button>
<Button variant="secondary">Learn More</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Skip</Button>
```

**Variants:**
- `primary`: Lime green background, bold and attention-grabbing
- `secondary`: Dark neutral background
- `outline`: Transparent with border
- `ghost`: Transparent, minimal

**Sizes:** sm, md, lg

**Features:**
- Hover scale animation
- Active state feedback
- Disabled state styling
- Smooth transitions

#### Card.tsx
```typescript
<Card hover onClick={handleClick}>
  {children}
</Card>
```

**Features:**
- Soft shadow by default
- Optional hover effect with lift animation
- Rounded corners (2xl = 1.5rem)
- Optional onClick handler

#### Badge.tsx
```typescript
<Badge variant="success">Available</Badge>
<Badge variant="warning">Busy</Badge>
<Badge variant="error">Unavailable</Badge>
```

**Variants:**
- `default`: Neutral gray
- `success`: Green
- `warning`: Yellow
- `error`: Red
- `info`: Blue

**Sizes:** sm, md

### 2. Feature Components

#### ProjectCard.tsx
Displays project information in a card layout.

**Shows:**
- Project title and description
- Client name (no email!)
- Time posted
- Budget range
- Required skills (as badges)
- Number of proposals

**Features:**
- Hover animation
- Click to view details
- Line clamp for long descriptions
- Responsive layout

**Usage:**
```typescript
<ProjectCard project={projectData} />
```

#### FreelancerCard.tsx
Displays freelancer profile in a card layout.

**Shows:**
- Avatar (generated from initials)
- Name (no email!)
- Star rating with review count
- Availability badge
- Bio preview
- Skills (up to 6, with "+X more")
- Hourly rate
- Years of experience

**Features:**
- Hover animation
- Color-coded availability
- View profile button
- Responsive layout

**Privacy:**
- NO contact information visible
- Only public profile data

**Usage:**
```typescript
<FreelancerCard freelancer={freelancerData} />
```

#### MessageInterface.tsx
Full messaging interface for conversations.

**Features:**
- Message list with scrolling
- Own messages vs received (different styling)
- Timestamp with relative time
- Read receipts
- Empty state
- Send button + Enter to send
- Privacy reminder (no contact info)
- Character warning about sharing contacts

**Styling:**
- Own messages: Lime green background
- Received messages: Gray background
- Smooth scroll to bottom
- Slide-up animation for new messages

**Usage:**
```typescript
<MessageInterface
  conversation={conversationData}
  messages={messagesList}
  currentUserId={userId}
  onSendMessage={handleSend}
/>
```

#### FileUpload.tsx
File upload and management component.

**Features:**
- Drag & drop upload
- Browse file picker
- 10MB size limit
- File type icons
- File list with metadata
- Download button
- Delete button (only for own files)
- File size formatting
- Date formatting

**File Type Icons:**
- 🖼️ Images
- 🎥 Videos
- 📕 PDFs
- 📝 Documents
- 📊 Spreadsheets
- 📦 Archives
- 📄 Default

**Usage:**
```typescript
<FileUpload
  projectId={projectId}
  files={filesList}
  onUpload={handleUpload}
  onDownload={handleDownload}
  onDelete={handleDelete}
  currentUserId={userId}
/>
```

## Landing Page (app/page.tsx)

### Sections:

1. **Navigation Bar**
   - Fixed top position
   - Blur backdrop
   - Logo
   - Main links (Browse Projects, Find Talent)
   - Auth buttons

2. **Hero Section**
   - Large display headline with gradient text
   - Trust indicator badge (pulsing dot)
   - Two CTAs (Start Hiring, Find Work)
   - Trust metrics (users, projects, ratings)

3. **Features Section**
   - 3-column grid
   - Icon + title + description
   - Hover effects
   - Key features:
     - Secure Payments
     - In-App Messaging
     - Project Files

4. **CTA Section**
   - Dark gradient background
   - Large headline
   - Dual CTAs

5. **Footer**
   - Copyright
   - Links (About, Privacy, Terms)

### Responsive Breakpoints:
- Mobile: < 810px
- Tablet: 810-1279px
- Desktop: ≥ 1280px

## Animations

### Defined Animations:
- `fade-in`: Opacity transition (0.5s)
- `slide-up`: Translate + opacity (0.5s)
- Custom hover scales for buttons
- Smooth transitions on all interactive elements

## Usage Examples

### Creating a Project Listing Page:
```typescript
import ProjectCard from '@/components/ProjectCard'
import { getOpenProjects } from '@/utils/database/projects'

export default async function ProjectsPage() {
  const projects = await getOpenProjects()

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-display-md font-bold text-neutral-900 mb-8">
        Open Projects
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
```

### Creating a Freelancer Browse Page:
```typescript
import FreelancerCard from '@/components/FreelancerCard'
import { searchFreelancers } from '@/utils/database/profiles'

export default async function FreelancersPage() {
  const freelancers = await searchFreelancers({
    availability: 'available',
    minRating: 4.0
  })

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-display-md font-bold text-neutral-900 mb-8">
        Top Freelancers
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {freelancers.map((freelancer) => (
          <FreelancerCard key={freelancer.id} freelancer={freelancer} />
        ))}
      </div>
    </div>
  )
}
```

### Creating a Project Detail Page with Messaging:
```typescript
import MessageInterface from '@/components/MessageInterface'
import FileUpload from '@/components/FileUpload'

export default function ProjectDetailPage() {
  // ... fetch data and setup handlers

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Project details */}
          <FileUpload
            projectId={project.id}
            files={files}
            onUpload={handleUpload}
            onDownload={handleDownload}
            onDelete={handleDelete}
            currentUserId={user.id}
          />
        </div>
        <div>
          <MessageInterface
            conversation={conversation}
            messages={messages}
            currentUserId={user.id}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  )
}
```

## Design Principles

1. **Privacy First**
   - Never display contact information
   - Always remind users about privacy rules
   - Gray out or hide features before payment

2. **Clean & Minimal**
   - Ample white space
   - Clear hierarchy
   - Consistent spacing

3. **Interactive Feedback**
   - Hover states on all clickable elements
   - Loading states for async actions
   - Success/error feedback

4. **Accessibility**
   - Semantic HTML
   - Color contrast ratios
   - Keyboard navigation support
   - Screen reader friendly

5. **Performance**
   - Optimized images
   - Lazy loading
   - Minimal JavaScript
   - Server components where possible

## Next Steps

1. **Add Real-time Updates**
   - Use Supabase Realtime for messages
   - Live notification badges
   - Online/offline indicators

2. **Enhance Interactions**
   - Toast notifications
   - Modal dialogs
   - Loading skeletons
   - Error boundaries

3. **Add More Pages**
   - User profile pages
   - Project detail page
   - Freelancer profile page
   - Dashboard pages
   - Settings page

4. **Mobile Optimization**
   - Mobile navigation menu
   - Touch-friendly interactions
   - Responsive images

5. **Dark Mode**
   - Implement dark mode toggle
   - Store preference
   - Smooth transition
