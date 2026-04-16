# 🚀 Deployment Guide - Unicorn Sports PWA

## Overview

This guide covers deploying the Rainbow Unicorn Sports PWA to production:
- **Frontend**: Netlify (automatic deployments from GitHub)
- **Backend**: Supabase (managed PostgreSQL + Edge Functions)

---

## 📋 Prerequisites

- [x] GitHub account (for code hosting)
- [x] Netlify account (free tier is sufficient)
- [x] Supabase account (free tier is sufficient)
- [x] Project code pushed to GitHub repository

---

## 🗄️ Part 1: Deploy Backend (Supabase)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `unicorns-ngo-pwa`
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to your users (e.g., Europe for Poland)
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

### Step 2: Apply Database Schema

**Option A: Using Supabase CLI (Recommended)**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (get ref from project settings)
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push

# Run seed data
supabase db execute --file ./supabase/seed.sql
```

**Option B: Manual SQL Execution**

1. In Supabase Dashboard → **SQL Editor**
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and click **"Run"**
4. Repeat for `supabase/seed.sql`

### Step 3: Configure Authentication

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure:
   - **Email confirmation**: Disabled (for testing) or Enabled (for production)
   - **Mailer**: Use default or configure SMTP
4. Go to **URL Configuration**:
   - **Site URL**: Will be your Netlify URL (e.g., `https://unicorn-sports.netlify.app`)
   - **Redirect URLs**: Add your Netlify URL

### Step 4: Deploy Edge Functions

```bash
# Deploy process-attendance function
supabase functions deploy process-attendance

# Deploy update-balance function
supabase functions deploy update-balance

# Deploy validate-registration function
supabase functions deploy validate-registration

# Set secrets (service role key)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Get service role key**: Project Settings → API → `service_role` key (keep secret!)

### Step 5: Configure CORS

1. In Supabase Dashboard → **Settings** → **API**
2. Under **CORS**, add your Netlify URL:
   ```
   https://unicorn-sports.netlify.app
   https://*.netlify.app
   ```

### Step 6: Get Credentials

From **Project Settings** → **API**, copy:
- **Project URL**: `https://xxxxx.supabase.co`
- **anon public key**: `eyJhbGciOi...` (safe to expose in frontend)
- **service_role secret**: `eyJhbGciOi...` (KEEP SECRET! Only for Edge Functions)

---

## 🌐 Part 2: Deploy Frontend (Netlify)

### Step 1: Push to GitHub

```bash
# Make sure all changes are committed
git add .
git commit -m "feat: complete PWA implementation"
git push origin main
```

### Step 2: Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and log in
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub**
4. Authorize Netlify to access your repos
5. Select your repository: `skrzypczykt/unicorns_pwa`

### Step 3: Configure Build Settings

Netlify will auto-detect settings from `netlify.toml`, but verify:

- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`
- **Node version**: `18`

### Step 4: Add Environment Variables

In Netlify Dashboard → **Site settings** → **Environment variables**, add:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Use the `anon` key, NOT the `service_role` key!

### Step 5: Deploy!

1. Click **"Deploy site"**
2. Wait 2-3 minutes for build
3. Your site will be live at: `https://random-name-12345.netlify.app`

### Step 6: Custom Domain (Optional)

1. In Netlify → **Domain settings**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `unicorn-sports.pl`)
4. Follow DNS configuration instructions
5. Netlify auto-provisions free SSL certificate

---

## ✅ Part 3: Post-Deployment Verification

### Check Frontend

1. Visit your Netlify URL
2. Verify:
   - [ ] Page loads with rainbow unicorn theme
   - [ ] Login page displays
   - [ ] PWA install prompt appears (mobile)
   - [ ] Polish translations work

### Check Authentication

1. Try to log in with test account: `user1@unicorn.test`
2. Verify:
   - [ ] Login succeeds
   - [ ] Dashboard loads
   - [ ] User profile shows correct balance

### Check Edge Functions

1. In Supabase Dashboard → **Edge Functions** → **Logs**
2. Perform actions in the app:
   - Register for an activity
   - Mark attendance (as trainer)
   - Update balance (as admin)
3. Check logs for successful executions

### Check Database

1. In Supabase Dashboard → **Table Editor**
2. Verify data:
   - [ ] Users table has profiles
   - [ ] Activities table has events
   - [ ] Registrations are created
   - [ ] Balance transactions are logged

### PWA Testing

**On Mobile Device:**

1. Visit site in Chrome/Safari
2. Check for install prompt
3. Install the PWA
4. Verify:
   - [ ] App opens like native app
   - [ ] Unicorn icon appears on home screen
   - [ ] Splash screen shows
   - [ ] Works offline (cached shell)

---

## 🔧 Continuous Deployment

Netlify automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main

# Netlify detects push and auto-deploys
# Check deployment in Netlify dashboard
```

**Deploy Previews**: Netlify creates preview URLs for pull requests

---

## 🌍 Production Checklist

Before going live with real users:

### Security
- [ ] Change all test account passwords
- [ ] Enable email confirmation in Supabase Auth
- [ ] Review RLS policies
- [ ] Enable rate limiting on Edge Functions
- [ ] Use custom domain with SSL

### Data
- [ ] Remove seed data (test users)
- [ ] Create real admin account
- [ ] Set up real trainers
- [ ] Configure activity types

### Monitoring
- [ ] Set up Supabase email alerts
- [ ] Monitor Edge Function logs
- [ ] Check database query performance
- [ ] Set up Netlify notifications

### Backup
- [ ] Configure Supabase automated backups
- [ ] Document recovery procedures
- [ ] Test backup restoration

### Performance
- [ ] Run Lighthouse audit (target: >90)
- [ ] Optimize images
- [ ] Check bundle size
- [ ] Test on slow 3G connection

---

## 📊 Monitoring & Maintenance

### Supabase Monitoring

1. **Dashboard** → **Reports**
   - Database size
   - API requests
   - Auth users
   - Edge Function invocations

2. **Logs**
   - PostgreSQL logs
   - Edge Function logs
   - Auth logs

### Netlify Monitoring

1. **Analytics**
   - Page views
   - Unique visitors
   - Load times

2. **Deploy Logs**
   - Build successes/failures
   - Deploy duration

### Regular Maintenance

**Weekly:**
- Check error logs in Supabase
- Review failed deployments in Netlify
- Monitor database size

**Monthly:**
- Review user feedback
- Update dependencies: `npm update`
- Check security advisories

**Quarterly:**
- Database performance review
- Cost analysis (Supabase & Netlify usage)
- Feature planning based on user requests

---

## 🆘 Troubleshooting

### "Build failed" on Netlify

**Check:**
1. Build logs in Netlify dashboard
2. Environment variables are set correctly
3. `netlify.toml` is in root directory
4. Node version matches (18)

**Fix:**
```bash
# Test build locally
cd frontend
npm install
npm run build

# If it works locally, check Netlify environment variables
```

### "CORS error" in browser console

**Check:**
1. Supabase CORS settings include your Netlify URL
2. Environment variables have correct Supabase URL

**Fix:**
- Add Netlify URL to Supabase CORS allowlist
- Redeploy Edge Functions if changed

### "Authentication failed"

**Check:**
1. Supabase Auth is enabled
2. Site URL is set correctly in Supabase
3. Environment variables are correct

**Fix:**
- Update Site URL in Supabase → Auth → URL Configuration
- Clear browser cache and try again

### Edge Functions not responding

**Check:**
1. Functions are deployed: `supabase functions list`
2. Service role key is set: `supabase secrets list`
3. Check logs: `supabase functions logs <function-name>`

**Fix:**
```bash
# Redeploy functions
supabase functions deploy process-attendance --no-verify-jwt
supabase functions deploy update-balance --no-verify-jwt
supabase functions deploy validate-registration --no-verify-jwt
```

---

## 💰 Cost Estimates

### Free Tier Limits

**Supabase Free Tier:**
- 500 MB database
- 2 GB bandwidth/month
- 500K Edge Function invocations/month
- 50K auth users

**Netlify Free Tier:**
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites

### Expected NGO Usage

For ~100 active users:
- **Supabase**: Free tier sufficient
- **Netlify**: Free tier sufficient
- **Total cost**: $0/month 🎉

---

## 🎉 Success!

Your Rainbow Unicorn Sports PWA is now live! 🦄🌈

**Share the URL with your NGO members and start managing classes!**

For support or questions, check:
- [Supabase Documentation](https://supabase.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- Project issues: https://github.com/skrzypczykt/unicorns_pwa/issues
