# 🚀 Vercel Deployment Guide

Complete guide for deploying your Disc Golf Tracker to Vercel.

## 📋 Pre-Deployment Checklist

### ✅ 1. Environment Variables Setup

Create a `.env.local` file in your project root:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-url.convex.cloud

# Clerk Webhook (for user deletion sync)
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### ✅ 2. Test Production Build

```bash
npm run build
```

**Status**: ✅ Build successful - All TypeScript errors fixed!

### ✅ 3. Get Your Keys

#### Convex Setup
1. **Run Convex dev**: `npx convex dev`
2. **Copy deployment URL** from the output
3. **Add to environment variables**

#### Clerk Setup
1. **Go to [clerk.com](https://clerk.com)** → Your App → API Keys
2. **Copy Publishable Key** (starts with `pk_test_`)
3. **Copy Secret Key** (starts with `sk_test_`)
4. **Add to environment variables**

## 🚀 Deployment Steps

### Step 1: Deploy to Vercel

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)**
3. **Import your GitHub repository**
4. **Vercel will auto-detect Next.js settings**

### Step 2: Configure Environment Variables in Vercel

In your Vercel dashboard:

1. **Go to Project Settings** → Environment Variables
2. **Add each variable** from your `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_your_key_here
CLERK_SECRET_KEY = sk_test_your_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL = /login
NEXT_PUBLIC_CLERK_SIGN_UP_URL = /register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = /
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = /
NEXT_PUBLIC_CONVEX_URL = https://your-deployment-url.convex.cloud
CLERK_WEBHOOK_SECRET = whsec_your_webhook_secret_here
```

3. **Redeploy** after adding environment variables

### Step 3: Configure Clerk for Production

1. **Go to Clerk Dashboard** → Your App → Paths
2. **Update URLs** to use your Vercel domain:
   - Sign-in URL: `https://your-app.vercel.app/login`
   - Sign-up URL: `https://your-app.vercel.app/register`
   - After sign-in URL: `https://your-app.vercel.app/`
   - After sign-up URL: `https://your-app.vercel.app/`

3. **Go to Domains** → Add your Vercel domain:
   - `your-app.vercel.app`

### Step 4: Set Up Clerk Webhook (Optional but Recommended)

1. **Go to Clerk Dashboard** → Webhooks
2. **Add Endpoint**:
   - URL: `https://your-app.vercel.app/api/webhooks/clerk`
   - Events: Select `user.deleted`
3. **Copy Webhook Secret** and add to Vercel environment variables
4. **Test the webhook** by deleting a test user

## 🧪 Post-Deployment Testing

### 1. Test Authentication
- [ ] Visit your Vercel URL
- [ ] Try signing up with a new account
- [ ] Try signing in
- [ ] Verify redirects work correctly

### 2. Test Core Features
- [ ] Create a new round
- [ ] Add friends
- [ ] View analytics
- [ ] Check that data saves to Convex

### 3. Test Webhook (if configured)
- [ ] Create a test user
- [ ] Delete the user in Clerk Dashboard
- [ ] Verify user is deleted from Convex

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
- **Check TypeScript errors**: `npm run build`
- **Verify all imports**: Make sure all files exist
- **Check environment variables**: Ensure all required vars are set

#### Authentication Issues
- **Verify Clerk keys**: Check publishable and secret keys
- **Check domain settings**: Ensure Vercel domain is added to Clerk
- **Verify URLs**: Make sure sign-in/sign-up URLs are correct

#### Convex Issues
- **Check deployment URL**: Verify `NEXT_PUBLIC_CONVEX_URL` is correct
- **Check Convex functions**: Ensure all functions are deployed
- **Check schema**: Verify database schema is up to date

#### Webhook Issues
- **Check webhook URL**: Ensure it's accessible from Clerk
- **Verify webhook secret**: Check environment variable
- **Check logs**: Look at Vercel function logs for errors

### Debug Commands

```bash
# Test build locally
npm run build

# Test production build
npm run start

# Check Convex deployment
npx convex dev

# Check environment variables
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```

## 📊 Performance Optimization

### Vercel Settings
- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### Recommended Vercel Plan
- **Hobby Plan**: Free, good for development/testing
- **Pro Plan**: $20/month, better for production apps

## 🔒 Security Considerations

### Environment Variables
- ✅ **Never commit** `.env.local` to git
- ✅ **Use Vercel's environment variables** for production
- ✅ **Rotate keys** regularly
- ✅ **Use different keys** for development and production

### Clerk Security
- ✅ **Enable MFA** for admin accounts
- ✅ **Set up proper CORS** policies
- ✅ **Monitor webhook deliveries**
- ✅ **Use HTTPS** in production

## 📈 Monitoring

### Vercel Analytics
- **Enable Vercel Analytics** for performance monitoring
- **Check function logs** for errors
- **Monitor build times** and deployments

### Clerk Monitoring
- **Check user sign-ups** and activity
- **Monitor webhook deliveries**
- **Review security events**

## 🎯 Next Steps After Deployment

1. **Set up custom domain** (optional)
2. **Configure analytics** (Vercel Analytics, Google Analytics)
3. **Set up monitoring** (error tracking, performance monitoring)
4. **Create backup strategy** for Convex data
5. **Set up staging environment** for testing

## 📞 Support

If you encounter issues:

1. **Check Vercel logs** in the dashboard
2. **Check Convex logs** in the dashboard
3. **Check Clerk logs** in the dashboard
4. **Review this guide** for common solutions
5. **Open an issue** on GitHub if needed

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] Production build successful
- [ ] Pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Environment variables added to Vercel
- [ ] Clerk configured for production domain
- [ ] Webhook configured (optional)
- [ ] Authentication tested
- [ ] Core features tested
- [ ] Webhook tested (if configured)

**🎉 Your Disc Golf Tracker is now live on Vercel!**

