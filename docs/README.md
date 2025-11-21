# Khedme Platform Documentation

Welcome to the Khedme platform documentation. This documentation covers all features, APIs, components, and architecture of the freelance marketplace platform.

## 📚 Documentation Index

### Core Documentation
- [**Architecture Overview**](./ARCHITECTURE.md) - System architecture, tech stack, and design patterns
- [**Getting Started**](./GETTING_STARTED.md) - Setup and development guide

### Features
- [**Workspace Files**](./features/workspace-files.md) - Project-based file sharing with comments
- [**Professional Dashboard**](./features/dashboard.md) - Role-based dashboards for freelancers and clients
- [**Authentication & Roles**](./features/authentication.md) - User authentication and role management
- [**Messaging System**](./features/messaging.md) - Real-time conversations between users

### API Reference
- [**API Overview**](./api/README.md) - API design principles and authentication
- [**Files API**](./api/files.md) - File upload, download, and management endpoints
- [**Comments API**](./api/comments.md) - File comment endpoints
- [**Projects API**](./api/projects.md) - Project management endpoints
- [**Messages API**](./api/messages.md) - Messaging endpoints

### Database
- [**Database Schema**](./database/schema.md) - Complete database schema and relationships
- [**Migrations**](./database/migrations.md) - Migration history and guide
- [**RLS Policies**](./database/rls-policies.md) - Row-Level Security documentation

### Components
- [**Component Library**](./components/README.md) - All reusable components
- [**Sidebar Component**](./components/Sidebar.md) - Enhanced professional sidebar
- [**File Components**](./components/file-components.md) - FileCard, FileUploader, FileComments
- [**Dashboard Components**](./components/dashboard-components.md) - Dashboard-specific components

### Guides
- [**Troubleshooting**](./TROUBLESHOOTING.md) - Common issues and solutions
- [**Best Practices**](./BEST_PRACTICES.md) - Development best practices
- [**Future Enhancements**](./FUTURE_ENHANCEMENTS.md) - Planned features and improvements

---

## 🚀 Quick Links

### For Developers
- [Setting up development environment](./GETTING_STARTED.md#development-setup)
- [Database setup and migrations](./database/migrations.md#running-migrations)
- [Component usage examples](./components/README.md#usage-examples)

### For Feature Development
- [Adding new features](./BEST_PRACTICES.md#adding-features)
- [API design guidelines](./api/README.md#design-principles)
- [Component creation guide](./components/README.md#creating-components)

### For Maintenance
- [Common issues](./TROUBLESHOOTING.md)
- [Database maintenance](./database/schema.md#maintenance)
- [Performance optimization](./BEST_PRACTICES.md#performance)

---

## 📋 Recent Updates

### December 2024
- ✅ Added workspace files feature with file comments
- ✅ Enhanced professional sidebar with user profile and stats
- ✅ Implemented file type validation (25MB limit, multiple formats)
- ✅ Added notification badges to navigation
- ✅ Created comprehensive documentation structure

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **UI Library:** HeroUI (NextUI), Tailwind CSS
- **Animation:** Framer Motion
- **Backend:** Next.js API Routes, Supabase
- **Database:** PostgreSQL (via Supabase)
- **Storage:** Supabase Storage
- **Authentication:** Supabase Auth

---

## 📖 How to Use This Documentation

1. **New to the project?** Start with [Architecture Overview](./ARCHITECTURE.md)
2. **Building a feature?** Check [Features](./features/) and [Components](./components/)
3. **Working with APIs?** See [API Reference](./api/)
4. **Database changes?** Review [Database Schema](./database/schema.md)
5. **Stuck on an issue?** Check [Troubleshooting](./TROUBLESHOOTING.md)

---

## 🤝 Contributing

When adding new features or making changes:

1. **Update documentation** alongside code changes
2. **Add JSDoc comments** to complex functions
3. **Document API changes** in relevant API docs
4. **Update schema docs** for database changes
5. **Add troubleshooting entries** for common issues

---

## 📝 Documentation Standards

- Use clear, concise language
- Include code examples where applicable
- Link between related documentation
- Keep examples up-to-date with code
- Document breaking changes prominently

---

**Last Updated:** December 2024
**Version:** 1.0.0
**Maintained by:** Development Team
