# Setup Guide

This guide will help you set up the Disc Golf Tracker application with Convex and Clerk.

## Prerequisites

- Node.js 18 or higher
- npm, yarn, pnpm, or bun
- A Convex account
- A Clerk account

## Step 1: Clone and Install

```bash
git clone <your-repo-url>
cd discgolf
npm install
```

## Step 2: Set up Convex

1. Go to [convex.dev](https://convex.dev) and create an account
2. Create a new project
3. Run the following command in your project directory:

```bash
npx convex dev
```

4. Follow the prompts to configure your project
5. Copy the deployment URL from the output

## Step 3: Set up Clerk

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. In the Clerk dashboard, go to "API Keys"
4. Copy your publishable key and secret key

## Step 4: Environment Variables

Create a `.env.local` file in your project root with the following variables:

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
```

## Step 5: Configure Clerk

1. In your Clerk dashboard, go to "Paths"
2. Set the following paths:
   - Sign-in URL: `/login`
   - Sign-up URL: `/register`
   - After sign-in URL: `/`
   - After sign-up URL: `/`

## Step 6: Run the Application

```bash
npm run dev
```

The application should now be running at `http://localhost:3000`.

## Step 7: Test the Setup

1. Open the application in your browser
2. Try signing up for a new account
3. Create a test round
4. Verify that data is being saved to Convex

## Troubleshooting

### Convex Issues

- Make sure your Convex deployment URL is correct
- Check that your Convex functions are deployed
- Verify your schema is properly defined

### Clerk Issues

- Ensure your API keys are correct
- Check that your URLs are properly configured
- Verify that your domain is allowed in Clerk settings

### Build Issues

- Make sure all dependencies are installed
- Check for TypeScript errors
- Verify that all environment variables are set

## Next Steps

Once everything is working:

1. Add some test courses to your Convex database
2. Create a few test rounds
3. Explore the different features of the application
4. Customize the UI and add your own features

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your environment variables
3. Check the Convex and Clerk dashboards for any issues
4. Open an issue on GitHub if you need help

