# Khedme Platform - Production Deployment Checklist

**Last Updated:** November 8, 2025
**Target Domains:**
- Main App: `khedme.com`
- Admin Panel: `admin.khedme.com`

---

## 📋 Pre-Deployment Checklist

### Code Readiness

#### Main App (`khedme`)
- [ ] All TODO_MAIN_APP.md tasks completed
- [ ] `npm run build` succeeds without errors
- [ ] All TypeScript errors fixed
- [ ] No console.log or debugging code
- [ ] Demo data loaded and tested
- [ ] All user flows tested end-to-end

#### Admin Panel (`khedme-admin`)
- [ ] All TODO_ADMIN_APP.md Phase 1 & 2 completed
- [ ] `npm run build` succeeds without errors
- [ ] Admin authentication tested
- [ ] Escrow management tested
- [ ] All routes protected by middleware

---

## 🗄️ Database Setup

### Supabase Production Project
- [ ] Create production Supabase project (separate from development)
- [ ] Note project URL and anon key
- [ ] Set up database password (strong, unique)
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Review RLS policies for security

### Migrations
- [ ] Apply all migrations in order:
  1. `001_initial_schema.sql` (if exists)
  2. `002_marketplace_schema.sql`
  3. `003_escrow_system.sql`
  4. `004_deliverables_system.sql`
  5. `005_message_attachments.sql`
  6. `006_notifications_system.sql`
  7. `007_content_moderation.sql` (if created)
  8. `008_platform_settings.sql` (if created)
  9. `009_admin_audit_log.sql` (if created)

### Database Indexes
- [ ] Add indexes for performance:
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_proposals_project_id ON proposals(project_id);
CREATE INDEX idx_proposals_freelancer_id ON proposals(freelancer_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_notifications_user_id_unread ON notifications(user_id, is_read);
CREATE INDEX idx_escrow_transactions_project_id ON escrow_transactions(project_id);
```

### Storage Buckets
- [ ] Create Supabase storage buckets:
  - `profile-pictures` - Public bucket
  - `portfolios` - Public bucket
  - `project-files` - Private bucket (authenticated access)
  - `payment-proofs` - Private bucket (admin only)
  - `deliverables` - Private bucket (project participants)

- [ ] Configure storage policies:
```sql
-- Example: Allow users to upload their own profile pictures
CREATE POLICY "Users can upload own profile picture"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Initial Data
- [ ] Insert platform settings (if table created)
- [ ] Create first admin account manually
- [ ] Add demo/seed data (optional for launch)

---

## 🔐 Environment Variables

### Main App Environment Variables
Create production `.env.local` (or configure in hosting platform):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]

# App Config
NEXT_PUBLIC_APP_URL=https://khedme.com
NEXT_PUBLIC_ADMIN_URL=https://admin.khedme.com

# Optional: Analytics
NEXT_PUBLIC_GA_ID=[google-analytics-id]

# Optional: Error Tracking
SENTRY_DSN=[sentry-dsn]
```

### Admin App Environment Variables
Create production `.env.local`:

```env
# Supabase (same as main app)
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]

# App Config
NEXT_PUBLIC_APP_URL=https://admin.khedme.com
NEXT_PUBLIC_MAIN_APP_URL=https://khedme.com
```

### Security Checks
- [ ] Ensure `.env.local` is in `.gitignore`
- [ ] Never commit secrets to Git
- [ ] Use strong, unique keys for production
- [ ] Rotate keys if accidentally exposed

---

## 🌐 Domain & Hosting Setup

### Domain Registration
- [ ] Purchase domain: `khedme.com`
- [ ] Configure DNS nameservers

### Hosting Platform (Recommended: Vercel)

#### Main App Deployment
- [ ] Create Vercel project for `khedme`
- [ ] Connect to Git repository
- [ ] Configure build settings:
  - Framework: Next.js
  - Root Directory: `./`
  - Build Command: `npm run build`
  - Output Directory: `.next`
- [ ] Add environment variables in Vercel dashboard
- [ ] Configure custom domain: `khedme.com`
- [ ] Enable automatic deployments from `main` branch

#### Admin App Deployment
- [ ] Create separate Vercel project for `khedme-admin`
- [ ] Connect to Git repository (or same repo, different root)
- [ ] Configure build settings:
  - Framework: Next.js
  - Root Directory: `./khedme-admin` (if monorepo)
  - Build Command: `npm run build`
  - Output Directory: `.next`
- [ ] Add environment variables in Vercel dashboard
- [ ] Configure custom domain: `admin.khedme.com`
- [ ] Enable automatic deployments from `main` branch

### DNS Configuration
- [ ] Add A record: `khedme.com` → Vercel IP
- [ ] Add A record: `admin.khedme.com` → Vercel IP
- [ ] Add CNAME record: `www.khedme.com` → `khedme.com`
- [ ] Wait for DNS propagation (up to 48 hours)

### SSL Certificates
- [ ] Verify SSL certificate issued by Vercel (automatic)
- [ ] Test HTTPS for both domains
- [ ] Ensure HTTP redirects to HTTPS

---

## 🔍 Testing Production

### Pre-Launch Testing
- [ ] Test main app on production URL
- [ ] Test admin app on production URL
- [ ] Test Supabase connection
- [ ] Test file uploads
- [ ] Test authentication (sign up, login, logout)
- [ ] Test escrow flow end-to-end
- [ ] Test notifications
- [ ] Test messaging
- [ ] Test on multiple browsers (Chrome, Safari, Firefox)
- [ ] Test on mobile devices (iOS, Android)

### Performance Testing
- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Test page load times (aim for <3s)
- [ ] Test with slow 3G network
- [ ] Verify images are optimized
- [ ] Check bundle size (aim for <500kb initial)

### Security Testing
- [ ] Test authentication bypass attempts
- [ ] Test SQL injection on forms
- [ ] Test XSS on text inputs
- [ ] Verify RLS policies prevent unauthorized access
- [ ] Test file upload security (reject dangerous types)
- [ ] Verify admin-only routes are protected

---

## 📊 Monitoring & Analytics

### Error Tracking
- [ ] Set up Sentry (or similar)
- [ ] Test error reporting
- [ ] Configure alert notifications

### Analytics
- [ ] Set up Google Analytics
- [ ] Track key events:
  - User sign ups
  - Project creations
  - Proposal submissions
  - Escrow payments
  - Project completions
- [ ] Set up conversion goals

### Performance Monitoring
- [ ] Set up Vercel Analytics
- [ ] Monitor Core Web Vitals
- [ ] Track error rates
- [ ] Monitor API response times

### Database Monitoring
- [ ] Monitor Supabase dashboard
- [ ] Set up usage alerts (storage, bandwidth)
- [ ] Monitor database performance
- [ ] Track connection pool usage

---

## 🚀 Launch Day Checklist

### Final Checks (1 day before)
- [ ] Complete code freeze (no new features)
- [ ] Full regression testing
- [ ] Backup database (export)
- [ ] Verify all monitoring is active
- [ ] Prepare rollback plan

### Launch Steps
1. **Deploy Main App**
   - [ ] Deploy to production
   - [ ] Verify deployment successful
   - [ ] Test critical flows

2. **Deploy Admin App**
   - [ ] Deploy to production
   - [ ] Verify deployment successful
   - [ ] Test admin access

3. **Verify Everything Works**
   - [ ] Test user sign up
   - [ ] Test project creation
   - [ ] Test file upload
   - [ ] Test messaging
   - [ ] Test admin escrow management
   - [ ] Test on mobile

4. **Go Live**
   - [ ] Announce launch
   - [ ] Monitor error logs
   - [ ] Be ready for quick fixes

### Post-Launch (First 24 Hours)
- [ ] Monitor error rates every 2 hours
- [ ] Check database performance
- [ ] Monitor server costs
- [ ] Respond to any critical bugs
- [ ] Collect user feedback

### Post-Launch (First Week)
- [ ] Daily monitoring of metrics
- [ ] Fix any reported bugs
- [ ] Optimize performance based on data
- [ ] Gather user feedback
- [ ] Plan hotfix releases if needed

---

## 📝 Documentation

### User Documentation
- [ ] Create help center/FAQ
- [ ] Write user guides:
  - How to post a project (client)
  - How to submit a proposal (freelancer)
  - How to use escrow system
  - How to upload deliverables
  - How to leave reviews
- [ ] Create video tutorials (optional)

### Admin Documentation
- [ ] Write admin manual
- [ ] Document escrow verification process
- [ ] Document release process
- [ ] Document user moderation process
- [ ] Create troubleshooting guide

### Developer Documentation
- [ ] Update README.md files
- [ ] Document API routes
- [ ] Document database schema
- [ ] Document deployment process
- [ ] Create contributing guidelines (if open source)

---

## 🔄 Backup & Recovery

### Automated Backups
- [ ] Enable Supabase daily backups
- [ ] Configure backup retention (30 days)
- [ ] Test restore from backup
- [ ] Document recovery process

### Manual Backups
- [ ] Export database schema
- [ ] Export user data
- [ ] Backup environment variables
- [ ] Store in secure location (encrypted)

---

## 💰 Cost Estimation

### Monthly Costs
| Service | Plan | Estimated Cost |
|---------|------|----------------|
| Supabase | Pro | $25/month |
| Vercel (Main) | Pro (optional) | $20/month or Free |
| Vercel (Admin) | Pro (optional) | $20/month or Free |
| Domain | Annual | $12/year (~$1/month) |
| Monitoring | Free tier | $0 |
| **Total** | | **~$26-66/month** |

### Scaling Considerations
- [ ] Plan for traffic growth
- [ ] Monitor Supabase usage limits
- [ ] Consider CDN for static assets
- [ ] Plan database scaling strategy

---

## 🆘 Rollback Plan

### If Critical Issues Occur
1. **Identify Issue**
   - Check error logs
   - Identify affected features

2. **Quick Fix or Rollback**
   - If quick fix possible: deploy hotfix
   - If major issue: rollback to previous version

3. **Rollback Steps**
   - [ ] Revert Git to previous commit
   - [ ] Redeploy from Vercel dashboard
   - [ ] Test previous version works
   - [ ] Investigate issue offline

4. **Communication**
   - [ ] Notify users of issue (if needed)
   - [ ] Post status update
   - [ ] ETA for fix

---

## 📅 Deployment Timeline

### Week 1-2: Preparation
- [ ] Complete TODO_MAIN_APP.md
- [ ] Complete TODO_ADMIN_APP.md (Phase 1 & 2)
- [ ] Set up production Supabase
- [ ] Configure hosting

### Week 3: Testing
- [ ] Load demo data
- [ ] Full QA testing
- [ ] Performance testing
- [ ] Security audit

### Week 4: Launch
- [ ] Final checks
- [ ] Deploy to production
- [ ] Launch announcement
- [ ] Monitor closely

---

## ✅ Launch Readiness Criteria

Platform is ready to launch when:

1. ✅ All critical features work perfectly
2. ✅ All user flows tested end-to-end
3. ✅ Security audit passed
4. ✅ Performance meets targets (Lighthouse 90+)
5. ✅ Mobile experience is smooth
6. ✅ Error monitoring active
7. ✅ Backup system configured
8. ✅ Rollback plan documented
9. ✅ Support documentation ready
10. ✅ Admin can manage escrow and users

---

## 🔗 Related Documents

- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Overall project status
- [TODO_MAIN_APP.md](./TODO_MAIN_APP.md) - Main app polish tasks
- [TODO_ADMIN_APP.md](./TODO_ADMIN_APP.md) - Admin panel tasks
- [docs/setup/QUICK_START.md](./docs/setup/QUICK_START.md) - Development setup

---

## 📞 Emergency Contacts

**Developer:** [Your contact]
**Hosting Support:** Vercel support
**Database Support:** Supabase support

**On-Call Schedule:**
- Week 1 post-launch: 24/7 monitoring
- Week 2-4: Daily check-ins
- After Month 1: Regular monitoring

---

## 🎉 Post-Launch

### Marketing
- [ ] Social media announcement
- [ ] Email existing users (if beta)
- [ ] Submit to directories
- [ ] Create launch video/demo
- [ ] Write launch blog post

### Iteration
- [ ] Collect user feedback
- [ ] Prioritize feature requests
- [ ] Plan next sprint
- [ ] Continuous improvement
