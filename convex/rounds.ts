import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const rounds = await ctx.db
      .query("rounds")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get course, scores, and weather for each round
    const roundsWithDetails = await Promise.all(
      rounds.map(async (round) => {
        const course = await ctx.db.get(round.courseId);
        const scores = await ctx.db
          .query("scores")
          .withIndex("by_round", (q) => q.eq("roundId", round._id))
          .collect();
        const weather = await ctx.db
          .query("weather")
          .withIndex("by_round", (q) => q.eq("roundId", round._id))
          .first();
        
        return {
          ...round,
          course,
          scores,
          weather,
        };
      })
    );

    return roundsWithDetails;
  },
});

export const getById = query({
  args: { id: v.id("rounds") },
  handler: async (ctx, args) => {
    const round = await ctx.db.get(args.id);
    if (!round) return null;

    const course = await ctx.db.get(round.courseId);
    const scores = await ctx.db
      .query("scores")
      .withIndex("by_round", (q) => q.eq("roundId", args.id))
      .collect();
    const weather = await ctx.db
      .query("weather")
      .withIndex("by_round", (q) => q.eq("roundId", args.id))
      .first();

    return {
      ...round,
      course,
      scores,
      weather,
    };
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
    roundType: v.union(
      v.literal("CASUAL"),
      v.literal("PRACTICE"),
      v.literal("TOURNAMENT"),
      v.literal("COMPETITIVE")
    ),
    scores: v.array(v.object({
      hole: v.number(),
      strokes: v.number(),
    })),
    weather: v.optional(v.object({
      temperature: v.optional(v.number()),
      windSpeed: v.optional(v.number()),
      windDirection: v.optional(v.string()),
      conditions: v.optional(v.string()),
      humidity: v.optional(v.number()),
      pressure: v.optional(v.number()),
    })),
    notes: v.optional(v.string()),
    startedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = args.startedAt || Date.now();
    const totalStrokes = args.scores.reduce((sum, score) => sum + score.strokes, 0);

    // Create the round
    const roundId = await ctx.db.insert("rounds", {
      userId: args.userId,
      courseId: args.courseId,
      startedAt: now,
      completed: true,
      totalStrokes,
      roundType: args.roundType,
      notes: args.notes,
      shared: false,
    });

    // Create scores
    for (const score of args.scores) {
      await ctx.db.insert("scores", {
        roundId,
        hole: score.hole,
        strokes: score.strokes,
      });
    }

    // Create weather if provided
    if (args.weather) {
      await ctx.db.insert("weather", {
        roundId,
        ...args.weather,
      });
    }

    return roundId;
  },
});

export const share = mutation({
  args: { id: v.id("rounds") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { shared: true });
    return { shareUrl: `/rounds/${args.id}` };
  },
});

export const getByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rounds")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
  },
});

