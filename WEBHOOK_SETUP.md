# Clerk Webhook Setup for User Deletion

This guide explains how to set up Clerk webhooks to automatically delete users from Convex when they're deleted in Clerk.

## 🚨 Current Issue

**Problem**: When you delete a user in Clerk, they are NOT automatically deleted from Convex. This creates "orphaned" user data in your database.

**Solution**: Set up Clerk webhooks to automatically sync user deletions.

## 📋 Setup Steps

### 1. Install Dependencies

The required package is already added to `package.json`:

```bash
npm install
```

### 2. Set Environment Variables

Add to your `.env.local`:

```env
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Configure Clerk Webhook

1. **Go to Clerk Dashboard** → Your App → Webhooks
2. **Click "Add Endpoint"**
3. **Set Endpoint URL**: `https://yourdomain.com/api/webhooks/clerk`
4. **Select Events**: Choose `user.deleted`
5. **Copy the Webhook Secret** and add it to your environment variables

### 4. Deploy Your App

Make sure your app is deployed so Clerk can reach the webhook endpoint.

## 🔧 How It Works

### Automatic Deletion Flow

1. **User deleted in Clerk** → Clerk sends webhook
2. **Webhook received** → Verifies signature with Clerk
3. **User deleted from Convex** → All related data cleaned up

### What Gets Deleted

When a user is deleted, the following data is automatically removed:

- ✅ **User record** in `users` table
- ✅ **All rounds** created by the user
- ✅ **All scores** for those rounds
- ✅ **All weather data** for those rounds
- ✅ **All round participants** for those rounds
- ✅ **All friendships** (both sent and received)
- ✅ **All group rounds** created by the user
- ✅ **All user achievements** (`userAchievements` table)
- ✅ **All user goals** (`goals` table)
- ✅ **All favorite courses** (`favoriteCourses` table)
- ✅ **All activities** (`activities` table)
- ✅ **All round notes** (`roundNotes` table)
- ✅ **All course leaderboard entries** (`courseLeaderboards` table)

### Manual Cleanup

If you need to manually clean up orphaned users:

1. **Visit**: `/admin/cleanup` (if you have admin access)
2. **Or use Convex Dashboard** to call `cleanupOrphanedUsers` mutation
3. **Or call directly**:
   ```javascript
   await convex.mutation(api.users.cleanupOrphanedUsers, {});
   ```

## 🧪 Testing

### Test Webhook Locally

1. **Use ngrok** to expose your local server:
   ```bash
   npx ngrok http 3000
   ```

2. **Set webhook URL** in Clerk to your ngrok URL:
   ```
   https://abc123.ngrok.io/api/webhooks/clerk
   ```

3. **Test by deleting a user** in Clerk Dashboard

### Verify Deletion

Check that the user and all related data are removed from Convex:

1. **Check users table** - user should be gone
2. **Check rounds table** - user's rounds should be gone
3. **Check friendships table** - user's friendships should be gone

## 🚨 Important Notes

### Security

- ✅ **Webhook signature verification** prevents unauthorized requests
- ✅ **Environment variable** keeps webhook secret secure
- ✅ **Only user.deleted events** are processed

### Data Integrity

- ✅ **Cascading deletion** removes all related data
- ✅ **No orphaned records** left behind
- ✅ **Atomic operations** ensure consistency

### Backup Considerations

- ⚠️ **User deletion is permanent** - consider backing up important data
- ⚠️ **No undo functionality** - deleted data cannot be recovered
- ⚠️ **Test thoroughly** before deploying to production

## 🔍 Troubleshooting

### Webhook Not Working

1. **Check webhook URL** is correct and accessible
2. **Verify webhook secret** matches environment variable
3. **Check Clerk logs** for webhook delivery status
4. **Check your app logs** for webhook processing errors

### User Not Deleted

1. **Check Convex logs** for deletion errors
2. **Verify user exists** in Convex before deletion
3. **Check database constraints** that might prevent deletion

### Partial Deletion

1. **Check for foreign key constraints** in your schema
2. **Verify all related data** is being found and deleted
3. **Check for concurrent operations** that might interfere

## 📚 Additional Resources

- [Clerk Webhooks Documentation](https://clerk.com/docs/webhooks)
- [Convex Mutations Documentation](https://docs.convex.dev/functions/mutations)
- [Svix Webhook Verification](https://docs.svix.com/receiving/verifying-payloads/why)

## 🎯 Next Steps

1. **Set up the webhook** following the steps above
2. **Test thoroughly** in development
3. **Deploy to production** with confidence
4. **Monitor webhook delivery** in Clerk Dashboard
5. **Set up alerts** for webhook failures if needed

