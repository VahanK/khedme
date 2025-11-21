# Architecture Overview

This document provides a comprehensive overview of the Khedme platform architecture, design patterns, and technical decisions.

---

## Table of Contents
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Design Patterns](#design-patterns)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │    Mobile    │  │   Desktop    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              App Router (Server Components)           │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │              Client Components (React)                │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │              API Routes (Edge Functions)              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Storage   │  │     Auth     │      │
│  │  (Database)  │  │  (Files)     │  │  (Sessions)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Layers                      │
├─────────────────────────────────────────────────────────────┤
│  Presentation Layer                                          │
│  ├─ Pages (Server Components)                               │
│  ├─ Layouts (DashboardLayout, etc.)                         │
│  └─ UI Components (Client Components)                       │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                        │
│  ├─ API Routes                                              │
│  ├─ Utility Functions                                       │
│  └─ Data Transformation                                     │
├─────────────────────────────────────────────────────────────┤
│  Data Access Layer                                           │
│  ├─ Supabase Client                                         │
│  ├─ Database Utilities                                      │
│  └─ Storage Utilities                                       │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure Layer                                        │
│  ├─ Supabase (Database, Auth, Storage)                     │
│  ├─ Middleware (Auth, Routing)                             │
│  └─ Environment Configuration                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **UI Library:** HeroUI (NextUI fork)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Icons:** Heroicons
- **Date Handling:** date-fns

### Backend
- **Runtime:** Next.js API Routes
- **Authentication:** Supabase Auth
- **Database:** PostgreSQL (Supabase)
- **Storage:** Supabase Storage
- **ORM:** Supabase Client (PostgreSQL)

### Development Tools
- **Package Manager:** npm/pnpm
- **Type Checking:** TypeScript
- **Linting:** ESLint
- **Version Control:** Git

---

## Project Structure

```
khedme/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── auth/
│   │   │   ├── signin/
│   │   │   ├── signup/
│   │   │   └── select-role/
│   ├── dashboard/                # Dashboard routes
│   │   ├── freelancer/           # Freelancer dashboard
│   │   │   ├── page.tsx
│   │   │   ├── projects/
│   │   │   │   └── [projectId]/
│   │   │   │       └── files/    # Workspace files
│   │   │   ├── proposals/
│   │   │   ├── messages/
│   │   │   └── profile/
│   │   └── client/               # Client dashboard
│   │       ├── page.tsx
│   │       ├── projects/
│   │       │   ├── new/
│   │       │   └── [projectId]/
│   │       │       └── files/    # Workspace files
│   │       ├── proposals/
│   │       ├── messages/
│   │       └── profile/
│   ├── api/                      # API routes
│   │   ├── projects/
│   │   │   └── [projectId]/
│   │   │       └── files/
│   │   ├── files/
│   │   │   ├── [fileId]/
│   │   │   │   └── comments/
│   │   │   └── comments/
│   │   │       └── [commentId]/
│   │   └── messages/
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx             # Context providers
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── dashboard/                # Dashboard components
│   │   ├── Sidebar.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── FileCard.tsx
│   │   ├── FileComments.tsx
│   │   ├── FileUploader.tsx
│   │   ├── WorkspaceFilesClient.tsx
│   │   └── ...
│   └── ui/                       # Generic UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       └── ...
├── lib/                          # Library code
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Client-side
│   │   ├── server.ts             # Server-side
│   │   └── middleware.ts         # Middleware
│   └── constants/                # App constants
│       └── file-types.ts         # File type definitions
├── utils/                        # Utility functions
│   └── database/                 # Database utilities
│       ├── files.ts              # File operations
│       ├── profiles.ts           # Profile operations
│       ├── projects.ts           # Project operations
│       ├── proposals.ts          # Proposal operations
│       └── messaging.ts          # Messaging operations
├── types/                        # TypeScript types
│   └── database.types.ts         # Database types
├── migrations/                   # Database migrations
│   ├── 002_marketplace_schema.sql
│   └── add_file_comments.sql
├── middleware.ts                 # Next.js middleware
├── tailwind.config.js            # Tailwind configuration
├── next.config.js                # Next.js configuration
└── tsconfig.json                 # TypeScript configuration
```

---

## Design Patterns

### 1. Server Components First
- **Pattern:** Use Server Components by default, Client Components only when needed
- **Benefits:** Better performance, smaller bundle size, direct database access
- **Implementation:**
  ```typescript
  // Server Component (default)
  export default async function Page() {
    const data = await fetchFromDatabase()
    return <Component data={data} />
  }

  // Client Component (when needed)
  'use client'
  export default function InteractiveComponent() {
    const [state, setState] = useState()
    return <div>...</div>
  }
  ```

### 2. Layout-Based Routing
- **Pattern:** Shared layouts wrap route segments
- **Benefits:** Persistent UI, performance optimization
- **Implementation:**
  ```typescript
  // app/dashboard/layout.tsx
  export default function DashboardLayout({ children }) {
    return <DashboardLayout>{children}</DashboardLayout>
  }
  ```

### 3. API Route Handlers
- **Pattern:** RESTful API routes in `/app/api`
- **Benefits:** Type-safe, co-located with app code
- **Implementation:**
  ```typescript
  // app/api/files/[fileId]/route.ts
  export async function GET(req, { params }) {
    // Handle GET request
  }
  ```

### 4. Utility-Based Data Access
- **Pattern:** Centralized database utilities in `/utils/database`
- **Benefits:** Reusable, testable, maintainable
- **Implementation:**
  ```typescript
  // utils/database/files.ts
  export async function getProjectFiles(projectId: string) {
    // Supabase query
  }
  ```

### 5. Type-Safe Database Access
- **Pattern:** TypeScript interfaces for all database entities
- **Benefits:** Compile-time safety, better IDE support
- **Implementation:**
  ```typescript
  // types/database.types.ts
  export interface ProjectFile {
    id: string
    file_name: string
    // ...
  }
  ```

### 6. Component Composition
- **Pattern:** Small, reusable components composed into larger features
- **Benefits:** Maintainable, testable, flexible
- **Example:** FileCard + FileComments + FileUploader = WorkspaceFiles

### 7. Row-Level Security (RLS)
- **Pattern:** Security enforced at database level
- **Benefits:** Consistent security, no business logic bypass
- **Implementation:** PostgreSQL RLS policies on all tables

---

## Data Flow

### File Upload Flow
```
User Action (FileUploader)
    │
    ▼
Client Component State
    │
    ▼
POST /api/projects/[id]/files
    │
    ├─► Validate user auth
    ├─► Validate project access
    ├─► Validate file type/size
    │
    ▼
uploadProjectFile() utility
    │
    ├─► Upload to Supabase Storage
    │   (bucket: project-files)
    │
    └─► Create database record
        (table: project_files)
    │
    ▼
Return file metadata
    │
    ▼
Router refresh (server component re-renders)
    │
    ▼
Updated file list displayed
```

### File Comment Flow
```
User adds comment (FileComments)
    │
    ▼
POST /api/files/[fileId]/comments
    │
    ├─► Validate user auth
    ├─► Validate file access
    │
    ▼
addFileComment() utility
    │
    └─► Insert into file_comments table
    │
    ▼
Return comment with user data
    │
    ▼
Router refresh
    │
    ▼
Updated comment list displayed
```

### Authentication Flow
```
User login (signin page)
    │
    ▼
Supabase Auth
    │
    ├─► Set session cookie
    │
    ▼
Middleware (middleware.ts)
    │
    ├─► Validate session
    ├─► Refresh if needed
    │
    ▼
Protected route access granted
    │
    ▼
Server component fetches user data
```

---

## Security Architecture

### Authentication
- **Method:** Supabase Auth (JWT-based)
- **Session Storage:** HTTP-only cookies
- **Token Refresh:** Automatic via middleware
- **Protected Routes:** Middleware-level checks

### Authorization
- **Database Level:** Row-Level Security (RLS)
- **Application Level:** API route guards
- **Role-Based:** Freelancer vs Client access control

### File Security
- **Upload Validation:** Type and size checks
- **Storage Access:** Signed URLs (1-hour expiry)
- **Download Protection:** Project membership verification
- **Comment Access:** RLS policies enforce project membership

### API Security
- **Authentication:** Required for all protected endpoints
- **Rate Limiting:** (TODO: Implement)
- **Input Validation:** Type checking and sanitization
- **Error Handling:** Safe error messages (no data leakage)

### Database Security
- **RLS Policies:** Enabled on all tables
- **Parameterized Queries:** Via Supabase client
- **Connection Security:** SSL/TLS encryption
- **Backup Strategy:** Supabase automated backups

---

## Performance Considerations

### Frontend
- **Server Components:** Reduce client-side JavaScript
- **Code Splitting:** Automatic via Next.js
- **Image Optimization:** Next.js Image component
- **Lazy Loading:** Dynamic imports for heavy components

### Database
- **Indexes:** Added on foreign keys and frequently queried columns
- **Query Optimization:** Select only needed columns
- **Connection Pooling:** Handled by Supabase
- **Caching:** (TODO: Implement for static data)

### Storage
- **CDN:** Supabase Storage CDN
- **File Size Limits:** 25MB maximum
- **Compression:** (TODO: Implement for images)

---

## Scalability Considerations

### Current Capacity
- **Database:** Supabase handles up to millions of rows
- **Storage:** Unlimited file storage (cost-based)
- **Concurrent Users:** Edge functions scale automatically

### Future Scaling
- **Caching Layer:** Redis for frequently accessed data
- **Search:** Algolia or Elasticsearch for project search
- **Real-time:** Supabase Realtime for live updates
- **CDN:** Vercel Edge Network for global distribution

---

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies: `npm install`
3. Set up Supabase project
4. Configure environment variables
5. Run migrations
6. Start dev server: `npm run dev`

### Deployment
- **Platform:** Vercel (recommended)
- **Environment:** Production, Staging, Development
- **CI/CD:** GitHub Actions (TODO)
- **Monitoring:** Vercel Analytics + Supabase Dashboard

---

## Future Architecture Improvements

### Short-term
- [ ] Implement caching layer for static data
- [ ] Add rate limiting to API routes
- [ ] Implement image compression
- [ ] Add real-time notifications

### Long-term
- [ ] Microservices for compute-heavy operations
- [ ] Elasticsearch for advanced search
- [ ] WebSocket server for real-time messaging
- [ ] CDN for user-uploaded files

---

**Last Updated:** December 2024
**Review Cycle:** Monthly
**Owner:** Development Team
