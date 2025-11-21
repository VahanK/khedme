# Questions & Decisions Needed

## Design Decisions

### Q1: Dark Mode
**Question**: Do you want dark mode support from the start, or focus on light mode first?
**Options**:
- A) Light mode only for MVP, add dark later
- B) Build both light and dark mode simultaneously
- C) Dark mode only (Apple style)

**Impact**: Affects CSS classes, component design, and development time

---

### Q2: Navigation Style
**Question**: What navigation style do you prefer?
**Options**:
- A) Fixed top navbar (always visible)
- B) Auto-hide navbar (hides on scroll down, shows on scroll up)
- C) Sidebar navigation
- D) Bottom tab bar (mobile-first)

**Current**: Fixed top navbar

---

### Q3: Animations
**Question**: How much animation do you want?
**Options**:
- A) Minimal (just transitions)
- B) Moderate (hover effects, page transitions)
- C) Rich (micro-interactions, loading animations, page transitions)

**Impact**: Performance and user experience

---

## Feature Decisions

### Q4: File Upload Limits
**Question**: What are the file upload limits per project?
**Current**: 10MB per file
**Questions**:
- Max files per project?
- Allowed file types? (images, PDFs, docs, videos?)
- Total storage limit per user?

---

### Q5: Search & Filters
**Question**: For browse pages (projects, freelancers), which filters are most important?
**Freelancers**:
- Skills (required)
- Hourly rate range (required)
- Rating minimum (required)
- Availability status (required)
- Years of experience?
- Location/timezone?
- Languages spoken?

**Projects**:
- Skills required (required)
- Budget range (required)
- Project duration?
- Experience level needed?
- Project category?

---

### Q6: Proposal System
**Question**: When a freelancer submits a proposal:
- Should client be notified immediately? (Email? In-app?)
- Can freelancer edit proposal after submission?
- Can freelancer withdraw proposal?
- Should there be a proposal template/structure?

---

### Q7: Payment & Pricing
**Question**: Commission structure?
**Options**:
- A) Percentage of transaction (e.g., 10% fee)
- B) Subscription for clients (unlimited posts)
- C) Subscription for freelancers (premium features)
- D) Hybrid (small % + premium features)

**Current**: Not implemented yet

---

### Q8: Messaging Restrictions
**Question**: To prevent contact exchange, should we:
- A) Block messages containing email/phone patterns
- B) Just warn users (no blocking)
- C) Manual review of flagged messages
- D) Disable copy/paste in messages

**Current**: Just shows warning, no blocking

---

### Q9: Review System
**Question**: Review requirements:
- Can both parties review each other?
- Required fields: rating (1-5) + comment?
- Minimum comment length?
- Can reviews be edited/deleted?
- Should reviews be moderated?

---

### Q10: Profile Verification
**Question**: How should we verify users?
- Email verification (required)
- Phone verification?
- ID verification?
- Portfolio verification for freelancers?
- Company verification for clients?

**Current**: Only email (via Supabase)

---

## Technical Decisions

### Q11: Real-time Updates
**Question**: Which features need real-time updates?
**Options**:
- Messages (definitely)
- Notifications?
- Project proposals count?
- Online status indicators?

**Implementation**: Supabase Realtime subscriptions

---

### Q12: Image Handling
**Question**: For profile pictures and portfolio images:
- Use Supabase Storage?
- Use external service (Cloudinary, etc.)?
- Max image size?
- Auto-resize/optimize?

---

### Q13: Notifications
**Question**: What notification types do users need?
**Freelancers**:
- New project matching skills?
- Proposal accepted/rejected?
- New message?
- Payment received?

**Clients**:
- New proposal received?
- Project milestone completed?
- New message?

**Delivery**:
- In-app only?
- Email notifications?
- Push notifications?

---

### Q14: Categories/Skills
**Question**: How should skills/categories be managed?
**Options**:
- A) Free-form text (users type anything)
- B) Predefined list (dropdown)
- C) Tag system with suggestions
- D) Hierarchical categories

**Current**: Array of strings (free-form)

---

### Q15: Timezone Handling
**Question**: Should we show:
- Local time for each user?
- UTC for consistency?
- Relative time ("2 hours ago")?

**Current**: Using relative time

---

## Content Decisions

### Q16: Homepage Content
**Question**: What should the homepage showcase?
- Featured freelancers (how many?)
- Recent projects (how many?)
- Success stories?
- Statistics (users, projects, earnings)?
- Client testimonials?

---

### Q17: Empty States
**Question**: What should we show when no data exists?
- Encouraging message?
- Tutorial/onboarding?
- Sample/demo data?
- Call-to-action to create content?

---

## Missing Features to Clarify

### F1: Project Milestones
**Status**: Not in current schema
**Question**: Do you want milestone-based projects?
- Break project into phases
- Payment per milestone
- Approval workflow

---

### F2: Escrow/Payment Hold
**Status**: Payment integration not implemented
**Question**: Payment flow:
1. Client posts project with budget
2. Client pays upfront → held in escrow?
3. Freelancer completes work
4. Client approves → payment released?
OR different flow?

---

### F3: Dispute Resolution
**Status**: Not implemented
**Question**: How to handle disputes?
- Mediation system?
- Refund policy?
- Arbitration process?

---

### F4: Freelancer Availability Calendar
**Status**: Just a status field
**Question**: Do freelancers need:
- Calendar integration?
- Booking system?
- Availability hours?

---

### F5: Team/Agency Support
**Status**: Only individual freelancers
**Question**: Should agencies/teams be supported?
- Multiple freelancers under one account?
- Team collaboration features?
- Different pricing for teams?

---

## Priority Classification

### 🔴 HIGH PRIORITY - Need answers now
- Q1: Dark Mode
- Q4: File Upload Limits
- Q5: Search & Filters
- Q8: Messaging Restrictions

### 🟡 MEDIUM PRIORITY - Need answers soon
- Q2: Navigation Style
- Q6: Proposal System
- Q9: Review System
- Q11: Real-time Updates

### 🟢 LOW PRIORITY - Can decide later
- Q7: Payment structure
- Q10: Verification
- Q13: Notifications
- F1-F5: Advanced features

---

## How to Answer

Reply with question numbers and your choice:
Example:
```
Q1: A (Light mode only for MVP)
Q2: A (Fixed top navbar)
Q4: Max 5 files, 10MB each, images+PDFs only
```

Or let me know if you want me to make reasonable defaults and we can adjust later!
