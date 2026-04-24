# Production Setup Guide

## Overview

This guide covers deploying your Next.js application to Vercel with Supabase PostgreSQL.

## Quick Start (5 minutes)

### 1. **Vercel Environment Setup**

Add these variables to Vercel Project Settings → Environment Variables:

```bash
# DATABASE
DATABASE_URL=postgresql://user:password@host:port/db?sslmode=require

# JWT
JWT_SECRET=<run: openssl rand -base64 32>

# ADMIN SEEDING
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=SecurePassword123!

# CLOUDINARY
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# ENVIRONMENT
NODE_ENV=production
```

### 2. **Database Setup**

```bash
# Pull environment variables locally
vercel env pull

# Apply Prisma migrations
npx prisma db push

# Run seed script to create admin and statuses
npm run seed
```

### 3. **Test Deployment**

Visit `https://your-app.vercel.app` and test:
- [ ] Admin login works
- [ ] Can create courses
- [ ] Can upload PDF templates
- [ ] Can submit applications
- [ ] Can download filled PDFs

## Detailed Instructions

### Step 1: Get Supabase Connection String

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy "Connection string" (Nodejs)
5. Replace placeholders with your password
6. Paste into Vercel `DATABASE_URL`

Example:
```
postgresql://postgres:YOUR_PASSWORD@db.xyzabc.supabase.co:5432/postgres?sslmode=require
```

### Step 2: Generate JWT Secret

```bash
# macOS/Linux
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Minimum 0 -Maximum 256) }))
```

Copy the output to Vercel `JWT_SECRET`

### Step 3: Configure Admin Account

Set these in Vercel:
- `ADMIN_EMAIL`: Your admin email
- `ADMIN_PASSWORD`: Strong password (min 8 chars)

These are used when you run `npm run seed`

### Step 4: Configure Cloudinary (Optional but Recommended)

1. Go to [cloudinary.com](https://cloudinary.com)
2. Create free account
3. Get API credentials from Dashboard
4. Add to Vercel:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

> **Note:** Without Cloudinary, files will be stored locally (not recommended for Vercel)

### Step 5: Verify After Deployment

```bash
# Pull fresh environment variables
vercel env pull

# Run migrations
npx prisma db push

# Seed the database
npm run seed

# Expected output:
# ✓ Admin created: your@email.com
# ✓ Status created: Pending
# ✓ Status created: Interview Scheduled
# ✓ Status created: Approved
# ✓ Status created: Rejected
# ✓ Seeding completed!
```

## What Gets Deployed

### Files Included:
- ✅ Application code (src/)
- ✅ Prisma schema & migrations
- ✅ Environment variables from Vercel
- ✅ Static assets (public/)

### Files NOT Included:
- ❌ .env.local (never committed)
- ❌ node_modules (reinstalled)
- ❌ .git (not needed in production)
- ❌ Development files (.next, .turbo)

## Troubleshooting

### Database Connection Failed
```
Error: Can't reach database
```

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check Supabase database is running
3. Ensure PostgreSQL connection string format: `postgresql://user:password@host:port/db`

### Seed Script Failed
```
PrismaClientInitializationError: Can't reach database
```

**Solution:**
- Run `vercel env pull` to get latest vars
- Verify `DATABASE_URL` and `JWT_SECRET` are set
- Check database is accessible

### Admin Login Not Working
- Verify `ADMIN_EMAIL` matches what you set
- Verify `ADMIN_PASSWORD` was used in seed
- Try seeding again: `npm run seed`

### PDF Upload/Download Issues
- Check `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Test in Cloudinary dashboard that files upload correctly
- For local storage: ensure `/public/uploads` directory exists

## Security Checklist

- [ ] Changed admin password from default
- [ ] Used randomly-generated JWT_SECRET
- [ ] Database SSL connection enabled (sslmode=require)
- [ ] All secrets in Vercel (not in .env.local)
- [ ] No console logs in production
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] httpOnly cookies enabled
- [ ] Input validation on server-side

## Monitoring & Maintenance

### View Logs
```bash
# Real-time logs
vercel logs --tail

# Recent logs
vercel logs
```

### Database Backups
- Supabase: Automatic daily backups
- Restore from Supabase Dashboard if needed

### Performance
- Vercel Analytics: Built-in
- Database performance: Check Supabase dashboard
- API response times: Vercel deployment logs

## Common Tasks

### Update Admin Password
1. Go to `/admin/settings` on production
2. Login with current credentials
3. Update password in Admin Profile section

### Add More Admins
1. Currently no UI - admins must be created manually
2. Plan: Add admin management in future version

### Rollback Deployment
1. Vercel keeps last 10 deployments
2. Go to Deployments tab
3. Click "Promote to Production" on previous version

### View Database
1. Go to Supabase dashboard
2. Click "SQL Editor" or "Table Editor"
3. Browse data directly

## Next Steps

After successful deployment:

1. **Set up monitoring:**
   - Enable Vercel Analytics
   - Consider Sentry for error tracking
   - Set up uptime monitoring

2. **Configure DNS:**
   - Add custom domain to Vercel
   - Update DNS records

3. **Performance optimization:**
   - Enable image optimization
   - Set up CDN caching
   - Monitor Lighthouse scores

4. **Backup strategy:**
   - Enable Supabase automated backups
   - Test restore process quarterly

## Support

- **Vercel:** https://vercel.com/support
- **Supabase:** https://supabase.com/docs
- **Prisma:** https://www.prisma.io/docs
- **Next.js:** https://nextjs.org/docs

---

**Last Updated:** 2026-04-24
**Version:** 1.0.0
