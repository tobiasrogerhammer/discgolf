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
