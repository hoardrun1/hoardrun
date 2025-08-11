# Vercel Deployment Guide for HoardRun

## Required Environment Variables

Set these in your Vercel dashboard under Project Settings > Environment Variables:

### Database
```
DATABASE_URL=your_postgresql_database_url
```

### Redis (Optional - for caching)
```
REDIS_URL=your_redis_url
```

### Authentication
```
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=https://your-domain.vercel.app
```

### Email Service
```
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
```

### Payment Services
```
MASTERCARD_CLIENT_ID=your_mastercard_client_id
MASTERCARD_CLIENT_SECRET=your_mastercard_client_secret
MASTERCARD_COUNTRY=US
```

### External APIs
```
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
```

### Optional Services
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Deployment Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Fix Vercel deployment issues"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables

3. **Deploy**
   - Vercel will automatically deploy on push
   - Monitor the deployment logs for any issues

## Build Fixes Applied

✅ **API Routes**: Added `export const dynamic = 'force-dynamic'` to all API routes
✅ **useSearchParams**: Wrapped in Suspense boundary
✅ **Redis**: Created build-safe Redis configuration
✅ **Error Handling**: Added global error boundary
✅ **Services**: Fixed all API call patterns

## Troubleshooting

### Redis Connection Errors
- These are expected during build and won't break deployment
- Redis will work properly in production with correct REDIS_URL

### Dynamic Server Usage Warnings
- These are normal for API routes that use headers/cookies
- Fixed by adding dynamic exports

### Build Timeouts
- Increase function timeout in vercel.json if needed
- Current setting: 30 seconds

## Post-Deployment Checklist

- [ ] Test user registration/login
- [ ] Verify email sending works
- [ ] Check database connections
- [ ] Test API endpoints
- [ ] Verify Redis caching (if enabled)
- [ ] Test payment flows
- [ ] Check error handling

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test locally with `npm run build`
4. Check database connectivity
