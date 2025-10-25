import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("courses").collect();
  },
});

export const getById = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const courses = await ctx.db.query("courses").collect();
    const searchTerm = args.query.toLowerCase();
    
    return courses.filter(course => 
      course.name.toLowerCase().includes(searchTerm) ||
      course.location?.toLowerCase().includes(searchTerm) ||
      course.description?.toLowerCase().includes(searchTerm)
    );
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
    addressUrl: v.optional(v.string()),
    holes: v.number(),
    estimatedLengthMeters: v.optional(v.number()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    difficulty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("courses", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getHoles = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courseHoles")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
  },
});

export const createHoles = mutation({
  args: {
    courseId: v.id("courses"),
    holes: v.array(v.object({
      hole: v.number(),
      par: v.number(),
      distanceMeters: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const holeIds = [];
    for (const hole of args.holes) {
      const holeId = await ctx.db.insert("courseHoles", {
        courseId: args.courseId,
        ...hole,
      });
      holeIds.push(holeId);
    }
    return holeIds;
  },
});

