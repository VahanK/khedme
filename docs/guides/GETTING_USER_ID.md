# How to Get User ID (client_id / freelancer_id)

## In Server Components

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function MyPage() {
  const supabase = await createClient()

  // Get the authenticated user
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user) {
    // User is not logged in
    redirect('/auth/signin')
  }

  // user.id is the UUID you use as client_id or freelancer_id
  const userId = user.id

  // Example: Create a project
  const project = await createProject({
    client_id: userId,  // ← This is what you need!
    title: "My Project",
    description: "...",
    // ...
  })

  return <div>User ID: {userId}</div>
}
```

## In Client Components

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function MyClientComponent() {
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    getUser()
  }, [])

  return <div>User ID: {userId}</div>
}
```

## In API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = user.id

  // Use it for database operations
  const body = await request.json()

  const { data, error } = await supabase
    .from('projects')
    .insert({
      client_id: userId,  // ← User's ID
      title: body.title,
      description: body.description,
      // ...
    })
    .select()

  return NextResponse.json({ data })
}
```

## Getting User Profile with Role

```typescript
import { createClient } from '@/lib/supabase/server'

export async function getCurrentUserProfile() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email,
    role: profile?.role, // 'freelancer' or 'client'
    ...profile
  }
}
```

## Accessing User Info from Auth Object

The `user` object from Supabase Auth contains:

```typescript
{
  id: "uuid-string",           // ← This is your client_id/freelancer_id
  email: "user@example.com",
  phone: null,
  created_at: "2025-01-01...",
  confirmed_at: "2025-01-01...",
  email_confirmed_at: "2025-01-01...",
  last_sign_in_at: "2025-01-01...",
  app_metadata: { ... },
  user_metadata: { ... },
  // ...
}
```

## Summary

**The `user.id` from `supabase.auth.getUser()` is what you use as:**
- `client_id` when a client creates a project
- `freelancer_id` when a freelancer submits a proposal
- `uploaded_by` when uploading files
- `sender_id` when sending messages
- Any other user reference in your database

## Where to Find Your Supabase Keys

Your Supabase configuration is in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your anonymous/public key

To get these values or find your project settings:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings > API
4. Copy the Project URL and anon/public key
