# Database Schema Documentation

Complete database schema for the Khedme platform.

---

## Table of Contents
- [Overview](#overview)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Tables](#tables)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Row-Level Security](#row-level-security)
- [Triggers](#triggers)

---

## Overview

**Database:** PostgreSQL 15+ (via Supabase)
**Schema:** public
**Authentication:** Supabase Auth

### Key Design Principles
1. **Security First:** RLS enabled on all tables
2. **Soft Deletes:** Use CASCADE for dependent data
3. **Timestamps:** All tables have created_at, updated_at where applicable
4. **UUIDs:** All primary keys are UUIDs
5. **Foreign Keys:** Enforce referential integrity

---

## Entity Relationship Diagram

```
┌─────────────┐
│   profiles  │ (Supabase Auth)
└──────┬──────┘
       │
       ├──────────┬──────────┬──────────┬──────────┐
       │          │          │          │          │
       ▼          ▼          ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌─────────────┐
│freelancer│ │  client  │ │projects│ │proposals│ │conversations│
│_profiles │ │_profiles │ └────┬───┘ └───┬────┘ └──────┬──────┘
└──────────┘ └──────────┘      │         │             │
                                │         │             │
                                ▼         ▼             ▼
                         ┌──────────┐ ┌──────────┐ ┌─────────┐
                         │ project  │ │ reviews  │ │messages │
                         │  _files  │ └──────────┘ └─────────┘
                         └────┬─────┘
                              │
                              ▼
                         ┌──────────┐
                         │   file   │
                         │ _comments│
                         └──────────┘
```

---

## Tables

### 1. profiles
**Purpose:** User accounts (extends Supabase Auth)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | uuid_generate_v4() | Primary key, matches auth.users |
| email | TEXT | No | - | User email |
| full_name | TEXT | Yes | NULL | User's full name |
| role | TEXT | Yes | NULL | 'freelancer' or 'client' |
| created_at | TIMESTAMP | No | NOW() | Account creation time |
| updated_at | TIMESTAMP | No | NOW() | Last update time |

**Constraints:**
- `role CHECK (role IN ('freelancer', 'client'))`

**RLS Policies:**
- Anyone can view profiles
- Users can update own profile

---

### 2. freelancer_profiles
**Purpose:** Extended freelancer information

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | - | FK to profiles(id), PK |
| bio | TEXT | Yes | NULL | Freelancer bio |
| skills | TEXT[] | Yes | NULL | Array of skills |
| hourly_rate | DECIMAL(10,2) | Yes | NULL | Hourly rate in USD |
| portfolio_url | TEXT | Yes | NULL | Portfolio link |
| avatar_url | TEXT | Yes | NULL | Profile picture URL |
| availability | TEXT | Yes | NULL | 'available', 'busy', 'unavailable' |
| years_of_experience | INTEGER | Yes | NULL | Years of experience |
| completed_projects | INTEGER | No | 0 | Count of completed projects |
| rating | DECIMAL(3,2) | No | 0.00 | Average rating (0-5) |
| total_reviews | INTEGER | No | 0 | Count of reviews |
| created_at | TIMESTAMP | No | NOW() | Profile creation |
| updated_at | TIMESTAMP | No | NOW() | Last update |

**Constraints:**
- `availability CHECK (availability IN ('available', 'busy', 'unavailable'))`
- `rating CHECK (rating >= 0 AND rating <= 5)`

**Indexes:**
- GIN index on skills (for array search)
- Index on hourly_rate
- Index on availability

**RLS Policies:**
- Anyone can view (for browsing)
- Only owner can update

---

### 3. client_profiles
**Purpose:** Extended client information

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | - | FK to profiles(id), PK |
| company_name | TEXT | Yes | NULL | Company name |
| company_description | TEXT | Yes | NULL | About the company |
| company_website | TEXT | Yes | NULL | Company website |
| avatar_url | TEXT | Yes | NULL | Company logo URL |
| total_projects_posted | INTEGER | No | 0 | Count of posted projects |
| created_at | TIMESTAMP | No | NOW() | Profile creation |
| updated_at | TIMESTAMP | No | NOW() | Last update |

**RLS Policies:**
- Anyone can view
- Only owner can update

---

### 4. projects
**Purpose:** Project listings

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | uuid_generate_v4() | Primary key |
| client_id | UUID | No | - | FK to profiles(id) |
| freelancer_id | UUID | Yes | NULL | FK to profiles(id), assigned freelancer |
| title | TEXT | No | - | Project title |
| description | TEXT | No | - | Project description |
| budget_min | DECIMAL(10,2) | Yes | NULL | Minimum budget |
| budget_max | DECIMAL(10,2) | Yes | NULL | Maximum budget |
| status | TEXT | No | 'open' | Project status |
| deadline | TIMESTAMP | Yes | NULL | Project deadline |
| required_skills | TEXT[] | Yes | NULL | Required skills array |
| payment_status | TEXT | No | 'pending' | Payment status |
| created_at | TIMESTAMP | No | NOW() | Project creation |
| updated_at | TIMESTAMP | No | NOW() | Last update |

**Constraints:**
- `status CHECK (status IN ('open', 'in_progress', 'in_review', 'completed', 'cancelled'))`
- `payment_status CHECK (payment_status IN ('pending', 'paid', 'refunded'))`

**Indexes:**
- Index on client_id
- Index on freelancer_id
- Index on status
- GIN index on required_skills

**RLS Policies:**
- Anyone can view open projects
- Only client can update
- Participants can view in_progress/completed

---

### 5. proposals
**Purpose:** Freelancer proposals on projects

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | uuid_generate_v4() | Primary key |
| project_id | UUID | No | - | FK to projects(id) |
| freelancer_id | UUID | No | - | FK to profiles(id) |
| cover_letter | TEXT | No | - | Proposal cover letter |
| proposed_budget | DECIMAL(10,2) | No | - | Proposed budget |
| estimated_duration | TEXT | Yes | NULL | Estimated duration |
| status | TEXT | No | 'pending' | Proposal status |
| created_at | TIMESTAMP | No | NOW() | Proposal submission |
| updated_at | TIMESTAMP | No | NOW() | Last update |

**Constraints:**
- `status CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn'))`
- `UNIQUE (project_id, freelancer_id)` - One proposal per freelancer per project

**Indexes:**
- Index on project_id
- Index on freelancer_id
- Index on status

**RLS Policies:**
- Freelancers can view own proposals
- Clients can view proposals on their projects
- Only freelancer can create/update own proposal
- Client can update status (accept/reject)

---

### 6. project_files
**Purpose:** Files uploaded to projects

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | uuid_generate_v4() | Primary key |
| project_id | UUID | No | - | FK to projects(id) |
| uploaded_by | UUID | No | - | FK to profiles(id) |
| file_name | TEXT | No | - | Original filename |
| file_path | TEXT | No | - | Storage path |
| file_size | INTEGER | Yes | NULL | File size in bytes |
| file_type | TEXT | Yes | NULL | MIME type |
| created_at | TIMESTAMP | No | NOW() | Upload time |

**Indexes:**
- Index on project_id
- Index on uploaded_by

**RLS Policies:**
- Only project participants (client + freelancer) can view
- Only project participants can upload
- Only uploader can delete

**Related Storage:**
- Bucket: `project-files`
- Path: `{projectId}/{timestamp}-{filename}`

---

### 7. file_comments
**Purpose:** Comments on project files

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | uuid_generate_v4() | Primary key |
| file_id | UUID | No | - | FK to project_files(id) |
| user_id | UUID | No | - | FK to profiles(id) |
| comment | TEXT | No | - | Comment text |
| created_at | TIMESTAMP | No | NOW() | Comment creation |
| updated_at | TIMESTAMP | No | NOW() | Last update |

**Indexes:**
- Index on file_id
- Index on user_id
- Index on created_at DESC

**RLS Policies:**
- Only project participants can view
- Only project participants can add
- Only owner can update/delete

---

### 8. conversations
**Purpose:** Chat conversations between users

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | uuid_generate_v4() | Primary key |
| project_id | UUID | Yes | NULL | FK to projects(id), optional |
| participant_1_id | UUID | No | - | FK to profiles(id) |
| participant_2_id | UUID | No | - | FK to profiles(id) |
| last_message_at | TIMESTAMP | No | NOW() | Last message time |
| created_at | TIMESTAMP | No | NOW() | Conversation start |

**Constraints:**
- `CHECK (participant_1_id != participant_2_id)` - Can't message yourself
- `UNIQUE (participant_1_id, participant_2_id, project_id)` - One conversation per pair per project

**Indexes:**
- Index on participant_1_id
- Index on participant_2_id
- Index on project_id

**RLS Policies:**
- Only participants can view
- Both participants can create

---

### 9. messages
**Purpose:** Messages within conversations

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | uuid_generate_v4() | Primary key |
| conversation_id | UUID | No | - | FK to conversations(id) |
| sender_id | UUID | No | - | FK to profiles(id) |
| content | TEXT | No | - | Message content |
| is_read | BOOLEAN | No | false | Read status |
| created_at | TIMESTAMP | No | NOW() | Send time |

**Indexes:**
- Index on conversation_id
- Index on sender_id
- Index on created_at DESC

**RLS Policies:**
- Only conversation participants can view
- Only participants can send
- Receiver can mark as read

---

### 10. reviews
**Purpose:** Reviews from clients to freelancers

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | uuid_generate_v4() | Primary key |
| project_id | UUID | No | - | FK to projects(id) |
| reviewer_id | UUID | No | - | FK to profiles(id), client |
| reviewee_id | UUID | No | - | FK to profiles(id), freelancer |
| rating | INTEGER | No | - | Rating 1-5 |
| comment | TEXT | Yes | NULL | Review comment |
| created_at | TIMESTAMP | No | NOW() | Review time |

**Constraints:**
- `rating CHECK (rating >= 1 AND rating <= 5)`
- `UNIQUE (project_id, reviewer_id, reviewee_id)` - One review per project

**Indexes:**
- Index on reviewee_id (for aggregating freelancer ratings)
- Index on project_id

**RLS Policies:**
- Anyone can view reviews
- Only project client can create review for freelancer
- Only reviewer can update own review

---

## Relationships

### One-to-One
- `profiles` ↔ `freelancer_profiles`
- `profiles` ↔ `client_profiles`

### One-to-Many
- `profiles` → `projects` (as client)
- `profiles` → `projects` (as freelancer)
- `profiles` → `proposals`
- `profiles` → `project_files`
- `profiles` → `file_comments`
- `projects` → `project_files`
- `projects` → `proposals`
- `projects` → `reviews`
- `project_files` → `file_comments`
- `conversations` → `messages`

### Many-to-Many (via junction tables)
- `profiles` ↔ `profiles` (via `conversations`)
- `profiles` ↔ `projects` (via `proposals`)

---

## Triggers

### updated_at Trigger

Automatically updates `updated_at` timestamp on row modification:

```sql
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to tables:
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON freelancer_profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON client_profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON file_comments FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

### last_message_at Trigger

Updates conversation's `last_message_at` when message sent:

```sql
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();
```

---

## Maintenance

### Vacuum Strategy
```sql
-- Run weekly
VACUUM ANALYZE;

-- Per table as needed
VACUUM ANALYZE project_files;
VACUUM ANALYZE messages;
```

### Backup Strategy
- Automated daily backups via Supabase
- Point-in-time recovery available
- Manual backups before major migrations

### Monitoring Queries

```sql
-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Slow queries (enable pg_stat_statements extension)
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

**Last Updated:** December 2024
**Schema Version:** 1.1
**Related Documentation:**
- [Migrations](./migrations.md)
- [RLS Policies](./rls-policies.md)
