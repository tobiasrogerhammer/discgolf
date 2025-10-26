# Convex Setup Guide

The test page is now working without Convex, but to use the full app features, you need to set up Convex.

## Quick Setup

1. **Start Convex Development Server**
   ```bash
   npx convex dev
   ```
   
   This will:
   - Generate the API files
   - Start the development backend
   - Watch for changes

2. **Set Environment Variables**
   
   Create `.env.local` with:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
   CLERK_SECRET_KEY=your_clerk_secret_here
   NEXT_PUBLIC_CONVEX_URL=your_convex_url_here
   ```

3. **Configure Clerk Domain**
   
   Update `convex/auth.config.js`:
   ```js
   export default {
     providers: [
       {
         domain: "https://your-actual-clerk-domain.clerk.accounts.dev",
         applicationID: "convex",
       },
     ]
   };
   ```

## What Happens When You Run `npx convex dev`

1. **Generates API Files**: Creates `convex/_generated/api.d.ts` and `api.js`
2. **Starts Backend**: Runs your Convex functions
3. **Enables Real-time**: Database updates in real-time
4. **Fixes Import Errors**: The `import { api } from '../../convex/_generated/api'` will work

## Testing

1. **Without Convex**: 
   - Go to `/test` page
   - Test toast notifications
   - Check authentication status

2. **With Convex**:
   - All features work
   - Database operations
   - Real-time updates
   - Full app functionality

## Current Status

✅ **Working**: Toast system, Clerk auth, UI components  
⏳ **Pending**: Convex backend (run `npx convex dev`)  
⏳ **Pending**: Environment variables setup  

The app is designed to work gracefully even without Convex running, but you'll need it for the full disc golf tracking features!

