import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Minimal rounds functions to allow deployment
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rounds")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
    scores: v.array(v.object({
      hole: v.number(),
      strokes: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const roundId = await ctx.db.insert("rounds", {
      userId: args.userId,
      courseId: args.courseId,
      startedAt: Date.now(),
      completed: true,
      roundType: "CASUAL",
      shared: false,
    });

    for (const score of args.scores) {
      await ctx.db.insert("scores", {
        roundId,
        hole: score.hole,
        strokes: score.strokes,
      });
    }

    return roundId;
  },
});
