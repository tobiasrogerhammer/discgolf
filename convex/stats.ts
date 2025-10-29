import { query } from "./_generated/server";
import { v } from "convex/values";

// Minimal stats functions to allow deployment
export const getUserStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const rounds = await ctx.db
      .query("rounds")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      totalRounds: rounds.length,
      averageScore: 0,
      bestScore: 0,
    };
  },
});

export const getLeaderboard = query({
  args: { 
    timePeriod: v.optional(v.string()),
    courseId: v.optional(v.id("courses")),
    friendsOnly: v.optional(v.boolean()),
    userId: v.optional(v.id("users"))
  },
  handler: async (ctx, args) => {
    let users = await ctx.db.query("users").collect();
    
    // Filter to friends only if requested
    if (args.friendsOnly && args.userId) {
      const friendships = await ctx.db
        .query("friendships")
        .withIndex("by_requester", (q) => q.eq("requesterId", args.userId!))
        .filter((q) => q.eq(q.field("status"), "ACCEPTED"))
        .collect();

      const friendshipsAsAddressee = await ctx.db
        .query("friendships")
        .withIndex("by_addressee", (q) => q.eq("addresseeId", args.userId!))
        .filter((q) => q.eq(q.field("status"), "ACCEPTED"))
        .collect();

      const allFriendships = [...friendships, ...friendshipsAsAddressee];
      const friendIds = new Set(
        allFriendships.map(friendship => 
          friendship.requesterId === args.userId! 
            ? friendship.addresseeId 
            : friendship.requesterId
        )
      );
      friendIds.add(args.userId!); // Include current user
      
      users = users.filter(user => friendIds.has(user._id));
    }
    
    const leaderboard = await Promise.all(
      users.map(async (user) => {
        const rounds = await ctx.db
          .query("rounds")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        return {
          userId: user._id,
          username: user.username || user.email,
          name: user.name || user.username || user.email,
          totalRounds: rounds.length,
          averageScore: 0,
        };
      })
    );

    return leaderboard.sort((a, b) => b.totalRounds - a.totalRounds);
  },
});

export const getAnalytics = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const rounds = await ctx.db
      .query("rounds")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      totalRounds: rounds.length,
      averageScore: 0,
      bestScore: 0,
      roundsThisMonth: 0,
      roundsThisYear: 0,
    };
  },
});
