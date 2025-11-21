# Setting Up Google OAuth for Supabase

## Step 1: Get Google OAuth Credentials

### 1. Go to Google Cloud Console
https://console.cloud.google.com/

### 2. Create a New Project (or select existing)
- Click on the project dropdown at the top
- Click "New Project"
- Name it (e.g., "Khedme Marketplace")
- Click "Create"

### 3. Enable Google+ API
- Go to "APIs & Services" > "Library"
- Search for "Google+ API"
- Click on it and click "Enable"

### 4. Configure OAuth Consent Screen
- Go to "APIs & Services" > "OAuth consent screen"
- Choose "External" (for public app)
- Click "Create"

Fill in the required fields:
- **App name**: Khedme
- **User support email**: Your email
- **Developer contact email**: Your email
- Click "Save and Continue"

Add scopes (optional for now):
- Click "Save and Continue"

Test users (optional):
- Add test emails if needed
- Click "Save and Continue"

### 5. Create OAuth Client ID

Go to "APIs & Services" > "Credentials"

Click "Create Credentials" > "OAuth client ID"

- **Application type**: Web application
- **Name**: Khedme Web Client

**Authorized JavaScript origins**:
```
http://localhost:3000
http://localhost:3001
https://yourdomain.com (when deployed)
```

**Authorized redirect URIs**:
```
https://hoskwahltrtmrwnhpzon.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback (for local testing)
http://localhost:3001/auth/callback (for local testing)
```

Click "Create"

### 6. Copy Your Credentials

You'll get:
- **Client ID**: Something like `123456789-abc123.apps.googleusercontent.com`
- **Client Secret**: Something like `GOCSPX-abc123xyz...`

**IMPORTANT**: Save these somewhere safe!

## Step 2: Configure Supabase

### 1. Go to Supabase Dashboard
https://supabase.com/dashboard/project/hoskwahltrtmrwnhpzon

### 2. Navigate to Authentication Settings
- Click on "Authentication" in the left sidebar
- Click on "Providers"
- Find "Google" in the list

### 3. Enable Google Provider
- Toggle "Enable Sign in with Google"
- Paste your **Client ID** (from Google)
- Paste your **Client Secret** (from Google)
- Click "Save"

### 4. Get Your Supabase Callback URL
The redirect URL should be:
```
https://hoskwahltrtmrwnhpzon.supabase.co/auth/v1/callback
```

Make sure this is added to Google Console's "Authorized redirect URIs"

## Step 3: Update Your App Code

### Update Sign In Page

Update `app/auth/signin/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-neutral-50 px-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-medium p-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Welcome back
          </h1>
          <p className="text-neutral-600 mb-8">
            Sign in to your Khedme account
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <Button
            variant="outline"
            size="lg"
            className="w-full mb-6"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-neutral-500">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email Sign In Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

### Create Auth Callback Handler

Create `app/auth/callback/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard or role selection
  return NextResponse.redirect(`${origin}/auth/select-role`)
}
```

### Update Sign Up Page (Optional - Add Google)

Update `app/auth/signup/page.tsx` similarly to add Google sign-up option.

## Step 4: Test the Integration

1. Start your dev server: `npm run dev`
2. Go to http://localhost:3001/auth/signin
3. Click "Continue with Google"
4. You should be redirected to Google's login page
5. After signing in with Google, you'll be redirected back to your app

## Troubleshooting

### "redirect_uri_mismatch" Error
- Make sure the redirect URI in Google Console exactly matches Supabase's callback URL
- It should be: `https://hoskwahltrtmrwnhpzon.supabase.co/auth/v1/callback`

### "Access blocked" Error
- Make sure you've published your OAuth consent screen
- Or add your test email to the test users list

### User Created But No Profile
After Google sign-in, you need to create a profile. Update the callback handler:

```typescript
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    if (data.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        // Create profile
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata.full_name || data.user.user_metadata.name,
          })
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/select-role`)
}
```

## Environment Variables

No need to add Google credentials to your `.env.local` - they're stored in Supabase!

Your current `.env.local` is fine:
```
NEXT_PUBLIC_SUPABASE_URL=https://hoskwahltrtmrwnhpzon.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Summary

1. ✅ Create Google OAuth credentials in Google Cloud Console
2. ✅ Add redirect URI: `https://hoskwahltrtmrwnhpzon.supabase.co/auth/v1/callback`
3. ✅ Enable Google provider in Supabase with Client ID and Secret
4. ✅ Update your sign-in page to include Google OAuth button
5. ✅ Create callback route to handle the redirect
6. ✅ Test the flow!
