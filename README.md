# Khedme - Freelance Marketplace Platform

**A modern freelance marketplace for the Lebanese/MENA market with manual escrow system**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Project Status](#project-status)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [License](#license)

---

## Overview

**Khedme** (Arabic for "My Service") is a full-featured freelance marketplace platform that connects clients with freelancers. The platform features a **manual escrow system** where payments are held by the platform and released by administrators, ensuring trust and security for both parties.

### Target Market
- Lebanese and MENA region freelancers
- English language interface
- Manual payment processing suitable for regional banking systems

### Platform Components
1. **Main App** (`khedme`) - Client and freelancer marketplace
2. **Admin Panel** (`khedme-admin`) - Platform management dashboard

---

## Project Status

**Last Updated:** November 8, 2025

### Main App
- **Status:** ✅ **Core features complete, ready for investor demo**
- **Progress:** ~95% complete
- **URL:** Will deploy to `khedme.com`

### Admin Panel
- **Status:** 🚧 **In development**
- **Progress:** ~30% complete
- **URL:** Will deploy to `admin.khedme.com`

For detailed status, see [PROJECT_STATUS.md](./PROJECT_STATUS.md)

---

## Key Features

### For Freelancers ✅
- Create profile with portfolio
- Browse and bid on projects
- Real-time messaging with clients
- File sharing and collaboration
- Submit deliverables and revisions
- Track escrow payments
- Receive notifications

### For Clients ✅
- Post projects with budgets
- Review and accept proposals
- Communicate with freelancers
- Upload project files
- Review deliverables
- Submit payment proofs
- Manage escrow

### For Admins ✅/🚧
- ✅ Verify payment proofs
- ✅ Release funds to freelancers
- ✅ View all escrow transactions
- 🚧 User management
- 🚧 Platform analytics
- 🚧 Content moderation

### Platform Features ✅
- **Manual Escrow** - 5% platform fee, admin-verified payments
- **File Management** - 65+ file types, 25MB limit, batch upload
- **Real-time Notifications** - New projects and messages
- **Deliverables System** - Work submission and revision workflow
- **Message Attachments** - Share files in chat, sync to workspace
- **Contact Sharing** - Contact info released when payment verified

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd khedme
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Apply database migrations**

   Run the SQL migrations in your Supabase dashboard in order:
   - `migrations/002_marketplace_schema.sql`
   - `migrations/003_escrow_system.sql`
   - `migrations/004_deliverables_system.sql`
   - `migrations/005_message_attachments.sql`
   - `migrations/006_notifications_system.sql`

5. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

For detailed setup instructions, see [docs/setup/QUICK_START.md](./docs/setup/QUICK_START.md)

---

## Documentation

### 📊 Project Management
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Comprehensive project status and completed features
- **[FEATURES_COMPLETED.md](./FEATURES_COMPLETED.md)** - Detailed inventory of all completed features
- **[TODO_MAIN_APP.md](./TODO_MAIN_APP.md)** - Remaining tasks for main app polish
- **[TODO_ADMIN_APP.md](./TODO_ADMIN_APP.md)** - Admin panel development roadmap
- **[TODO_DEPLOYMENT.md](./TODO_DEPLOYMENT.md)** - Production deployment checklist

### 🛠️ Setup & Configuration
- **[docs/setup/QUICK_START.md](./docs/setup/QUICK_START.md)** - Development environment setup
- **[docs/setup/GOOGLE_OAUTH_SETUP.md](./docs/setup/GOOGLE_OAUTH_SETUP.md)** - Google OAuth configuration
- **[docs/setup/GOOGLE_OAUTH_FINAL_STEPS.md](./docs/setup/GOOGLE_OAUTH_FINAL_STEPS.md)** - OAuth finalization

### 📚 Feature Guides
- **[docs/guides/MARKETPLACE_GUIDE.md](./docs/guides/MARKETPLACE_GUIDE.md)** - Complete marketplace features guide
- **[docs/guides/GETTING_USER_ID.md](./docs/guides/GETTING_USER_ID.md)** - User ID retrieval guide

### 🗄️ Database & API
- **[docs/database/schema.md](./docs/database/schema.md)** - Database schema documentation
- **[docs/api/files.md](./docs/api/files.md)** - File API documentation
- **[docs/api/comments.md](./docs/api/comments.md)** - Comments API documentation

### 🎨 Design System
- **[docs/design/UI_COMPONENTS.md](./docs/design/UI_COMPONENTS.md)** - UI components guide
- **[docs/design/MODERN_DESIGN_SYSTEM.md](./docs/design/MODERN_DESIGN_SYSTEM.md)** - Design system specification
- **[docs/design/APPLE_LIQUID_GLASS_DESIGN.md](./docs/design/APPLE_LIQUID_GLASS_DESIGN.md)** - Design inspiration

### 💻 Development
- **[docs/development/DEVELOPMENT_ROADMAP.md](./docs/development/DEVELOPMENT_ROADMAP.md)** - Development roadmap
- **[docs/development/PAGE_COMPONENT_TRACKING.md](./docs/development/PAGE_COMPONENT_TRACKING.md)** - Page component tracking

### 🏗️ Architecture
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture overview
- **[docs/components/file-components.md](./docs/components/file-components.md)** - File component architecture
- **[docs/features/workspace-files.md](./docs/features/workspace-files.md)** - Workspace files feature

---

## Project Structure

```
khedme/
├── app/                        # Next.js app directory
│   ├── (auth)/                # Authentication pages
│   ├── dashboard/             # Dashboard routes
│   │   ├── freelancer/        # Freelancer dashboard
│   │   ├── client/            # Client dashboard
│   │   ├── notifications/     # Notifications page
│   │   └── admin/             # Admin routes (temporary)
│   ├── api/                   # API routes
│   │   ├── escrow/           # Escrow management
│   │   ├── deliverables/     # Work submissions
│   │   ├── files/            # File operations
│   │   ├── messages/         # Messaging
│   │   ├── notifications/    # Notifications
│   │   └── admin/            # Admin endpoints
│   └── ...
├── components/                 # React components
│   ├── escrow/               # Escrow components
│   ├── deliverables/         # Deliverable components
│   ├── dashboard/            # Dashboard components
│   ├── notifications/        # Notification components
│   └── admin/                # Admin components
├── lib/                       # Utilities
│   └── supabase/             # Supabase clients
├── types/                     # TypeScript types
├── migrations/                # Database migrations
├── docs/                      # Documentation
│   ├── setup/                # Setup guides
│   ├── guides/               # Feature guides
│   ├── design/               # Design docs
│   ├── development/          # Development docs
│   ├── api/                  # API docs
│   ├── database/             # Database docs
│   ├── components/           # Component docs
│   └── features/             # Feature docs
└── README.md                  # This file
```

### Admin Panel Structure
```
khedme-admin/
├── app/                       # Admin app directory
│   ├── login/                # Admin login
│   ├── unauthorized/         # Non-admin redirect
│   └── (dashboard)/          # Admin dashboard routes
├── components/                # Admin UI components
├── lib/                      # Shared utilities
└── middleware.ts             # Admin auth protection
```

---

## Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[HeroUI](https://www.heroui.com/)** - React component library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library

### Backend
- **[Supabase](https://supabase.com/)** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Storage (file uploads)
  - Row Level Security (RLS)

### Developer Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting (optional)
- **[date-fns](https://date-fns.org/)** - Date utilities
- **[recharts](https://recharts.org/)** - Charts (admin panel)

---

## Database Schema

### Core Tables
- `profiles` - User profiles (all roles)
- `freelancer_profiles` - Extended freelancer data
- `client_profiles` - Extended client data
- `projects` - Project listings with escrow
- `proposals` - Freelancer bids
- `project_files` - File storage metadata
- `conversations` - Message conversations
- `messages` - Chat messages
- `deliverables` - Work submissions
- `escrow_transactions` - Payment audit trail
- `notifications` - User notifications

See [docs/database/schema.md](./docs/database/schema.md) for complete schema.

---

## API Routes

### Overview
The platform provides RESTful API routes for:
- Authentication & profiles
- Projects & proposals
- File management
- Messaging
- Deliverables
- Escrow management
- Notifications
- Admin operations

See [PROJECT_STATUS.md](./PROJECT_STATUS.md#-api-routes-inventory) for complete API documentation.

---

## Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Production Server
```bash
npm start
```

### Type Checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

---

## Deployment

The platform is designed to deploy to:
- **Main App:** Vercel (recommended) or any Next.js hosting
- **Admin Panel:** Separate Vercel project
- **Database:** Supabase (production project)
- **Domains:** `khedme.com` and `admin.khedme.com`

See [TODO_DEPLOYMENT.md](./TODO_DEPLOYMENT.md) for complete deployment guide.

---

## Contributing

This is a private project. For development team members:

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Submit pull request
5. Get review and approval
6. Merge to `main`

---

## Security

### Reporting Security Issues
Please report security vulnerabilities privately to the development team.

### Security Features
- Row Level Security (RLS) on all tables
- Role-based access control
- Secure file upload validation
- Admin-only route protection
- XSS and SQL injection prevention
- Secure session management

---

## Support

For questions and support:
- Review documentation in `/docs`
- Check [PROJECT_STATUS.md](./PROJECT_STATUS.md) for current status
- Review [TODO_MAIN_APP.md](./TODO_MAIN_APP.md) for known issues

---

## Roadmap

### Completed ✅
- Core marketplace features
- Manual escrow system
- File management
- Messaging with attachments
- Deliverables workflow
- Notifications system

### In Progress 🚧
- Admin panel (30% complete)
- UI/UX polish
- Demo data creation

### Planned 📅
- Production deployment
- User testing and feedback
- Performance optimization
- Marketing and launch

See [TODO_MAIN_APP.md](./TODO_MAIN_APP.md) and [TODO_ADMIN_APP.md](./TODO_ADMIN_APP.md) for detailed tasks.

---

## License

Copyright © 2025. All rights reserved.

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) by Vercel
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [HeroUI](https://www.heroui.com/) - Beautiful React components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

**Last Updated:** November 8, 2025
**Version:** 1.0.0-beta
**Status:** Pre-launch (investor demo ready)
