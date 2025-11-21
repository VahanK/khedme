# Khedme Admin Panel - Development Tasks

**Last Updated:** November 8, 2025
**Status:** 30% Complete - Foundation established
**Location:** `C:\Users\vahan\Documents\work\khedme-admin`
**Target:** Full admin functionality for platform management

---

## ✅ COMPLETED (30%)

### Foundation
- ✅ Next.js 15 project initialized
- ✅ Dependencies installed (HeroUI, Supabase, lucide-react, recharts, date-fns)
- ✅ Tailwind + HeroUI configured
- ✅ Environment variables copied from main app
- ✅ Supabase utilities copied (`lib/supabase/`)
- ✅ Database types copied (`types/supabase.ts`)
- ✅ Admin auth middleware created (`middleware.ts`)
- ✅ Same database connection as main app
- ✅ Providers setup for HeroUI

---

## 🚧 IN PROGRESS (70% Remaining)

### 1. Authentication Pages

#### Login Page
**File:** `app/login/page.tsx`
**Requirements:**
- [ ] Email/password form
- [ ] Supabase auth integration
- [ ] Error handling for invalid credentials
- [ ] "Remember me" option
- [ ] Loading state during sign-in
- [ ] Redirect to dashboard on success
- [ ] Show error if user is not admin
- [ ] Responsive design

**Design:**
```typescript
// Features needed:
- Card-based login form
- Email input with validation
- Password input with show/hide toggle
- Sign in button with loading state
- Error message display
- Simple, professional design
```

#### Unauthorized Page
**File:** `app/unauthorized/page.tsx`
**Requirements:**
- [ ] Clear message explaining admin-only access
- [ ] Sign out button
- [ ] Link to main app
- [ ] Professional design

---

### 2. Dashboard Layout

#### Main Layout with Sidebar
**File:** `app/(dashboard)/layout.tsx`
**Requirements:**
- [ ] Persistent sidebar navigation
- [ ] Responsive (collapsible on mobile)
- [ ] Top bar with user info and sign out
- [ ] Active route highlighting
- [ ] Smooth transitions

**Sidebar Navigation Items:**
```typescript
- Dashboard (/) - Analytics & stats
- Escrow Management (/escrow) - Payment verifications & releases
- Users (/users) - User management
- Projects (/projects) - Project oversight
- Content Moderation (/moderation) - Flag review
- Settings (/settings) - Platform settings
```

**Components Needed:**
- [ ] `components/admin/Sidebar.tsx`
- [ ] `components/admin/TopBar.tsx`
- [ ] `components/admin/AdminNav.tsx`

---

### 3. Analytics Dashboard (Home Page)

#### Overview Page
**File:** `app/(dashboard)/page.tsx`
**Requirements:**
- [ ] Key platform metrics
- [ ] Charts and graphs
- [ ] Recent activity feed
- [ ] Quick action buttons

**Metrics to Display:**
```typescript
- Total users (breakdown: freelancers, clients, admins)
- Active projects (by status)
- Total escrow amount held
- Pending verifications count
- Pending releases count
- Platform revenue (5% fees collected)
- Revenue this month
- Growth trends (users, projects, revenue)
```

**Charts:**
- [ ] User growth over time (line chart)
- [ ] Project status distribution (pie chart)
- [ ] Revenue by month (bar chart)
- [ ] Escrow status breakdown (donut chart)

**Components Needed:**
- [ ] `components/admin/dashboard/StatsCard.tsx`
- [ ] `components/admin/dashboard/UserGrowthChart.tsx`
- [ ] `components/admin/dashboard/RevenueChart.tsx`
- [ ] `components/admin/dashboard/ProjectStatusChart.tsx`
- [ ] `components/admin/dashboard/RecentActivity.tsx`

**API Routes:**
- [ ] `app/api/admin/stats/route.ts` - Overall stats
- [ ] `app/api/admin/stats/users/route.ts` - User metrics
- [ ] `app/api/admin/stats/revenue/route.ts` - Revenue data
- [ ] `app/api/admin/stats/projects/route.ts` - Project metrics

---

### 4. Escrow Management

#### Copy from Main App
**Source:** `C:\Users\vahan\Documents\work\khedme\components\admin\AdminEscrowDashboard.tsx`
**Destination:** `C:\Users\vahan\Documents\work\khedme-admin\components\escrow\EscrowDashboard.tsx`

**Tasks:**
- [ ] Copy AdminEscrowDashboard component
- [ ] Copy escrow API routes (or use from main app)
- [ ] Update imports and paths
- [ ] Test verification workflow
- [ ] Test release workflow
- [ ] Add admin-specific views

**Page:** `app/(dashboard)/escrow/page.tsx`

**Features:**
- [ ] Tabs for: All | Pending Verification | Pending Release | Completed
- [ ] Filter by amount, date, status
- [ ] Search by project name or user
- [ ] Quick actions (verify, release)
- [ ] Transaction history view
- [ ] Export to CSV

**Additional Components:**
- [ ] `components/escrow/EscrowTable.tsx`
- [ ] `components/escrow/VerificationModal.tsx`
- [ ] `components/escrow/ReleaseModal.tsx`
- [ ] `components/escrow/TransactionDetails.tsx`

---

### 5. User Management

#### Users List Page
**File:** `app/(dashboard)/users/page.tsx`
**Requirements:**
- [ ] Searchable user list
- [ ] Filter by role (freelancer, client, admin)
- [ ] Filter by status (active, suspended)
- [ ] Sort by join date, activity
- [ ] Pagination (50 users per page)
- [ ] User actions (view, suspend, delete)

**Data to Display:**
```typescript
- Profile picture
- Name
- Email
- Role
- Join date
- Last active
- Projects count
- Total spent/earned
- Status (active, suspended)
```

**Components:**
- [ ] `components/users/UserTable.tsx`
- [ ] `components/users/UserRow.tsx`
- [ ] `components/users/UserFilters.tsx`

#### User Detail Page
**File:** `app/(dashboard)/users/[id]/page.tsx`
**Requirements:**
- [ ] Full profile information
- [ ] Activity history
- [ ] Projects (posted or worked on)
- [ ] Transaction history
- [ ] Reviews given/received
- [ ] Suspend/unsuspend button
- [ ] Delete account button (with confirmation)
- [ ] Edit user details (admin override)

**Components:**
- [ ] `components/users/UserProfile.tsx`
- [ ] `components/users/UserActivity.tsx`
- [ ] `components/users/UserProjects.tsx`
- [ ] `components/users/UserTransactions.tsx`
- [ ] `components/users/UserActions.tsx`

**API Routes:**
- [ ] `app/api/admin/users/route.ts` - List users
- [ ] `app/api/admin/users/[id]/route.ts` - User details
- [ ] `app/api/admin/users/[id]/suspend/route.ts` - Suspend user
- [ ] `app/api/admin/users/[id]/delete/route.ts` - Delete user

---

### 6. Projects Management

#### Projects List Page
**File:** `app/(dashboard)/projects/page.tsx`
**Requirements:**
- [ ] All projects with filters
- [ ] Filter by status (open, in progress, completed, cancelled)
- [ ] Search by title or client name
- [ ] Sort by date, budget
- [ ] Quick view of escrow status
- [ ] Admin actions (view, cancel, flag)

**Components:**
- [ ] `components/projects/ProjectTable.tsx`
- [ ] `components/projects/ProjectFilters.tsx`
- [ ] `components/projects/ProjectActions.tsx`

#### Project Detail Page
**File:** `app/(dashboard)/projects/[id]/page.tsx`
**Requirements:**
- [ ] Full project details
- [ ] Client and freelancer info
- [ ] Proposals list
- [ ] Escrow status
- [ ] Messages thread
- [ ] Deliverables
- [ ] Admin actions (cancel project, resolve disputes)

**API Routes:**
- [ ] `app/api/admin/projects/route.ts` - List projects
- [ ] `app/api/admin/projects/[id]/route.ts` - Project details
- [ ] `app/api/admin/projects/[id]/cancel/route.ts` - Cancel project

---

### 7. Content Moderation

#### Moderation Queue
**File:** `app/(dashboard)/moderation/page.tsx`
**Requirements:**
- [ ] Flagged content list (projects, profiles, messages)
- [ ] Review interface
- [ ] Approve/reject actions
- [ ] Ban/suspend users
- [ ] Add notes to moderation actions

**Database Migration Needed:**
```sql
-- Create content_flags table
CREATE TABLE content_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type content_flag_type NOT NULL,
  content_id UUID NOT NULL,
  reporter_id UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,
  status flag_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tasks:**
- [ ] Create migration for content moderation
- [ ] Add flag button to projects (in main app)
- [ ] Add flag button to profiles (in main app)
- [ ] Create moderation UI

**Components:**
- [ ] `components/moderation/FlagsList.tsx`
- [ ] `components/moderation/ReviewModal.tsx`
- [ ] `components/moderation/ModerationActions.tsx`

**API Routes:**
- [ ] `app/api/admin/moderation/flags/route.ts` - Get flags
- [ ] `app/api/admin/moderation/flags/[id]/route.ts` - Review flag

---

### 8. Settings & Configuration

#### Platform Settings Page
**File:** `app/(dashboard)/settings/page.tsx`
**Requirements:**
- [ ] Platform fee percentage (currently 5%)
- [ ] File upload limits
- [ ] User registration settings
- [ ] Email notification settings
- [ ] Feature toggles

**Database Migration Needed:**
```sql
-- Create settings table
CREATE TABLE platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Settings:**
```typescript
- platform_fee_percentage: 5
- max_file_size_mb: 25
- max_files_per_upload: 10
- allow_user_registration: true
- maintenance_mode: false
- featured_categories: []
```

**Components:**
- [ ] `components/settings/SettingsForm.tsx`
- [ ] `components/settings/FeatureToggles.tsx`

---

## 🗄️ Database Changes Needed

### New Tables
1. **content_flags** - Content moderation
2. **platform_settings** - Admin configuration
3. **admin_audit_log** - Track admin actions

### Migration Files to Create
- [ ] `007_content_moderation.sql`
- [ ] `008_platform_settings.sql`
- [ ] `009_admin_audit_log.sql`

---

## 🎨 Design Consistency

### Theme
- [ ] Use same color scheme as main app
- [ ] Dark mode support (optional)
- [ ] Admin-specific accent color (e.g., purple/orange)

### Components
- [ ] Reuse HeroUI components
- [ ] Create admin-specific components library
- [ ] Ensure consistent spacing and typography

---

## 🧪 Testing

### Auth Testing
- [ ] Test admin login
- [ ] Test non-admin redirect to unauthorized
- [ ] Test session persistence
- [ ] Test sign out

### Feature Testing
- [ ] Test escrow verification flow
- [ ] Test escrow release flow
- [ ] Test user suspension
- [ ] Test project cancellation
- [ ] Test content moderation
- [ ] Test settings updates

### Security Testing
- [ ] Verify middleware protects all routes
- [ ] Test RLS policies for admin queries
- [ ] Verify admin-only API access
- [ ] Test SQL injection prevention

---

## 📦 Deployment

### Build & Deploy
- [ ] Ensure `npm run build` succeeds
- [ ] Configure for deployment (Vercel/Netlify)
- [ ] Set up environment variables
- [ ] Configure custom domain (admin.khedme.com)
- [ ] Test production build

---

## 📅 Estimated Timeline

| Feature | Complexity | Time Estimate |
|---------|------------|---------------|
| Login & Unauthorized pages | Low | 0.5 days |
| Dashboard layout & sidebar | Medium | 1 day |
| Analytics dashboard | High | 2-3 days |
| Escrow management (copy) | Low | 0.5 days |
| User management | Medium | 2 days |
| Projects management | Medium | 2 days |
| Content moderation | High | 2-3 days |
| Settings page | Low | 1 day |
| Testing | Medium | 1-2 days |
| Deployment | Low | 0.5 days |

**Total:** 12-15 days for complete admin panel

---

## 🎯 Priority Order

### Phase 1: Essential (Complete First)
1. Login page ✅
2. Dashboard layout ✅
3. Escrow management ✅ (already exists, just copy)
4. Basic analytics dashboard ✅

### Phase 2: Core Features
5. User management 🔄
6. Projects oversight 🔄

### Phase 3: Advanced
7. Content moderation 🔄
8. Settings & configuration 🔄

### Phase 4: Polish & Deploy
9. Testing ⏳
10. Deployment ⏳

---

## ✅ Completion Criteria

Admin panel is ready when:

1. ✅ Admin can log in securely
2. ✅ Non-admins cannot access
3. ✅ Analytics dashboard shows accurate data
4. ✅ Escrow verification & release works
5. ✅ User management is functional
6. ✅ Projects can be viewed and managed
7. ✅ All pages are responsive
8. ✅ Build completes without errors
9. ✅ Security audit passes
10. ✅ Deployed to admin.khedme.com

---

## 🔗 Related Documents

- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Overall project status
- [TODO_MAIN_APP.md](./TODO_MAIN_APP.md) - Main app tasks
- [TODO_DEPLOYMENT.md](./TODO_DEPLOYMENT.md) - Production deployment
- [khedme-admin/README.md](../khedme-admin/README.md) - Admin app documentation
