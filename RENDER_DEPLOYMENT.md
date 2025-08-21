# 🚀 Render Deployment Guide

This guide will help you deploy your HoardRun application from Vercel to Render.

## 📋 Prerequisites

- [Render Account](https://render.com) (free tier available)
- GitHub repository with your code
- Domain name (optional, Render provides free subdomains)

## 🔧 Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure all the new files are committed to your GitHub repository:
- `render.yaml` - Render service configuration
- `Dockerfile` - Container configuration (optional)
- `scripts/build.sh` - Build script
- `.env.render.example` - Environment variables template
- `app/api/health/route.ts` - Health check endpoint

### 2. Create Render Services

#### Option A: Using render.yaml (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Review and deploy the services

#### Option B: Manual Setup

1. **Create PostgreSQL Database:**
   - Go to Render Dashboard
   - Click "New" → "PostgreSQL"
   - Name: `hoardrun-db`
   - Plan: Starter (free) or higher
   - Note the connection details

2. **Create Redis Instance:**
   - Click "New" → "Redis"
   - Name: `hoardrun-redis`
   - Plan: Starter (free) or higher

3. **Create Web Service:**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Name: `hoardrun-web`
   - Environment: Node
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`

### 3. Configure Environment Variables

In your Render web service dashboard, add these environment variables:

```bash
# Required
NODE_ENV=production
NEXTAUTH_SECRET=<generate-a-secure-secret>
NEXTAUTH_URL=https://your-app-name.onrender.com
DATABASE_URL=<automatically-provided-by-render-postgresql>
REDIS_URL=<automatically-provided-by-render-redis>

# Email (choose one)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="HoardRun <noreply@hoardrun.com>"

# Email service removed - using development email service instead

# SMS (optional)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# WebAuthn
WEBAUTHN_RP_ID=your-app-name.onrender.com
WEBAUTHN_ORIGIN=https://your-app-name.onrender.com

# Optional
NEXT_PUBLIC_BYPASS_AUTH=false
```

### 4. Deploy

1. Click "Deploy Latest Commit" in your Render dashboard
2. Monitor the build logs
3. Once deployed, test the health endpoint: `https://your-app.onrender.com/api/health`

## 🔍 Verification Steps

### 1. Health Check
Visit `https://your-app.onrender.com/api/health` to verify:
- Database connection
- Environment variables
- Application status

### 2. Database Migration
Check the deployment logs to ensure Prisma migrations ran successfully:
```
🗄️ Running database migrations...
✅ Migration completed
```

### 3. Application Functionality
- Test user registration
- Test email verification
- Test login/logout
- Test core features

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Review build logs for specific errors

2. **Database Connection Issues:**
   - Verify DATABASE_URL is correctly set
   - Check if Prisma migrations completed
   - Ensure PostgreSQL service is running

3. **Environment Variable Issues:**
   - Double-check all required variables are set
   - Verify no typos in variable names
   - Check if secrets are properly generated

### Debug Commands

Access your service shell in Render dashboard:
```bash
# Check environment variables
env | grep -E "(DATABASE|NEXTAUTH|REDIS)"

# Test database connection
npx prisma db pull

# Check application logs
tail -f /tmp/logs/application.log
```

## 📊 Monitoring

### Built-in Monitoring
- Render provides automatic monitoring
- View metrics in the dashboard
- Set up alerts for downtime

### Custom Monitoring
- Health check endpoint: `/api/health`
- Application logs in `/tmp/logs/`
- Error tracking (integrate Sentry if needed)

## 🔄 Continuous Deployment

Render automatically deploys when you push to your main branch:

1. Push changes to GitHub
2. Render detects changes
3. Automatic build and deployment
4. Zero-downtime deployment

## 💰 Cost Optimization

### Free Tier Limits
- Web Service: 750 hours/month
- PostgreSQL: 1GB storage
- Redis: 25MB storage

### Scaling Options
- Upgrade to paid plans for:
  - More resources
  - Custom domains
  - Advanced features
  - Priority support

## 🔐 Security Best Practices

1. **Environment Variables:**
   - Never commit secrets to Git
   - Use Render's secret management
   - Rotate secrets regularly

2. **Database Security:**
   - Use strong passwords
   - Enable SSL connections
   - Regular backups

3. **Application Security:**
   - Keep dependencies updated
   - Use HTTPS only
   - Implement proper authentication

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Prisma with Render](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-render)

## 🆘 Support

If you encounter issues:
1. Check Render's status page
2. Review deployment logs
3. Contact Render support
4. Check community forums
