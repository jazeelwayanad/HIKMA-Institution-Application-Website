# Production Deployment Guide

## Pre-Deployment Checklist

- [ ] All TypeScript errors fixed
- [ ] No console.logs in production code
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Seed script tested locally
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Passwords changed from defaults

## Vercel Deployment Steps

### 1. Connect Repository
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Select project root: `.`

### 2. Configure Environment Variables
Go to Project Settings → Environment Variables and add:

```
DATABASE_URL=postgresql://...
JWT_SECRET=<random_secure_key>
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ADMIN_EMAIL=your_admin_email@domain.com
ADMIN_PASSWORD=<secure_password>
NODE_ENV=production
```

**Generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Deploy
Click "Deploy" - Vercel will automatically:
- Run `npm install`
- Run `npm run build`
- Deploy to production

### 4. Run Database Migrations & Seed

After deployment succeeds:

**Option A: Via Vercel CLI**
```bash
# Pull environment variables locally
vercel env pull

# Run seed script
npm run seed
```

**Option B: Via SSH/Dashboard**
- Use Vercel Postgres Dashboard to run migrations
- Or use `vercel shell` to SSH into server and run `npm run seed`

### 5. Verify Deployment

1. **Visit your URL:** `https://your-app.vercel.app`
2. **Test Admin Login:**
   - Go to `/admin-login`
   - Use credentials from `ADMIN_EMAIL` / `ADMIN_PASSWORD`
3. **Test Application Form:**
   - Create a test course with a PDF template
   - Submit an application
   - Download the filled PDF
4. **Verify Database:** Check Supabase dashboard for data

## Supabase Setup

### Create PostgreSQL Database
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Create database (default name: `postgres`)
4. Copy connection string
5. Add to Vercel as `DATABASE_URL`

### Apply Database Schema
```bash
# Ensure prisma schema is in sync
npx prisma db push

# Or use migrate
npx prisma migrate deploy
```

## Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT_SECRET (randomly generated)
- [ ] Use HTTPS everywhere
- [ ] Enable Supabase SSL connection
- [ ] Set secure cookie settings (httpOnly, secure, sameSite)
- [ ] Remove console.logs
- [ ] Validate all inputs server-side
- [ ] Never expose error messages
- [ ] Use environment variables for secrets
- [ ] Enable Vercel's "Automatic Git Integration"

## Production Best Practices

### Logging
- Development: Full error details with stack traces
- Production: Generic error messages, detailed logs to Sentry/LogRocket
- Use: `if (process.env.NODE_ENV === "development") console.error(err);`

### Error Handling
- Never expose database errors to users
- Return generic messages: "Something went wrong"
- Log full errors server-side for debugging

### Database
- Use connection pooling (Supabase handles this)
- Set appropriate timeouts
- Monitor query performance
- Regular backups (Supabase automatic daily)

### Monitoring
Consider adding:
- Sentry for error tracking
- LogRocket for user session replay
- Vercel Analytics for performance
- Uptime monitoring

## Rollback Plan

If deployment fails:
```bash
# Vercel keeps previous deployments
# Click "Promote to Production" on previous deployment
```

If database issues:
```bash
# Supabase has automatic backups
# Restore from Supabase dashboard
```

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js Docs:** https://nextjs.org/docs
