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
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
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
