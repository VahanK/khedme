# Google OAuth - Final Setup Steps

## ✅ What's Already Done

Your code is already configured! The sign-in page and callback handler are ready to use Google OAuth.

## 🔧 What You Need to Do

### Step 1: Add Credentials to Supabase Dashboard

1. **Go to Supabase Dashboard**:
   https://supabase.com/dashboard/project/hoskwahltrtmrwnhpzon/auth/providers

2. **Find Google** in the providers list and click to expand

3. **Toggle "Enable Sign in with Google" to ON**

4. **Enter your credentials**:
   - **Client ID**: `YOUR_GOOGLE_CLIENT_ID`
   - **Client Secret**: `YOUR_GOOGLE_CLIENT_SECRET`

5. **Click Save**

### Step 2: Verify Google Cloud Console Settings

1. Go to: https://console.cloud.google.com/apis/credentials

2. Click on your OAuth client ID

3. **Verify Authorized redirect URIs include**:
   ```
   https://hoskwahltrtmrwnhpzon.supabase.co/auth/v1/callback
   http://localhost:3001/auth/callback
   ```

4. **Verify Authorized JavaScript origins include**:
   ```
   http://localhost:3001
   https://hoskwahltrtmrwnhpzon.supabase.co
   ```

5. **Save** if you made any changes

### Step 3: Test the Integration

1. Make sure your dev server is running (it already is on http://localhost:3001)

2. Go to: http://localhost:3001/auth/signin

3. Click **"Continue with Google"**

4. You should:
   - Be redirected to Google login
   - Sign in with your Google account
   - Be redirected back to your app
   - Land on `/auth/select-role` (for first-time users)
   - Select your role (freelancer or client)
   - Be redirected to your dashboard

## 🎯 How It Works

### First-Time Google Users:
1. Click "Continue with Google"
2. Sign in with Google
3. Profile is automatically created in database
4. Redirected to `/auth/select-role`
5. Choose role (freelancer or client)
6. Redirected to dashboard

### Returning Google Users:
1. Click "Continue with Google"
2. Sign in with Google
3. Directly redirected to dashboard

## 🚨 Security Notes

**NEVER** commit or share these credentials publicly:
- ✅ Stored in Supabase Dashboard (secure)
- ❌ NOT in your code or .env files
- ❌ NOT in git repository

Your credentials are only used by Supabase servers, never exposed to the client.

## 🎨 Updated Design

The sign-in page now has your modern design system:
- Lime green accents
- Clean, minimal layout
- Smooth animations
- Google logo with proper colors
- Responsive design

## 📁 Files Updated

- ✅ `app/auth/signin/page.tsx` - Updated with new design
- ✅ `app/api/auth/callback/route.ts` - Already existed and works perfectly
- ✅ All UI components are using your design system

## 🔍 Troubleshooting

### "redirect_uri_mismatch" error
**Solution**: Make sure in Google Console the redirect URI is exactly:
```
https://hoskwahltrtmrwnhpzon.supabase.co/auth/v1/callback
```

### "Access blocked: This app's request is invalid"
**Solution**:
1. Go to Google Cloud Console
2. OAuth consent screen
3. Click "Publish App" or add your email to test users

### Profile not created
Check Supabase logs:
1. Go to https://supabase.com/dashboard/project/hoskwahltrtmrwnhpzon/logs/explorer
2. Look for errors in the profiles table

### Google sign-in button not working
**Solution**:
1. Check browser console for errors
2. Make sure Supabase credentials are configured
3. Verify your internet connection

## ✨ Next Steps After Setup

Once Google OAuth is working:

1. **Test the full flow**:
   - Sign up with Google
   - Select role
   - Complete profile
   - Browse projects/freelancers

2. **Add more OAuth providers** (optional):
   - GitHub
   - LinkedIn
   - Facebook

3. **Customize the experience**:
   - Add profile picture from Google
   - Pre-fill user data
   - Add email verification (if needed)

## 🎉 You're All Set!

Just add those credentials to Supabase Dashboard and you're ready to test!

Visit: http://localhost:3001/auth/signin
